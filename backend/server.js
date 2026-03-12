const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const play = require('play-dl');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentamos el límite para soportar imágenes en Base64

const JWT_SECRET = 'midnight_acid_secret_key_123';

// ==========================================
// 🛠️ REPARACIÓN AUTOMÁTICA DE BASE DE DATOS
// ==========================================
db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT", (err) => {
        if (!err) console.log("✅ Columna avatar_url añadida correctamente.");
    });
    db.run("ALTER TABLE users ADD COLUMN birthdate TEXT", (err) => {
        if (!err) console.log("✅ Columna birthdate añadida correctamente.");
    });
});

// --- CONFIGURACIÓN DE PLAY-DL PARA SOUNDCLOUD ---
play.getFreeClientID().then((clientID) => {
    play.setToken({
        soundcloud: {
            client_id: clientID
        }
    });
    console.log("✅ play-dl: Client ID de SoundCloud configurado correctamente.");
}).catch(err => console.error("❌ Error configurando SoundCloud en play-dl:", err.message));

// --- AUTH ROUTER ---
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) return res.status(400).json({ error: 'Username already exists' });
            res.json({ message: 'User created successfully', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'User not found' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid password' });
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, username: user.username });
    });
});

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// --- MUSIC PROXY ROUTER (DEEZER API) ---
app.get('/api/music/trending', async (req, res) => {
    try {
        const response = await axios.get('https://api.deezer.com/chart/0/tracks');
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch trending music' });
    }
});

app.get('/api/music/search', async (req, res) => {
    try {
        const query = req.query.q;
        const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// --- FULL AUDIO STREAM PROXY ---
app.get('/api/music/stream', async (req, res) => {
    try {
        const { query, duration } = req.query;
        if (!query) return res.status(400).json({ error: "Missing query" });

        const searchResults = await play.search(query, {
            limit: 5,
            source: { soundcloud: 'tracks' }
        });

        if (!searchResults || searchResults.length === 0) return res.status(404).json({ error: "No encontrado" });

        let streamObj;
        for (let i = 0; i < searchResults.length; i++) {
            try {
                streamObj = await play.stream(searchResults[i].url);
                if (streamObj) break;
            } catch (error) {
                console.log("Reintentando stream...");
            }
        }

        if (!streamObj) return res.status(404).json({ error: "Error de stream" });

        res.header('Content-Type', 'audio/mpeg');
        if (duration) {
            res.header('Content-Duration', duration);
            res.header('X-Content-Duration', duration);
        }
        res.header('Accept-Ranges', 'bytes');

        streamObj.stream.pipe(res);

    } catch (err) {
        res.status(500).json({ error: 'Fallo de servidor' });
    }
});

// --- PLAYLISTS & FAVORITES ---
app.get('/api/playlists', authenticate, (req, res) => {
    db.all('SELECT * FROM playlists WHERE user_id = ?', [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/playlists', authenticate, (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO playlists (user_id, name) VALUES (?, ?)', [req.user.userId, name], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, name });
    });
});

app.get('/api/playlists/:id/tracks', authenticate, (req, res) => {
    db.all('SELECT * FROM playlist_tracks WHERE playlist_id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/playlists/:id/tracks', authenticate, (req, res) => {
    const { track_id, track_data } = req.body;
    db.run('INSERT INTO playlist_tracks (playlist_id, track_id, track_data) VALUES (?, ?, ?)',
        [req.params.id, track_id, JSON.stringify(track_data)], function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ id: this.lastID, track_id });
        });
});

app.get('/api/favorites', authenticate, (req, res) => {
    db.all('SELECT * FROM favorites WHERE user_id = ?', [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const favorites = rows.map(row => ({
            ...row,
            track_data: JSON.parse(row.track_data)
        }));
        res.json(favorites);
    });
});

app.post('/api/favorites', authenticate, (req, res) => {
    const { track_id, track_data } = req.body;
    db.run('INSERT INTO favorites (user_id, track_id, track_data) VALUES (?, ?, ?)',
        [req.user.userId, track_id, JSON.stringify(track_data)], function (err) {
            if (err) return res.status(400).json({ error: 'Already in favorites' });
            res.json({ id: this.lastID, track_id });
        });
});

app.delete('/api/favorites/:trackId', authenticate, (req, res) => {
    db.run('DELETE FROM favorites WHERE user_id = ? AND track_id = ?',
        [req.user.userId, req.params.trackId], function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Removed' });
        });
});

app.delete('/api/playlists/:id', authenticate, (req, res) => {
    const playlistId = req.params.id;
    db.run('DELETE FROM playlist_tracks WHERE playlist_id = ?', [playlistId], (err) => {
        if (err) return res.status(500).json({ error: 'Error al borrar canciones' });
        db.run('DELETE FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.user.userId], function (err) {
            if (err) return res.status(500).json({ error: 'Error al borrar playlist' });
            res.json({ message: 'Playlist eliminada' });
        });
    });
});

// --- DOWNLOAD ---
app.get('/api/music/download', async (req, res) => {
    try {
        const { query, filename } = req.query;
        const searchResults = await play.search(query, { limit: 1, source: { soundcloud: 'tracks' } });
        if (!searchResults.length) return res.status(404).send("Not found");
        const streamObj = await play.stream(searchResults[0].url);
        res.header('Content-Disposition', `attachment; filename="${filename || 'track'}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        streamObj.stream.pipe(res);
    } catch (err) {
        res.status(500).send("Error");
    }
});

// --- UPDATE PROFILE (VERSION PRO) ---
app.put('/api/auth/profile', authenticate, async (req, res) => {
    const { username, newPassword, avatarData, birthdate } = req.body;
    const userId = req.user.userId;

    try {
        let query = 'UPDATE users SET username = ?, avatar_url = ?, birthdate = ?';
        let params = [username, avatarData, birthdate];

        if (newPassword && newPassword.trim() !== "") {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            query += ', password = ? WHERE id = ?';
            params.push(hashedPassword, userId);
        } else {
            query += ' WHERE id = ?';
            params.push(userId);
        }

        db.run(query, params, function (err) {
            if (err) return res.status(400).json({ error: 'Error al actualizar: ' + err.message });
            res.json({ message: 'Perfil actualizado con éxito' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error de servidor' });
    }
});

// --- GET USER STATS & INFO ---
app.get('/api/auth/me', authenticate, (req, res) => {
    const userId = req.user.userId;
    const userQuery = 'SELECT id, username, avatar_url, birthdate FROM users WHERE id = ?';
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM favorites WHERE user_id = ?) as fav_count,
            (SELECT COUNT(*) FROM playlists WHERE user_id = ?) as playlist_count
    `;

    db.get(userQuery, [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        db.get(statsQuery, [userId, userId], (err, stats) => {
            res.json({
                ...user,
                favCount: stats.fav_count,
                playlistCount: stats.playlist_count
            });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
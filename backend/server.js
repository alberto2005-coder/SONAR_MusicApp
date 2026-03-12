const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const play = require('play-dl');
const db = require('./database');

const app = express();
app.use(cors());
// Límite aumentado para soportar la subida de avatares y portadas de playlists en Base64
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = 'midnight_acid_secret_key_123';

// ==========================================
// 🛠️ REPARACIÓN Y MANTENIMIENTO DE DB
// ==========================================
db.serialize(() => {
    // Columnas necesarias para el Perfil Pro
    db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT", (err) => {
        if (!err) console.log("✅ Columna avatar_url lista.");
    });
    db.run("ALTER TABLE users ADD COLUMN birthdate TEXT", (err) => {
        if (!err) console.log("✅ Columna birthdate lista.");
    });
    // Columna necesaria para portadas de Playlists personalizadas
    db.run("ALTER TABLE playlists ADD COLUMN cover_url TEXT", (err) => {
        if (!err) console.log("✅ Columna cover_url añadida a playlists.");
    });
    db.run("ALTER TABLE playlists ADD COLUMN description TEXT", (err) => {
        if (!err) console.log("✅ Columna description añadida a playlists.");
    });
});

// --- CONFIGURACIÓN SOUNDCLOUD ---
play.getFreeClientID().then((clientID) => {
    play.setToken({ soundcloud: { client_id: clientID } });
    console.log("✅ play-dl: SoundCloud listo.");
}).catch(err => console.error("❌ Error SoundCloud:", err.message));

// ==========================================
// 🔐 SISTEMA DE AUTENTICACIÓN
// ==========================================

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Datos requeridos' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) return res.status(400).json({ error: 'El usuario ya existe' });
            res.json({ message: 'Usuario creado', userId: this.lastID });
        });
    } catch (error) { res.status(500).json({ error: 'Error en registro' }); }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Usuario no encontrado' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, username: user.username });
    });
});

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) { res.status(401).json({ error: 'Token inválido' }); }
};

// ==========================================
// 👤 PERFIL Y ESTADÍSTICAS
// ==========================================

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
            res.json({ ...user, favCount: stats.fav_count, playlistCount: stats.playlist_count });
        });
    });
});

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
            if (err) return res.status(400).json({ error: 'Error DB: ' + err.message });
            res.json({ message: 'Perfil actualizado' });
        });
    } catch (error) { res.status(500).json({ error: 'Error servidor' }); }
});

// ==========================================
// 🎵 MOTOR DE MÚSICA Y STREAMING
// ==========================================

app.get('/api/music/trending', async (req, res) => {
    try {
        const response = await axios.get('https://api.deezer.com/chart/0/tracks');
        res.json(response.data);
    } catch (err) { res.status(500).send("Error trending"); }
});

app.get('/api/music/search', async (req, res) => {
    try {
        const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(req.query.q)}`);
        res.json(response.data);
    } catch (err) { res.status(500).send("Error búsqueda"); }
});

app.get('/api/music/stream', async (req, res) => {
    try {
        const { query, duration } = req.query;
        const searchResults = await play.search(query, { limit: 1, source: { soundcloud: 'tracks' } });
        if (!searchResults.length) return res.status(404).send("No found");
        const streamObj = await play.stream(searchResults[0].url);
        res.header('Content-Type', 'audio/mpeg');
        if (duration) res.header('X-Content-Duration', duration);
        streamObj.stream.pipe(res);
    } catch (err) { res.status(500).send("Error stream"); }
});

app.get('/api/music/download', async (req, res) => {
    try {
        const { query, filename } = req.query;
        const search = await play.search(query, { limit: 1, source: { soundcloud: 'tracks' } });
        const stream = await play.stream(search[0].url);
        res.header('Content-Disposition', `attachment; filename="${filename || 'track'}.mp3"`);
        stream.stream.pipe(res);
    } catch (err) { res.status(500).send("Error descarga"); }
});

// ==========================================
// ❤️ FAVORITOS (CON FIX DE PARSEO)
// ==========================================

app.get('/api/favorites', authenticate, (req, res) => {
    db.all('SELECT * FROM favorites WHERE user_id = ?', [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        const favorites = rows.map(row => ({
            ...row,
            track_data: typeof row.track_data === 'string' ? JSON.parse(row.track_data) : row.track_data
        }));
        res.json(favorites);
    });
});

app.post('/api/favorites', authenticate, (req, res) => {
    const { track_id, track_data } = req.body;
    db.run('INSERT INTO favorites (user_id, track_id, track_data) VALUES (?, ?, ?)',
        [req.user.userId, track_id, JSON.stringify(track_data)], (err) => {
            if (err) return res.status(400).json({ error: 'Ya en favoritos' });
            res.json({ success: true });
        });
});

app.delete('/api/favorites/:trackId', authenticate, (req, res) => {
    db.run('DELETE FROM favorites WHERE user_id = ? AND track_id = ?',
        [req.user.userId, req.params.trackId], () => res.json({ success: true }));
});

// ==========================================
// 📂 GESTIÓN DE PLAYLISTS PRO
// ==========================================

const ensurePlaylistOwner = (req, res, next) => {
    const playlistId = req.params.id;
    db.get('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.user.userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!row) return res.status(404).json({ error: 'Playlist not found' });
        next();
    });
};

app.get('/api/playlists', authenticate, (req, res) => {
    db.all('SELECT * FROM playlists WHERE user_id = ?', [req.user.userId], (err, rows) => {
        res.json(rows || []);
    });
});

app.post('/api/playlists', authenticate, (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO playlists (user_id, name) VALUES (?, ?)', [req.user.userId, name], function () {
        res.json({ id: this.lastID, name });
    });
});

// Edición de detalles (Nombre, Foto, Descripción)
app.put('/api/playlists/:id', authenticate, (req, res) => {
    const { name, description, cover_data } = req.body;
    db.run('UPDATE playlists SET name = COALESCE(?, name), description = COALESCE(?, description), cover_url = COALESCE(?, cover_url) WHERE id = ? AND user_id = ?',
        [name, description, cover_data, req.params.id, req.user.userId], () => res.json({ success: true }));
});

app.get('/api/playlists/:id/tracks', authenticate, ensurePlaylistOwner, (req, res) => {
    db.all('SELECT * FROM playlist_tracks WHERE playlist_id = ?', [req.params.id], (err, rows) => {
        const tracks = rows.map(r => ({ ...r, track_data: JSON.parse(r.track_data) }));
        res.json(tracks);
    });
});

app.post('/api/playlists/:id/tracks', authenticate, ensurePlaylistOwner, (req, res) => {
    const { track_id, track_data } = req.body;
    db.get('SELECT id FROM playlist_tracks WHERE playlist_id = ? AND track_id = ? LIMIT 1',
        [req.params.id, track_id], (err, row) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (row) return res.status(409).json({ error: 'Track already in playlist' });

            db.run('INSERT INTO playlist_tracks (playlist_id, track_id, track_data) VALUES (?, ?, ?)',
                [req.params.id, track_id, JSON.stringify(track_data)], () => res.json({ success: true }));
        });
});

app.delete('/api/playlists/:id/tracks/by-track/:trackId', authenticate, ensurePlaylistOwner, (req, res) => {
    db.run('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?',
        [req.params.id, req.params.trackId.toString()], () => res.json({ success: true }));
});

app.delete('/api/playlists/:id', authenticate, ensurePlaylistOwner, (req, res) => {
    db.run('DELETE FROM playlist_tracks WHERE playlist_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        db.run('DELETE FROM playlists WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId], () => {
            res.json({ success: true });
        });
    });
});
// BORRADO POR ID DE FILA ÚNICO (Para evitar borrar duplicados por error)
app.delete('/api/playlists/:id/tracks/:rowId', authenticate, ensurePlaylistOwner, (req, res) => {
    // Usamos el ID de la fila (el autoincremental de la tabla)
    db.run('DELETE FROM playlist_tracks WHERE id = ? AND playlist_id = ?',
        [req.params.rowId, req.params.id], function (err) {
            if (err) return res.status(500).json({ error: 'Error al eliminar' });
            res.json({ success: true });
        });
});
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 SONAR Server en puerto ${PORT}`));

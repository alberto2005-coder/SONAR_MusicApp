const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const music = require('./music');
const db = require('./database');

const app = express();
app.use(cors());
// Límite aumentado para soportar la subida de avatares y portadas de playlists en Base64
app.use(express.json({ limit: '10mb' }));

// ==========================================
// 👤 SIN LOGIN NI REGISTRO: siempre el usuario local
// ==========================================
const authenticate = (req, res, next) => {
    req.user = { userId: db.localUserId, username: 'SONAR' };
    next();
};

// ==========================================
// 👤 PERFIL Y ESTADÍSTICAS (local, sin contraseña)
// ==========================================

app.get('/api/profile', authenticate, (req, res) => {
    const userId = req.user.userId;
    const userQuery = 'SELECT id, username, avatar_url, birthdate FROM users WHERE id = ?';
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM favorites WHERE user_id = ?) as fav_count,
            (SELECT COUNT(*) FROM playlists WHERE user_id = ?) as playlist_count
    `;
    db.get(userQuery, [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        db.get(statsQuery, [userId, userId], (err2, stats) => {
            res.json({ ...user, favCount: stats.fav_count, playlistCount: stats.playlist_count });
        });
    });
});

app.put('/api/profile', authenticate, (req, res) => {
    const { username, avatarData, birthdate } = req.body;
    const userId = req.user.userId;
    const query = 'UPDATE users SET username = ?, avatar_url = ?, birthdate = ? WHERE id = ?';
    db.run(query, [username, avatarData, birthdate, userId], function (err) {
        if (err) return res.status(400).json({ error: 'Error DB: ' + err.message });
        res.json({ message: 'Perfil actualizado' });
    });
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

// Proxy de audio: reenvía también las peticiones Range para que el
// <audio> del navegador pueda buscar (seek) dentro de la pista.
const pipeAudio = async (req, res, extraHeaders = {}, preResolved = null) => {
    try {
        const track = preResolved || await music.resolveTrack(req.query.query);
        if (!track) return res.status(404).send('No found');

        const upstreamHeaders = {};
        if (req.headers.range) upstreamHeaders.Range = req.headers.range;

        const upstream = await axios.get(track.url, {
            headers: upstreamHeaders,
            responseType: 'stream',
            timeout: 30000,
            validateStatus: (s) => s < 500
        });

        res.status(upstream.status);
        res.set('Content-Type', upstream.headers['content-type'] || track.mime);
        res.set('Accept-Ranges', upstream.headers['accept-ranges'] || 'bytes');
        if (upstream.headers['content-length']) res.set('Content-Length', upstream.headers['content-length']);
        if (upstream.headers['content-range']) res.set('Content-Range', upstream.headers['content-range']);
        if (req.query.duration) res.set('X-Content-Duration', req.query.duration);
        Object.entries(extraHeaders).forEach(([k, v]) => res.set(k, v));

        upstream.data.on('error', () => { try { res.end(); } catch (e) { /* cerrado */ } });
        upstream.data.pipe(res);
    } catch (err) {
        console.error('❌ Error de streaming:', err.message);
        if (!res.headersSent) res.status(500).send('Error stream');
        else try { res.end(); } catch (e) { /* cerrado */ }
    }
};

app.get('/api/music/stream', (req, res) => pipeAudio(req, res));

app.get('/api/music/download', async (req, res) => {
    // Nota: sin ffmpeg no se puede recodificar a MP3 real; se entrega
    // el audio original (m4a/webm) con el nombre del título.
    const name = (req.query.filename || req.query.query || 'track').toString()
        .replace(/[\\/:*?"<>|]+/g, ' ')
        .trim()
        .slice(0, 120) || 'track';

    try {
        const track = await music.resolveTrack(req.query.query);
        if (!track) return res.status(404).send('No found');
        const ascii = `${name}.${track.ext}`.replace(/[^\x20-\x7E]/g, '_');
        await pipeAudio(req, res, {
            'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(`${name}.${track.ext}`)}`
        }, track);
    } catch (err) {
        console.error('❌ Error de descarga:', err.message);
        if (!res.headersSent) res.status(500).send('Error descarga');
    }
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
// ==========================================
// 🌐 FRONTEND: servido por el mismo servidor
// (desde disco en desarrollo, o desde el bundle embebido en el .exe)
// ==========================================
const isCompiled = (typeof __COMPILED__ !== 'undefined' && __COMPILED__) || !!process.versions.sea;
const backendDir = (typeof __dirname === 'string' && __dirname && !isCompiled) ? __dirname : path.dirname(process.execPath);
const DISK_DIST = path.resolve(path.join(backendDir, '..', 'frontend', 'dist'));
const isSea = isCompiled;

let embedded = {};
try { embedded = require('./static-assets'); } catch (err) { embedded = {}; }

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp3': 'audio/mpeg'
};

const sendEmbedded = (rel, res) => {
    res.set('Content-Type', MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream');
    res.send(Buffer.from(embedded[rel], 'base64'));
};

const sendFromDisk = (rel, res) => {
    try {
        const target = path.normalize(path.join(DISK_DIST, rel));
        if (!target.startsWith(DISK_DIST)) return false;
        if (fs.existsSync(target) && fs.statSync(target).isFile()) {
            res.sendFile(target);
            return true;
        }
    } catch (err) { /* ignoramos y seguimos */ }
    return false;
};

if (!isSea && fs.existsSync(DISK_DIST)) {
    app.use(express.static(DISK_DIST));
}

// Fallback SPA (BrowserRouter): cualquier ruta no-API sirve index.html
app.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(404).send('Not found');
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Endpoint no encontrado' });

    const rel = req.path === '/' ? '/index.html' : req.path;

    if (isSea) {
        if (embedded[rel]) return sendEmbedded(rel, res);
        if (sendFromDisk(rel, res)) return;
    } else {
        if (sendFromDisk(rel, res)) return;
        if (embedded[rel]) return sendEmbedded(rel, res);
    }

    if (embedded['/index.html']) return sendEmbedded('/index.html', res);
    if (sendFromDisk('/index.html', res)) return;
    res.status(404).send('Frontend no disponible: ejecuta `npm run build` dentro de frontend/.');
});

// ==========================================
// 🚀 ARRANQUE (puerto libre + apertura del navegador)
// ==========================================
const CANDIDATE_PORTS = [5000, 5001, 5002, 5003, 5004, 5005];

const openBrowser = (url) => {
    if (process.env.SONAR_NO_BROWSER === '1') return;
    try {
        const { exec } = require('child_process');
        if (process.platform === 'win32') {
            exec(`start "" "${url}"`);
        } else if (process.platform === 'darwin') {
            exec(`open "${url}"`);
        } else {
            exec(`xdg-open "${url}"`);
        }
    } catch (err) { console.log('ℹ️  Ábrelo manualmente en tu navegador:', url); }
};

const tryListen = (index) => {
    if (index >= CANDIDATE_PORTS.length) {
        console.log('⚠️  No hay puertos libres. ¿Ya está SONAR abierto?');
        openBrowser('http://localhost:5000');
        return;
    }

    const port = CANDIDATE_PORTS[index];
    const server = app.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(`🚀 SONAR Server en puerto ${port}`);
        console.log(`🎧 Abriendo ${url}`);
        setTimeout(() => openBrowser(url), 400);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`ℹ️  Puerto ${port} ocupado, probando el siguiente...`);
            tryListen(index + 1);
        } else {
            console.error('❌ Error del servidor:', err.message);
        }
    });
};

tryListen(0);

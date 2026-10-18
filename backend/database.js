const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Consola limpia: solo mostramos las advertencias que importan
process.removeAllListeners('warning');
process.on('warning', (w) => {
    if (w.name !== 'ExperimentalWarning') console.warn(`${w.name}: ${w.message}`);
});

// ¿Estamos compilados dentro de un .exe (Bun compile / Node SEA)?
const isCompiled = (typeof __COMPILED__ !== 'undefined' && __COMPILED__) || !!process.versions.sea;

// ==========================================
// 📀 SQLite nativo de Node (sin módulos nativos compilados)
// Se expone con la misma API de callbacks que usaba `sqlite3`
// para no tener que tocar la lógica de server.js.
// ==========================================

const isSea = !!process.versions.sea; // true cuando corre dentro del .exe empaquetado

function pickDataDir() {
    const candidates = [];
    if (process.env.SONAR_DATA_DIR) candidates.push(process.env.SONAR_DATA_DIR);
    if (isCompiled) {
        // 1) Carpeta junto al .exe (modo portable) 2) APPDATA 3) Temp
        candidates.push(path.join(path.dirname(process.execPath), 'SONAR_data'));
        candidates.push(path.join(os.homedir(), 'AppData', 'Roaming', 'SONAR'));
        candidates.push(os.tmpdir());
    } else {
        candidates.push(__dirname);
    }

    for (const dir of candidates) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            const probe = path.join(dir, '.sonar-write-test');
            fs.writeFileSync(probe, 'ok');
            fs.unlinkSync(probe);
            return dir;
        } catch (err) { /* carpeta no escribible: probamos la siguiente */ }
    }
    return os.tmpdir();
}

const dataDir = pickDataDir();
const dbPath = path.join(dataDir, 'database.sqlite');

// 🌱 Semilla: la DB de ejemplo (playlist y favoritos de muestra) viaja
// incrustada dentro del .exe y se copia solo en la primera ejecución.
try {
    if (!fs.existsSync(dbPath) && isCompiled) {
        const assets = require('./static-assets');
        const seed = assets && assets['/__seed/database.sqlite'];
        if (seed) {
            fs.writeFileSync(dbPath, Buffer.from(seed, 'base64'));
            console.log('🌱 Base de datos inicial copiada (playlist y favoritos de ejemplo).');
        }
    }
} catch (err) { /* sin semilla: arrancamos con la base vacía */ }

const normalize = (params) => (params || []).map(v => (v === undefined ? null : v));

class SqliteDb {
    constructor(file) {
        this.raw = new DatabaseSync(file);
        this.dataDir = dataDir;
        this.dbPath = file;
    }

    serialize(fn) { if (typeof fn === 'function') fn(); return this; }

    run(sql, params, cb) {
        if (typeof params === 'function') { cb = params; params = []; }
        try {
            const info = this.raw.prepare(sql).run(...normalize(params));
            const ctx = { lastID: Number(info.lastInsertRowid), changes: Number(info.changes) };
            if (cb) cb.call(ctx, null);
        } catch (err) {
            if (cb) cb.call({}, err); else console.error('DB run error:', err.message);
        }
        return this;
    }

    get(sql, params, cb) {
        if (typeof params === 'function') { cb = params; params = []; }
        try {
            const row = this.raw.prepare(sql).get(...normalize(params));
            if (cb) cb(null, row);
            return row;
        } catch (err) {
            if (cb) { cb(err); return undefined; }
            throw err;
        }
    }

    all(sql, params, cb) {
        if (typeof params === 'function') { cb = params; params = []; }
        try {
            const rows = this.raw.prepare(sql).all(...normalize(params));
            if (cb) cb(null, rows);
            return rows;
        } catch (err) {
            if (cb) { cb(err); return undefined; }
            throw err;
        }
    }

    close() { try { this.raw.close(); } catch (err) { /* ya cerrada */ } }
}

const db = new SqliteDb(dbPath);
console.log(`📀 Base de datos local: ${dbPath}`);

// ==========================================
// 🛠️ REPARACIÓN Y MANTENIMIENTO DE DB
// ==========================================
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        cover_url TEXT,
        description TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS playlist_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER,
        track_id TEXT,
        track_data TEXT,
        FOREIGN KEY(playlist_id) REFERENCES playlists(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        track_id TEXT,
        track_data TEXT,
        UNIQUE(user_id, track_id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Columnas que podían faltar en bases de datos antiguas
    db.run('ALTER TABLE users ADD COLUMN avatar_url TEXT', (err) => {
        if (!err) console.log("✅ Columna avatar_url lista.");
    });
    db.run('ALTER TABLE users ADD COLUMN birthdate TEXT', (err) => {
        if (!err) console.log("✅ Columna birthdate lista.");
    });
    db.run('ALTER TABLE playlists ADD COLUMN cover_url TEXT', (err) => {
        if (!err) console.log("✅ Columna cover_url añadida a playlists.");
    });
    db.run('ALTER TABLE playlists ADD COLUMN description TEXT', (err) => {
        if (!err) console.log("✅ Columna description añadida a playlists.");
    });

    // ==========================================
    // 👤 USUARIO ÚNICO LOCAL (sin login ni registro)
    // Se reutiliza la primera fila existente para no perder datos.
    // ==========================================
    const existing = db.get('SELECT id FROM users ORDER BY id LIMIT 1');
    if (existing && existing.id) {
        db.run('UPDATE users SET username = ?, password = NULL WHERE id = ?', ['SONAR', existing.id]);
        db.localUserId = existing.id;
    } else {
        db.run('INSERT INTO users (id, username) VALUES (?, ?)', [1, 'SONAR']);
        db.localUserId = 1;
    }
    console.log(`✅ Usuario local único: SONAR (id ${db.localUserId})`);
});

module.exports = db;

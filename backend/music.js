// ==========================================
// 🎵 MOTOR DE STREAMING (YouTube vía Innertube)
//
// Motivo: play-dl ya no funciona (SoundCloud cifra con FairPlay y
// YouTube devolvió formatos sin URL para clientes web).
//
// Cliente usado: VISIONOS. Es el único que devuelve URLs directas de
// audio SIN exigir "PO token", y por tanto sirve la pista COMPLETA con
// rangos (búsquedas/avances incluidos). Los clientes ANDROID e IOS sí
// limitan la respuesta al primer ~1 MB (pruebas 2026-10-18).
//
// Solo usamos axios (búsqueda + reproductor): todo JavaScript puro,
// se empaqueta sin problemas dentro del .exe.
// ==========================================
const axios = require('axios');

const PLAYER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
const ANDROID_UA = 'com.google.android.youtube/21.26.364 (Linux; U; Android 11) gzip';
const WEB_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const TIME_RE = /^(?:\d+:)?\d{1,2}:\d{2}$/;

// Dos clientes con URL directa y rango completo (ninguno exige PO token):
//  - VISIONOS → audios adaptivos puros (mejor: archivo pequeño y solo audio)
//  - ANDROID  → formato muxed (vídeo+audio): única vía válida para los
//               canales "Topic" (solo audio), que VISIONOS rechaza
const CLIENTS = {
    visionos: {
        ua: PLAYER_UA,
        source: 'adaptive',
        client: {
            clientName: 'VISIONOS',
            clientVersion: '1.02',
            deviceMake: 'Apple',
            deviceModel: 'RealityDevice17,1',
            osName: 'visionOS',
            osVersion: '26.5.23O471',
            hl: 'es',
            gl: 'US'
        }
    },
    android: {
        ua: ANDROID_UA,
        source: 'muxed',
        client: {
            clientName: 'ANDROID',
            clientVersion: '21.26.364',
            androidSdkVersion: 30,
            osName: 'Android',
            osVersion: '11',
            hl: 'es',
            gl: 'US'
        }
    }
};

// Las URLs de googlevideo caducan (≈6 h): cacheamos por consulta
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_MAX = 100;

const extFor = (mime) => {
    const m = (mime || '').toLowerCase();
    if (m.includes('video/mp4')) return 'mp4';
    if (m.includes('audio/mp4')) return 'm4a';
    if (m.includes('webm')) return 'webm';
    if (m.includes('ogg') || m.includes('opus')) return 'ogg';
    return 'm4a';
};

// El cliente VISIONOS exige visitorData (si no, responde LOGIN_REQUIRED).
// Lo pedimos una vez (página de YouTube) y lo reutilizamos; si caduca,
// volvemos a pedirlo con el visitorData que devuelve la propia respuesta.
let cachedVisitorData = '';

async function ensureVisitorData() {
    if (cachedVisitorData) return cachedVisitorData;
    try {
        const { data } = await axios.get('https://www.youtube.com/', {
            headers: { 'User-Agent': WEB_UA, 'Accept-Language': 'es-ES,es;q=0.9' },
            timeout: 15000
        });
        const m = data.match(/"visitorData":"([^"]+)"/);
        if (m) cachedVisitorData = m[1];
    } catch (err) { /* seguimos sin él: fetchPlayer reintenta con la respuesta */ }
    return cachedVisitorData;
}

async function fetchPlayer(videoId, clientKey) {
    const cfg = CLIENTS[clientKey];
    const url = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';

    const makeBody = () => ({
        context: {
            client: {
                ...cfg.client,
                ...(cachedVisitorData ? { visitorData: cachedVisitorData } : {})
            }
        },
        videoId,
        contentCheckOk: true,
        racyCheckOk: true
    });

    const makeHeaders = () => ({
        'Content-Type': 'application/json',
        'User-Agent': cfg.ua,
        'X-Goog-Api-Format-Version': '2',
        ...(cachedVisitorData ? {
            'X-Goog-Visitor-Id': cachedVisitorData,
            'X-Youtube-Client-Name': clientKey === 'android' ? '3' : '101',
            'X-Youtube-Client-Version': cfg.client.clientVersion,
            'Origin': 'https://www.youtube.com'
        } : {})
    });

    const post = async () => (await axios.post(url, makeBody(), {
        headers: makeHeaders(),
        timeout: 20000,
        validateStatus: () => true
    })).data;

    let data = await post();
    const status = data.playabilityStatus && data.playabilityStatus.status;
    if (status !== 'OK') {
        const vd = (data.responseContext && data.responseContext.visitorData) || '';
        if (vd && vd !== cachedVisitorData) {
            cachedVisitorData = vd;
            data = await post();
        }
    }
    return data;
}

function pickAudioFormat(data, source) {
    const streaming = data.streamingData || {};
    if (source === 'muxed') {
        // Formato "muxed" (vídeo+audio): el único con URL abierta en ANDROID.
        // Elegimos el de menor resolución → archivo más ligero para stream.
        const muxed = (streaming.formats || []).filter(f => f.url);
        if (!muxed.length) return null;
        muxed.sort((a, b) => Number(a.width || 9999) - Number(b.width || 9999));
        return muxed[0];
    }
    const audio = (streaming.adaptiveFormats || []).filter(f => (f.mimeType || '').includes('audio') && f.url);
    if (!audio.length) return null;
    // Preferimos mp4/aac: el navegador conoce la duración desde el inicio y permite buscar
    const mp4 = audio.filter(f => (f.mimeType || '').includes('audio/mp4'));
    const pool = mp4.length ? mp4 : audio;
    const kbps = (f) => Number(f.averageBitrate || f.audioBitrate || f.bitrate || 0);
    pool.sort((a, b) => kbps(b) - kbps(a));
    return pool[0];
}

function textOf(t) {
    if (!t) return '';
    if (typeof t === 'string') return t;
    if (t.simpleText) return t.simpleText;
    if (Array.isArray(t.runs)) return t.runs.map(r => (r && r.text) || '').join('');
    if (typeof t.content === 'string') return t.content;
    return '';
}

function parseDuration(str) {
    if (!str || !TIME_RE.test(str)) return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
}

// Búsqueda directa en YouTube (Innertube). Sin librerías externas de
// scraping: recorremos el JSON buscando vídeos, tanto en el formato
// clásico (videoRenderer) como en el actual (lockupViewModel).
async function findYouTubeVideo(query) {
    const { data } = await axios.post('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
        query,
        context: { client: { clientName: 'WEB', clientVersion: '2.20250219.01.00', hl: 'es', gl: 'US' } }
    }, {
        headers: { 'Content-Type': 'application/json', 'User-Agent': WEB_UA },
        timeout: 20000
    });

    const results = [];
    const seen = new Set();
    const push = (id, title, seconds) => {
        if (typeof id !== 'string' || id.length !== 11 || seen.has(id)) return;
        seen.add(id);
        results.push({ videoId: id, title: title || '', seconds: seconds || 0 });
    };

    const walk = (node, depth) => {
        if (!node || typeof node !== 'object' || depth > 14) return;
        if (Array.isArray(node)) { node.forEach(n => walk(n, depth + 1)); return; }

        if (node.videoRenderer && node.videoRenderer.videoId) {
            const vr = node.videoRenderer;
            push(vr.videoId, textOf(vr.title), parseDuration(textOf(vr.lengthText)));
        } else {
            const lm = node.lockupViewModel;
            if (lm && typeof lm.contentId === 'string' && /VIDEO/i.test(String(lm.contentType || ''))) {
                const meta = lm.metadata && lm.metadata.lockupMetadataViewModel;
                const match = JSON.stringify(lm).match(/"(\d{1,2}:\d{2}(?::\d{2})?)"/);
                push(lm.contentId, meta ? textOf(meta.title) : '', match ? parseDuration(match[1]) : 0);
            } else if (typeof node.videoId === 'string' && node.videoId.length === 11) {
                const title = textOf(node.title) || textOf(node.headline);
                const seconds = parseDuration(textOf(node.lengthText));
                if (title || seconds) push(node.videoId, title, seconds);
            }
        }

        for (const key of Object.keys(node)) walk(node[key], depth + 1);
    };
    walk(data, 0);

    if (!results.length) return null;
    return results.find(v => v.seconds > 0) || results[0];
}

/**
 * Resuelve una consulta ("Artista Título") a una URL de audio reproducible.
 * Devuelve { url, mime, ext, title, seconds, videoId } o null.
 */
async function resolveTrack(query, opts = {}) {
    const key = String(query || '').trim().toLowerCase();
    const hit = cache.get(key);
    if (!opts.fresh && hit && Date.now() - hit.time < CACHE_TTL) return hit.value;

    const video = await findYouTubeVideo(query);
    if (!video) return null;

    await ensureVisitorData();

    // Probamos los clientes en orden hasta encontrar URL directa usable.
    let fmt = null;
    let lastStatus = '';
    for (const clientKey of ['visionos', 'android']) {
        const data = await fetchPlayer(video.videoId, clientKey);
        const status = data.playabilityStatus && data.playabilityStatus.status;
        if (status !== 'OK') { lastStatus = status || lastStatus; continue; }
        fmt = pickAudioFormat(data, CLIENTS[clientKey].source);
        if (fmt) break;
    }

    if (!fmt) {
        throw new Error('Vídeo no reproducible' + (lastStatus ? ': ' + lastStatus : ''));
    }

    const value = {
        url: fmt.url,
        mime: (fmt.mimeType || 'audio/mp4').split(';')[0].trim(),
        ext: extFor(fmt.mimeType),
        title: video.title,
        seconds: video.seconds,
        videoId: video.videoId
    };

    if (cache.size >= CACHE_MAX) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
    }
    cache.set(key, { time: Date.now(), value });
    return value;
}

module.exports = { resolveTrack, extFor };

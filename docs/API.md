# 🔌 API

Servidor Express en `http://localhost:5000` (autoincrementa `5000 → 5005` si el puerto está ocupado).
Todas las respuestas son JSON salvo `stream` y `download`, que devuelven audio.

> **Nota:** no hay autenticación real. Los endpoints marcados con 🔒 usan el *middleware* `authenticate`,
> que fija siempre el usuario local `SONAR` (`userId = 1`).

---

## Perfil

### `GET /api/profile` 🔒

```json
{
  "id": 1,
  "username": "SONAR",
  "avatar_url": "data:image/png;base64,..." | null,
  "birthdate": "2000-01-01" | null,
  "favCount": 2,
  "playlistCount": 1
}
```

### `PUT /api/profile` 🔒

Cuerpo: `{ "username": "string", "avatarData": "data:image/...|null", "birthdate": "YYYY-MM-DD|null" }`

→ `{ "message": "Perfil actualizado" }` · `400` si falla la BD.

---

## Música

### `GET /api/music/trending`

Proxy de `https://api.deezer.com/chart/0/tracks`.

```json
{ "data": [ { "id": 3818963601, "title": "...", "duration": 209,
              "artist": { "name": "..." }, "album": { "cover_xl": "https://...", ... } } ] }
```

### `GET /api/music/search?q=<texto>`

Proxy de `https://api.deezer.com/search?q=...` → misma forma que *trending*.
El parámetro se llama **`q`** (si no viene, Deezer devuelve resultados vacíos).

### `GET /api/music/stream?query=<título o artista>&duration=<segundos>`

- Devuelve el **audio** de la pista resuelta por el motor propio (YouTube Innertube).
- Soporta **`Range`**: responde `206 Partial Content` con `Content-Range` y `Accept-Ranges: bytes`
  → el reproductor puede hacer *seek*.
- `duration` es opcional; se refleja en la cabecera `X-Content-Duration`.
- `Content-Type`: normalmente `audio/mp4` (o `video/mp4` en el formato *muxed* de respaldo).
- `404` si no se encuentra la pista, `500` si falla la fuente.

Ejemplo:

```bash
curl -H "Range: bytes=0-1023" \
  "http://localhost:5000/api/music/stream?query=bad%20bunny%20titi&duration=209"
# → HTTP/1.1 206 Partial Content, 1024 bytes
```

### `GET /api/music/download?query=<...>&filename=<nombre opcional>`

- Igual que `stream` pero con `Content-Disposition: attachment; filename="..."`.
- Extensión real del archivo: **`.m4a`** (o **`.mp4`** para el formato *muxed* de canales “Topic”).
  No hay recodificación a MP3 (no se usa ffmpeg).
- `filename` se sanea (sin `\/:*?"<>|`, máx. 120 caracteres) y se convierte a ASCII para el nombre
  `filename=`, conservando UTF-8 en `filename*=`.

---

## Favoritos 🔒

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/favorites` | Lista de favoritos con `track_data` ya parseado. |
| `POST` | `/api/favorites` | Añade. Cuerpo: `{ "track_id": ..., "track_data": {...} }` → `{ "success": true }`; `400` si ya existía. |
| `DELETE` | `/api/favorites/:trackId` | Quita → `{ "success": true }` (idempotente). |

---

## Playlists 🔒

`ensurePlaylistOwner` verifica que la playlist pertenezca al usuario antes de tocar sus pistas (`404` si no).

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `GET` | `/api/playlists` | — | `[{ id, user_id, name, description, cover_url }]` |
| `POST` | `/api/playlists` | `{ "name": "..." }` | `{ id, name }` |
| `PUT` | `/api/playlists/:id` | `{ name?, description?, cover_data? }` | `{ success: true }` (usa `COALESCE`: lo que no llega no se toca) |
| `DELETE` | `/api/playlists/:id` | — | Borra pistas y luego la playlist → `{ success: true }` |
| `GET` | `/api/playlists/:id/tracks` | — | `[{ id, playlist_id, track_id, track_data:{...} }]` |
| `POST` | `/api/playlists/:id/tracks` | `{ track_id, track_data }` | `{ success: true }` · `409` si ya estaba |
| `DELETE` | `/api/playlists/:id/tracks/:rowId` | — | Borra **esa fila** (evita borrar duplicados) |
| `DELETE` | `/api/playlists/:id/tracks/by-track/:trackId` | — | Borra todas las filas de esa pista |

`track_data` es el objeto completo de la pista (título, artista, álbum, duración…) serializado en JSON
dentro de la columna; la API lo devuelve **parseado**.

---

## Estáticos

| Ruta | Contenido |
|---|---|
| `GET /` | `index.html` (SPA). |
| `GET /manifest.webmanifest` | Manifiesto PWA (`application/manifest+json`). |
| `GET /sw.js` | Service worker. |
| `GET /icons/icon-*.png` | Iconos PWA (192 / 512 / 512 maskable). |
| `GET /assets/*` | JS/CSS compilados por Vite. |

Fuente: `frontend/dist` en desarrollo, o el bundle embebido `backend/static-assets.js` en el `.exe`.
Rutas desconocidas caen en el `index.html` (enrutado SPA); las rutas `/api/*` inexistente devuelven `404` JSON.

---

## Códigos de estado habituales

| Código | Cuándo |
|---|---|
| `206` | Respuesta parcial de audio (rango solicitado). |
| `400` | Error de base de datos en escritura. |
| `404` | Pista no encontrada / playlist inexistente. |
| `409` | Pista ya presente en la playlist. |
| `500` | La fuente externa (Deezer/YouTube) falló. |

---

Siguiente: [Desarrollo →](./DESARROLLO.md)

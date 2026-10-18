# 🏗️ Arquitectura

SONAR es una aplicación de **un solo ejecutable**: dentro viven, en el mismo proceso, el servidor Express,
la base de datos SQLite y el frontend React compilado.

```
┌─────────────────────────── SONAR.exe (Bun) ───────────────────────────┐
│  Express (puerto 5000..5005)                                          │
│   ├── /api/*          → lógica de negocio + SQLite (node:sqlite)      │
│   ├── /api/music/*    → proxy de audio (Range) hacia googlevideo      │
│   └── /*              → frontend embebido (static-assets.js)          │
│                                                                       │
│  Datos: SONAR_data\database.sqlite  (o %APPDATA%\SONAR)               │
└───────────────────────────────────────────────────────────────────────┘
              ▲                         ▲
              │ HTTP (mismo origen)     │ HTTPS
        ventana --app (Edge/Chrome)   Deezer API · YouTube Innertube
```

---

## 1. Frontend (`frontend/`)

React 19 + Vite 7 + Tailwind CSS 4, enrutado con `react-router-dom`.

| Ruta | Página | Fichero |
|---|---|---|
| `/` | Inicio (tendencias) | `src/pages/Home.jsx` |
| `/search` | Buscar | `src/pages/Search.jsx` |
| `/library` | Biblioteca y playlists | `src/pages/Library.jsx` |
| `/profile` | Perfil local | `src/pages/Profile.jsx` |

Componentes y estado:

- `src/components/Sidebar.jsx` — navegación; raíl de iconos bajo 768 px.
- `src/components/Player.jsx` — reproductor fijo inferior (columnas flexibles, sin anchos fijos).
- `src/components/AddToPlaylistModal.jsx` — añadir una pista a una playlist.
- `src/contexts/PlayerContext.jsx` — pista actual, cola, volumen, progreso y `seek`.
- `src/contexts/LibraryContext.jsx` — favoritos, playlists y descargas (todo vía `/api`).
- `src/contexts/AuthContext.jsx` — usuario local fijo `{ id: 1, username: 'SONAR' }` (**sin login**).
- `src/hooks/useColorThief.js` — extrae el color dominante de la carátula para el tema dinámico.

En desarrollo, Vite (puerto 5173) hace *proxy* de `/api` hacia `http://localhost:5000`
(ver `frontend/vite.config.js`).

### PWA

- `public/manifest.webmanifest` → nombre, iconos, `display: standalone`, colores `#050505`.
- `public/sw.js` → *service worker*: red primero y caché como respaldo para la interfaz
  (**nunca** intercepta `/api/*` ni el audio).
- `public/icons/` → 192, 512 y 512 *maskable* (generados por `backend/icon/build-icons-web.ps1`).

---

## 2. Servidor (`backend/server.js`)

- Express 5 + `cors` + `body-parser` propio (`express.json({ limit: '10mb' })` para avatares/portadas en Base64).
- **Autenticación ficticia**: el *middleware* `authenticate` no valida nada; fija
  `req.user = { userId: db.localUserId, username: 'SONAR' }`. Por eso el resto de endpoints “piden
  usuario” pero nunca pueden fallar.
- **Frontend**: intenta servir `frontend/dist` desde disco (desarrollo); si no existe, sirve el bundle
  embebido `static-assets.js` (`.exe`).
- **Lanzador de ventana**: busca Edge o Chrome y los abre con `--app=http://localhost:5000`
  (ventana de aplicación sin pestañas). Si no hay ninguno, usa `start <url>`.

---

## 3. Motor de música (`backend/music.js`)

Motor propio (sin `yt-dlp`, `play-dl` ni `ffmpeg`), en dos fases:

1. **Metadatos** → API pública de Deezer (`api.deezer.com/chart/0/tracks` y `/search?q=`) para portadas,
   títulos, artistas y duraciones.
2. **Audio** → YouTube *Innertube*:
   - **Búsqueda** con cliente `WEB` y paseo genérico del JSON de respuesta
     (`videoRenderer` y `lockupViewModel`).
   - **Reproducción** con cliente **`VISIONOS`**: audios completos y sin PO token.
     Requiere `visitorData`, que se obtiene de la home de YouTube y se cachea (se refresca desde
     `responseContext` si caduca).
   - **Fallback `ANDROID` 21.26.364** (formato *muxed*): única vía para canales “Topic” que VISIONOS
     rechaza.
   - Los formatos adaptativos de ANDROID/IOS se descartan: la CDN solo entrega ~1 MB por rango.
- **Caché**: `Map` con TTL de 30 minutos y máximo 100 entradas (`resolveTrack`).
- **Salida**: `resolveTrack(query)` → `{ url, mime, ext, ... }`.

### Proxy de audio (`pipeAudio`)

- Reenvía la cabecera `Range` del navegador y devuelve **206 Partial Content** con `Content-Range`,
  `Accept-Ranges` y `Content-Length` → el `<audio>` puede hacer *seek*.
- Añade `X-Content-Duration` cuando se pasa `duration`.
- **Descarga**: mismos bytes pero con `Content-Disposition: attachment` y nombre saneado.

---

## 4. Base de datos (`backend/database.js`)

Adaptador sobre **`node:sqlite`** (`DatabaseSync`) con API de callbacks tipo `better-sqlite3`,
evitando módulos nativos (clave para poder compilar con Bun).

| Tabla | Columnas | Contenido |
|---|---|---|
| `users` | `id, username, avatar_url, birthdate` | Un único usuario local (id 1, “SONAR”). |
| `playlists` | `id, user_id, name, description, cover_url` | Portada en Base64. |
| `playlist_tracks` | `id, playlist_id, track_id, track_data(JSON)` | Duplicados comprobados antes de insertar. |
| `favorites` | `id, user_id, track_id, track_data(JSON)` | El JSON completo de la pista. |

- El fichero `backend/database.sqlite` es la **semilla**: se incrusta en el paquete como
  `/__seed/database.sqlite` y se copia en `SONAR_data` en la **primera ejecución**.
- Ruta de datos: `SONAR_DATA_DIR` → `.\SONAR_data` junto al `.exe` → `%APPDATA%\SONAR`.

---

## 5. Flujo de reproducción

```
Usuario pulsa una pista
  → PlayerContext monta la cola y llama a /api/music/stream?query=...&duration=...
  → music.resolveTrack(query) (caché → Innertube VISIONOS → fallback ANDROID)
  → pipeAudio abre el stream con la cabecera Range del navegador
  → 206 con bytes ←→ <audio> (seek instantáneo, progreso y volumen)
```

---

## 6. Empaquetado (ver [EMPACADO.md](./EMPACADO.md))

`backend/pack.js` encadena: **Vite build → incrustar assets → esbuild (CJS) → `bun build --compile`
→ `rcedit`** (icono y propiedades de Windows). El instalador lo genera Inno Setup 7.

---

Siguiente: [API →](./API.md)

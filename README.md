# 🎵 SONAR — Música local sin cuentas

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" />
</div>

---

**SONAR** es un reproductor de música para **Windows 10/11** que funciona en una sola ventana:
busca canciones, organiza tu biblioteca y guarda todo **en local**, sin registro ni contraseña.

- 🖥️ **Un solo `.exe`**: servidor, interfaz y base de datos embebidos (no instala nada más).
- 🔍 **Búsqueda + streaming** con salto (*seek*) instantáneo dentro de la pista.
- 📂 **Biblioteca**: playlists con portada, favoritos y descargas en SQLite local.
- ⬇️ **Descargas** en `.m4a` / `.mp4` reales (sin ffmpeg).
- 🎨 **Interfaz dinámica**: el color sale de la carátula; adaptable de 320 px a pantallas grandes.
- 📲 **App instalable (PWA)**: se abre en ventana propia sin pestañas y se instala en Windows.

> 📚 **Documentación completa en [`docs/`](./docs/README.md)** — instalación, guía de uso, arquitectura,
> API, desarrollo, empaquetado, publicación, changelog y solución de problemas.

---

## 🚀 Empezar

**Usuario final:** ve a la [release v1.0.0](https://github.com/alberto2005-coder/SONAR_MusicApp/releases)
y descarga `SONAR-Setup-1.0.0.exe` (instalador) o `SONAR.exe` (portable) → doble clic.
Detalles en [docs/INSTALACION.md](./docs/INSTALACION.md).

**Desarrollador:**

```powershell
git clone https://github.com/alberto2005-coder/SONAR_MusicApp.git
cd SONAR_MusicApp

cd backend  ; npm install ; npm start     # API → http://localhost:5000
cd ..\frontend ; npm install ; npm run dev  # SPA → http://localhost:5173
```

Para generar el ejecutable:

```powershell
cd frontend ; npm run build
cd ..\backend ; npm run pack:exe          # → backend\build\SONAR.exe
```

---

## 💻 Tecnologías

| Frontend | Backend | Empaquetado |
| --- | --- | --- |
| React 19 + Vite 7 | Express 5 | Bun (`bun build --compile`) |
| Tailwind CSS 4 | SQLite vía `node:sqlite` | `rcedit` (icono/propiedades) |
| lucide-react, framer-motion | axios, cors | Inno Setup 7 (instalador) |
| PWA (manifest + service worker) | Motor propio Innertube (sin yt-dlp/play-dl) | esbuild |

---

## 📂 Estructura

```text
SONAR_MusicApp/
├── backend/            # Servidor, motor de música, BD y empaquetado
│   ├── server.js       # API + proxy de audio + frontend embebido
│   ├── music.js        # Búsqueda y reproducción (YouTube Innertube)
│   ├── database.js     # SQLite local (sin módulos nativos)
│   ├── pack.js         # Genera el .exe
│   ├── icon/           # Iconos (.ico y PWA)
│   └── installer/      # Script de Inno Setup
├── frontend/           # SPA React (páginas, contextos, componentes)
├── docs/               # 📚 Toda la documentación
└── README.md
```

---

## 📖 Índice de documentación

1. [Instalación](./docs/INSTALACION.md)
2. [Guía de uso](./docs/GUIA-DE-USO.md)
3. [Arquitectura](./docs/ARQUITECTURA.md)
4. [API](./docs/API.md)
5. [Desarrollo](./docs/DESARROLLO.md)
6. [Empaquetado (.exe e instalador)](./docs/EMPACADO.md)
7. [Publicación de releases](./docs/PUBLICACION.md)
8. [Cambios](./docs/CAMBIOS.md)
9. [Solución de problemas](./docs/TROUBLESHOOTING.md)

---

> **Sin cuentas:** no hay login ni registro; la app crea un usuario local `SONAR` y guarda todo en
> `SONAR_data` junto al `.exe` (o en `%APPDATA%\SONAR`).

<div align="center">
<b>Desarrollado por Alberto Ortiz</b>
<i>SONAR — Reproductor de música local</i>
</div>


---

# English Version

**SONAR** is a music player for **Windows 10/11** that runs in a single window: search songs, organize your library and keep everything **stored locally**, with no account or password required.

- 🖥️ **Single `.exe`**: server, UI and database bundled in (nothing else installed).
- 🔍 **Search + streaming** with instant seek inside the track.
- 📂 **Library**: playlists with cover art, favorites and downloads in local SQLite.
- ⬇️ **Real `.m4a` / `.mp4`** downloads (no ffmpeg needed).
- 🎨 **Dynamic UI**: colors extracted from the album art; scales from 320 px to large screens.
- 📲 **Installable app (PWA)**: opens in its own window and installs on Windows.

> 📚 **Full documentation in [`docs/`](./docs/README.md)** — installation, usage guide, architecture, API, development, packaging, releases, changelog and troubleshooting.

## Getting Started

**End user:** go to the [v1.0.0 release](https://github.com/alberto2005-coder/SONAR_MusicApp/releases) and download `SONAR-Setup-1.0.0.exe` (installer) or `SONAR.exe` (portable) → double-click. Details in [docs/INSTALACION.md](./docs/INSTALACION.md).

**Developer:**

```powershell
git clone https://github.com/alberto2005-coder/SONAR_MusicApp.git
cd SONAR_MusicApp

cd backend  ; npm install ; npm start      # API -> http://localhost:5000
cd ..\frontend ; npm install ; npm run dev # SPA -> http://localhost:5173
```

To build the executable:

```powershell
cd frontend ; npm run build
cd ..\backend ; npm run pack:exe          # -> backend\build\SONAR.exe
```

## Tech Stack

| Frontend | Backend | Packaging |
| --- | --- | --- |
| React 19 + Vite 7 | Express 5 | Bun (`bun build --compile`) |
| Tailwind CSS 4 | SQLite via `node:sqlite` | `rcedit` (icon/properties) |
| lucide-react, framer-motion | axios, cors | Inno Setup 7 (installer) |
| PWA (manifest + service worker) | Own Innertube engine (no yt-dlp/play-dl) | esbuild |

## Project Structure

```text
SONAR_MusicApp/
├── backend/            # Server, music engine, DB and packaging
│   ├── server.js       # API + audio proxy + embedded frontend
│   ├── music.js        # Search and playback (YouTube Innertube)
│   ├── database.js     # Local SQLite (no native modules)
│   ├── pack.js         # Builds the .exe
│   ├── icon/           # Icons (.ico and PWA)
│   └── installer/      # Inno Setup script
├── frontend/           # React SPA (pages, contexts, components)
├── docs/               # Full documentation
└── README.md
```

## Documentation Index

1. [Installation](./docs/INSTALACION.md)
2. [User Guide](./docs/GUIA-DE-USO.md)
3. [Architecture](./docs/ARQUITECTURA.md)
4. [API](./docs/API.md)
5. [Development](./docs/DESARROLLO.md)
6. [Packaging (.exe and installer)](./docs/EMPACADO.md)
7. [Release publishing](./docs/PUBLICACION.md)
8. [Changelog](./docs/CAMBIOS.md)
9. [Troubleshooting](./docs/TROUBLESHOOTING.md)

> **No accounts:** there is no login or sign-up; the app creates a local `SONAR` user and stores everything in `SONAR_data` next to the `.exe` (or in `%APPDATA%\SONAR`).

<div align="center">
<b>Developed by Alberto Ortiz</b>
<i>SONAR — Local music player</i>
</div>

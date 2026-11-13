# SONAR — reproductor de música local

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-local-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![MIT](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE)

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Características](#características)
- [Documentación](#documentación)
- [Instalación como usuario](#instalación-como-usuario)
- [Desarrollo](#desarrollo)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos y privacidad](#datos-y-privacidad)
- [Aviso de uso](#aviso-de-uso)
- [Licencia](#licencia)

### Descripción

**SONAR** es un reproductor de música para **Windows 10/11** que funciona en una sola ventana: busca canciones, organiza la biblioteca y lo guarda todo **en local**, sin registro ni contraseña. El servidor, la interfaz y la base de datos van empaquetados en un único ejecutable.

### Características

- **Un solo `.exe`** con servidor, UI y SQLite embebidos.
- **Búsqueda y streaming** con salto instantáneo dentro de la pista.
- **Biblioteca local**: playlists con portada, favoritos y descargas.
- **Descargas reales** en `.m4a` / `.mp4` sin necesidad de ffmpeg.
- **Interfaz dinámica**: los colores salen de la carátula y se adapta desde 320 px.
- **PWA instalable** que se abre en su propia ventana.
- **Sin cuentas**: crea un usuario local `SONAR` y guarda los datos en `SONAR_data` junto al `.exe` o en `%APPDATA%\SONAR`.

### Documentación

La documentación completa vive en [`docs/`](docs/README.md):

1. [Instalación](docs/INSTALACION.md)
2. [Guía de uso](docs/GUIA-DE-USO.md)
3. [Arquitectura](docs/ARQUITECTURA.md)
4. [API](docs/API.md)
5. [Desarrollo](docs/DESARROLLO.md)
6. [Empaquetado](docs/EMPACADO.md)
7. [Publicación de releases](docs/PUBLICACION.md)
8. [Cambios](docs/CAMBIOS.md)
9. [Solución de problemas](docs/TROUBLESHOOTING.md)

### Instalación como usuario

Descarga desde [Releases](https://github.com/alberto2005-coder/SONAR_MusicApp/releases):

- `SONAR-Setup-1.0.0.exe` — instalador.
- `SONAR.exe` — versión portable.

Doble clic y listo. No requiere instalar Node.js ni ffmpeg.

### Desarrollo

Requisitos: **Node.js 22 o superior** (usa `node:sqlite`), npm y, para empaquetar, **Bun**.

```powershell
git clone https://github.com/alberto2005-coder/SONAR_MusicApp.git
cd SONAR_MusicApp

cd backend  ; npm install ; npm start        # API → http://localhost:5000
cd ..\frontend ; npm install ; npm run dev   # SPA → http://localhost:5173
```

Para generar el ejecutable:

```powershell
cd frontend ; npm run build
cd ..\backend ; npm run pack:exe             # → backend\build\SONAR.exe
```

### Tecnologías

| Frontend | Backend | Empaquetado |
|---|---|---|
| React 19 + Vite 7 | Express 5 | Bun (`bun build --compile`) |
| Tailwind CSS 4 | SQLite vía `node:sqlite` | `rcedit` (icono y propiedades) |
| lucide-react, framer-motion | axios, cors | Inno Setup 7 |
| PWA (manifest + service worker) | Motor Innertube propio | esbuild |

### Estructura del proyecto

```text
SONAR_MusicApp/
├── backend/
│   ├── server.js       # API, proxy de audio y frontend embebido
│   ├── music.js        # Búsqueda y reproducción
│   ├── database.js     # SQLite local
│   ├── pack.js         # Generación del .exe
│   ├── icon/           # Iconos
│   └── installer/      # Script de Inno Setup
├── frontend/           # SPA de React
├── docs/               # Documentación
├── LICENSE
└── README.md
```

### Datos y privacidad

No hay login ni telemetría: la biblioteca, las playlists y los favoritos se guardan en SQLite dentro de la carpeta de datos local. Borrar esa carpeta reinicia la aplicación. Para mover la biblioteca a otro equipo, copia `SONAR_data` (o la carpeta de `%APPDATA%\SONAR`).

### Aviso de uso

SONAR accede a contenido público mediante un motor propio. Úsalo para contenido al que tengas derecho y respeta los **términos de servicio** de las plataformas de origen y la legislación de tu país. El proyecto no aloja música ni concede licencias sobre ella.

### Licencia

**MIT** — consulta [LICENSE](LICENSE).

---

## English

### Table of contents

- [Overview](#overview)
- [Features](#features)
- [Documentation](#documentation)
- [Installing as a user](#installing-as-a-user)
- [Development](#development)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Data and privacy](#data-and-privacy)
- [Usage notice](#usage-notice)
- [License](#license)

### Overview

**SONAR** is a music player for **Windows 10/11** that runs in a single window: search songs, organise your library and keep everything **local**, with no account or password. The server, UI and database are bundled into one executable.

### Features

- **A single `.exe`** with the server, UI and SQLite embedded.
- **Search and streaming** with instant seeking within a track.
- **Local library**: playlists with cover art, favourites and downloads.
- **Real downloads** in `.m4a` / `.mp4` without ffmpeg.
- **Dynamic UI**: colours extracted from the cover art, scaling from 320 px.
- **Installable PWA** that opens in its own window.
- **No accounts**: it creates a local `SONAR` user and stores data in `SONAR_data` next to the `.exe` or in `%APPDATA%\SONAR`.

### Documentation

Full documentation lives in [`docs/`](docs/README.md):

1. [Installation](docs/INSTALACION.md)
2. [User guide](docs/GUIA-DE-USO.md)
3. [Architecture](docs/ARQUITECTURA.md)
4. [API](docs/API.md)
5. [Development](docs/DESARROLLO.md)
6. [Packaging](docs/EMPACADO.md)
7. [Release publishing](docs/PUBLICACION.md)
8. [Changelog](docs/CAMBIOS.md)
9. [Troubleshooting](docs/TROUBLESHOOTING.md)

### Installing as a user

Download from [Releases](https://github.com/alberto2005-coder/SONAR_MusicApp/releases):

- `SONAR-Setup-1.0.0.exe` — installer.
- `SONAR.exe` — portable build.

Double-click and you are done. No Node.js or ffmpeg required.

### Development

Requirements: **Node.js 22 or later** (it uses `node:sqlite`), npm and, for packaging, **Bun**.

```powershell
git clone https://github.com/alberto2005-coder/SONAR_MusicApp.git
cd SONAR_MusicApp

cd backend  ; npm install ; npm start        # API -> http://localhost:5000
cd ..\frontend ; npm install ; npm run dev   # SPA -> http://localhost:5173
```

To build the executable:

```powershell
cd frontend ; npm run build
cd ..\backend ; npm run pack:exe             # -> backend\build\SONAR.exe
```

### Tech stack

| Frontend | Backend | Packaging |
|---|---|---|
| React 19 + Vite 7 | Express 5 | Bun (`bun build --compile`) |
| Tailwind CSS 4 | SQLite via `node:sqlite` | `rcedit` (icon and properties) |
| lucide-react, framer-motion | axios, cors | Inno Setup 7 |
| PWA (manifest + service worker) | Custom Innertube engine | esbuild |

### Project structure

```text
SONAR_MusicApp/
├── backend/
│   ├── server.js       # API, audio proxy and embedded frontend
│   ├── music.js        # Search and playback
│   ├── database.js     # Local SQLite
│   ├── pack.js         # .exe generation
│   ├── icon/           # Icons
│   └── installer/      # Inno Setup script
├── frontend/           # React SPA
├── docs/               # Documentation
├── LICENSE
└── README.md
```

### Data and privacy

There is no login and no telemetry: the library, playlists and favourites live in SQLite inside the local data folder. Deleting that folder resets the app. To move the library to another machine, copy `SONAR_data` (or the `%APPDATA%\SONAR` folder).

### Usage notice

SONAR accesses public content through its own engine. Use it for content you have the right to access and respect the **terms of service** of the source platforms and the law in your country. The project does not host music or grant any licence over it.

### License

**MIT** — see [LICENSE](LICENSE).

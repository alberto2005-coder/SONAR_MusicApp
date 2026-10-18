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

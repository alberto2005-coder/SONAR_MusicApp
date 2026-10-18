# 🧑‍💻 Desarrollo

## Requisitos

| Herramienta | Versión probada | Para qué |
|---|---|---|
| Node.js | 24.x (mínimo 18) | Servidor, Vite y `pack.js` |
| npm | 11.x | Dependencias |
| Git | cualquiera | Control de versiones |

No hace falta: Python, ffmpeg, yt-dlp, base de datos instalada ni módulos nativos.

---

## Puesta en marcha

```powershell
git clone https://github.com/alberto2005-coder/SONAR_MusicApp.git
cd SONAR_MusicApp

# 1) Backend (API en el puerto 5000)
cd backend
npm install
npm start          # node server.js

# 2) Frontend (en otra terminal)
cd ..\frontend
npm install
npm run dev        # Vite → http://localhost:5173 (proxy /api → 5000)
```

Abre `http://localhost:5173`. El frontend llama a rutas relativas (`/api/...`) y Vite las redirige al
backend (`frontend/vite.config.js`).

> Para probar el **servidor con frontend compilado** en local: `cd frontend && npm run build` y luego
> `cd ../backend && npm start` → abre `http://localhost:5000`.

### Comandos útiles

| Comando | Dónde | Qué hace |
|---|---|---|
| `npm start` | `backend/` | Servidor con Node. |
| `npm run build` | `frontend/` | Compila la SPA en `frontend/dist`. |
| `npm run lint` | `frontend/` | ESLint. |
| `npm run pack:exe` | `backend/` | Genera `backend/build/SONAR.exe` (ver [EMPACADO.md](./EMPACADO.md)). |
| `npm run pack:exe:sea` | `backend/` | Variante Node SEA + postject (alternativa a Bun). |

### Variables útiles en desarrollo

```powershell
$env:SONAR_NO_BROWSER = '1'   # no abre la ventana de navegador
$env:SONAR_DATA_DIR   = 'D:\tmp\sonar'   # BD en otra carpeta
```

---

## Estructura del repositorio

```
SONAR_MusicApp/
├── backend/
│   ├── server.js          # Express: API + proxy de audio + frontend embebido
│   ├── music.js           # Motor YouTube (búsqueda + player + fallbacks)
│   ├── database.js        # Adaptador node:sqlite, usuario local, rutas de datos
│   ├── pack.js            # Build del .exe (vite → static-assets → esbuild → bun → rcedit)
│   ├── static-assets.js   # [generado] frontend en base64
│   ├── database.sqlite    # Semilla de la BD (se incrusta en el paquete)
│   ├── icon/              # build-icon.ps1, build-icons-web.ps1, sonar.ico
│   ├── installer/SONAR.iss# Script de Inno Setup
│   └── build/             # [generado] SONAR.exe, SONAR-Setup-*.exe, bundles
├── frontend/
│   ├── index.html         # manifest, favicon, theme-color
│   ├── vite.config.js     # proxy /api
│   ├── public/            # manifest.webmanifest, sw.js, icons/, logo_sonar.png
│   └── src/
│       ├── pages/         # Home, Search, Library, Profile
│       ├── components/    # Sidebar, Player, AddToPlaylistModal
│       ├── contexts/      # PlayerContext, LibraryContext, AuthContext (local)
│       └── hooks/         # useColorThief
├── docs/                  # ← esta documentación
└── README.md
```

Ignorado por Git: `node_modules/`, `build/`, `dist/`, `backend/static-assets.js`, `*.exe`, `SONAR_data/`.

---

## Convenciones del proyecto

1. **Sin autenticación.** No reintroducir login: `AuthContext` expone un usuario local fijo y el backend
   fija `req.user`. Los endpoints conservan el middleware `authenticate` solo por coherencia de esquema.
2. **Sin módulos nativos.** Solo `express`, `cors` y `axios` en producción; la BD usa `node:sqlite`.
   Esto es lo que permite compilar el `.exe` con Bun sin toolchain de C++.
3. **Datos separados del programa.** Nunca escribir junto al `.exe` sin comprobar permisos: la ruta de
   datos ya resuelve `SONAR_DATA_DIR` → `.\SONAR_data` → `%APPDATA%\SONAR`.
4. **Streaming por proxy.** Todo el audio pasa por `/api/music/stream` para poder inyectar `Range`
   (y para no exponer URLs de terceros al cliente).
5. **Tailwind sin anchos fijos.** Reglas responsive que ya están aplicadas y conviene mantener:

   | Regla | Por qué |
   |---|---|
   | Nunca `w-1/3` / anchos fijos en el reproductor | Usar `flex-1 min-w-0` + `shrink-0` |
   | Títulos grandes con `clamp()` | Escalan con la ventana y no se cortan |
   | Rejillas con `grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))]` | Nunca tarjetas aplastadas |
   | Textos dentro de flex con `min-w-0` + `truncate` | Evita desbordes por títulos largos |
   | Ocultar elementos secundarios bajo 640 px (`hidden sm:block`) | Número de pista, descarga, tiempos |
   | Sidebar `w-16 md:w-[240px]` | Raíl de iconos en pantallas estrechas |

6. **Comprobación responsive** antes de dar por hecho un cambio de UI (no hay herramienta de redimensionado):
   monta la app en un **iframe de ancho variable dentro de la propia app** y mide:

   ```js
   // 1) inyectar (en la pestaña abierta en localhost:5000)
   const f = document.createElement('iframe');
   f.id = 'probe'; f.src = '/library';
   f.style.cssText = 'position:fixed;left:0;top:0;width:480px;height:740px;border:0';
   document.body.appendChild(f);

   // 2) medir dentro del frame (cambiar el ancho del iframe entre pasadas)
   const W = document.documentElement.clientWidth;
   const box = [], txt = [];
   document.querySelectorAll('#root *').forEach(el => {
     const r = el.getBoundingClientRect();
     const cls = typeof el.className === 'string' ? el.className : '';
     if (r.right > W + 1 || r.left < -1) box.push(el.className);
     if (el.scrollWidth > el.clientWidth + 2 && !/truncate|overflow-hidden/.test(cls))
       txt.push(el.className);
   });
   ```

   Probar en `320, 375, 480, 640, 768, 1024, 1440` px. *Objetivo: `box` y `txt` vacíos.*

---

## Cómo añadir, por ejemplo, un endpoint

1. Ruta nueva en `backend/server.js` (`app.get('/api/...', authenticate, ...)`).
2. Consumo en el contexto correspondiente (`LibraryContext` / `PlayerContext`).
3. Documentación en [API.md](./API.md).
4. Si toca UI, comprueba el responsive con el método del iframe.

---

Siguiente: [Empaquetado →](./EMPACADO.md)

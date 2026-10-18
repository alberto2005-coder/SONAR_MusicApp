# 📝 Cambios (changelog)

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) · versionado [SemVer](https://semver.org/lang/es/).

---

## v1.0.0 — 18 de octubre de 2026

**Primera release pública.** Reitera: reproductor de música local para Windows **sin cuentas ni registro**.

### 📦 Cómo obtenerla

| Archivo | Tamaño | Para qué sirve |
|---|---|---|
| **SONAR-Setup-1.0.0.exe** | ~35 MB | **Instalador** (recomendado): aparece en el inicio con icono propio. |
| **SONAR.exe** | ~95 MB | **Portable**: doble clic, sin instalar nada. |

**Requisitos:** Windows 10/11 (64 bits) e internet. No necesita Java, Node, ffmpeg ni código.

### ✅ Novedades

- **Búsqueda y reproducción** de música en streaming con *seek* instantáneo (soporte de rangos HTTP `206`).
- **Motor propio** de audio (YouTube Innertube) con cliente principal y respaldo para vídeos “Topic”;
  sin `yt-dlp` ni `ffmpeg`.
- **Biblioteca**: playlists editables (nombre y portada), favoritos y borrado de pistas, todo en SQLite local.
- **Descargas** de audio al disco (`.m4a` o `.mp4` real, sin recodificar).
- **Reproductor** con cola, volumen, barra de progreso y color dominante de la carátula.
- **Sin login ni registro**: usuario local fijo `SONAR`; se eliminó toda la autenticación.
- **Un solo ejecutable**: servidor + frontend + base de datos embebidos (Bun), con icono y propiedades
  de Windows (FileDescription, ProductName, versión 1.0.0.0).
- **App instalable (PWA)**: manifiesto, *service worker* e iconos 192/512; el `.exe` abre la app en
  **ventana propia sin pestañas** (Edge/Chrome en modo `--app`).
- **Interfaz adaptable de 320 px a pantallas grandes**: barra lateral en modo raíl, títulos con tamaño
  fluido, rejillas elásticas y filas sin desbordes (verificada sin errores de consola).
- **Instalador** de Inno Setup 7 con español e inglés, icono de escritorio e inicio con Windows opcionales.

### 🗂️ Datos

- Se guardan en `SONAR_data` junto al `.exe` (o `%APPDATA%\SONAR` si no hay permisos de escritura).
- Primera ejecución: usuario `SONAR`, playlist de ejemplo *PRUEBA* y 2 favoritos.

### ⚠️ Limitaciones conocidas

- No hay recodificación a MP3 (se entrega el formato original del origen).
- La velocidad de descarga depende de la CDN de origen; con conexiones lentas una canción puede tardar
  uno o dos minutos.
- Los formatos adaptativos de móvil se descartan por el límite de ~1 MB por rango de la CDN.

### 🔗 Enlaces

- Release: <https://github.com/alberto2005-coder/SONAR_MusicApp/releases/tag/v1.0.0>
- Tag: `v1.0.0` · Código: `main`

---

## [Sin publicar]

### Añadido
- Documentación completa en [`docs/`](./README.md) (instalación, uso, arquitectura, API, desarrollo,
  empaquetado, publicación, changelog y solución de problemas).

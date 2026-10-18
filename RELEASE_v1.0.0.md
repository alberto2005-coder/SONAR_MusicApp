# SONAR 1.0.0 🎧

**Reproductor de música local para Windows, sin cuentas ni registro.**

SONAR es una app de escritorio que arranca su propio servidor e interfaz en una ventana de aplicación (sin pestañas de navegador). Busca música en streaming, organiza tu biblioteca y guarda todo en local, en tu equipo.

---

## Descarga

| Archivo | Tamaño | Para qué sirve |
|---|---|---|
| **SONAR-Setup-1.0.0.exe** | ~35 MB | **Instalador** (recomendado): lo instalas y te aparece en el inicio con icono propio. |
| **SONAR.exe** | ~95 MB | **Portable**: lo descargas, lo pones donde quieras y doble clic. No instala nada. |

> Los dos hacen exactamente lo mismo; elige el que prefieras.

## Requisitos

- Windows 10 / 11 (64 bits).
- Conexión a internet (para buscar y reproducir música).
- Sin instalar nada más: ni Java, ni Node, ni ffmpeg, ni código.

## Cómo usarlo

1. **Doble clic** en `SONAR-Setup-1.0.0.exe` (o en `SONAR.exe` si usas la portable).
2. Se abre la ventana de **SONAR** sola, apuntando a `localhost:5000`.
3. Escribe en **Buscar**, pulsa cualquier canción y ya suena.

- **Biblioteca** → crea playlists con `+` y arrastra canciones desde el buscador.
- **Corazón** → añade a *Me Gusta*.
- **Icono de descarga** → guarda la pista en tu disco (`.m4a` / `.mp4`).
- **Instalar SONAR** (icono en la barra de direcciones del navegador/Edge) → la app se instala en Windows con su propio icono y ventana.

## Dónde guarda los datos

- Si puede escribir junto al `.exe`: crea la carpeta **`SONAR_data`** (base de datos SQLite con tus playlists, favoritos y descargas).
- Si no puede escribir (por ejemplo, en `Program Files`): usa **`%APPDATA%\SONAR`**.

No hay usuarios ni contraseñas: todo es local y tuyo.

## Qué incluye esta primera release

- ✅ Búsqueda de música y reproducción en streaming con *seek* instantáneo (soporte de rangos HTTP).
- ✅ Biblioteca con playlists editables (nombre y portada), favoritos y borrado de pistas.
- ✅ Descargas de audio al disco.
- ✅ Reproductor con cola, volumen, barra de progreso y color dominante de la carátula.
- ✅ Sin login ni registro: usuario local fijo `SONAR`.
- ✅ App instalable (PWA) + icono y propiedades de Windows en el `.exe`.
- ✅ Interfaz adaptable de 320 px a pantallas grandes (probada sin desbordes ni errores de consola).

## Notas técnicas

- Servidor + frontend embebidos en un único ejecutable compilado con Bun (sin dependencias de sistema).
- Motor propio de búsqueda/reproducción (Innertube) con clientes de respaldo para vídeos "Topic".
- Instalador generado con Inno Setup 7.

---

**Instala Windows x64 · versión 1.0.0 · 18 de octubre de 2026**

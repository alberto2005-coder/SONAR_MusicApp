# 📚 Documentación de SONAR

Toda la documentación del proyecto vive aquí. Cada documento es autocontenido:

| Documento | Qué encontrarás |
|---|---|
| [INSTALACION.md](./INSTALACION.md) | Cómo instalar y ejecutar SONAR en Windows (instalador o portable), dónde guarda los datos y cómo desinstalarlo. |
| [GUIA-DE-USO.md](./GUIA-DE-USO.md) | Manual de usuario: pantalla por pantalla, reproducción, playlists, favoritos, descargas y app instalable. |
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Cómo está construido: frontend, servidor, motor de música, base de datos y flujo de reproducción. |
| [API.md](./API.md) | Referencia completa de la API REST (`/api/...`) con parámetros y respuestas. |
| [DESARROLLO.md](./DESARROLLO.md) | Entorno de desarrollo, comandos, estructura de carpetas y convenciones (incluidas las reglas responsive). |
| [EMPACADO.md](./EMPACADO.md) | Cómo se genera el `.exe` autocontenido: `pack.js`, icono, metadatos e instalador con Inno Setup. |
| [PUBLICACION.md](./PUBLICACION.md) | Cómo publicar una *release* en GitHub paso a paso (tag + notas + assets). |
| [CAMBIOS.md](./CAMBIOS.md) | *Changelog* de todas las versiones. |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Errores frecuentes y cómo solucionarlos. |

---

## Resumen en 30 segundos

- **Qué es:** reproductor de música local para Windows 10/11 (64 bits) **sin cuentas ni registro**.
- **Cómo se ejecuta:** doble clic en `SONAR-Setup-1.0.0.exe` (instalador) o en `SONAR.exe` (portable).
  Arranca un servidor local en el puerto `5000` y abre la ventana de aplicación (sin pestañas de navegador).
- **Dónde guarda los datos:** carpeta `SONAR_data` junto al `.exe` (o `%APPDATA%\SONAR` si no hay permisos de
  escritura): base de datos SQLite con playlists, favoritos, perfil y descargas.
- **Requisitos:** Windows 10/11 x64 + internet. No necesita Java, Node, ffmpeg ni nada instalado.
- **Stack:** React 19 + Vite 7 + Tailwind 4 · Express 5 · SQLite (`node:sqlite`) · Bun (compilación del `.exe`).

---

## Enlaces rápidos

- Repositorio: <https://github.com/alberto2005-coder/SONAR_MusicApp>
- Releases: <https://github.com/alberto2005-coder/SONAR_MusicApp/releases>
- Documento de la primera release: [CAMBIOS.md → v1.0.0](./CAMBIOS.md#v100--18-de-octubre-de-2026)

---

*Última actualización: 18 de octubre de 2026.*

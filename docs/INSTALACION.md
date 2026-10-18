# 🖥️ Instalación

SONAR es un programa **portable**: no necesita instaladores de Java, Node, ffmpeg ni librerías de sistema.

## Requisitos

| Requisito | Detalle |
|---|---|
| Sistema | Windows 10 o 11, **64 bits** |
| Internet | Sí (búsqueda y reproducción de música) |
| Escritura | Sí, en la carpeta donde está el `.exe` o en `%APPDATA%` |
| Permisos de administrador | No hace falta |

---

## Opción A — Instalador (recomendada)

1. Descarga **`SONAR-Setup-1.0.0.exe`** desde la [página de releases](https://github.com/alberto2005-coder/SONAR_MusicApp/releases).
2. Doble clic → aparece el asistente de Inno Setup (en español).
3. Sigue el asistente. Tareas opcionales que puedes marcar:
   - **Crear icono en el escritorio** (desmarcado por defecto).
   - **Iniciar SONAR con Windows** (desmarcado por defecto).
4. Al terminar, SONAR se instala en `C:\Program Files\SONAR` y te lo abre.

> El instalador solo copia el `.exe`; tus datos se crean después, en la primera ejecución.

## Opción B — Portable

1. Descarga **`SONAR.exe`** (95 MB) desde la [página de releases](https://github.com/alberto2005-coder/SONAR_MusicApp/releases).
2. Guárdalo donde quieras: escritorio, carpeta de descargas, unidad USB…
2. Doble clic. Crea a su lado la carpeta `SONAR_data`.

> Si lo guardas en `C:\Program Files` (donde Windows bloquea la escritura), SONAR usa automáticamente
> `%APPDATA%\SONAR` en vez de `SONAR_data`.

---

## Primera ejecución

1. Se abre una **ventana de aplicación** (sin barra de pestañas) apuntando a `http://localhost:5000`.
2. Se crea la base de datos local con un usuario fijo **SONAR** y datos de ejemplo
   (playlist *PRUEBA* con pistas y 2 favoritos).
3. Ya puedes buscar música y reproducirla.

Si el puerto `5000` está ocupado, SONAR prueba automáticamente `5001, 5002, 5003, 5004, 5005`.

---

## Dónde se guardan tus datos

Orden de preferencia:

1. **`SONAR_data` junto al `.exe`** (portable o instalación con permisos).
2. **`%APPDATA%\SONAR`** (si no se puede escribir junto al `.exe`).
3. Variable de entorno **`SONAR_DATA_DIR`** (si la defines, manda sobre todo).

Contenido de la carpeta:

```
SONAR_data/
└── database.sqlite    ← playlists, favoritos, perfil, pistas
```

**Respaldar:** copia `database.sqlite`. **Restaurar:** vuelve a ponerlo donde estaba con la app cerrada.

**Borrar todo:** borra la carpeta `SONAR_data` (o `%APPDATA%\SONAR`) con SONAR cerrado; se recrea vacía.

---

## Variables de entorno

| Variable | Efecto |
|---|---|
| `SONAR_NO_BROWSER=1` | No abre la ventana del navegador/app al arrancar (útil para scripts y depuración). |
| `SONAR_DATA_DIR` | Fuerza la carpeta donde se guarda la base de datos. |

Ejemplo (PowerShell):

```powershell
$env:SONAR_NO_BROWSER = '1'
& 'C:\ruta\a\SONAR.exe'
```

---

## Desinstalar

1. **Inicio → aplicaciones → SONAR → Desinstalar** (si usaste el instalador).
2. Borra `SONAR_data` / `%APPDATA%\SONAR` si quieres eliminar también tus playlists y favoritos.

---

## Actualizar

1. Cierra SONAR.
2. Sustituye `SONAR.exe` por la nueva versión (o reinstala el `.exe` de la release).
3. **Tus datos se conservan**: la base de datos vive en `SONAR_data`, separada del programa.

---

Siguiente: [Guía de uso →](./GUIA-DE-USO.md)

# 📦 Empaquetado: del código al `.exe`

Todo lo hace `backend/pack.js`. Salida: **`backend/build/SONAR.exe`** (~95 MB, autocontenido).

```powershell
cd backend
npm run pack:exe        # = node pack.js
```

---

## Las 5 fases de `pack.js`

| # | Fase | Detalle |
|---|---|---|
| 1 | **Frontend** | `vite build` → `frontend/dist`. |
| 2 | **Incrustar** | Cada fichero de `dist` se convierte en base64 dentro de `backend/static-assets.js` (incluye `manifest.webmanifest`, `sw.js` e iconos). |
| 3 | **Bundle del backend** | `esbuild` → `build/server.bundle.cjs` (CJS, target bun) con `define: { __COMPILED__: 'true' }`. Así el código sabe que va embebido. |
| 4 | **Runtime** | `bun build --compile` → `build/SONAR.exe` (Bun embebido, sin instalar nada). |
| 5 | **Windows** | `rcedit` aplica `icon/sonar.ico` y las propiedades del fichero. |

### Alternativa con Node SEA

```powershell
npm run pack:exe:sea    # node pack.js --sea
```

Genera el ejecutable con **Node SEA + postject**. Funciona, pero en algunas máquinas el antivirus lo
bloquea; por eso **Bun es la ruta por defecto**.

---

## Icono y propiedades

- `backend/icon/build-icon.ps1` → genera `sonar.ico` con 6 tamaños (16…256 px) a partir del logo.
- `backend/icon/build-icons-web.ps1` → genera `frontend/public/icons/` (192, 512 y 512 *maskable*)
  para la PWA.

Propiedades que aplica `pack.js`:

| Clave | Valor |
|---|---|
| `FileDescription` | `SONAR - Reproductor de música local` |
| `ProductName` | `SONAR` |
| `CompanyName` | `SONAR` |
| `ProductVersion` / `FileVersion` | `1.0.0.0` |

> `rcedit` (del paquete npm) es el que sirve; `resedit`/`pe-library` no funcionan porque el PE de Bun
> tiene secciones después de `.rsrc`.

---

## Datos y semilla

- `backend/database.sqlite` es la **semilla** y viaja incrustada como `/__seed/database.sqlite`.
- En la primera ejecución se copia a `SONAR_data\database.sqlite` (o `%APPDATA%\SONAR`) con un usuario
  local, la playlist *PRUEBA* y 2 favoritos.
- `pack.js` **no** incluye los datos del usuario: solo la semilla del repositorio.

---

## Compilar el instalador (Inno Setup 7)

1. Instala Inno Setup 7 (probado en `C:\Program Files\Inno Setup 7`).
2. Compila:

   ```powershell
   & 'C:\Program Files\Inno Setup 7\ISCC.exe' 'C:\...\backend\installer\SONAR.iss'
   ```

3. Resultado: **`backend/build/SONAR-Setup-1.0.0.exe`** (~35 MB).

`SONAR.iss` define: nombre y versión, carpeta `{autopf}\SONAR`, idiomas **español e inglés**, tarea
opcional de icono en el escritorio, tarea opcional de inicio con Windows, y empaqueta `SONAR.exe`.
La salida lleva el icono de SONAR en el propio `Setup.exe`.

> **Importante:** el instalador empaqueta el `SONAR.exe` que haya en `backend/build`. Si cambias código,
> vuelve a ejecutar `npm run pack:exe` **antes** de compilar el instalador.

---

## Errores típicos del empaquetado

| Error | Causa | Solución |
|---|---|---|
| `failed to move executable ... EPERM` | El `.exe` está en uso o bloqueado un instante | Cierra SONAR, borra `build\SONAR.exe` y repite (2-3 intentos suelen bastar) |
| El `.exe` funciona pero “no se ve lo nuevo” | Frontend sin recompilar | Ejecuta primero `frontend: npm run build`, luego `pack.js` |
| El antivirus lo borra | Heurística sobre binarios poco comunes | Restaurar desde la cuarentena; compilar con `--sea` como alternativa |

---

Siguiente: [Publicación en GitHub →](./PUBLICACION.md)

# 🛠️ Solución de problemas

## El `.exe` no abre / se cierra al instante

1. **Puerto ocupado** (raro: SONAR prueba 5000→5005). Mira si quedó un proceso:

   ```powershell
   Get-Process SONAR -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Antivirus en cuarentena**: restaura `SONAR.exe` y añade una excepción.
3. **Carpeta de solo lectura** (`Program Files`): en ese caso SONAR debe usar `%APPDATA%\SONAR`; si no lo
   hace, ejecuta una vez desde una carpeta con permisos (p. ej. el escritorio) para descartar problemas.

---

## Abre pero la página sale en blanco o antigua

- Pulsa **`Ctrl + F5`** (recarga dura): el *service worker* guarda la interfaz en caché.
- Comprueba que la URL es `http://localhost:5000` (o el puerto que muestre la consola).

---

## No suena nada / “Error stream”

| Causa probable | Qué hacer |
|---|---|
| Sin internet | Comprueba la conexión (la música sale de YouTube). |
| La pista no existe o cambió el título | Busca otra versión (“artista + título”). |
| La CDN va muy lenta | Espera unos segundos: el audio empieza en cuanto llega el primer rango. |
| Formato no compatible con el navegador | Prueba otra pista; el motor ya hace *fallback* automáticamente. |

El servidor registra los fallos en la consola de la ventana desde la que se lanzó
(`❌ Error de streaming: ...`).

---

## El *seek* (barra de progreso) no responde

El *seek* depende de que el servidor devuelva `206` con rangos. Verifícalo:

```powershell
$req = [System.Net.WebRequest]::Create('http://localhost:5000/api/music/stream?query=bad+bunny&duration=200')
$req.AddRange(0,1023)
($req.GetResponse()).StatusCode   # debe ser 206
```

Si da `200`, algo interfiere con las cabeceras (proxy/antivirus).

---

## Las descargas salen cortadas o muy lentas

- La velocidad la marca la CDN de origen (puede rondar decenas de KB/s tras mucho uso).
- No cierres la pestaña hasta que el archivo deje de crecer.
- Formato esperado: `.m4a` (o `.mp4`); comprueba la cabecera `ftyp` si dudas de la integridad.

---

## No encuentro mis playlists/favoritos

1. ¿Cerraste y abriste la app? Los datos viven en la BD, no en la web.
2. Localiza la BD:

   ```powershell
   Get-ChildItem "$env:APPDATA\SONAR", ".\SONAR_data" -ErrorAction SilentlyContinue
   ```

3. Si usaste `SONAR_DATA_DIR`, busca ahí.
4. Para restaurar un respaldo: cierra SONAR y copia `database.sqlite` encima.

---

## La app no se “instala” como aplicación (PWA)

- Usa **Edge o Chrome** (el manifiesto solo lo leen navegadores compatibles).
- Abre `http://localhost:5000` y busca el icono **“Instalar SONAR”** en la barra de direcciones, o
  menú ⋮ → *Instalar aplicación*.
- Si no aparece, recarga con `Ctrl + F5` (hace falta que `/manifest.webmanifest` responda 200).

---

## Se abre en una pestaña normal en vez de ventana de aplicación

SONAR busca Edge y Chrome en sus rutas estándar. Si tienes otro navegador o una ruta rara, se usa el
abridor por defecto. Fuerza el modo app lanzándolo con el navegador indicado, o reinstala Edge/Chrome.

---

## El `.exe` “no tiene los últimos cambios”

`SONAR.exe` lleva el frontend **incrustado**: hay que regenerarlo.

```powershell
cd frontend ; npm run build
cd ..\backend ; npm run pack:exe
```

---

## El empaquetado falla con `EPERM`

El `.exe` anterior sigue en uso. Cierra todo, borra `backend\build\SONAR.exe` y repite
`npm run pack:exe` (2-3 intentos suelen bastar).

---

## Error al compilar el instalador

- ¿Existe `ISCC.exe`? En este equipo: `C:\Program Files\Inno Setup 7\ISCC.exe`.
- ¿Está actualizado `backend\build\SONAR.exe`? Compílalo antes (`npm run pack:exe`).

---

## Nada de lo anterior funciona

Recopila:

```powershell
node --version ; npm --version
Get-Process SONAR -ErrorAction SilentlyContinue
try { (Invoke-WebRequest 'http://localhost:5000/api/profile' -UseBasicParsing -TimeoutSec 5).StatusCode } catch { $_.Exception.Message }
```

…y ábrelo como *issue* en <https://github.com/alberto2005-coder/SONAR_MusicApp/issues>.

---

Volver al [índice de documentación](./README.md)

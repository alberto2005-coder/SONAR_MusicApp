# 🚀 Publicación de una release en GitHub

Flujo completo para sacar una versión de SONAR a producción.

---

## 0. Antes de empezar

- [ ] Código probado (ver [DESARROLLO.md](./DESARROLLO.md)).
- [ ] `frontend: npm run build` y `backend: npm run pack:exe` ejecutados → `SONAR.exe` actualizado.
- [ ] Instalador recompilado → `SONAR-Setup-X.Y.Z.exe`.
- [ ] [CAMBIOS.md](./CAMBIOS.md) actualizado con la nueva versión.

---

## 1. Subir el código

```powershell
cd C:\Users\alors\Downloads\SONAR_MusicApp
git add .
git commit -m "Descripción breve del cambio"
git push origin main
```

Los binarios (`*.exe`, `build/`, `dist/`) **no** se suben al repositorio: van como *assets* de la release.

---

## 2. Crear y subir el tag

```powershell
git tag -a v1.0.1 -m "SONAR 1.0.1 - descripción corta"
git push origin v1.0.1
```

Convención: **`v<mayor>.<menor>.<parche>`** (`v1.0.0`, `v1.0.1`, `v1.1.0`), coincidente con la versión del
instalador (`SONAR-Setup-1.0.1.exe`).

---

## 3. Crear la release (a mano, en la web)

1. Abre **<https://github.com/alberto2005-coder/SONAR_MusicApp/releases/new>**
   (Releases → *Draft a new release*).
2. **Choose a tag** → selecciona el tag creado (ya aparece porque está en el remoto).
3. **Release title** → p. ej. `SONAR 1.0.1`.
4. **Describe this release** → pega el texto de [CAMBIOS.md](./CAMBIOS.md) para esa versión.
5. Marca **“Set as the latest release”**.
6. En **“Attach binaries…”** arrastra los dos archivos desde `backend/build/`:
   - `SONAR.exe` (portable)
   - `SONAR-Setup-X.Y.Z.exe` (instalador)
7. **Publish release** (espera a que suban los ~130 MB; no cierres la pestaña).

La release queda en `https://github.com/alberto2005-coder/SONAR_MusicApp/releases`.

---

## 4. Opcional: automatizar con GitHub CLI

```powershell
winget install GitHub.cli
gh auth login                     # autoriza en el navegador una vez

gh release create v1.0.1 `
  backend\build\SONAR.exe `
  backend\build\SONAR-Setup-1.0.1.exe `
  --title "SONAR 1.0.1" `
  --notes-file docs\CAMBIOS.md `
  --latest
```

Con `gh` instalado, los pasos 1-3 completos se reducen a un par de comandos.

---

## Checklist final

- [ ] `main` y el tag apuntan al mismo commit (`git ls-remote origin`).
- [ ] Los dos `.exe` aparecen con su tamaño en la release.
- [ ] Marca “Latest” activada.
- [ ] Enlace de releases actualizado en el README si cambió algo relevante.

---

Siguiente: [Changelog →](./CAMBIOS.md)

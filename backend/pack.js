/**
 * pack.js — Genera UN SOLO .exe con todo dentro (SONAR.exe)
 *
 * Pasos:
 *   1. Compila el frontend (Vite → frontend/dist)
 *   2. Incrusta esos archivos en backend/static-assets.js (base64)
 *   3. Empaqueta el backend en un único JS con esbuild
 *   4. Genera el .exe con uno de los dos métodos:
 *        (por defecto) bun build --compile  → binario limpio, sin inyección
 *        --sea                           → Node SEA (postject), suele ser bloqueado por AV
 *
 * Uso:  cd backend && npm install && npm run build
 */
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND = __dirname;
const FRONTEND = path.join(BACKEND, '..', 'frontend');
const DIST = path.join(FRONTEND, 'dist');
const BUILD = path.join(BACKEND, 'build');
const OUT_EXE = path.join(BUILD, 'SONAR.exe');
const USE_SEA = process.argv.includes('--sea');

const step = (msg) => console.log(`\n───── ${msg} ─────`);

function run(cmd, cwd) {
    console.log(`> ${cmd}`);
    execSync(cmd, { cwd, stdio: 'inherit', env: process.env });
}

function walk(dir, base = dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, base, out);
        else out.push(path.relative(base, full));
    }
    return out;
}

// ---------------------------------------------------------------
step('1/5  Compilando frontend (vite build)');
run('npm run build', FRONTEND);
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('No se generó frontend/dist/index.html');
}

// ---------------------------------------------------------------
step('2/5  Incrustando frontend en static-assets.js');
const files = walk(DIST);
const assets = {};
for (const rel of files) {
    const key = '/' + rel.split(path.sep).join('/');
    assets[key] = fs.readFileSync(path.join(DIST, rel)).toString('base64');
}
// Semilla: la base de datos de ejemplo (playlist y favoritos) viaja dentro
// del .exe y se copia en la carpeta de datos solo en la primera ejecución.
const seedPath = path.join(BACKEND, 'database.sqlite');
let embeddedCount = files.length;
if (fs.existsSync(seedPath)) {
    assets['/__seed/database.sqlite'] = fs.readFileSync(seedPath).toString('base64');
    embeddedCount += 1;
}
fs.writeFileSync(
    path.join(BACKEND, 'static-assets.js'),
    '// AUTOGENERADO por backend/pack.js — no editar a mano\n' +
    'module.exports = ' + JSON.stringify(assets) + ';\n'
);
console.log(`✅ ${embeddedCount} archivos incrustados (${(JSON.stringify(assets).length / 1024 / 1024).toFixed(2)} MB)`);

// ---------------------------------------------------------------
step(`3/5  Empaquetando backend con esbuild (target: ${USE_SEA ? 'node SEA' : 'bun compile'})`);
fs.mkdirSync(BUILD, { recursive: true });
const esbuild = require('esbuild');
esbuild.buildSync({
    entryPoints: [path.join(BACKEND, 'server.js')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: path.join(BUILD, 'server.bundle.cjs'),
    minify: false,
    sourcemap: false,
    logLevel: 'info',
    // Módulos internos de Node que esbuild no debe intentar empaquetar
    external: ['node:*'],
    // Marca compilada: el bundle sabe que vive dentro de un .exe
    define: { __COMPILED__: 'true' }
});
console.log('✅ bundle listo:', path.join(BUILD, 'server.bundle.cjs'));

// ---------------------------------------------------------------
if (USE_SEA) {
    // ---- Método antiguo: Node SEA (puede ser bloqueado por antivirus) ----
    step('4/5  Generando blob de Node SEA');
    const seaConfigPath = path.join(BUILD, 'sea-config.json');
    fs.writeFileSync(seaConfigPath, JSON.stringify({
        main: path.join(BUILD, 'server.bundle.cjs'),
        output: path.join(BUILD, 'SONAR.blob'),
        disableExperimentalSEAWarning: true,
        useSnapshot: false,
        useCodeCache: false
    }, null, 2));
    run(`node --experimental-sea-config "${seaConfigPath}"`, BACKEND);

    step('5/5  Inyectando blob en node.exe → SONAR.exe');
    fs.copyFileSync(process.execPath, OUT_EXE);
    const BLOB = fs.readFileSync(path.join(BUILD, 'SONAR.blob'));
    const FUSE = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';
    injectSea(OUT_EXE, BLOB, FUSE)
        .then(() => {
            fs.rmSync(path.join(BUILD, 'SONAR.blob'), { force: true });
            applyWindowsMetadata(OUT_EXE);
            finish();
        })
        .catch(fail);
} else {
    // ---- Método por defecto: bun build --compile (un binario normal) ----
    step('4/5  Compilando el runtime con Bun');
    run(`npx --no-install bun build --compile "${path.join(BUILD, 'server.bundle.cjs')}" --outfile "${OUT_EXE}"`, BACKEND);

    step('5/5  Verificando el ejecutable');
    if (!fs.existsSync(OUT_EXE)) throw new Error('Bun no generó el .exe');
    applyWindowsMetadata(OUT_EXE);
    finish();
}

function finish() {
    const size = fs.statSync(OUT_EXE).size;
    const mb = (size / 1024 / 1024).toFixed(1);
    console.log(`\n🎉 LISTO: ${OUT_EXE}  (${mb} MB)`);
    console.log('Doble clic y arranca el servidor + abre el navegador.');
    console.log('Los datos (SQLite) se guardan en .\\SONAR_data junto al .exe, o en %APPDATA%\\SONAR si no se puede escribir.');
}

// ---------------------------------------------------------------
// Icono + propiedades de Windows (Descripción, Producto, Versión…)
// Usa rcedit (herramienta en JS/C++ usada por Electron) sobre el .exe.
function applyWindowsMetadata(exePath) {
    if (process.platform !== 'win32') return;

    const icoPath = path.join(BACKEND, 'icon', 'sonar.ico');
    if (!fs.existsSync(icoPath)) {
        console.log('⚠️  No existe backend\\icon\\sonar.ico: se omite icono y propiedades.');
        console.log('    Genéralo con: powershell -ExecutionPolicy Bypass -File backend\\icon\\build-icon.ps1');
        return;
    }

    const binName = process.arch === 'x64' ? 'rcedit-x64.exe' : 'rcedit.exe';
    const bin = path.join(BACKEND, 'node_modules', 'rcedit', 'bin', binName);
    if (!fs.existsSync(bin)) {
        console.log('⚠️  rcedit no está instalado (npm i -D rcedit): se omite icono y propiedades.');
        return;
    }

    execFileSync(bin, [
        exePath,
        '--set-icon', icoPath,
        '--set-version-string', 'FileDescription', 'SONAR - Reproductor de música local',
        '--set-version-string', 'ProductName', 'SONAR',
        '--set-version-string', 'CompanyName', 'SONAR',
        '--set-version-string', 'LegalCopyright', `© ${new Date().getFullYear()} SONAR`,
        '--set-version-string', 'OriginalFilename', 'SONAR.exe',
        '--set-version-string', 'InternalName', 'SONAR',
        '--set-version-string', 'Comments', 'Servidor local + interfaz web en un único ejecutable',
        '--set-file-version', '1.0.0.0',
        '--set-product-version', '1.0.0.0'
    ], { stdio: 'inherit' });
    console.log('✅ Icono y propiedades de Windows aplicados (icon/sonar.ico)');
}

function fail(err) {
    console.error('\n❌ Falló el empaquetado:', err);
    process.exit(1);
}

async function injectSea(exePath, blob, fuse) {
    try {
        const { inject } = require('postject');
        await inject(exePath, 'NODE_SEA_BLOB', blob, {
            sentinelFuse: fuse,
            overwrite: true,
            machoSegmentName: 'NODE_SEA'
        });
        console.log('✅ Blob inyectado con la API de postject');
    } catch (err) {
        console.log('⚠️  API de postject no disponible, usando CLI:', err.message);
        const blobPath = path.join(BUILD, 'SONAR.blob');
        run(`npx --no-install postject "${exePath}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse ${fuse} --overwrite`, BACKEND);
    }
}

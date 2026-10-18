# 🎧 Guía de uso

SONAR abre en una **ventana de aplicación** (sin pestañas de navegador). La interfaz tiene tres zonas:
**barra lateral** (izquierda), **contenido** (centro) y **reproductor** (abajo, siempre visible).

---

## Barra lateral

| Entrada | Qué hace |
|---|---|
| **Inicio** | Portada con las canciones en tendencia. |
| **Buscar** | Búsqueda libre de cualquier canción o artista. |
| **Tu Biblioteca** | Playlists y favoritos. |

- En pantallas **estrechas (< 768 px)** la barra se convierte en un raíl solo de iconos; pasa el ratón
  encima y verás las etiquetas.
- La sección “Tu cuenta / SONAR” **no existe**: no hay login ni registro.

---

## Reproductor (parte inferior)

- **Carátula + título/artista** a la izquierda (se oculta la carátula en ventanas muy estrechas).
- **Controles** al centro: anterior · reproducir/pausa · siguiente.
- **Barra de progreso**: arrastra para buscar dentro de la canción (*seek* instantáneo).
- **Volumen y cola** a la derecha (el volumen aparece a partir de ~768 px de ancho).
- El color de los controles cambia según el color dominante de la carátula.

---

## Inicio

- **“En Tendencia”**: tarjetas con las canciones del momento.
- Al pasar el ratón sobre una tarjeta aparecen:
  - ▶ reproducir,
  - **＋** añadir a una playlist,
  - ❤️ favorito,
  - ⬇️ descargar.
- Clic en la tarjeta → se reproduce **y** se crea la cola con el resto de la lista.

---

## Buscar

1. Escribe en la caja (título o artista) y pulsa **Intro**.
2. En la lista: clic en la fila para reproducir; a la derecha tienes ＋ (playlist), ❤️ (favorito),
   ⬇️ (descarga) y la duración.

---

## Tu Biblioteca

### Rejilla principal

- **Me Gusta** → tarjeta morada con todos tus favoritos.
- **Tus playlists** → tarjetas con carátula (doble clic… no: clic para abrir).
- **＋** (arriba a la derecha) → crea una playlist con nombre.
- El ratón sobre una playlist muestra la papelera para **borrarla** (con confirmación).

### Dentro de una playlist

- **Portada editable**: ratón encima → *Editar portada* → elige una imagen.
- **Nombre editable**: pulsa el ✏️ o haz clic directamente en el título y escribe (se guarda al salir).
- **Lista de pistas**: título y artista siempre recortados con “…” en pantallas pequeñas.
  - ▶ clic en la fila → reproduce la playlist desde esa canción.
  - ⬇️ descarga (a partir de ~640 px de ancho), ❤️ favorito, 🗑️ quitar de la lista.
  - En móvil se ocultan el número de orden y la descarga para que no se solapen nada.

---

## Perfil (menú lateral / ruta `/profile`)

- Cambiar **nombre de usuario**, **avatar** (imagen local) y **fecha de nacimiento**.
- Resumen: nº de favoritos y playlists.
- Es un perfil **local**: no hay contraseña ni cuenta online.

---

## Descargas

- El icono ⬇️ abre la descarga en una pestaña nueva.
- Se guarda el **audio original**: `.m4a` (o `.mp4` para vídeos “Topic”) — SONAR no necesita ffmpeg.
- La descarga va por streaming: si la conexión es lenta, el archivo tarda lo que tarde (una canción
  de 3 min puede ocupar ~5 MB).

---

## App instalable (PWA)

La ventana ya se abre sin pestañas, y además puedes **instalarla en Windows**:

1. En la barra de direcciones de Edge/Chrome, pulsa el icono **“Instalar SONAR”** (o menú ⋮ → *Instalar aplicación*).
2. Aparece en el **Inicio** con el icono de SONAR y se abre en su propia ventana.

También quedan guardados en caché los archivos de la interfaz para que abra más rápido.

---

## Atajos y detalles útiles

- **Intro** en el campo de búsqueda → busca.
- La cola de reproducción se genera sola al pulsar una canción (sigue el contexto de la lista).
- El estado de la biblioteca (playlists, favoritos) se refresca solo: no hace falta recargar.
- Todo se guarda en local al instante; puedes cerrar y abrir la app sin perder nada.

---

Siguiente: [Arquitectura →](./ARQUITECTURA.md)

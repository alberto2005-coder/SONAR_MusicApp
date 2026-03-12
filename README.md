# 🎵 SONAR - Ultimate Music Experience

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

---

## 📖 Índice / Index
1. [Sobre el Proyecto / About The Project](#-sobre-el-proyecto--about-the-project)
2. [Demo: Credenciales / Test Credentials](#-demo-credenciales--test-credentials)
3. [Instalación / Installation](#-instalación--installation)
4. [Uso / Usage](#-uso--usage)
5. [Tecnologías / Tech Stack](#-tecnologías--tech-stack)
6. [Estructura / Structure](#-estructura--structure)

---

## 🚀 Sobre el Proyecto / About The Project

**SONAR** es una plataforma de streaming de música de alto rendimiento. A diferencia de otros clones, SONAR utiliza un motor de búsqueda híbrido y un sistema de streaming real que permite escuchar canciones completas sin interrupciones.

**SONAR** is a high-performance music streaming platform. Unlike other clones, SONAR uses a hybrid search engine and a real streaming system that allows listening to full tracks without interruptions.

### ✨ Características / Features
* **Real-time Streaming:** Audio directo desde SoundCloud/YouTube con tecnología `play-dl`.
* **Smart Search:** Metadatos precisos integrando la API de Deezer.
* **Library Management:** Crea, abre y elimina Playlists personalizadas.
* **Persistent Auth:** Sesiones seguras con JWT y LocalStorage que no se cierran al recargar.
* **Responsive Player:** Barra de progreso real, control de volumen y sincronización de tiempos.

---

## 🔑 Demo: Credenciales / Test Credentials

Para una prueba rápida, utiliza los siguientes datos:
For a quick test, use the following data:

* **User:** `prueba@prueba.com`
* **Password:** `prueba`

---

## 🛠 Instalación / Installation

### Requisitos / Prerequisites
* Node.js (v16+)
* npm o yarn

### Pasos / Steps
1. **Clonar / Clone:**
   ```bash
   git clone [https://github.com/tu-usuario/sonar.git](https://github.com/tu-usuario/sonar.git)

```

2. **Backend:**
```bash
cd backend
npm install

```


3. **Frontend:**
```bash
cd ../frontend
npm install

```



---

## 🎮 Uso / Usage

Debes ejecutar ambos servidores simultáneamente / Run both servers at the same time:

**1. Servidor API (Backend):**

```bash
cd backend
node server.js

```

**2. Cliente Web (Frontend):**

```bash
cd frontend
npm run dev

```

---

## 💻 Tecnologías / Tech Stack

| Frontend | Backend | DevTools |
| --- | --- | --- |
| React (Vite) | Express.js | SQLite (DB) |
| Tailwind CSS | Play-dl | Axios |
| Lucide Icons | JWT & Bcrypt | SQLite Viewer |

---

## 📂 Estructura / Structure

```text
spotify/
├── backend/            # Express API & SQLite Database
│   ├── database.sqlite # Persistencia de datos
│   └── server.js       # Motor de streaming y rutas
├── frontend/           # React App
│   ├── src/contexts/   # Lógica global (Auth, Music, Playlists)
│   ├── src/components/ # Componentes (Player, Sidebar, Modals)
│   └── src/pages/      # Vistas (Home, Library, Search)
└── .gitignore          # Archivos excluidos

```

---

## 🤝 Contacto / Contact

**Alberto Ortiz** Proyecto creado como clon funcional de Spotify con fines educativos.

*Project created as a functional Spotify clone for educational purposes.*

---

<div align="center">
<b>Hecho con ❤️ por Alberto Ortiz</b>
</div>


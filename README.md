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
2. [Funciones de Alto Rendimiento / High-Performance Features](#-funciones-de-alto-rendimiento--high-performance-features)
3. [Demo: Credenciales / Test Credentials](#-demo-credenciales--test-credentials)
4. [Instalación / Installation](#-instalación--installation)
5. [Tecnologías / Tech Stack](#-tecnologías--tech-stack)

---

## 🚀 Sobre el Proyecto / About The Project

**SONAR** es una plataforma de streaming de música avanzada y minimalista. Utiliza un motor híbrido que combina metadatos precisos de Deezer con un sistema de streaming real desde SoundCloud/YouTube para ofrecer una experiencia musical completa, fluida y totalmente gratuita.

---

## ✨ Funciones de Alto Rendimiento / High-Performance Features

* **🎨 Dynamic Adaptive Interface:** La interfaz reacciona visualmente a la música, cambiando sus colores automáticamente según la carátula del álbum mediante algoritmos de extracción de color.
* **🎶 Smart Queue System:** Gestión inteligente de reproducción. Al elegir un tema, el sistema genera automáticamente una cola de reproducción basada en el contexto actual.
* **🔊 Pro Audio Control:** Sistema de audio con control de volumen interno preciso, modo **Mute** inteligente y sincronización de metadatos en tiempo real.
* **💾 Native MP3 Downloader:** Capacidad de descarga directa de pistas favoritas integrada en la interfaz de usuario.
* **❤️ Persistent Library:** Gestión robusta de favoritos y playlists personalizadas sincronizadas con una base de datos SQLite.

---

## 🔑 Demo: Credenciales / Test Credentials

* **User:** `prueba@prueba.com`
* **Password:** `prueba`

---

## 🛠 Instalación / Installation

### Requisitos / Prerequisites
* Node.js (v16+)
* **yt-dlp** (Necesario para el motor de streaming del servidor)

### Pasos / Steps
1. **Clonar / Clone:**
   ```bash
   git clone [https://github.com/alberto2005-coder/SONAR_MusicApp](https://github.com/alberto2005-coder/SONAR_MusicApp)

```

2. **Instalación:**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

```



---

## 💻 Tecnologías / Tech Stack

| Frontend | Backend | Infraestructura |
| --- | --- | --- |
| React (Vite) | Express.js | SQLite (DB) |
| Tailwind CSS | Play-dl | Fast-Average-Color |
| Lucide Icons | JWT & Bcrypt | Axios |

---

## 📂 Estructura / Structure

```text
SONAR/
├── backend/            # Express API & SQLite Engine
│   ├── database.sqlite # Persistencia de datos
│   └── server.js       # Lógica de streaming y endpoints
├── frontend/           # React Application
│   ├── src/hooks/      # useColorThief (Motor de color)
│   ├── src/contexts/   # Contextos de reproducción y usuario
│   ├── src/components/ # Interfaz (Player Pro, Sidebar, Modals)
│   └── src/pages/      # Vistas de la aplicación
└── README.md

```

---

<div align="center">
<b>Desarrollado por Alberto Ortiz</b>





<i>SONAR: High-Performance Music Streaming Platform</i>
</div>

```

¿Te gusta cómo queda ahora? Se ve mucho más serio y profesional. ¿Hay algo más que quieras pulir antes de darlo por terminado?

```

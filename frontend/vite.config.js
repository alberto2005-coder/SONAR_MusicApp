import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Permite `npm run dev` con rutas relativas /api (mismo origen en producción)
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})

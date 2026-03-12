import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { PlayerProvider } from './contexts/PlayerContext.jsx'
import { LibraryProvider } from './contexts/LibraryContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

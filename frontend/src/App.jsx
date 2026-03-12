import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { PlayerContext } from './contexts/PlayerContext';
import { useColorThief } from './hooks/useColorThief';

function App() {
  const { currentTrack } = useContext(PlayerContext);
  // Obtenemos el color dominante para el fondo de la app
  const dominantColor = useColorThief(currentTrack?.album?.cover_medium || currentTrack?.album?.cover);

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans relative">
      {/* Capa de fondo adaptativa */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-in-out -z-10"
        style={{
          background: `radial-gradient(circle at top left, ${dominantColor}33 0%, #000000 100%)`
        }}
      />

      <Sidebar />
      <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto mb-[90px] relative">
        <div className="p-8 pb-32">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
      <Player />
    </div>
  );
}

export default App;
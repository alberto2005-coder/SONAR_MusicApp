import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Auth from './pages/Auth';

function App() {
  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full bg-black overflow-y-auto mb-[90px] relative">
        <div className="p-8 pb-32">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
      <Player />
    </div>
  );
}

export default App;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search as SearchIcon, Library, Music } from 'lucide-react';

const Sidebar = () => {
    // Estilos basados en tu diseño original
    const activeClass = "flex items-center justify-between text-[#D4FF00] font-medium py-3 px-4 bg-[#181818] transition-all border-l-2 border-[#D4FF00]";
    const inactiveClass = "flex items-center gap-3 text-[#888888] font-medium py-3 px-4 hover:text-white transition-all duration-200 border-l-2 border-transparent";

    return (
        <div className="w-[240px] h-full bg-[#050505] flex flex-col z-10 border-r border-[#1a1a1a]">
            {/* Logo */}
            <div className="flex items-center gap-2 p-6 mb-4">
                <Music size={24} className="text-[#D4FF00]" />
                <h1 className="text-xl font-bold tracking-widest text-white uppercase">SONAR</h1>
            </div>

            <nav className="flex flex-col flex-1">
                {/* Inicio */}
                <NavLink to="/" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    {({ isActive }) => (
                        <div className="flex items-center gap-3">
                            <Home size={20} className={isActive ? "text-[#D4FF00]" : "text-[#888888]"} />
                            <span>Inicio</span>
                        </div>
                    )}
                </NavLink>

                {/* Buscar */}
                <NavLink to="/search" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    {({ isActive }) => (
                        <div className="flex items-center gap-3">
                            <SearchIcon size={20} className={isActive ? "text-[#D4FF00]" : "text-[#888888]"} />
                            <span>Buscar</span>
                        </div>
                    )}
                </NavLink>

                {/* Biblioteca */}
                <NavLink to="/library" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    {({ isActive }) => (
                        <div className="flex items-center gap-3">
                            <Library size={20} className={isActive ? "text-[#D4FF00]" : "text-[#888888]"} />
                            <span>Tu Biblioteca</span>
                        </div>
                    )}
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
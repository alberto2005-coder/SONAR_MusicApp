import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search as SearchIcon, Library, Music } from 'lucide-react';

const Sidebar = () => {
    // Estilos basados en tu diseño original
    const activeClass = "flex items-center justify-between text-[#D4FF00] font-medium py-3 px-4 bg-[#181818] transition-all border-l-2 border-[#D4FF00]";
    const inactiveClass = "flex items-center gap-3 text-[#888888] font-medium py-3 px-4 hover:text-white transition-all duration-200 border-l-2 border-transparent";

    return (
        <div className="w-16 md:w-[240px] shrink-0 h-full bg-[#050505] flex flex-col z-10 border-r border-[#1a1a1a]">
            {/* Logo */}
            <div className="flex items-center justify-center md:justify-start gap-2 p-4 md:p-6 mb-4">
                <Music size={24} className="text-[#D4FF00] shrink-0" />
                <h1 className="hidden md:block text-xl font-bold tracking-widest text-white uppercase">SONAR</h1>
            </div>

            <nav className="flex flex-col flex-1">
                {/* Inicio */}
                <NavLink to="/" title="Inicio" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    {({ isActive }) => (
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <Home size={20} className={`shrink-0 ${isActive ? "text-[#D4FF00]" : "text-[#888888]"}`} />
                            <span className="hidden md:inline">Inicio</span>
                        </div>
                    )}
                </NavLink>

                {/* Buscar */}
                <NavLink to="/search" title="Buscar" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    {({ isActive }) => (
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <SearchIcon size={20} className={`shrink-0 ${isActive ? "text-[#D4FF00]" : "text-[#888888]"}`} />
                            <span className="hidden md:inline">Buscar</span>
                        </div>
                    )}
                </NavLink>

                {/* Biblioteca */}
                <NavLink to="/library" title="Tu Biblioteca" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    {({ isActive }) => (
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <Library size={20} className={`shrink-0 ${isActive ? "text-[#D4FF00]" : "text-[#888888]"}`} />
                            <span className="hidden md:inline">Tu Biblioteca</span>
                        </div>
                    )}
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
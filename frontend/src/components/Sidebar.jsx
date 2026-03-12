import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search as SearchIcon, LogOut, ArrowRightToLine, Library, Music, User } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

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

            {/* Bottom Auth Link dinámico */}
            <div className="mt-auto mb-[90px] border-t border-[#1a1a1a]">
                {user ? (
                    <div className="flex flex-col">
                        {/* BOTÓN DE PERFIL (Nuevo) */}
                        <button
                            onClick={() => navigate('/profile')}
                            className="group flex flex-col px-6 pt-4 pb-2 hover:bg-[#111] transition-colors text-left"
                        >
                            <span className="text-[10px] text-[#555] uppercase tracking-tighter font-bold mb-1">Sesión:</span>
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-[#D4FF00]" />
                                <span className="text-[#888] text-sm font-bold group-hover:text-white transition-colors">
                                    {user.username}
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 text-[#555555] font-medium py-4 px-6 hover:text-red-500 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/auth')}
                        className="w-full flex items-center gap-3 text-[#555555] font-medium py-4 px-6 hover:text-white transition-all duration-200"
                    >
                        <ArrowRightToLine size={20} />
                        <span>Iniciar Sesión</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
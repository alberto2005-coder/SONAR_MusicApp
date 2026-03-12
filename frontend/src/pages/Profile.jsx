import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { User, ShieldCheck, Save, Camera, Heart, LayoutGrid, Calendar } from 'lucide-react';

const Profile = () => {
    const { user, token, logout } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [username, setUsername] = useState('');
    const [avatarData, setAvatarData] = useState(''); // Para la imagen en Base64
    const [birthdate, setBirthdate] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(res.data);
                setUsername(res.data.username);
                setAvatarData(res.data.avatar_url || '');
                setBirthdate(res.data.birthdate || '');
            } catch (err) { console.error(err); }
        };
        fetchUserData();
    }, [token]);

    // Función para procesar la imagen del equipo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarData(reader.result); // Convierte a Base64
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/api/auth/profile',
                { username, avatarData, birthdate, newPassword: password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: '¡Perfil actualizado!' });
        } catch (err) { setMessage({ type: 'error', text: 'Error al guardar.' }); }
    };

    if (!userData) return <div className="p-20 text-center text-[#555]">Cargando tu configuración...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto text-white pb-32">
            {/* CABECERA CON NOMBRE AUTO-AJUSTABLE */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-[#111] p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#D4FF00] bg-black flex items-center justify-center">
                        {avatarData ? (
                            <img src={avatarData} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                            <span className="text-5xl font-black italic text-[#D4FF00]">{username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                        <Camera size={24} className="text-[#D4FF00]" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="flex-1 text-center md:text-left overflow-hidden w-full">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4FF00] mb-1">Cuenta SONAR</p>
                    {/* Tamaño de fuente ajustado y truncado para que no rompa el diseño */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 truncate w-full italic uppercase">
                        {username}
                    </h1>
                    <div className="flex justify-center md:justify-start gap-4">
                        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-[#888] flex items-center gap-2 border border-white/5">
                            <Heart size={12} className="text-[#D4FF00]" /> {userData.favCount} Favoritos
                        </span>
                        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-[#888] flex items-center gap-2 border border-white/5">
                            <LayoutGrid size={12} className="text-[#D4FF00]" /> {userData.playlistCount} Playlists
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="md:col-span-2 bg-[#111] p-8 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2 italic uppercase tracking-tighter">
                        <User size={20} className="text-[#D4FF00]" /> Ajustes Personales
                    </h2>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-2 block">Nombre de Usuario</label>
                                <input
                                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#222] focus:border-[#D4FF00] p-4 rounded-xl outline-none transition-all font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-2 block">Fecha de Nacimiento</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-4 text-[#333]" size={18} />
                                    <input
                                        type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-[#222] focus:border-[#D4FF00] p-4 pl-12 rounded-xl outline-none transition-all text-sm color-white"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-2 block">Nueva Contraseña</label>
                            <input
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mantenla en blanco si no deseas cambiarla"
                                className="w-full bg-[#0a0a0a] border border-[#222] focus:border-[#D4FF00] p-4 rounded-xl outline-none transition-all text-sm"
                            />
                        </div>

                        <button type="submit" className="w-full bg-[#D4FF00] text-black font-black py-4 rounded-full hover:scale-[1.02] transition-all uppercase tracking-widest text-xs shadow-lg shadow-[#D4FF00]/10">
                            Actualizar mi Perfil
                        </button>

                        {message.text && (
                            <p className={`text-center font-bold text-sm ${message.type === 'success' ? 'text-[#D4FF00]' : 'text-red-500'}`}>{message.text}</p>
                        )}
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#111] p-8 rounded-2xl border border-white/5">
                        <h3 className="text-[#555] font-black uppercase text-[10px] tracking-widest mb-4 italic">Resumen de Cuenta</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-[#888]">Plan:</span>
                                <span className="text-[#D4FF00] font-bold">SONAR PRO</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-[#888]">Miembro desde:</span>
                                <span className="text-white">2026</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={logout} className="w-full py-4 bg-red-600/10 text-red-500 rounded-xl font-black hover:bg-red-600 hover:text-white transition-all text-[10px] uppercase tracking-widest border border-red-500/20">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
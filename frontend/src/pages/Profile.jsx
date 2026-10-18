import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Camera, Heart, LayoutGrid, Calendar } from 'lucide-react';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [username, setUsername] = useState('');
    const [avatarData, setAvatarData] = useState(''); // Para la imagen en Base64
    const [birthdate, setBirthdate] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get('/api/profile');
                setUserData(res.data);
                setUsername(res.data.username);
                setAvatarData(res.data.avatar_url || '');
                setBirthdate(res.data.birthdate || '');
            } catch (err) { console.error(err); }
        };
        fetchUserData();
    }, []);

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
            await axios.put('/api/profile', { username, avatarData, birthdate });
            setMessage({ type: 'success', text: '¡Perfil actualizado!' });
        } catch (err) { setMessage({ type: 'error', text: 'Error al guardar.' }); }
    };

    if (!userData) return <div className="p-8 sm:p-20 text-center text-[#555]">Cargando tu configuración...</div>;

    return (
        <div className="max-w-4xl mx-auto text-white pb-32">
            {/* CABECERA CON NOMBRE AUTO-AJUSTABLE */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-12 bg-[#111] p-6 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
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
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
                        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-[#888] flex items-center gap-2 border border-white/5">
                            <Heart size={12} className="text-[#D4FF00]" /> {userData.favCount} Favoritos
                        </span>
                        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-[#888] flex items-center gap-2 border border-white/5">
                            <LayoutGrid size={12} className="text-[#D4FF00]" /> {userData.playlistCount} Playlists
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
                <div className="md:col-span-2 bg-[#111] p-5 sm:p-8 rounded-2xl border border-white/5">
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
                            <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-2 block">Tu Cuenta</label>
                            <p className="text-[#555] text-xs leading-relaxed bg-[#0a0a0a] border border-[#222] p-4 rounded-xl">
                                Esta copia de SONAR funciona sin usuarios ni contraseñas: todo se guarda en local en tu equipo.
                            </p>
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
                                <span className="text-[#888]">Modo:</span>
                                <span className="text-[#D4FF00] font-bold">LOCAL (sin registro)</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-[#888]">Almacenamiento:</span>
                                <span className="text-white">Equipo actual</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../contexts/PlayerContext';
import { AuthContext } from '../contexts/AuthContext';
import { LibraryContext } from '../contexts/LibraryContext';
import { Heart, Music, Plus, Play, Trash2, ChevronLeft } from 'lucide-react';

const Library = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const { setCurrentTrack } = useContext(PlayerContext);
    const {
        favorites, playlists, loading,
        toggleFavorite, isFavorite,
        createPlaylist, deletePlaylist
    } = useContext(LibraryContext);

    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistTracks, setPlaylistTracks] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    // Actualizar la vista si cambian los favoritos y estamos dentro de "Tus Me Gusta"
    useEffect(() => {
        if (selectedPlaylist?.id === 'fav') {
            const tracks = favorites.map(f =>
                typeof f.track_data === 'string' ? JSON.parse(f.track_data) : f.track_data
            );
            setPlaylistTracks(tracks);
        }
    }, [favorites, selectedPlaylist]);

    const openPlaylist = async (playlist) => {
        setSelectedPlaylist(playlist);

        if (playlist.id === 'fav') {
            const tracks = favorites.map(f =>
                typeof f.track_data === 'string' ? JSON.parse(f.track_data) : f.track_data
            );
            setPlaylistTracks(tracks);
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/playlists/${playlist.id}/tracks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const tracks = res.data.map(t =>
                typeof t.track_data === 'string' ? JSON.parse(t.track_data) : t.track_data
            );
            setPlaylistTracks(tracks);
        } catch (err) {
            console.error("Error al cargar canciones de la playlist", err);
            setPlaylistTracks([]);
        }
    };

    const handleCreatePlaylist = (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;
        createPlaylist(newPlaylistName);
        setNewPlaylistName('');
        setShowCreate(false);
    };

    if (!user) return <div className="p-20 text-center text-gray-500">Inicia sesión para ver tu biblioteca.</div>;

    return (
        <div className="w-full text-white p-8 pb-32">
            {selectedPlaylist ? (
                // VISTA DE PLAYLIST ABIERTA
                <div>
                    <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-[#888] hover:text-white mb-6 transition">
                        <ChevronLeft size={20} /> Volver
                    </button>

                    <div className="flex items-end gap-6 mb-8">
                        <div className="w-48 h-48 bg-[#111] border border-[#222] shadow-2xl flex items-center justify-center rounded-lg group relative overflow-hidden">
                            <Music size={64} className="text-[#333]" />
                            {/* Botón "+" sobre la carátula */}
                            <button
                                onClick={() => navigate('/search')}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Plus size={48} className="text-[#D4FF00]" />
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#D4FF00] mb-2">Playlist</p>
                            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
                                {selectedPlaylist.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-4">
                                <p className="text-[#888] text-sm">{user.username} • {playlistTracks.length} canciones</p>
                                <button
                                    onClick={() => navigate('/search')}
                                    className="bg-[#D4FF00] text-black rounded-full p-1 hover:scale-110 transition shadow-lg"
                                    title="Añadir canciones"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LISTA DE CANCIONES O ESTADO VACÍO */}
                    <div className="mt-10">
                        {playlistTracks.length > 0 ? (
                            <div className="space-y-1">
                                {playlistTracks.map((track, index) => (
                                    <div key={index} onClick={() => setCurrentTrack(track)} className="group flex items-center justify-between p-3 rounded-md hover:bg-white/5 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="w-4 text-center text-[#555] group-hover:hidden font-mono text-xs">{index + 1}</span>
                                            <Play size={16} className="hidden group-hover:block text-[#D4FF00]" />
                                            <img src={track.album?.cover_small} className="w-10 h-10 rounded shadow-md" alt="" />
                                            <div>
                                                <p className="font-bold text-sm">{track.title}</p>
                                                <p className="text-xs text-[#888]">{track.artist?.name}</p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}>
                                            <Heart size={16} fill={isFavorite(track.id) ? "#D4FF00" : "none"} className={isFavorite(track.id) ? "text-[#D4FF00]" : "text-[#555]"} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // ESTADO VACÍO CON BOTÓN DE ACCIÓN
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#222] rounded-xl bg-[#0a0a0a]">
                                <Plus size={48} className="text-[#1a1a1a] mb-4" />
                                <p className="text-[#555] mb-6 font-medium">Esta lista está vacía</p>
                                <button
                                    onClick={() => navigate('/search')}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-[#D4FF00] transition-all hover:scale-105 shadow-xl"
                                >
                                    Buscar canciones para añadir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // VISTA PRINCIPAL DE BIBLIOTECA
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-black tracking-tighter">Tu Biblioteca</h1>
                        <button onClick={() => setShowCreate(true)} className="bg-[#D4FF00] text-black p-2 rounded-full hover:scale-110 transition shadow-lg">
                            <Plus size={24} />
                        </button>
                    </div>

                    {showCreate && (
                        <form onSubmit={handleCreatePlaylist} className="mb-8 bg-[#121212] p-4 rounded-lg flex gap-4 border border-[#222]">
                            <input
                                autoFocus
                                className="bg-[#1a1a1a] flex-1 p-2 rounded outline-none border border-transparent focus:border-[#555] text-sm"
                                placeholder="Nombre de la nueva lista..."
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                            />
                            <button type="submit" className="text-[#D4FF00] font-bold text-sm px-2">Crear</button>
                            <button type="button" onClick={() => setShowCreate(false)} className="text-red-500 text-sm px-2">Cancelar</button>
                        </form>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div onClick={() => openPlaylist({ id: 'fav', name: 'Tus Me Gusta' })} className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] p-6 rounded-md cursor-pointer hover:scale-[1.02] transition shadow-lg flex flex-col justify-end min-h-[200px]">
                            <h3 className="text-2xl font-black leading-none">Tus Me Gusta</h3>
                            <p className="text-sm mt-3 font-bold">{favorites.length} canciones</p>
                        </div>

                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="group bg-[#121212] p-4 rounded-md hover:bg-[#181818] transition-all relative cursor-pointer" onClick={() => openPlaylist(playlist)}>
                                <div className="aspect-square bg-[#1a1a1a] mb-4 flex items-center justify-center rounded-lg relative overflow-hidden shadow-inner">
                                    <Music size={40} className="text-[#333] group-hover:scale-110 transition-transform" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                                        className="absolute top-2 right-2 p-2 bg-black/60 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-sm truncate">{playlist.name}</h3>
                                <p className="text-[#555] text-[10px] uppercase tracking-widest font-bold mt-1">Playlist • {user.username}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Library;
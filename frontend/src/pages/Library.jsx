import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../contexts/PlayerContext';
import { AuthContext } from '../contexts/AuthContext';
import { LibraryContext } from '../contexts/LibraryContext';
import { Heart, Music, Plus, Play, Trash2, ChevronLeft, Download, Camera, Edit2 } from 'lucide-react';

const Library = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const { playTrack, currentTrack } = useContext(PlayerContext);
    const nameRef = useRef(null);

    const {
        favorites, playlists, loading,
        toggleFavorite, isFavorite, downloadTrack,
        createPlaylist, deletePlaylist, updatePlaylistDetails, removeTrackFromPlaylist
    } = useContext(LibraryContext);

    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistTracks, setPlaylistTracks] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    // --- FUNCIÓN RECUPERADA: Abrir Playlist ---
    const openPlaylist = async (playlist) => {
        setSelectedPlaylist(playlist);
        if (playlist.id === 'fav') {
            const tracks = favorites.map(f => ({
                id: f.id,
                track_data: typeof f.track_data === 'string' ? JSON.parse(f.track_data) : f.track_data
            }));
            setPlaylistTracks(tracks);
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/playlists/${playlist.id}/tracks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const tracks = res.data.map(t => ({
                id: t.id, // Row ID único
                track_data: typeof t.track_data === 'string' ? JSON.parse(t.track_data) : t.track_data
            }));
            setPlaylistTracks(tracks);
        } catch (err) {
            console.error("Error al cargar canciones", err);
            setPlaylistTracks([]);
        }
    };

    // Refrescar tracks cuando hay cambios en la librería (para borrados y favoritos)
    useEffect(() => {
        if (selectedPlaylist) {
            if (selectedPlaylist.id === 'fav') {
                const tracks = favorites.map(f => ({
                    id: f.id,
                    track_data: typeof f.track_data === 'string' ? JSON.parse(f.track_data) : f.track_data
                }));
                setPlaylistTracks(tracks);
            } else {
                // Si es una playlist normal, refrescamos desde el servidor para ver el borrado
                const fetchUpdate = async () => {
                    try {
                        const res = await axios.get(`http://localhost:5000/api/playlists/${selectedPlaylist.id}/tracks`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setPlaylistTracks(res.data.map(t => ({
                            id: t.id,
                            track_data: typeof t.track_data === 'string' ? JSON.parse(t.track_data) : t.track_data
                        })));
                    } catch (e) { }
                };
                fetchUpdate();
            }
        }
    }, [favorites, playlists]);

    const focusName = () => {
        if (nameRef.current) {
            nameRef.current.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(nameRef.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    const handleNameBlur = (e) => {
        const newName = e.target.innerText;
        if (newName !== selectedPlaylist.name && selectedPlaylist.id !== 'fav') {
            updatePlaylistDetails(selectedPlaylist.id, { name: newName });
            setSelectedPlaylist({ ...selectedPlaylist, name: newName });
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && selectedPlaylist.id !== 'fav') {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePlaylistDetails(selectedPlaylist.id, {
                    name: selectedPlaylist.name,
                    cover_data: reader.result
                });
                setSelectedPlaylist({ ...selectedPlaylist, cover_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest">Inicia sesión para ver tu biblioteca</div>;

    return (
        <div className="w-full text-white p-8 pb-32">
            {selectedPlaylist ? (
                <div className="animate-in fade-in duration-500">
                    <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-[#888] hover:text-white mb-8 transition font-black uppercase text-[10px] tracking-[0.2em]">
                        <ChevronLeft size={14} /> Volver a biblioteca
                    </button>

                    <div className="flex flex-col md:flex-row items-end gap-10 mb-12">
                        <div className="w-60 h-60 bg-[#111] border border-white/5 shadow-2xl flex items-center justify-center rounded-2xl group relative overflow-hidden flex-shrink-0">
                            {selectedPlaylist.cover_url ? (
                                <img src={selectedPlaylist.cover_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                            ) : (
                                <Music size={80} className={`${selectedPlaylist.id === 'fav' ? 'text-[#6018f8]' : 'text-[#222]'}`} />
                            )}

                            {selectedPlaylist.id !== 'fav' && (
                                <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                    <Camera size={32} className="text-[#D4FF00] mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Editar Portada</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>

                        <div className="flex-1 w-full overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4FF00] mb-3">Playlist Personalizada</p>

                            <div className="flex items-center gap-6 group/name">
                                <h1
                                    ref={nameRef}
                                    contentEditable={selectedPlaylist.id !== 'fav'}
                                    onBlur={handleNameBlur}
                                    suppressContentEditableWarning={true}
                                    className={`text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none outline-none focus:text-[#D4FF00] focus:bg-white/5 px-2 -ml-2 rounded-xl transition-all truncate ${selectedPlaylist.id !== 'fav' ? 'cursor-text' : ''} italic`}
                                >
                                    {selectedPlaylist.name}
                                </h1>
                                {selectedPlaylist.id !== 'fav' && (
                                    <button onClick={focusName} className="p-4 bg-[#111] border border-white/5 hover:bg-[#D4FF00] hover:text-black rounded-full transition-all shadow-2xl active:scale-90 flex-shrink-0">
                                        <Edit2 size={24} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4FF00] to-white flex items-center justify-center text-black text-xs font-black">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-[#888] text-[10px] font-black uppercase tracking-[0.2em]">{user.username} • {playlistTracks.length} pistas guardadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-white/5 pt-8">
                        {playlistTracks.length > 0 ? (
                            <div className="space-y-1">
                                {playlistTracks.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all ${currentTrack?.id === item.track_data.id ? 'bg-white/10' : ''}`}
                                    >
                                        <div className="flex items-center gap-5 flex-1" onClick={() => playTrack(item.track_data, playlistTracks.map(t => t.track_data))}>
                                            <span className={`w-6 text-center font-mono text-[10px] font-black ${currentTrack?.id === item.track_data.id ? 'text-[#D4FF00]' : 'text-[#333]'}`}>
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                            <img src={item.track_data.album?.cover_small} className="w-12 h-12 rounded-lg shadow-2xl transition-transform group-hover:scale-105" alt="" />
                                            <div className="truncate">
                                                <p className={`font-black text-sm truncate max-w-md ${currentTrack?.id === item.track_data.id ? 'text-[#D4FF00]' : 'text-white'}`}>
                                                    {item.track_data.title}
                                                </p>
                                                <p className="text-[10px] text-[#555] uppercase font-black tracking-widest mt-0.5">{item.track_data.artist?.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 px-4">
                                            <button onClick={(e) => { e.stopPropagation(); downloadTrack(item.track_data); }} className="text-[#333] hover:text-white transition opacity-0 group-hover:opacity-100">
                                                <Download size={18} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.track_data); }}>
                                                <Heart size={18} fill={isFavorite(item.track_data.id) ? "#D4FF00" : "none"} className={isFavorite(item.track_data.id) ? "text-[#D4FF00]" : "text-[#333] hover:text-white"} />
                                            </button>

                                            {selectedPlaylist.id === 'fav' ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.track_data); }}
                                                    className="text-[#333] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:rotate-12"
                                                    title="Quitar de favoritos"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(selectedPlaylist.id, item.id); }}
                                                    className="text-[#333] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:rotate-12"
                                                    title="Borrar de la playlist"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}

                                            <div className="text-[10px] text-[#333] w-12 text-right font-mono font-black tracking-tighter">
                                                {Math.floor(item.track_data.duration / 60)}:{(item.track_data.duration % 60).toString().padStart(2, '0')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[40px] bg-[#050505]">
                                <Plus size={60} className="text-[#111] mb-6" />
                                <p className="text-[#444] mb-10 font-black uppercase text-[10px] tracking-[0.5em]">No hay pistas en esta colección</p>
                                <button onClick={() => navigate('/search')} className="bg-[#D4FF00] text-black px-12 py-5 rounded-full font-black text-xs uppercase hover:scale-105 hover:bg-white transition-all shadow-[0_0_50px_rgba(212,255,0,0.15)] tracking-[0.2em]">
                                    Explorar Catálogo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <p className="text-[10px] font-black text-[#D4FF00] uppercase tracking-[0.5em] mb-3">Tu Universo Musical</p>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">Biblioteca</h1>
                        </div>
                        <button onClick={() => setShowCreate(true)} className="bg-[#D4FF00] text-black p-5 rounded-full hover:rotate-90 hover:bg-white transition-all duration-500 shadow-2xl">
                            <Plus size={32} />
                        </button>
                    </div>

                    {showCreate && (
                        <form onSubmit={(e) => { e.preventDefault(); if (newPlaylistName.trim()) { createPlaylist(newPlaylistName); setNewPlaylistName(''); setShowCreate(false); } }} className="mb-14 bg-[#0a0a0a] p-8 rounded-[30px] flex gap-6 border border-white/5 animate-in slide-in-from-top-10 duration-500">
                            <input autoFocus className="bg-[#111] flex-1 p-5 rounded-2xl outline-none border-2 border-transparent focus:border-[#D4FF00] text-sm font-black uppercase tracking-widest transition-all" placeholder="Dale un nombre a tu lista..." value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} />
                            <button type="submit" className="bg-[#D4FF00] text-black font-black text-[10px] uppercase px-10 rounded-2xl hover:bg-white transition-colors">Confirmar</button>
                            <button type="button" onClick={() => setShowCreate(false)} className="text-red-500 font-black text-[10px] uppercase px-6 hover:text-white transition-colors">Cancelar</button>
                        </form>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
                        <div
                            onClick={() => openPlaylist({ id: 'fav', name: 'Tus Me Gusta' })}
                            className="bg-gradient-to-br from-[#1d08c0] to-[#6018f8] p-10 rounded-[35px] cursor-pointer hover:scale-[1.05] transition-all shadow-2xl flex flex-col justify-end min-h-[280px] relative overflow-hidden group border border-white/10"
                        >
                            <div className="absolute top-6 right-6 text-white/10 group-hover:text-white/30 transition-all group-hover:rotate-12 group-hover:scale-125 duration-500">
                                <Heart size={60} fill="currentColor" />
                            </div>
                            <h3 className="text-4xl font-black leading-none uppercase italic tracking-tighter">Me Gusta</h3>
                            <p className="text-[10px] mt-6 font-black uppercase tracking-[0.3em] text-white/50">{favorites.length} pistas</p>
                        </div>

                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="group bg-[#0a0a0a] p-5 rounded-[35px] border border-white/5 hover:bg-[#111] transition-all relative cursor-pointer hover:shadow-2xl" onClick={() => openPlaylist(playlist)}>
                                <div className="aspect-square bg-[#111] mb-6 flex items-center justify-center rounded-[25px] relative overflow-hidden shadow-2xl">
                                    {playlist.cover_url ? (
                                        <img src={playlist.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                    ) : (
                                        <Music size={50} className="text-[#1a1a1a] group-hover:text-[#D4FF00] transition-all duration-500" />
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('¿Seguro?')) deletePlaylist(playlist.id); }}
                                        className="absolute top-4 right-4 p-3 bg-black/80 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all z-20 scale-50 group-hover:scale-100 shadow-2xl"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <h3 className="font-black text-base truncate uppercase italic tracking-tighter group-hover:text-[#D4FF00] transition-colors px-2">{playlist.name}</h3>
                                <p className="text-[#333] text-[9px] uppercase tracking-[0.3em] font-black mt-3 px-2">Playlist • {user.username.split('@')[0]}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Library;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { PlayerContext } from '../contexts/PlayerContext';
import { LibraryContext } from '../contexts/LibraryContext';
import { Heart, Download, PlusCircle, Play } from 'lucide-react';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const Home = () => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackToAdd, setTrackToAdd] = useState(null);

    const { playTrack, currentTrack } = useContext(PlayerContext);
    const { toggleFavorite, isFavorite, downloadTrack } = useContext(LibraryContext);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/music/trending');
                setTrending(res.data.data.slice(0, 15));
            } catch (err) {
                console.error("Error cargando tendencias:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    return (
        <div className="text-white w-full h-full pb-10">
            {trackToAdd && <AddToPlaylistModal track={trackToAdd} onClose={() => setTrackToAdd(null)} />}

            <div className="mb-10">
                <h1 className="text-5xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Syne', transform: 'scaleX(1.1)', transformOrigin: 'left' }}>Escucha ahora</h1>
                <p className="text-[#888888] text-sm">Los éxitos que están sonando en todo el mundo.</p>
            </div>

            {/* SECCIÓN CARDS (TENDENCIAS) */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-bold text-[#D4FF00]">En Tendencia</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-t-2 border-[#D4FF00]"></div></div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {trending.slice(0, 5).map((track) => (
                            <div
                                key={`trend-${track.id}`}
                                className="group cursor-pointer transition-all hover:bg-[#111] p-3 rounded-lg relative"
                                onClick={() => playTrack(track, trending)}
                            >
                                <div className="aspect-square w-full mb-4 overflow-hidden rounded-md bg-[#181818] relative shadow-lg">
                                    <img src={track.album.cover_xl} alt={track.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />

                                    {/* Botón Play Superpuesto */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-[#D4FF00] text-black p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* BOTONES DE ACCIÓN (ESQUINA SUPERIOR DERECHA) */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }}
                                            className="p-2 rounded-full backdrop-blur-md bg-black/60 text-white hover:text-[#D4FF00] transition"
                                            title="Añadir a playlist"
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                                            className={`p-2 rounded-full backdrop-blur-md bg-black/60 transition ${isFavorite(track.id) ? 'text-[#D4FF00]' : 'text-white hover:text-[#D4FF00]'}`}
                                            title="Favoritos"
                                        >
                                            <Heart size={16} fill={isFavorite(track.id) ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); downloadTrack(track); }}
                                            className="p-2 rounded-full backdrop-blur-md bg-black/60 text-white hover:text-[#D4FF00] transition"
                                            title="Descargar"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className={`font-bold text-sm truncate mb-1 ${currentTrack?.id === track.id ? 'text-[#D4FF00]' : 'text-white'}`}>
                                    {track.title}
                                </h3>
                                <p className="text-[#888888] text-xs truncate">{track.artist.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN LISTA (TOP CANCIONES) */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold mb-6">Top Canciones</h2>
                {trending.slice(5, 15).map((track, index) => (
                    <div
                        key={`top-${track.id}`}
                        className={`flex items-center justify-between p-2 hover:bg-[#111111] rounded group cursor-pointer transition-colors ${currentTrack?.id === track.id ? 'bg-[#111111]' : ''}`}
                        onClick={() => playTrack(track, trending)}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <span className="text-[#555555] text-sm w-4 text-center font-mono">{index + 6}</span>
                            <img src={track.album.cover_small} alt="cover" className="w-10 h-10 object-cover rounded" />
                            <div>
                                <h4 className={`font-bold text-sm ${currentTrack?.id === track.id ? 'text-[#D4FF00]' : 'text-white'}`}>
                                    {track.title}
                                </h4>
                                <p className="text-xs text-[#888888]">{track.artist.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }} className="text-[#555] hover:text-[#D4FF00] transition">
                                <PlusCircle size={18} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }} className={`transition ${isFavorite(track.id) ? 'text-[#D4FF00]' : 'text-[#555555] hover:text-white'}`}>
                                <Heart size={16} fill={isFavorite(track.id) ? "currentColor" : "none"} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); downloadTrack(track); }} className="text-[#555555] hover:text-white transition">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
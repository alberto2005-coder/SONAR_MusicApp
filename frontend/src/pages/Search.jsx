import React, { useState, useContext } from 'react';
import axios from 'axios';
import { PlayerContext } from '../contexts/PlayerContext';
import { LibraryContext } from '../contexts/LibraryContext';
import { Search as SearchIcon, Heart, Download, PlusCircle } from 'lucide-react';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trackToAdd, setTrackToAdd] = useState(null);

    // Importamos playTrack del contexto para gestionar la cola
    const { playTrack, currentTrack } = useContext(PlayerContext);
    const { toggleFavorite, isFavorite, downloadTrack } = useContext(LibraryContext);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/music/search?q=${encodeURIComponent(query)}`);
            setResults(res.data.data.slice(0, 15));
        } catch (err) {
            console.error("Error en la búsqueda:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full text-white h-full pb-10 relative">
            {/* Modal para añadir a playlists */}
            {trackToAdd && <AddToPlaylistModal track={trackToAdd} onClose={() => setTrackToAdd(null)} />}

            <div className="mb-10">
                <h1 className="text-5xl font-black tracking-tighter mb-8" style={{ fontFamily: 'Syne', transform: 'scaleX(1.1)', transformOrigin: 'left' }}>Buscar</h1>
                <form onSubmit={handleSearch} className="relative max-w-[500px]">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
                    <input
                        type="text"
                        placeholder="¿Qué quieres escuchar?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-[#111111] text-white rounded py-3 pl-12 pr-4 focus:outline-none border border-[#333] focus:border-[#D4FF00] transition"
                    />
                </form>
            </div>

            {loading ? (
                <div className="flex py-10"><div className="animate-spin w-8 h-8 rounded-full border-t-2 border-[#D4FF00]"></div></div>
            ) : (
                <div className="flex flex-col gap-1">
                    {results.map(track => (
                        <div
                            key={track.id}
                            className={`flex items-center justify-between py-3 px-2 hover:bg-[#111111] group cursor-pointer transition-colors ${currentTrack?.id === track.id ? 'bg-[#111111]' : ''}`}
                        >
                            {/* Al hacer clic, pasamos la canción y la lista completa 'results' como cola */}
                            <div className="flex items-center gap-4 flex-1" onClick={() => playTrack(track, results)}>
                                <img src={track.album.cover_small} alt="cover" className="w-12 h-12 object-cover rounded shadow" />
                                <div className="flex flex-col justify-center">
                                    <h4 className={`font-bold text-sm mb-0.5 ${currentTrack?.id === track.id ? 'text-[#D4FF00]' : 'text-white'}`}>
                                        {track.title}
                                    </h4>
                                    <p className="text-xs text-[#888888]">{track.artist.name} • {track.album.title}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }}
                                    className="text-[#555555] hover:text-[#D4FF00] transition"
                                    title="Añadir a playlist"
                                >
                                    <PlusCircle size={18} />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                                    className={`transition ${isFavorite(track.id) ? 'text-[#D4FF00]' : 'text-[#555555] hover:text-white'}`}
                                >
                                    <Heart size={16} fill={isFavorite(track.id) ? "currentColor" : "none"} />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadTrack(track); }}
                                    className="text-[#555555] hover:text-white transition"
                                >
                                    <Download size={16} />
                                </button>

                                <div className="text-xs text-[#555555] w-10 text-right font-mono">
                                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
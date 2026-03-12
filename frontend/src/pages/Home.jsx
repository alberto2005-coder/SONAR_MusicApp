import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { PlayerContext } from '../contexts/PlayerContext';
import { LibraryContext } from '../contexts/LibraryContext';
import { Heart, Download, PlusCircle } from 'lucide-react';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const Home = () => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackToAdd, setTrackToAdd] = useState(null);

    const { setCurrentTrack } = useContext(PlayerContext);
    const { toggleFavorite, isFavorite, downloadTrack } = useContext(LibraryContext);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/music/trending');
                setTrending(res.data.data.slice(0, 10));
            } catch (err) { console.error("Failed to fetch trends", err); }
            finally { setLoading(false); }
        };
        fetchTrending();
    }, []);

    return (
        <div className="text-white w-full h-full pb-10">
            {trackToAdd && <AddToPlaylistModal track={trackToAdd} onClose={() => setTrackToAdd(null)} />}

            <div className="mb-10">
                <h1 className="text-5xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Syne', transform: 'scaleX(1.1)', transformOrigin: 'left' }}>Escucha ahora</h1>
                <p className="text-[#888888] text-sm">Trending, nuevo y lo mejor de hoy</p>
            </div>

            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-bold text-[#D4FF00]">En Tendencia</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-t-2 border-[#D4FF00]"></div></div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {trending.slice(0, 5).map((track) => (
                            <div key={`trend-${track.id}`} className="group cursor-pointer transition-transform hover:-translate-y-1 relative">
                                <div className="aspect-square w-full mb-3 overflow-hidden bg-[#181818]" onClick={() => setCurrentTrack(track)}>
                                    <img src={track.album.cover_xl} alt={track.title} className="object-cover w-full h-full" />
                                </div>
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }} className="p-2 rounded-full backdrop-blur-md bg-black/40 text-white hover:text-[#D4FF00] hover:scale-110 transition">
                                        <PlusCircle size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }} className={`p-2 rounded-full backdrop-blur-md bg-black/40 hover:scale-110 transition ${isFavorite(track.id) ? 'text-[#D4FF00]' : 'text-white'}`}>
                                        <Heart size={16} fill={isFavorite(track.id) ? "currentColor" : "none"} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); downloadTrack(track); }} className="p-2 rounded-full backdrop-blur-md bg-black/40 text-white hover:scale-110 transition">
                                        <Download size={16} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-sm truncate text-white mb-1" onClick={() => setCurrentTrack(track)}>{track.title}</h3>
                                <p className="text-[#888888] text-xs truncate" onClick={() => setCurrentTrack(track)}>{track.artist.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold mb-6">Top Canciones</h2>
                {trending.slice(5, 10).map((track, index) => (
                    <div key={`top-${track.id}`} className="flex items-center justify-between p-2 hover:bg-[#181818] rounded group cursor-pointer transition-colors">
                        <div className="flex items-center gap-4 flex-1" onClick={() => setCurrentTrack(track)}>
                            <span className="text-[#555555] text-sm w-4 text-center">{index + 6}</span>
                            <img src={track.album.cover_small} alt="cover" className="w-10 h-10 object-cover" />
                            <div><h4 className="font-bold text-sm text-white">{track.title}</h4><p className="text-xs text-[#888888]">{track.artist.name}</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }} className="text-[#555] hover:text-[#D4FF00] transition">
                                <PlusCircle size={18} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }} className={`transition ${isFavorite(track.id) ? 'text-[#D4FF00]' : 'text-[#555555] hover:text-white'}`}>
                                <Heart size={16} fill={isFavorite(track.id) ? "currentColor" : "none"} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); downloadTrack(track); }} className="text-[#555555] hover:text-white transition"><Download size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
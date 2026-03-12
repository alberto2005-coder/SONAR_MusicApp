import React, { useContext, useState } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic } from 'lucide-react';
import { useColorThief } from '../hooks/useColorThief';

const Player = () => {
    const {
        currentTrack, isPlaying, togglePlay, currentTime, duration,
        seekTime, volume, setVolume, playNext, playPrevious, queue, currentIndex
    } = useContext(PlayerContext);

    const [showQueue, setShowQueue] = useState(false);
    const dominantColor = useColorThief(currentTrack?.album?.cover_small);

    const formatTime = (time) => {
        if (!time || isNaN(time) || !isFinite(time) || time <= 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const progressPercent = (duration > 0 && isFinite(duration)) ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[90px] border-t border-white/5 flex items-center justify-between px-6 z-[100] transition-colors duration-1000"
            style={{ background: `linear-gradient(to top, #050505, ${dominantColor}15)` }}>

            {/* COLA FLOTANTE */}
            {showQueue && (
                <div className="absolute bottom-[100px] right-6 w-80 bg-[#111] border border-[#222] rounded-lg shadow-2xl p-4 z-[110]">
                    <h3 className="text-sm font-bold mb-4 text-[#D4FF00]">Siguiente en la cola</h3>
                    <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {queue.slice(currentIndex + 1).map((track, i) => (
                            <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition cursor-default">
                                <img src={track.album?.cover_small} className="w-8 h-8 rounded" alt="" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-bold truncate text-white">{track.title}</span>
                                    <span className="text-[10px] text-[#888]">{track.artist?.name}</span>
                                </div>
                            </div>
                        ))}
                        {queue.length - 1 === currentIndex && <p className="text-[10px] text-[#555] italic">No hay más canciones</p>}
                    </div>
                </div>
            )}

            {/* INFO CANCIÓN */}
            <div className="flex items-center gap-4 w-1/3">
                {currentTrack && (
                    <>
                        <img src={currentTrack.album?.cover_small} alt="cover" className="w-14 h-14 object-cover rounded" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white font-bold text-sm truncate">{currentTrack.title}</span>
                            <span className="text-[#888888] text-xs truncate">{currentTrack.artist.name}</span>
                        </div>
                    </>
                )}
            </div>

            {/* CONTROLES */}
            <div className="flex flex-col items-center justify-center w-1/3 gap-2">
                <div className="flex items-center gap-6">
                    <button onClick={playPrevious} className="text-[#888] hover:text-white transition"><SkipBack size={20} /></button>
                    <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition shadow-xl">
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    <button onClick={playNext} className="text-[#888] hover:text-white transition"><SkipForward size={20} /></button>
                </div>

                <div className="w-full max-w-[450px] flex items-center gap-3">
                    <span className="text-[10px] text-[#888] font-mono w-8 text-right">{formatTime(currentTime)}</span>
                    <div className="h-1 flex-1 bg-white/10 rounded-full relative group hover:h-1.5 transition-all">
                        <input type="range" min="0" max={duration || 100} step="0.1" value={currentTime}
                            onChange={(e) => seekTime(parseFloat(e.target.value))} className="w-full h-full opacity-0 cursor-pointer absolute z-10" />
                        <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: dominantColor !== '#000000' ? dominantColor : '#D4FF00' }}></div>
                    </div>
                    <span className="text-[10px] text-[#888] font-mono w-8">{formatTime(duration)}</span>
                </div>
            </div>

            {/* VOLUMEN Y COLA */}
            <div className="w-1/3 flex justify-end items-center gap-4">
                <button onClick={() => setShowQueue(!showQueue)} className={`transition ${showQueue ? 'text-[#D4FF00]' : 'text-[#888] hover:text-white'}`}>
                    <ListMusic size={20} />
                </button>
                <div className="flex items-center gap-2 group w-32">
                    <Volume2 size={18} className="text-[#888]" />
                    <div className="h-1 flex-1 bg-white/10 rounded-full relative group-hover:h-1.5 transition-all">
                        <input type="range" min="0" max="1" step="0.01" value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-full opacity-0 cursor-pointer absolute z-10" />
                        <div className="h-full bg-white rounded-full" style={{ width: `${volume * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
import React, { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import { Play, Pause } from 'lucide-react';
import { useColorThief } from '../hooks/useColorThief';

const Player = () => {
    const { currentTrack, isPlaying, togglePlay, currentTime, duration, seekTime } = useContext(PlayerContext);

    // Extraemos el color para el reproductor
    const dominantColor = useColorThief(currentTrack?.album?.cover_small);

    const formatTime = (time) => {
        if (!time || isNaN(time) || !isFinite(time) || time <= 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const progressPercent = (duration > 0 && isFinite(duration))
        ? (currentTime / duration) * 100
        : 0;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 h-[90px] border-t border-white/5 flex items-center justify-between px-6 z-50 transition-colors duration-1000"
            style={{
                // Degradado sutil en el reproductor
                background: `linear-gradient(to top, #050505, ${dominantColor}15)`
            }}
        >
            {/* Información de la canción */}
            <div className="flex items-center gap-4 w-1/3">
                {currentTrack && (
                    <>
                        <img
                            src={currentTrack.album?.cover_small || currentTrack.album?.cover}
                            alt="cover"
                            className="w-14 h-14 object-cover rounded shadow-lg"
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white font-bold text-sm truncate">{currentTrack.title}</span>
                            <span className="text-[#888888] text-xs truncate">{currentTrack.artist.name}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Controles centrales */}
            <div className="flex flex-col items-center justify-center w-1/3 gap-2">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform active:scale-95 shadow-xl"
                    style={{ backgroundColor: dominantColor !== '#000000' ? dominantColor : 'white', color: dominantColor !== '#000000' ? 'black' : 'black' }}
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                </button>

                <div className="w-full max-w-[400px] flex items-center gap-3">
                    <span className="text-[10px] text-[#888888] font-mono w-8 text-right">
                        {formatTime(currentTime)}
                    </span>

                    <div className="h-1 flex-1 bg-white/10 rounded-full relative overflow-hidden group hover:h-1.5 transition-all">
                        <input
                            type="range"
                            min="0"
                            max={duration > 0 ? duration : 100}
                            step="0.1"
                            value={currentTime}
                            onChange={(e) => seekTime(parseFloat(e.target.value))}
                            className="w-full h-full opacity-0 cursor-pointer absolute z-10"
                        />
                        <div
                            className="h-full transition-colors"
                            style={{
                                width: `${progressPercent}%`,
                                backgroundColor: dominantColor !== '#000000' ? dominantColor : '#D4FF00'
                            }}
                        ></div>
                    </div>

                    <span className="text-[10px] text-[#888888] font-mono w-8">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            <div className="w-1/3"></div>
        </div>
    );
};

export default Player;
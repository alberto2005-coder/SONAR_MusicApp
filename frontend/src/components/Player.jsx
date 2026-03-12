import React, { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import { Play, Pause } from 'lucide-react';

const Player = () => {
    const { currentTrack, isPlaying, togglePlay, currentTime, duration, seekTime } = useContext(PlayerContext);

    // Función de formateo robusta
    const formatTime = (time) => {
        // Si el tiempo no es un número válido o es infinito, devolvemos 0:00
        if (!time || isNaN(time) || !isFinite(time) || time <= 0) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Cálculo del porcentaje de la barra de progreso
    // Usamos una validación para que si duration es 0 o inválida, la barra se quede al inicio
    const progressPercent = (duration > 0 && isFinite(duration))
        ? (currentTime / duration) * 100
        : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#050505] border-t border-[#1a1a1a] flex items-center justify-between px-6 z-50">

            {/* Información de la canción */}
            <div className="flex items-center gap-4 w-1/3">
                {currentTrack && (
                    <>
                        <img
                            src={currentTrack.album?.cover_small || currentTrack.album?.cover}
                            alt="cover"
                            className="w-14 h-14 object-cover rounded"
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white font-bold text-sm truncate">{currentTrack.title}</span>
                            <span className="text-[#888888] text-xs truncate">{currentTrack.artist.name}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Controles centrales y barra de progreso */}
            <div className="flex flex-col items-center justify-center w-1/3 gap-2">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-[#D4FF00] transition-transform active:scale-95"
                >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                </button>

                <div className="w-full max-w-[400px] flex items-center gap-3">
                    {/* Tiempo actual */}
                    <span className="text-[10px] text-[#888888] font-mono w-8 text-right">
                        {formatTime(currentTime)}
                    </span>

                    {/* Barra de progreso / Input Range */}
                    <div className="h-1 flex-1 bg-[#222222] rounded-full relative overflow-hidden group hover:h-1.5 transition-all">
                        <input
                            type="range"
                            min="0"
                            // Si duration es inválida, ponemos 100 por defecto para que el input no de error
                            max={duration > 0 ? duration : 100}
                            step="0.1"
                            value={currentTime}
                            onChange={(e) => seekTime(parseFloat(e.target.value))}
                            className="w-full h-full opacity-0 cursor-pointer absolute z-10"
                        />
                        <div
                            className="h-full bg-white group-hover:bg-[#D4FF00] transition-colors"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                    {/* Tiempo total (Duración) */}
                    <span className="text-[10px] text-[#888888] font-mono w-8">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Espacio para volumen u otros controles */}
            <div className="w-1/3"></div>
        </div>
    );
};

export default Player;
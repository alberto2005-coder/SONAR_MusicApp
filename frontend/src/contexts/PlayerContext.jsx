import React, { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => setCurrentTime(audio.currentTime);

        // Intentar capturar duración del audio si el stream lo permite
        const updateDuration = () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
                setDuration(audio.duration);
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    useEffect(() => {
        if (currentTrack) {
            // Seteamos la duración directamente desde los datos de Deezer
            if (currentTrack.duration) {
                setDuration(currentTrack.duration);
            }

            const query = `${currentTrack.artist.name} ${currentTrack.title}`;
            // Pasamos la duración al backend para mayor compatibilidad
            const streamUrl = `http://localhost:5000/api/music/stream?query=${encodeURIComponent(query)}&duration=${currentTrack.duration}`;

            audioRef.current.src = streamUrl;
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Error de reproducción:", err));
        }
    }, [currentTrack]);

    const seekTime = (time) => {
        if (isFinite(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else if (audioRef.current.src) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack, setCurrentTrack, isPlaying, togglePlay,
            volume, setVolume, currentTime, duration, seekTime, audioRef
        }}>
            {children}
        </PlayerContext.Provider>
    );
};
import React, { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
                setDuration(audio.duration);
            }
        };

        const handleTrackEnd = () => {
            playNext();
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleTrackEnd);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleTrackEnd);
        };
    }, [currentIndex, queue]);

    // Sincronizar volumen real con el elemento de audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (currentTrack) {
            if (currentTrack.duration) setDuration(currentTrack.duration);

            const query = `${currentTrack.artist.name} ${currentTrack.title}`;
            const streamUrl = `http://localhost:5000/api/music/stream?query=${encodeURIComponent(query)}&duration=${currentTrack.duration}`;

            audioRef.current.src = streamUrl;
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Error de reproducción:", err));
        }
    }, [currentTrack]);

    const playTrack = (track, newQueue = []) => {
        setCurrentTrack(track);
        if (newQueue.length > 0) {
            setQueue(newQueue);
            const index = newQueue.findIndex(t => t.id === track.id);
            setCurrentIndex(index);
        }
    };

    const playNext = () => {
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setCurrentTrack(queue[nextIndex]);
        }
    };

    const playPrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setCurrentTrack(queue[prevIndex]);
        }
    };

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
            currentTrack, playTrack, isPlaying, togglePlay,
            volume, setVolume, currentTime, duration, seekTime,
            audioRef, queue, currentIndex, playNext, playPrevious
        }}>
            {children}
        </PlayerContext.Provider>
    );
};
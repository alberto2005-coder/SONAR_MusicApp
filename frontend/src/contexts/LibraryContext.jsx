import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para descargar la canción
    const downloadTrack = async (track) => {
        try {
            const query = `${track.artist.name} ${track.title}`;
            // Abrimos en una pestaña nueva para iniciar la descarga desde el backend
            window.open(`http://localhost:5000/api/music/download?query=${encodeURIComponent(query)}`, '_blank');
        } catch (err) {
            console.error("Error al intentar descargar:", err);
        }
    };

    const fetchLibrary = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [favsRes, playsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/favorites', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/playlists', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setFavorites(favsRes.data);
            setPlaylists(playsRes.data);
        } catch (err) {
            console.error("Error cargando biblioteca:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
    }, [token]);

    const toggleFavorite = async (track) => {
        try {
            await axios.post('http://localhost:5000/api/favorites/toggle',
                { trackId: track.id, trackData: track },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLibrary();
        } catch (err) {
            console.error("Error en favoritos:", err);
        }
    };

    const isFavorite = (trackId) => favorites.some(f => f.track_id === trackId.toString());

    return (
        <LibraryContext.Provider value={{
            favorites, playlists, loading,
            toggleFavorite, isFavorite, downloadTrack,
            fetchLibrary
        }}>
            {children}
        </LibraryContext.Provider>
    );
};
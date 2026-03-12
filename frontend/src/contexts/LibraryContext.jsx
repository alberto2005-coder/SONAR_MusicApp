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

    // CORRECCIÓN: Adaptado a las rutas reales de tu server.js
    const toggleFavorite = async (track) => {
        if (!token || !track) return;

        const trackIdStr = track.id.toString();
        const alreadyFavorite = isFavorite(track.id);

        try {
            if (alreadyFavorite) {
                // Si ya es favorita, usamos la ruta DELETE de tu server.js
                await axios.delete(`http://localhost:5000/api/favorites/${trackIdStr}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Si no es favorita, usamos la ruta POST de tu server.js
                // Usamos los nombres de campos que espera tu DB: track_id y track_data
                await axios.post('http://localhost:5000/api/favorites',
                    {
                        track_id: trackIdStr,
                        track_data: track
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            // Refrescamos la biblioteca para que el corazón cambie al instante
            await fetchLibrary();
        } catch (err) {
            console.error("Error en favoritos:", err);
        }
    };

    // Comparamos siempre como String para que coincida con la base de datos
    const isFavorite = (trackId) => {
        if (!trackId) return false;
        return favorites.some(f => f.track_id === trackId.toString());
    };

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
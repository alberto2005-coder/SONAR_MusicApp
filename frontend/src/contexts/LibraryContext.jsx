import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const toggleFavorite = async (track) => {
        if (!token || !track) return;
        const trackIdStr = track.id.toString();
        const alreadyFavorite = isFavorite(track.id);
        try {
            if (alreadyFavorite) {
                await axios.delete(`http://localhost:5000/api/favorites/${trackIdStr}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/favorites',
                    { track_id: trackIdStr, track_data: track },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            await fetchLibrary();
        } catch (err) { console.error("Error en favoritos:", err); }
    };

    const isFavorite = (trackId) => {
        if (!trackId) return false;
        return favorites.some(f => f.track_id === trackId.toString());
    };

    const createPlaylist = async (name) => {
        if (!token || !name) return;
        try {
            await axios.post('http://localhost:5000/api/playlists', { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchLibrary();
        } catch (err) { console.error("Error al crear playlist:", err); }
    };
    const addToPlaylist = async (playlistId, track) => {
        if (!token || !track) return { ok: false, reason: 'invalid' };
        try {
            await axios.post(`http://localhost:5000/api/playlists/${playlistId}/tracks`,
                { track_id: track.id.toString(), track_data: track },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchLibrary();
            return { ok: true };
        } catch (err) {
            if (axios.isAxiosError && err.response?.status === 409) {
                return { ok: false, reason: 'duplicate' };
            }
            console.error('Error al añadir a playlist:', err);
            return { ok: false, reason: 'error' };
        }
    };

    const deletePlaylist = async (playlistId) => {
        if (!token) return;
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${playlistId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchLibrary();
        } catch (err) { console.error("Error al eliminar playlist:", err); }
    };

    // CAMBIO AQUÃ: Ahora usa rowId para borrar duplicados correctamente
    const removeTrackFromPlaylist = async (playlistId, rowId) => {
        if (!token) return;
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${playlistId}/tracks/${rowId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchLibrary();
        } catch (err) { console.error("Error al eliminar canciÃ³n:", err); }
    };

    const updatePlaylistDetails = async (playlistId, data) => {
        if (!token) return;
        try {
            await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchLibrary();
        } catch (err) { console.error("Error al editar playlist:", err); }
    };

    return (
        <LibraryContext.Provider value={{
            favorites, playlists, loading,
            toggleFavorite, isFavorite, downloadTrack,
            fetchLibrary, createPlaylist, addToPlaylist, deletePlaylist,
            removeTrackFromPlaylist, updatePlaylistDetails
        }}>
            {children}
        </LibraryContext.Provider>
    );
};

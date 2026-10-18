import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    const downloadTrack = async (track) => {
        try {
            const query = `${track.artist.name} ${track.title}`;
            window.open(`/api/music/download?query=${encodeURIComponent(query)}`, '_blank');
        } catch (err) {
            console.error("Error al intentar descargar:", err);
        }
    };

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            const [favsRes, playsRes] = await Promise.all([
                axios.get('/api/favorites'),
                axios.get('/api/playlists')
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
    }, []);

    const toggleFavorite = async (track) => {
        if (!track) return;
        const trackIdStr = track.id.toString();
        const alreadyFavorite = isFavorite(track.id);
        try {
            if (alreadyFavorite) {
                await axios.delete(`/api/favorites/${trackIdStr}`);
            } else {
                await axios.post('/api/favorites', { track_id: trackIdStr, track_data: track });
            }
            await fetchLibrary();
        } catch (err) { console.error("Error en favoritos:", err); }
    };

    const isFavorite = (trackId) => {
        if (!trackId) return false;
        return favorites.some(f => f.track_id === trackId.toString());
    };

    const createPlaylist = async (name) => {
        if (!name) return;
        try {
            await axios.post('/api/playlists', { name });
            await fetchLibrary();
        } catch (err) { console.error("Error al crear playlist:", err); }
    };

    const addToPlaylist = async (playlistId, track) => {
        if (!track) return { ok: false, reason: 'invalid' };
        try {
            await axios.post(`/api/playlists/${playlistId}/tracks`,
                { track_id: track.id.toString(), track_data: track });
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
        try {
            await axios.delete(`/api/playlists/${playlistId}`);
            await fetchLibrary();
        } catch (err) { console.error("Error al eliminar playlist:", err); }
    };

    // Borrado por rowId para no borrar duplicados por error
    const removeTrackFromPlaylist = async (playlistId, rowId) => {
        try {
            await axios.delete(`/api/playlists/${playlistId}/tracks/${rowId}`);
            await fetchLibrary();
        } catch (err) { console.error("Error al eliminar canción:", err); }
    };

    const updatePlaylistDetails = async (playlistId, data) => {
        try {
            await axios.put(`/api/playlists/${playlistId}`, data);
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

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLibrary = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [favsRes, playsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/favorites', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/playlists', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setFavorites(favsRes.data);
            setPlaylists(playsRes.data);
        } catch (err) {
            console.error("Error al cargar biblioteca", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
    }, [token]);

    const createPlaylist = async (name) => {
        try {
            const res = await axios.post('http://localhost:5000/api/playlists', { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlaylists([...playlists, res.data]);
        } catch (err) {
            console.error("Error al crear playlist", err);
        }
    };

    const deletePlaylist = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlaylists(playlists.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error al eliminar playlist", err);
        }
    };

    const addToPlaylist = async (playlistId, track) => {
        try {
            await axios.post(`http://localhost:5000/api/playlists/${playlistId}/tracks`, {
                track_id: track.id.toString(),
                track_data: track
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Añadido a la playlist");
        } catch (err) {
            console.error("Error al añadir a playlist", err);
        }
    };

    const toggleFavorite = async (track) => {
        if (!token) return;
        const isFav = favorites.some(f => f.track_id === track.id.toString());
        try {
            if (isFav) {
                await axios.delete(`http://localhost:5000/api/favorites/${track.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFavorites(favorites.filter(f => f.track_id !== track.id.toString()));
            } else {
                await axios.post('http://localhost:5000/api/favorites', {
                    track_id: track.id.toString(),
                    track_data: track
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFavorites([...favorites, { track_id: track.id.toString(), track_data: track }]);
            }
        } catch (err) {
            console.error("Error en favoritos", err);
        }
    };

    const isFavorite = (trackId) => favorites.some(f => f.track_id === trackId.toString());

    return (
        <LibraryContext.Provider value={{
            favorites, playlists, loading,
            toggleFavorite, isFavorite,
            createPlaylist, deletePlaylist, addToPlaylist,
            fetchLibrary
        }}>
            {children}
        </LibraryContext.Provider>
    );
};
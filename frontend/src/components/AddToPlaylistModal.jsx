import React, { useContext } from 'react';
import { LibraryContext } from '../contexts/LibraryContext';
import { ListMusic, X } from 'lucide-react';

const AddToPlaylistModal = ({ track, onClose }) => {
    const { playlists, addToPlaylist } = useContext(LibraryContext);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-[#333] w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-[#222] flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <ListMusic className="text-[#D4FF00]" size={24} />
                        Añadir a playlist
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-2">
                    {playlists.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4 text-sm">No tienes playlists creadas todavía.</p>
                        </div>
                    ) : (
                        playlists.map(playlist => (
                            <button
                                key={playlist.id}
                                onClick={() => {
                                    addToPlaylist(playlist.id, track);
                                    onClose();
                                }}
                                className="w-full flex items-center p-4 hover:bg-[#D4FF00] hover:text-black rounded-lg transition-all text-left font-bold text-white mb-1"
                            >
                                {playlist.name}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

// La app ya no usa login/registro: existe un único usuario local fijo
// que usa el backend para guardar favoritos y playlists en la SQLite.
const LOCAL_USER = { id: 1, username: 'SONAR' };

export const AuthProvider = ({ children }) => {
    const [user] = useState(LOCAL_USER);
    const [loading] = useState(false);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

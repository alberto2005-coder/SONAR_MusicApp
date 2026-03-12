import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');

        if (savedToken && savedUsername) {
            setToken(savedToken);
            setUser({ username: savedUsername, token: savedToken });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
        const { token: userToken, username: resUsername } = res.data;

        localStorage.setItem('token', userToken);
        localStorage.setItem('username', resUsername);

        setToken(userToken);
        setUser({ username: resUsername, token: userToken });
    };

    const register = async (username, password) => {
        await axios.post('http://localhost:5000/api/auth/register', { username, password });
        return login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, token, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
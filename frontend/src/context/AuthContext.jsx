import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const storedToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (storedToken && userData) {
            setToken(storedToken);
            setUser(JSON.parse(userData));
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const { token: authToken, ...userData } = response.data;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);

        return userData;
    };

    const updateUser = (patch) => {
        if (!user) return;
        const updated = { ...user, ...patch };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === 'ADMIN';
    const isStudent = () => user?.role === 'STUDENT';
    const isStaff = () => user?.role === 'STAFF';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin, isStudent, isStaff }}>
            {children}
        </AuthContext.Provider>
    );
};

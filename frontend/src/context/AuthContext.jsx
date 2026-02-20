import React, { createContext, useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Basic auth logic - replace with actual JWT/API integration
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);

    const login = (username, password) => {
        // Placeholder check - replace with API call
        if (username === 'raakul' && password === '12345') {
            const token = 'fake-jwt-token';
            localStorage.setItem('adminToken', token);
            setToken(token);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = () => {
    const { token } = useAuth();
    if (!token) return <Navigate to="/admin/login" replace />;
    return <Outlet />;
};

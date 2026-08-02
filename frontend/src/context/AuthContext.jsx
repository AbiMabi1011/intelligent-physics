import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null);

    const login = (userData) => {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    const updateUser = (updatedFields) => {
        const updatedUser = { ...user, ...updatedFields };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token: user ? 'logged-in' : null,
            role: user?.role,
            login,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

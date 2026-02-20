import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { token, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleLogout = () => {
        logout();
        <Navigate to="/admin/login" replace />;
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <Topbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    displayName="Raakul" // Could be dynamic from context
                    onLogout={handleLogout}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16 p-6">
                    <Outlet /> {/* Renders the nested route content (Dashboard, Students, etc.) */}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

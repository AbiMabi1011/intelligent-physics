import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import BottomNav from '../components/admin/BottomNav';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('admin-theme-light');
        } else {
            document.documentElement.classList.remove('admin-theme-light');
        }

        // Clean up theme class when admin dashboard is unmounted
        return () => {
            document.documentElement.classList.remove('admin-theme-light');
        };
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('admin-theme', nextTheme);
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen bg-[#0D0E12] overflow-hidden font-sans text-white">

            {/* Sidebar — drawer on mobile, static column on desktop */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onLogout={logout}
            />

            {/* Main content — full width on mobile, shrinks beside sidebar on lg+ */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <Topbar
                    onToggleSidebar={() => setSidebarOpen(prev => !prev)}
                    displayName={user.full_name || user.email}
                    onLogout={logout}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0D0E12] p-6 lg:p-10 pb-24 lg:pb-10">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Bottom nav (mobile only) */}
            <BottomNav />
        </div>
    );
};

export default AdminLayout;

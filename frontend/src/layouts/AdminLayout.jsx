import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import BottomNav from '../components/admin/BottomNav';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

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
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 pb-20 lg:pb-6">
                    <div className="max-w-7xl mx-auto">
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

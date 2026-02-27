import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, Megaphone, Settings
} from 'lucide-react';

/**
 * Mobile-only bottom navigation bar for the admin panel.
 * Shows the 5 most important pages. Hidden on lg+.
 */
const BottomNav = () => {
    const items = [
        { name: 'Home', path: '/admin/dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={22} /> },
        { name: 'Quizzes', path: '/admin/quizzes', icon: <BookOpen size={22} /> },
        { name: 'News', path: '/admin/announcements', icon: <Megaphone size={22} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={22} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex lg:hidden shadow-lg">
            {items.map(item => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold transition-colors
                        ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <span className={`mb-0.5 ${isActive ? 'text-blue-600' : ''}`}>{item.icon}</span>
                            <span>{item.name}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;

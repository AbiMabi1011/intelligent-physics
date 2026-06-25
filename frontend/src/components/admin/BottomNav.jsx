import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, Megaphone, Settings, Activity, Zap
} from 'lucide-react';

/**
 * Mobile-only bottom navigation bar for the admin panel.
 * Upgraded to high-end dark mode for Intelligent Physics.
 */
const BottomNav = () => {
    const items = [
        { name: 'HOME', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'STUDENTS', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'QUIZ', path: '/admin/quizzes', icon: <Activity size={20} /> },
        { name: 'NEWS', path: '/admin/announcements', icon: <Megaphone size={20} /> },
        { name: 'SETUP', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0E12]/80 backdrop-blur-2xl border-t border-[#23262D] lg:hidden flex px-2 pb-6 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#656CFF] to-transparent shadow-[0_0_15px_#656CFF]" />
            
            {items.map(item => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 relative group
                        ${isActive ? 'text-white' : 'text-slate-600 hover:text-white'}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div className={`relative mb-1.5 transition-transform duration-500 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-110'}`}>
                                {isActive && (
                                    <div className="absolute inset-0 bg-[#656CFF]/20 blur-[15px] rounded-full scale-150" />
                                )}
                                <span className={`relative z-10 ${isActive ? 'text-[#656CFF]' : 'group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-white translate-y-[-2px]' : 'text-slate-700'}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-[-4px] h-1 w-1 bg-[#656CFF] rounded-full shadow-[0_0_8px_#656CFF] animate-pulse" />
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;

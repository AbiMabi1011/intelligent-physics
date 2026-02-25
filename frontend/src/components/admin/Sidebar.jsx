import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'Marks', path: '/admin/marks', icon: <ClipboardList size={20} /> },
        { name: 'Papers', path: '/admin/papers', icon: <FileText size={20} /> },
        { name: 'Quizzes', path: '/admin/quizzes', icon: <BookOpen size={20} /> },
        { name: 'Results', path: '/admin/results', icon: <ClipboardList size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 transform bg-slate-900 text-white transition-all duration-300 shadow-xl flex flex-col
                ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-20'}
            `}
        >
            {/* Header / Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="h-10 w-10 min-w-[2.5rem] flex items-center justify-center p-1 bg-white/10 rounded-lg">
                        <img src={logo} alt="IP Logo" className="w-full h-full object-contain" />
                    </div>
                    {isOpen && (
                        <span className="text-lg font-bold tracking-wider whitespace-nowrap">Physics Admin</span>
                    )}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-slate-400 hover:text-white focus:outline-none"
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 py-6 px-3 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center rounded-lg px-3 py-3 transition-colors
                            ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                            ${!isOpen && 'justify-center'}
                        `}
                    >
                        {item.icon}
                        {isOpen && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User / Logout */}
            <div className="border-t border-slate-700 p-4">
                <button
                    onClick={onLogout}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-slate-300 hover:bg-red-900/50 hover:text-red-400 transition-colors ${!isOpen && 'justify-center'}`}
                >
                    <LogOut size={20} />
                    {isOpen && <span className="ml-3 font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

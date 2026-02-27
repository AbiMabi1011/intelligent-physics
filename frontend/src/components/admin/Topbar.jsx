import React, { useState } from 'react';
import { Menu, Bell, LogOut, User, X } from 'lucide-react';
import logo from '../../assets/logo.jpeg';

const Topbar = ({ onToggleSidebar, displayName, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white border-b border-gray-100 px-4 md:px-6 shadow-sm shrink-0">

            {/* ── Left: hamburger + brand (mobile) ── */}
            <div className="flex items-center gap-3">
                {/* Hamburger — always shown to open/close drawer */}
                <button
                    onClick={onToggleSidebar}
                    className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={22} />
                </button>

                {/* Brand on mobile (not visible on lg since sidebar shows it) */}
                <div className="flex items-center gap-2 lg:hidden">
                    <img src={logo} alt="IP" className="h-7 w-7 object-contain" />
                    <span className="font-bold text-gray-800 text-sm">Intelligent Physics</span>
                </div>
            </div>

            {/* ── Right: bell + profile ── */}
            <div className="flex items-center gap-2">
                {/* Notification bell */}
                <button className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(prev => !prev)}
                        className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100 transition-colors focus:outline-none"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                            {displayName}
                        </span>
                    </button>

                    {dropdownOpen && (
                        <>
                            {/* Backdrop */}
                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                            {/* Menu */}
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Intelligent Physics — Admin</p>
                                </div>
                                {/* Profile item (placeholder) */}
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <User size={16} className="text-gray-400" /> My Profile
                                </button>
                                {/* Sign out */}
                                <button
                                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} /> Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;

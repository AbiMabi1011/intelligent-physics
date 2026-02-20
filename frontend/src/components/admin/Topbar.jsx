import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut, User } from 'lucide-react';

const Topbar = ({ onToggleSidebar, displayName, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm z-10 w-full fixed top-0 right-0 left-0 lg:left-64 lg:w-[calc(100%-16rem)] transition-all duration-300">
            {/* Left Controls */}
            <div className="flex items-center">
                <button
                    onClick={onToggleSidebar}
                    className="mr-4 rounded p-2 text-gray-500 hover:bg-gray-100 focus:outline-none lg:hidden"
                >
                    <Menu size={24} />
                </button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="h-10 w-64 rounded-full border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 p-1 rounded-lg transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-indigo-50">
                            {displayName ? displayName.charAt(0) : 'A'}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">{displayName}</span>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 transform origin-top-right transition-all">
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                <p className="text-xs text-gray-500 truncate">admin@physics.com</p>
                            </div>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                <User size={16} className="mr-2" /> Profile
                            </button>
                            <button
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                                <LogOut size={16} className="mr-2" /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;

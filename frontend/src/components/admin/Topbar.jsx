import React, { useState } from 'react';
import { Menu, Bell, LogOut, Search, Settings, Mail, Grid, Zap, Activity, ShieldCheck, ChevronDown, User, Sun, Moon } from 'lucide-react';

const Topbar = ({ onToggleSidebar, displayName, onLogout, theme, onToggleTheme }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    return (
        <header className="h-24 bg-[#0D0E12]/90 backdrop-blur-3xl border-b border-[#23262D] sticky top-0 z-40 px-8 lg:px-12">
            <div className="flex items-center justify-between h-full w-full mx-auto relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-[20%] w-64 h-64 bg-[#656CFF]/5 blur-[100px] rounded-full pointer-events-none" />
                
                {/* Left Side: Search & Toggle */}
                <div className="flex items-center gap-8 flex-1 relative z-10">
                    <button 
                        onClick={onToggleSidebar}
                        className="lg:hidden h-12 w-12 flex items-center justify-center rounded-2xl text-slate-400 bg-white/5 border border-white/5 hover:bg-[#656CFF] hover:text-white transition-all shadow-xl active:scale-90"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden md:flex items-center relative max-w-xl w-full group">
                        <span className="absolute left-6 text-slate-500 group-focus-within:text-[#656CFF] transition-all duration-500 group-focus-within:scale-110">
                            <Search size={20} />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full bg-[#15171C] border border-[#23262D] rounded-[2rem] py-4 pl-16 pr-6 text-[11px] font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#656CFF]/10 focus:border-[#656CFF]/50 transition-all outline-none shadow-lg group-hover:bg-[#1c1f26]"
                        />
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-4 lg:gap-8 relative z-10">
                    
                    {/* Server Status */}
                    <div className="hidden xl:flex items-center gap-6 px-8 py-3 bg-white/5 border border-white/5 rounded-2xl mr-4">
                        <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981] animate-pulse" />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Server Online</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                             <Activity size={14} className="text-[#656CFF]" />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Stable Connection</span>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-[#23262D]">
                        <button className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-[#656CFF] transition-all relative group shadow-inner">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-[#EF4444] rounded-full ring-4 ring-[#0D0E12] animate-bounce" />
                        </button>
                        <button className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-[#656CFF] transition-all shadow-inner">
                            <Grid size={20} />
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        onClick={onToggleTheme}
                        className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-[#656CFF] transition-all shadow-inner"
                        title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                    >
                        {theme === 'dark' ? (
                            <Sun size={20} className="transition-transform duration-500 hover:rotate-45" />
                        ) : (
                            <Moon size={20} className="transition-transform duration-500 hover:-rotate-12" />
                        )}
                    </button>

                    {/* User Profile */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-4 p-1.5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 transition-all outline-none group active:scale-95 shadow-2xl"
                        >
                            <div className="h-11 w-11 rounded-[1.2rem] bg-gradient-to-br from-[#656CFF] to-[#b0b3ff] flex items-center justify-center text-white font-black text-sm shadow-xl shadow-[#656CFF]/20 group-hover:rotate-6 transition-transform">
                                {displayName?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="hidden lg:block text-left pr-2">
                                <p className="text-sm font-black text-white leading-tight flex items-center gap-2">
                                    {displayName || 'Admin'} <ChevronDown size={14} className={`text-slate-500 transition-transform duration-500 ${showProfileDropdown ? 'rotate-180 text-[#656CFF]' : ''}`} />
                                </p>
                                <p className="text-[9px] font-black text-[#656CFF] uppercase tracking-widest mt-0.5 flex items-center gap-1.5 italic">
                                   <ShieldCheck size={10} /> Verified Admin
                                </p>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-6 w-72 bg-[#15171C] border border-[#23262D] rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-4 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
                                <div className="p-6 border-b border-white/5 mb-4 bg-gradient-to-br from-[#1c1f26] to-transparent rounded-[2rem] relative overflow-hidden group/profile">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#656CFF]/10 blur-[40px] rounded-full scale-0 group-hover/profile:scale-150 transition-transform duration-700" />
                                    <p className="text-[9px] font-black text-[#656CFF] uppercase tracking-[0.3em] mb-2 italic">Active Account</p>
                                    <p className="text-lg font-black text-white truncate leading-none">{displayName}</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <Zap size={10} className="text-[#FEBC2E]" /> Admin Level: 10
                                    </p>
                                </div>
                                <div className="space-y-1.5 px-1">
                                    <button className="w-full flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white rounded-2xl transition-all group/item">
                                        <div className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center group-hover/item:bg-[#656CFF]/10 group-hover/item:text-[#656CFF] transition-all shadow-inner">
                                            <User size={16} />
                                        </div>
                                        My Profile
                                    </button>
                                    <button className="w-full flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white rounded-2xl transition-all group/item">
                                        <div className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center group-hover/item:bg-[#656CFF]/10 group-hover/item:text-[#656CFF] transition-all shadow-inner">
                                            <Settings size={16} />
                                        </div>
                                        Admin Settings
                                    </button>
                                    <div className="h-px bg-white/5 my-3 mx-4" />
                                    <button 
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500/60 hover:bg-red-500 hover:text-white rounded-2xl transition-all group/logout shadow-xl hover:shadow-red-500/20 active:scale-95"
                                    >
                                        <div className="h-9 w-9 bg-red-500/10 rounded-xl flex items-center justify-center group-hover/logout:bg-white/10 group-hover/logout:text-white transition-all">
                                            <LogOut size={16} />
                                        </div>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;

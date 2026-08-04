import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import BottomNav from '../components/admin/BottomNav';
import { useAuth } from '../context/AuthContext';
import { X, Sliders, Layout, Sparkles, Sidebar as SidebarIcon, Check } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Core customizers state
    const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'dark');
    const [compact, setCompact] = useState(() => localStorage.getItem('admin-compact') === 'true');
    const [sidebarGlass, setSidebarGlass] = useState(() => localStorage.getItem('admin-sidebar-glass') !== 'false');
    const [glowsEnabled, setGlowsEnabled] = useState(() => localStorage.getItem('admin-glows-enabled') !== 'false');
    const [customizerOpen, setCustomizerOpen] = useState(false);

    // Apply Theme Class
    useEffect(() => {
        const themeClasses = ['admin-theme-light', 'admin-theme-cyberpunk', 'admin-theme-emerald', 'admin-theme-crimson'];
        themeClasses.forEach(c => document.documentElement.classList.remove(c));

        if (theme && theme !== 'dark') {
            document.documentElement.classList.add(`admin-theme-${theme}`);
        }

        localStorage.setItem('admin-theme', theme);

        return () => {
            themeClasses.forEach(c => document.documentElement.classList.remove(c));
        };
    }, [theme]);

    // Apply layout customizer classes
    useEffect(() => {
        if (compact) {
            document.documentElement.classList.add('admin-compact');
        } else {
            document.documentElement.classList.remove('admin-compact');
        }
        localStorage.setItem('admin-compact', compact);
    }, [compact]);

    useEffect(() => {
        if (sidebarGlass) {
            document.documentElement.classList.add('admin-sidebar-glass');
        } else {
            document.documentElement.classList.remove('admin-sidebar-glass');
        }
        localStorage.setItem('admin-sidebar-glass', sidebarGlass);
    }, [sidebarGlass]);

    useEffect(() => {
        if (glowsEnabled) {
            document.documentElement.classList.add('admin-glows-enabled');
        } else {
            document.documentElement.classList.remove('admin-glows-enabled');
        }
        localStorage.setItem('admin-glows-enabled', glowsEnabled);
    }, [glowsEnabled]);

    // Helper checking permissions and mapping routes to permissions
    const location = useLocation();
    
    if (!user || (user.role !== 'admin' && user.role !== 'sub_admin')) {
        return <Navigate to="/" replace />;
    }

    // List of page mappings
    // Students -> "Students"
    // Settings -> "Settings" (only super-admin can manage sub-admins or edit settings unless permitted)
    // Announcements -> "Announcements"
    // Class Recordings -> "Class Recordings"
    // Exams & Quizzes -> "Exams & Quizzes"
    // Past Papers -> "Past Papers"
    // Student Marks -> "Student Marks"
    // Exam Results -> "Exam Results"
    // Homepage Ads -> "Homepage Ads"
    // Hero Sliders -> "Hero Sliders"
    // Learning Hub -> "Learning Hub"
    if (user.role === 'sub_admin') {
        const permitted = (user.permissions || '').split(',').map(p => p.trim());
        const path = location.pathname;

        let requiredPermission = null;
        if (path.startsWith('/admin/students')) requiredPermission = "Students";
        else if (path.startsWith('/admin/settings')) requiredPermission = "Settings";
        else if (path.startsWith('/admin/announcements')) requiredPermission = "Announcements";
        else if (path.startsWith('/admin/recordings')) requiredPermission = "Class Recordings";
        else if (path.startsWith('/admin/quizzes')) requiredPermission = "Exams & Quizzes";
        else if (path.startsWith('/admin/papers')) requiredPermission = "Past Papers";
        else if (path.startsWith('/admin/marks')) requiredPermission = "Student Marks";
        else if (path.startsWith('/admin/results')) requiredPermission = "Exam Results";
        else if (path.startsWith('/admin/homepage')) requiredPermission = "Homepage Ads";
        else if (path.startsWith('/admin/sliders')) requiredPermission = "Hero Sliders";
        else if (path.startsWith('/admin/learning-hub')) requiredPermission = "Learning Hub";

        if (requiredPermission && !permitted.includes(requiredPermission)) {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    const themesList = [
        { id: 'dark', name: 'Modern Dark', bg: 'bg-[#0D0E12]', color: '#656CFF' },
        { id: 'light', name: 'Clean Light', bg: 'bg-[#F8FAFC]', color: '#3B82F6' },
        { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'bg-[#05050A]', color: '#FF007F' },
        { id: 'emerald', name: 'Emerald Forest', bg: 'bg-[#060D0B]', color: '#10B981' },
        { id: 'crimson', name: 'Crimson Ocean', bg: 'bg-[#0A0505]', color: '#EF4444' }
    ];

    return (
        <div className="flex h-screen bg-[#0D0E12] overflow-hidden font-sans text-white transition-all duration-300">

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onLogout={logout}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <Topbar
                    onToggleSidebar={() => setSidebarOpen(prev => !prev)}
                    displayName={user.full_name || user.email}
                    onLogout={logout}
                    theme={theme}
                    onSelectTheme={setTheme}
                    onToggleCustomizer={() => setCustomizerOpen(true)}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0D0E12] p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <Outlet context={{ theme, setTheme, compact, setCompact, sidebarGlass, setSidebarGlass, glowsEnabled, setGlowsEnabled }} />
                    </div>
                </main>
            </div>

            {/* Layout Configuration Drawer */}
            {customizerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setCustomizerOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div className="relative w-full max-w-md bg-[#15171C] border-l border-[#23262D] h-full shadow-2xl p-8 flex flex-col overflow-y-auto z-10 animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
                            <div className="flex items-center gap-3">
                                <Sliders className="text-[#656CFF]" size={22} />
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider text-white">Layout Settings</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Customize your admin workspace</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setCustomizerOpen(false)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Presets Grid */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                     <Sparkles size={12} className="text-[#656CFF]" /> Color Theme Presets
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {themesList.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-24 ${
                                                theme === t.id 
                                                    ? 'border-[#656CFF] bg-[#656CFF]/10 shadow-[0_0_15px_rgba(101,108,255,0.15)]' 
                                                    : 'border-[#23262D] bg-[#0D0E12] hover:border-white/15'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start w-full">
                                                <span 
                                                    className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center" 
                                                    style={{ backgroundColor: t.color }}
                                                >
                                                    {theme === t.id && <Check size={12} className="text-white font-black" />}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400">Preset</span>
                                            </div>
                                            <span className="text-xs font-black text-white uppercase tracking-tight mt-2">{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-white/5 my-4" />

                            {/* Controls */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                     <Layout size={12} className="text-[#656CFF]" /> Interface Toggles
                                </h4>

                                {/* Layout Compactness */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Compact Viewports</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Densely packed components & grids</p>
                                    </div>
                                    <button
                                        onClick={() => setCompact(!compact)}
                                        className={`h-7 w-12 rounded-full p-1 transition-all ${compact ? 'bg-[#656CFF]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`h-5 w-5 bg-white rounded-full transition-all ${compact ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Sidebar Glassmorphism */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Sidebar Blur</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Enable high-end glass backdrop blur</p>
                                    </div>
                                    <button
                                        onClick={() => setSidebarGlass(!sidebarGlass)}
                                        className={`h-7 w-12 rounded-full p-1 transition-all ${sidebarGlass ? 'bg-[#656CFF]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`h-5 w-5 bg-white rounded-full transition-all ${sidebarGlass ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Hover Glowing Borders */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Glowing Highlights</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Enable gradient glow-borders on cards</p>
                                    </div>
                                    <button
                                        onClick={() => setGlowsEnabled(!glowsEnabled)}
                                        className={`h-7 w-12 rounded-full p-1 transition-all ${glowsEnabled ? 'bg-[#656CFF]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`h-5 w-5 bg-white rounded-full transition-all ${glowsEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Reset */}
                        <div className="mt-auto pt-8 border-t border-white/5 text-center">
                            <button
                                onClick={() => {
                                    setTheme('dark');
                                    setCompact(false);
                                    setSidebarGlass(true);
                                    setGlowsEnabled(true);
                                }}
                                className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all"
                            >
                                Reset workspace defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom nav (mobile only) */}
            <BottomNav />
        </div>
    );
};

export default AdminLayout;

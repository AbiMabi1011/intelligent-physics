import React, { useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    Settings,
    X,
    LogOut,
    Megaphone,
    Video,
    Layers,
    Home
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const adminItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    const portalItems = [
        { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={20} /> },
        { name: 'Class Recordings', path: '/admin/recordings', icon: <Video size={20} /> },
        { name: 'Exams & Quizzes', path: '/admin/quizzes', icon: <BookOpen size={20} /> },
        { name: 'Past Papers', path: '/admin/papers', icon: <FileText size={20} /> },
        { name: 'Student Marks', path: '/admin/marks', icon: <ClipboardList size={20} /> },
        { name: 'Exam Results', path: '/admin/results', icon: <ClipboardList size={20} /> },
    ];

    const websiteItems = [
        { name: 'Homepage Ads', path: '/admin/homepage', icon: <Home size={20} /> },
        { name: 'Hero Sliders', path: '/admin/sliders', icon: <Layers size={20} /> },
        { name: 'Hub Overview', path: '/admin/learning-hub', icon: <LayoutDashboard size={20} /> },
    ];

    return (
        <>
            {/* ── Mobile Overlay ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ── Sidebar Drawer ── */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col w-64
                    bg-slate-900 text-white shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-64
                `}
            >
                {/* ── Brand Header ── */}
                <div className="flex h-16 items-center justify-between px-5 border-b border-slate-700/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 min-w-[2.25rem] flex items-center justify-center p-1 bg-white/10 rounded-xl">
                            <img src={logo} alt="IP Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-base font-bold tracking-wide whitespace-nowrap text-white">
                            Intelligent Physics
                        </span>
                    </div>
                    {/* Close button (mobile only) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 mt-4">

                    {/* Administration */}
                    <div>
                        <div className="px-2 mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Administration</p>
                        </div>
                        <div className="space-y-0.5">
                            {adminItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                    `}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Learning Hub Content */}
                    <div>
                        <div className="px-2 mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Learning Hub</p>
                        </div>
                        <div className="space-y-0.5">
                            {portalItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                    `}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Public Website */}
                    <div>
                        <div className="px-2 mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Public Website (Free Hub)</p>
                        </div>
                        <div className="space-y-0.5">
                            {websiteItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                    `}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* ── Logout ── */}
                <div className="border-t border-slate-700/60 p-4 shrink-0">
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-all"
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

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
    Home,
    Shield,
    Zap,
    Box,
    ChevronRight,
    Search,
    User,
    Activity
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const rawNavigationGroups = [
        {
            group: 'Overview & Main',
            items: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
            ]
        },
        {
            group: 'Home Page Management',
            items: [
                { name: 'Homepage Content Manager', path: '/admin/homepage', icon: <Home size={18} />, permission: 'Homepage Ads' },
                { name: 'Hero Sliders & Banners', path: '/admin/sliders', icon: <Layers size={18} />, permission: 'Hero Sliders' },
            ]
        },
        {
            group: 'Learning Hub Management',
            items: [
                { name: 'Student Portal LMS', path: '/admin/learning-hub', icon: <Box size={18} />, permission: 'Learning Hub' },
                { name: 'Announcements & Notices', path: '/admin/announcements', icon: <Megaphone size={18} />, permission: 'Announcements' },
                { name: 'Student Marks', path: '/admin/marks', icon: <ClipboardList size={18} />, permission: 'Student Marks' },
                { name: 'Exam Results', path: '/admin/results', icon: <Activity size={18} />, permission: 'Exam Results' },
            ]
        },
        {
            group: 'Knowledge Hub Management',
            items: [
                { name: 'Class Recordings', path: '/admin/recordings', icon: <Video size={18} />, permission: 'Class Recordings' },
                { name: 'Exams & Quizzes', path: '/admin/quizzes', icon: <BookOpen size={18} />, permission: 'Exams & Quizzes' },
                { name: 'Past Papers Vault', path: '/admin/papers', icon: <FileText size={18} />, permission: 'Past Papers' },
            ]
        },
        {
            group: 'Administration & Control',
            items: [
                { name: 'Student Directory', path: '/admin/students', icon: <Users size={18} />, permission: 'Students' },
                { name: 'System Settings', path: '/admin/settings', icon: <Settings size={18} />, permission: 'Settings' },
            ]
        }
    ];

    // Filter items based on sub-admin permissions
    const permitted = user?.permissions ? user.permissions.split(',').map(p => p.trim()) : [];
    const navigationGroups = rawNavigationGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            // Dashboard is always visible
            if (item.name === 'Dashboard') return true;
            if (user?.role === 'admin') return true;
            // Check if item permission matches user permissions
            return item.permission && permitted.includes(item.permission);
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);

    return (
        <>
            {/* ── Mobile Overlay ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ── Sidebar Drawer ── */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col w-80
                    bg-[#0D0E12] text-white border-r border-[#23262D] shadow-2xl
                    transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-80
                `}
            >
                {/* ── Brand Header ── */}
                <div className="flex h-24 items-center justify-between px-8 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#656CFF]/5 blur-[50px] rounded-full -translate-x-12 -translate-y-12" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-12 w-12 flex items-center justify-center p-2 bg-[#656CFF]/10 rounded-2xl border border-[#656CFF]/20 shadow-inner group transition-all">
                            <img src={logo} alt="IP Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-black tracking-[0.2em] leading-tight text-white">
                               INTELLIGENT
                           </span>
                           <span className="text-[14px] font-black tracking-[0.2em] leading-tight text-[#656CFF]">
                               PHYSICS
                           </span>
                           <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-1.5 italic">
                               <Shield size={8} /> ADMIN CONSOLE
                           </span>
                        </div>
                    </div>
                    {/* Close button (mobile only) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-slate-500 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar relative z-10">
                    {navigationGroups.map((group, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="px-4 flex items-center justify-between uppercase tracking-[0.3em] font-black text-[9px] text-slate-600 italic">
                                <span>{group.group}</span>
                                <div className="h-px bg-[#23262D] flex-1 ml-4 opacity-50" />
                            </div>
                            <div className="space-y-1.5">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                                            group flex items-center justify-between px-4 py-4 rounded-2xl
                                            font-black text-[11px] uppercase tracking-widest transition-all duration-300
                                            ${isActive 
                                                ? 'bg-[#656CFF] text-white shadow-2xl shadow-[#656CFF]/30 translate-x-1' 
                                                : 'text-slate-500 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-[#656CFF]'}`}>
                                                {item.icon}
                                            </span>
                                            {item.name}
                                        </div>
                                        {location.pathname === item.path && (
                                            <ChevronRight size={14} className="animate-in fade-in slide-in-from-left-2 duration-500" />
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* System Pulse Component */}
                    <div className="px-4 pt-10">
                        <div className="bg-[#15171C] border border-[#23262D] rounded-[2rem] p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#656CFF]/5 blur-[40px] rounded-full translate-x-8 translate-y-[-8px]" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">System Status</p>
                                    <p className="text-[11px] font-black text-white uppercase tracking-wider">Fast & Online</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-[#656CFF] to-blue-400 w-3/4 rounded-full shadow-[0_0_10px_#656CFF]" />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ── Profile Footer ── */}
                <div className="p-6 shrink-0 border-t border-[#23262D] bg-[#0D0E12] relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#656CFF] shadow-[0_0_20px_#656CFF]" />
                    
                    <div className="flex items-center justify-between p-4 bg-[#15171C] border border-[#23262D] rounded-2xl group transition-all hover:border-[#656CFF]/40">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 border border-[#656CFF]/20 flex items-center justify-center text-[#656CFF] font-black text-xs shadow-lg">
                                {user?.full_name?.charAt(0).toUpperCase() || <User size={18} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[120px]">
                                    {user?.full_name || 'Admin User'}
                                </span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-1.5">
                                    <span className="h-1 w-1 rounded-full bg-[#10B981] shadow-[0_0_5px_#10B981]" /> Online
                                </span>
                            </div>
                         </div>
                         <button
                             onClick={onLogout}
                             className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group-hover:scale-105 active:scale-95 shadow-xl"
                             title="Logout"
                         >
                             <LogOut size={16} />
                         </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

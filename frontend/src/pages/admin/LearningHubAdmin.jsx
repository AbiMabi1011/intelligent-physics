import React, { useState, useEffect } from 'react';
import { Megaphone, Video, FileText, Layers, ArrowRight, Activity, Box, Sparkles, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const LearningHubAdmin = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        announcements: 0,
        recordings: 0,
        papers: 0,
        sliders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [annRes, recRes, papRes, sliRes] = await Promise.all([
                    fetch(`${API_URL}/announcements`).catch(() => ({ ok: false })),
                    fetch(`${API_URL}/recordings`).catch(() => ({ ok: false })),
                    fetch(`${API_URL}/papers`).catch(() => ({ ok: false })),
                    fetch(`${API_URL}/sliders`).catch(() => ({ ok: false }))
                ]);

                const [ann, rec, pap, sli] = await Promise.all([
                    annRes.ok ? annRes.json() : [],
                    recRes.ok ? recRes.json() : [],
                    papRes.ok ? papRes.json() : [],
                    sliRes.ok ? sliRes.json() : []
                ]);

                setStats({
                    announcements: ann.length || 0,
                    recordings: rec.length || 0,
                    papers: pap.length || 0,
                    sliders: sli.length || 0
                });
            } catch (err) {
                console.error('Error fetching hub stats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const hubModules = [
        {
            title: 'Announcements',
            desc: 'Post important updates and news for all students',
            icon: <Megaphone size={32} />,
            count: stats.announcements,
            path: '/admin/announcements',
            color: '#FEBC2E',
            bg: 'bg-[#FEBC2E]/10 border-[#FEBC2E]/20 text-[#FEBC2E]'
        },
        {
            title: 'Class Recordings',
            desc: 'Upload and manage your class video recordings',
            icon: <Video size={32} />,
            count: stats.recordings,
            path: '/admin/recordings',
            color: '#656CFF',
            bg: 'bg-[#656CFF]/10 border-[#656CFF]/20 text-[#656CFF]'
        },
        {
            title: 'Study Materials',
            desc: 'Upload and share past papers and marking schemes',
            icon: <FileText size={32} />,
            count: stats.papers,
            path: '/admin/papers',
            color: '#10B981',
            bg: 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
        },
        {
            title: 'Home Sliders',
            desc: 'Manage the image banners on the student dashboard',
            icon: <Layers size={32} />,
            count: stats.sliders,
            path: '/admin/sliders',
            color: '#A855F7',
            bg: 'bg-[#A855F7]/10 border-[#A855F7]/20 text-[#A855F7]'
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-10">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <Box size={32} className="text-[#656CFF]" /> Learning Hub
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
                        Manage all your school content from one place
                    </p>
                </div>
                <div className="flex items-center gap-4 px-8 py-4 admin-card bg-transparent border-dashed">
                   <div className="h-10 w-10 bg-[#656CFF]/10 rounded-xl flex items-center justify-center text-[#656CFF]">
                        <Activity size={20} />
                   </div>
                   <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider">Running Fast</p>
                   </div>
                </div>
            </div>

            {/* Content Hub Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {hubModules.map((mod) => (
                    <div
                        key={mod.title}
                        onClick={() => navigate(mod.path)}
                        className={`cursor-pointer group relative flex flex-col justify-between rounded-[2.5rem] bg-[#15171C] p-10 border border-[#23262D] shadow-2xl hover:border-white/20 transition-all duration-500 hover:scale-[1.02] active:scale-95`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full translate-x-12 translate-y-[-12px] opacity-10 group-hover:opacity-30 transition-opacity" style={{ background: mod.color }} />
                        
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all shadow-lg group-hover:scale-110 duration-500 ${mod.bg}`}>
                                    {mod.icon}
                                </div>
                                {loading ? (
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 animate-pulse" />
                                ) : (
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white tracking-tighter leading-none">{mod.count}</div>
                                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Items</div>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 leading-tight tracking-tight group-hover:text-white transition-colors">{mod.title}</h3>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2">{mod.desc}</p>
                        </div>

                        <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/5">
                            <span className="text-[10px] font-black text-[#656CFF] uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500">Open Manager</span>
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 group-hover:bg-[#656CFF] group-hover:text-white transition-all shadow-xl">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Security Notice */}
            <div className="admin-card bg-transparent border-dashed p-10 mt-12 group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#656CFF]/5 blur-[100px] rounded-full translate-x-24 translate-y-[-24px]" />
                 
                 <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                     <div className="flex items-center gap-6">
                         <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] animate-pulse">
                             <Navigation size={32} />
                         </div>
                         <div>
                             <h4 className="text-lg font-black text-white uppercase tracking-tight">Need Help?</h4>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Access our documentation for full system support</p>
                         </div>
                     </div>
                     <button className="h-14 px-10 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#656CFF] transition-all shadow-xl active:scale-95 flex items-center gap-3">
                         View Manual <Sparkles size={16} />
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default LearningHubAdmin;

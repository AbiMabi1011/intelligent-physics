import React, { useState, useEffect } from 'react';
import { Megaphone, Video, FileText, Layers, ArrowRight } from 'lucide-react';
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
            desc: 'Manage global and batch-specific notices',
            icon: <Megaphone size={28} className="text-orange-500" />,
            count: stats.announcements,
            path: '/admin/announcements',
            bg: 'bg-orange-50',
            border: 'border-orange-100'
        },
        {
            title: 'Class Recordings',
            desc: 'Upload and manage video lessons',
            icon: <Video size={28} className="text-blue-500" />,
            count: stats.recordings,
            path: '/admin/recordings',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            title: 'Past Papers',
            desc: 'Manage study materials and marking schemes',
            icon: <FileText size={28} className="text-green-500" />,
            count: stats.papers,
            path: '/admin/papers',
            bg: 'bg-green-50',
            border: 'border-green-100'
        },
        {
            title: 'Hero Sliders',
            desc: 'Configure homepage sliding banners',
            icon: <Layers size={28} className="text-purple-500" />,
            count: stats.sliders,
            path: '/admin/sliders',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Content Overview</h1>
                <p className="text-gray-500 mt-1">Centralised view of portal materials and public resources.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {hubModules.map((mod) => (
                    <div
                        key={mod.title}
                        onClick={() => navigate(mod.path)}
                        className={`cursor-pointer group flex flex-col justify-between rounded-2xl bg-white p-6 border ${mod.border} shadow-sm hover:shadow-md transition-all`}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${mod.bg}`}>
                                    {mod.icon}
                                </div>
                                {loading ? (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                                ) : (
                                    <span className="text-2xl font-bold text-slate-700">{mod.count}</span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{mod.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{mod.desc}</p>
                        </div>
                        <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
                            Manage module <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mt-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 mb-1">How is content distributed?</h3>
                        <p className="text-indigo-800/80 text-sm leading-relaxed max-w-3xl">
                            All resources managed through these panels are distributed securely. <strong>"Learning Hub"</strong> content (like Quizzes, Marks, and targeted Announcements) is strictly locked behind user authentication and batch permissions. A subset of this content (like free videos and general announcements) automatically syncs to the public <strong>"Knowledge Center"</strong> and Homepage for prospective students.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default LearningHubAdmin;

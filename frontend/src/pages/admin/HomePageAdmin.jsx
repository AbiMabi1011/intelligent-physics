import React, { useState, useEffect, useRef } from 'react';
import {
    Home, Plus, Trash2, Edit2, X, Loader2,
    ToggleLeft, ToggleRight, Eye, EyeOff, Upload, Image,
    Layout, Megaphone, Save, BarChart3, GripVertical, Sparkles, Navigation, CheckCircle, User, MessageSquare, HelpCircle, Layers
} from 'lucide-react';
import { API_URL } from '../../config';

// ─── Constants ───

const ACCENT_PRESETS = [
    { label: 'Indigo', value: '#6366f1', grad: 'linear-gradient(145deg,#0f0b2e,#1a116b)' },
    { label: 'Blue', value: '#3b82f6', grad: 'linear-gradient(145deg,#0a1a2e,#0d2b55)' },
    { label: 'Violet', value: '#8b5cf6', grad: 'linear-gradient(145deg,#0e0720,#1a0f3a)' },
    { label: 'Cyan', value: '#06b6d4', grad: 'linear-gradient(145deg,#051420,#071f38)' },
    { label: 'Green', value: '#10b981', grad: 'linear-gradient(145deg,#061a14,#0a2e20)' },
    { label: 'Rose', value: '#f43f5e', grad: 'linear-gradient(145deg,#1a060c,#2e0d18)' },
];

const CARDS_COLOR_PRESETS = [
    { label: 'Blue Tint', value: 'border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5' },
    { label: 'Indigo Tint', value: 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:shadow-indigo-500/5' },
    { label: 'Cyan Tint', value: 'border-cyan-200 bg-cyan-50/20 hover:border-cyan-400 hover:shadow-cyan-500/5' },
    { label: 'Rose Tint', value: 'border-rose-200 bg-rose-50/20 hover:border-rose-400 hover:shadow-rose-500/5' },
    { label: 'Purple Tint', value: 'border-purple-200 bg-purple-50/20 hover:border-purple-400 hover:shadow-purple-500/5' },
    { label: 'Amber Tint', value: 'border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:shadow-amber-500/5' },
    { label: 'Emerald Tint', value: 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400 hover:shadow-emerald-500/5' },
    { label: 'Teal Tint', value: 'border-teal-200 bg-teal-50/20 hover:border-teal-400 hover:shadow-teal-500/5' },
    { label: 'Orange Tint', value: 'border-orange-200 bg-orange-50/20 hover:border-orange-400 hover:shadow-orange-500/5' },
    { label: 'Sky Tint', value: 'border-sky-200 bg-sky-50/20 hover:border-sky-400 hover:shadow-sky-500/5' },
    { label: 'Violet Tint', value: 'border-violet-200 bg-violet-50/20 hover:border-violet-400 hover:shadow-violet-500/5' },
];

const EMPTY_AD_FORM = {
    badge: '', title: '', description: '', cta_text: '', cta_link: '', image_url: '',
    position: 'left', accent: '#6366f1', gradient: 'linear-gradient(145deg,#0f0b2e,#1a116b)',
    is_active: true, order_index: 0,
};

const EMPTY_STAT_FORM = {
    value: '', label: '', icon: '',
    color: '#656CFF', bg: 'rgba(101,108,255,.12)',
    is_active: true, order_index: 0,
};

const EMPTY_TEACHER_FORM = {
    name: '', title: 'Lead Lecturer', credentials: '', bio_text: '', image_url: '', mediums: 'Tamil and English Medium class'
};

const EMPTY_SYLLABUS_FORM = {
    topic: '', icon: '', desc: '', subtopics_input: '', color: 'border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5', order_index: 0
};

const EMPTY_FEATURE_FORM = {
    icon: '', title: '', desc: '', color: 'border-blue-200 bg-blue-50/30 hover:border-blue-400', order_index: 0
};

const EMPTY_BATCH_FORM = {
    name: '', status: 'Enrolling Now', seats_left: '', schedule: '', description: '', features_input: '', color: 'border-blue-200 bg-blue-50/10 hover:border-blue-400', enroll_link: '/login', order_index: 0
};

const EMPTY_TESTIMONIAL_FORM = {
    quote: '', name: '', result: '', stars: 5, order_index: 0
};

const EMPTY_FAQ_FORM = {
    question: '', answer: '', order_index: 0
};

// ─── Main Component ───
export default function HomePageAdmin() {
    const [tab, setTab] = useState('ads'); // ads, stats, teacher, syllabus, features, batches, testimonials, faqs

    const TABS_LIST = [
        { id: 'ads', label: 'Promotions', icon: <Megaphone size={16} /> },
        { id: 'stats', label: 'Statistics', icon: <BarChart3 size={16} /> },
        { id: 'teacher', label: 'Teacher Bio', icon: <User size={16} /> },
        { id: 'syllabus', label: 'Syllabus', icon: <Layers size={16} /> },
        { id: 'features', label: 'LMS Features', icon: <Sparkles size={16} /> },
        { id: 'batches', label: 'Batches', icon: <Navigation size={16} /> },
        { id: 'testimonials', label: 'Reviews', icon: <MessageSquare size={16} /> },
        { id: 'faqs', label: 'FAQs', icon: <HelpCircle size={16} /> },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <Home size={32} className="text-[#656CFF]" /> Landing Page Manager
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
                        Manage all custom content blocks displayed on the website homepage
                    </p>
                </div>
            </div>

            {/* Tabs List */}
            <div className="flex flex-wrap items-center gap-2 bg-[#15171C] border border-[#23262D] p-2 rounded-2xl w-full">
                {TABS_LIST.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-[#656CFF] text-white shadow-xl shadow-[#656CFF]/20' : 'text-slate-500 hover:text-white hover:bg-white/5'} `}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                {tab === 'ads' && <AdsManager />}
                {tab === 'stats' && <StatsManager />}
                {tab === 'teacher' && <TeacherProfileManager />}
                {tab === 'syllabus' && <SyllabusManager />}
                {tab === 'features' && <FeaturesGridManager />}
                {tab === 'batches' && <BatchesListManager />}
                {tab === 'testimonials' && <TestimonialsListManager />}
                {tab === 'faqs' && <FaqsListManager />}
            </div>
        </div>
    );
}

// ─── Stats Manager ───
function StatsManager() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_STAT_FORM);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/home-stats`);
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_STAT_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (s) => { setForm({ ...EMPTY_STAT_FORM, ...s }); setEditId(s.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_STAT_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.value.trim() || !form.label.trim()) return alert('Value and Label required');
        setIsSaving(true);
        try {
            const url = editId ? `${API_URL}/home-stats/${editId}` : `${API_URL}/home-stats`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, order_index: Number(form.order_index) }),
            });
            if (res.ok) { closeModal(); fetchStats(); }
            else alert('Failed to save');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this statistic from the website?')) return;
        await fetch(`${API_URL}/home-stats/${id}`, { method: 'DELETE' });
        fetchStats();
    };

    const toggleActive = async (s) => {
        await fetch(`${API_URL}/home-stats/${s.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...s, is_active: !s.is_active }),
        });
        fetchStats();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner shadow-[#656CFF]/5">
                        <BarChart3 size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Public Statistics</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Display your success numbers on the home page</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add New Stat
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Stats...</span>
                </div>
            ) : stats.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <BarChart3 className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No statistics found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.sort((a,b) => a.order_index - b.order_index).map((s) => (
                        <div key={s.id} className="admin-card group p-6 flex flex-col justify-between hover:border-[#656CFF]/40 transition-all bg-[#15171C]">
                            <div className="flex items-start justify-between mb-8">
                                <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] group-hover:scale-110 transition-transform shadow-xl">
                                    <span className="text-3xl">{s.icon || '📊'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleActive(s)} className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${s.is_active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-700/10 text-slate-500'}`}>
                                        {s.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => openEdit(s)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black text-white italic tracking-tighter">{s.value}</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 italic">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-xl rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 translate-y-[-12px]" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Statistic</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">Landing page numerical value</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Value</label>
                                    <input
                                        type="text" placeholder="e.g. 1,200+"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Icon Emoji</label>
                                    <input
                                        type="text" placeholder="e.g. 🎓"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 text-center"
                                        value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Sort Order</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Statistic Label</label>
                                <input
                                    type="text" placeholder="e.g. ACTIVE STUDENTS"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.label} onChange={e => setForm({...form, label: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-14 bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save Statistic'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Ads Manager ───
function AdsManager() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_AD_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileRef = useRef(null);

    useEffect(() => { fetchAds(); }, []);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/home-ads`);
            if (res.ok) setAds(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setImageFile(f);
        setImagePreview(URL.createObjectURL(f));
    };

    const openCreate = () => { setForm(EMPTY_AD_FORM); setEditId(null); setImagePreview(''); setImageFile(null); setShowModal(true); };
    const openEdit = (a) => { setForm({ ...EMPTY_AD_FORM, ...a }); setEditId(a.id); setImagePreview(a.image_url); setImageFile(null); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_AD_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return alert('Title and Description are required');
        setIsSaving(true);
        try {
            let imageUrl = form.image_url;
            if (imageFile) {
                const fd = new FormData();
                fd.append('file', imageFile);
                const r = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd });
                if (r.ok) {
                    const d = await r.json();
                    imageUrl = d.file_url || d.url;
                }
            }

            const url = editId ? `${API_URL}/home-ads/${editId}` : `${API_URL}/home-ads`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, image_url: imageUrl }),
            });
            if (res.ok) { closeModal(); fetchAds(); }
            else alert('Failed to save');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this promotion from the website?')) return;
        await fetch(`${API_URL}/home-ads/${id}`, { method: 'DELETE' });
        fetchAds();
    };

    const toggleActive = async (a) => {
        await fetch(`${API_URL}/home-ads/${a.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...a, is_active: !a.is_active }),
        });
        fetchAds();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#FEBC2E]/10 flex items-center justify-center text-[#FEBC2E] shadow-inner shadow-[#FEBC2E]/5">
                        <Megaphone size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Website Promotions</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage the promotional banners on your website</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add Promotion
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Promotions...</span>
                </div>
            ) : ads.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <Megaphone className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No promotions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {ads.sort((a,b) => a.order_index - b.order_index).map((a) => (
                        <div key={a.id} className="admin-card group p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-[#656CFF]/40 transition-all bg-[#15171C]">
                            <div className="h-24 w-40 rounded-2xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0 relative">
                                {a.image_url ? (
                                    <img src={`${API_URL}${a.image_url}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={a.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900 font-bold text-xs uppercase">No Image</div>
                                )}
                                {!a.is_active && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"><EyeOff size={24} className="text-white/40" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[9px] font-black text-[#656CFF] uppercase tracking-[0.3em]">{a.badge || 'PROMOTION'}</span>
                                    <span className={`h-2 w-2 rounded-full ${a.is_active ? 'bg-[#10B981]' : 'bg-slate-700'}`} />
                                </div>
                                <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight truncate group-hover:text-[#656CFF] transition-colors">{a.title}</h4>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 truncate">{a.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleActive(a)} className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${a.is_active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-700/10 text-slate-500'}`}>
                                    {a.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => openEdit(a)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(a.id)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-4xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/10 blur-[80px] rounded-full -translate-y-12 translate-x-12" />
                        
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Promotion</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">New website display content</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 italic">General Information</label>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <input
                                                type="text" placeholder="Badge Text (e.g. HOT)"
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                                value={form.badge} onChange={e => setForm({...form, badge: e.target.value})}
                                            />
                                            <input
                                                type="number" placeholder="Order Index"
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                                value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                            />
                                        </div>
                                        <input
                                            type="text" placeholder="Promotion Title"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 mb-4"
                                            value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                                        />
                                        <textarea
                                            placeholder="Description Text"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-28 resize-none"
                                            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="CTA Button Text"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                            value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})}
                                        />
                                        <input
                                            type="text" placeholder="Link URL"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                            value={form.cta_link} onChange={e => setForm({...form, cta_link: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 italic">Promotional Image</label>
                                        <div onClick={() => fileRef.current.click()} className={`group relative h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-white/[0.01] ${imagePreview ? 'border-[#10B981]' : 'border-[#23262D] hover:border-[#656CFF]/50'}`}>
                                            {imagePreview ? (
                                                <img src={imagePreview.startsWith('/') ? `${API_URL}${imagePreview}` : imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-110 transition-all duration-700" alt="Preview" />
                                            ) : (
                                                <>
                                                    <Image size={32} className="text-slate-750 mb-2" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select Visual</span>
                                                </>
                                            )}
                                            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Text Alignment</label>
                                            <div className="flex bg-[#0D0E12] p-1.5 rounded-xl border border-[#23262D]">
                                                {['left', 'right'].map(pos => (
                                                    <button key={pos} type="button" onClick={() => setForm({...form, position: pos})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${form.position === pos ? 'bg-[#656CFF] text-white' : 'text-slate-500 hover:text-white'}`}>{pos}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Accent Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {ACCENT_PRESETS.map(p => (
                                                    <button key={p.value} type="button" onClick={() => setForm({...form, accent: p.value, gradient: p.grad})} className={`w-8 h-8 rounded-lg border-2 transition-all ${form.accent === p.value ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: p.value }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-16 bg-[#656CFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                {isSaving ? 'Saving...' : 'Save Promotion'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Teacher Profile Manager ───
function TeacherProfileManager() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_TEACHER_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileRef = useRef(null);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/teacher-profile`);
            if (res.ok) {
                const data = await res.json();
                setForm(data);
                setImagePreview(data.image_url);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setImageFile(f);
        setImagePreview(URL.createObjectURL(f));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.credentials.trim() || !form.bio_text.trim()) return alert('Name, Credentials, and Bio are required');
        setIsSaving(true);
        try {
            let imageUrl = form.image_url;
            if (imageFile) {
                const fd = new FormData();
                fd.append('file', imageFile);
                const r = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd });
                if (r.ok) {
                    const d = await r.json();
                    imageUrl = d.file_url || d.url;
                }
            }

            const res = await fetch(`${API_URL}/teacher-profile`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, image_url: imageUrl }),
            });
            if (res.ok) {
                alert('Teacher profile updated successfully!');
                fetchProfile();
            } else alert('Failed to save profile');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Teacher Profile...</span>
            </div>
        );
    }

    return (
        <div className="admin-card p-10 bg-[#15171C] max-w-4xl mx-auto rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
            <div className="flex gap-4 items-center mb-8 border-b border-[#23262D] pb-6 relative z-10">
                <User size={24} className="text-[#656CFF]" />
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Lecturer Bio Details</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configure lecturer profile intro displayed in the hero section</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left photo box */}
                    <div className="md:col-span-1 space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Lecturer Photo</label>
                        <div onClick={() => fileRef.current.click()} className="group relative h-60 w-full rounded-[2rem] border-2 border-dashed border-[#23262D] hover:border-[#656CFF]/50 transition-all flex flex-col items-center justify-center overflow-hidden bg-white/[0.01] cursor-pointer">
                            {imagePreview ? (
                                <img src={imagePreview.startsWith('/') ? `${API_URL}${imagePreview}` : imagePreview} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Teacher" />
                            ) : (
                                <>
                                    <User size={40} className="text-slate-700 mb-2" />
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Select Portrait</span>
                                </>
                            )}
                            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
                        </div>
                    </div>

                    {/* Right form fields */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Full Name</label>
                                <input
                                    type="text" placeholder="e.g. Mr. R. Raakulan"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Lecturer Title</label>
                                <input
                                    type="text" placeholder="e.g. Lead Lecturer"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Qualifications</label>
                                <input
                                    type="text" placeholder="e.g. B.Sc. Physics - University of Jaffna"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.credentials} onChange={e => setForm({...form, credentials: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Teaching Mediums</label>
                                <input
                                    type="text" placeholder="e.g. Tamil and English Medium class"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.mediums} onChange={e => setForm({...form, mediums: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Executive Bio Paragraph</label>
                            <textarea
                                placeholder="Lecturer bio description paragraph..."
                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-28 resize-none"
                                value={form.bio_text} onChange={e => setForm({...form, bio_text: e.target.value})}
                            />
                        </div>
                    </div>

                </div>

                <button
                    type="submit" disabled={isSaving}
                    className="w-full h-16 bg-[#656CFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    {isSaving ? 'Saving Bio Details...' : 'Save Bio Details'}
                </button>
            </form>
        </div>
    );
}

// ─── Syllabus Manager ───
function SyllabusManager() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_SYLLABUS_FORM);

    useEffect(() => { fetchUnits(); }, []);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/syllabus-units`);
            if (res.ok) setUnits(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_SYLLABUS_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (u) => {
        let subtopicsInput = '';
        try {
            const parsed = JSON.parse(u.subtopics_json);
            if (Array.isArray(parsed)) subtopicsInput = parsed.join(', ');
        } catch { subtopicsInput = u.subtopics_json || ''; }
        setForm({ ...EMPTY_SYLLABUS_FORM, ...u, subtopics_input: subtopicsInput });
        setEditId(u.id);
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_SYLLABUS_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.topic.trim() || !form.desc.trim()) return alert('Topic and Description required');
        setIsSaving(true);
        
        // Process subtopics to JSON list
        const subList = form.subtopics_input.split(',').map(s => s.trim()).filter(Boolean);
        const subtopicsJson = JSON.stringify(subList);

        try {
            const url = editId ? `${API_URL}/syllabus-units/${editId}` : `${API_URL}/syllabus-units`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: form.topic,
                    icon: form.icon,
                    desc: form.desc,
                    subtopics_json: subtopicsJson,
                    color: form.color,
                    order_index: Number(form.order_index)
                }),
            });
            if (res.ok) { closeModal(); fetchUnits(); }
            else alert('Failed to save');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this syllabus unit from the website?')) return;
        await fetch(`${API_URL}/syllabus-units/${id}`, { method: 'DELETE' });
        fetchUnits();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner shadow-[#656CFF]/5">
                        <Layers size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Syllabus Curriculum Units</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure G.C.E. Advanced Level Physics units and subtopic checklists</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add Syllabus Topic
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Syllabus...</span>
                </div>
            ) : units.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <Layers className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No syllabus units found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {units.sort((a,b) => a.order_index - b.order_index).map((u) => {
                        let parsedSubs = [];
                        try { parsedSubs = JSON.parse(u.subtopics_json); } catch { parsedSubs = []; }
                        return (
                            <div key={u.id} className="admin-card group p-6 flex flex-col justify-between hover:border-[#656CFF]/40 transition-all bg-[#15171C]">
                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-md">
                                            {u.icon || '📏'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(u)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{u.topic}</h4>
                                    <p className="text-xs text-slate-400 mt-2 line-clamp-3">{u.desc}</p>
                                    
                                    {parsedSubs.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[#23262D]">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Subtopics Breakdown:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {parsedSubs.slice(0, 3).map((sub, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-semibold text-slate-400 rounded-md truncate max-w-[100px]">{sub}</span>
                                                ))}
                                                {parsedSubs.length > 3 && (
                                                    <span className="px-2 py-1 bg-[#656CFF]/10 text-[9px] font-bold text-[#656CFF] rounded-md">+{parsedSubs.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                    Topic Order Index: {u.order_index}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-2xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Syllabus Topic</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">Add national syllabus topic segments</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Topic Title</label>
                                    <input
                                        type="text" placeholder="e.g. Mechanics"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Icon Emoji</label>
                                    <input
                                        type="text" placeholder="e.g. ⚙️"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 text-center"
                                        value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Sort Order</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Theme Color Style (Preset Select)</label>
                                <select
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-slate-400 focus:border-[#656CFF]/50 outline-none"
                                    value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                                >
                                    {CARDS_COLOR_PRESETS.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Topic Overview Description</label>
                                <input
                                    type="text" placeholder="Brief outline summarizing the unit..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.desc} onChange={e => setForm({...form, desc: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Subtopics Breakdown List (Comma Separated)</label>
                                <textarea
                                    placeholder="e.g. Kinematics, Newton's Laws, Momentum, Work & Power..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-24 resize-none"
                                    value={form.subtopics_input} onChange={e => setForm({...form, subtopics_input: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-14 bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving Topic...' : 'Save Syllabus Topic'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Features Grid Manager ───
function FeaturesGridManager() {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FEATURE_FORM);

    useEffect(() => { fetchFeatures(); }, []);

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/lms-features`);
            if (res.ok) setFeatures(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_FEATURE_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (f) => { setForm({ ...EMPTY_FEATURE_FORM, ...f }); setEditId(f.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_FEATURE_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.desc.trim()) return alert('Title and Description are required');
        setIsSaving(true);
        try {
            const url = editId ? `${API_URL}/lms-features/${editId}` : `${API_URL}/lms-features`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, order_index: Number(form.order_index) }),
            });
            if (res.ok) { closeModal(); fetchFeatures(); }
            else alert('Failed to save feature');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feature from the website?')) return;
        await fetch(`${API_URL}/lms-features/${id}`, { method: 'DELETE' });
        fetchFeatures();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner shadow-[#656CFF]/5">
                        <Sparkles size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">LMS Core Features</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure features list displaying actual platform functionalities</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add Feature Card
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Features...</span>
                </div>
            ) : features.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <Sparkles className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No features found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.sort((a,b) => a.order_index - b.order_index).map((f) => (
                        <div key={f.id} className="admin-card group p-6 flex flex-col justify-between hover:border-[#656CFF]/40 transition-all bg-[#15171C]">
                            <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-md">
                                        {f.icon || '📚'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(f)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(f.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{f.title}</h4>
                                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{f.desc}</p>
                            </div>
                            <div className="mt-6 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                Feature Order Index: {f.order_index}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-xl rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Feature</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">Add platform core functionality segment</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Feature Title</label>
                                    <input
                                        type="text" placeholder="e.g. Solved Past Papers Bank"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Sort Order</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Icon Emoji</label>
                                    <input
                                        type="text" placeholder="e.g. 🧩"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 text-center"
                                        value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Theme Preset</label>
                                    <select
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-slate-400 focus:border-[#656CFF]/50 outline-none"
                                        value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                                    >
                                        <option value="border-blue-200 bg-blue-50/30 hover:border-blue-400">Blue Card</option>
                                        <option value="border-indigo-200 bg-indigo-50/30 hover:border-indigo-400">Indigo Card</option>
                                        <option value="border-cyan-200 bg-cyan-50/30 hover:border-cyan-400">Cyan Card</option>
                                        <option value="border-rose-200 bg-rose-50/30 hover:border-rose-400">Rose Card</option>
                                        <option value="border-emerald-200 bg-emerald-50/30 hover:border-emerald-400">Emerald Card</option>
                                        <option value="border-amber-200 bg-amber-50/30 hover:border-amber-400">Amber Card</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Description Text</label>
                                <textarea
                                    placeholder="Outline summarizing the feature utility..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-24 resize-none"
                                    value={form.desc} onChange={e => setForm({...form, desc: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-14 bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving Feature...' : 'Save LMS Feature'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Batches List Manager ───
function BatchesListManager() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_BATCH_FORM);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/home-batches`);
            if (res.ok) setBatches(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_BATCH_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (b) => {
        let featsInput = '';
        try {
            const parsed = JSON.parse(b.features_json);
            if (Array.isArray(parsed)) featsInput = parsed.join(', ');
        } catch { featsInput = b.features_json || ''; }
        setForm({ ...EMPTY_BATCH_FORM, ...b, features_input: featsInput });
        setEditId(b.id);
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_BATCH_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.schedule.trim() || !form.description.trim()) return alert('Name, Schedule, and Description are required');
        setIsSaving(true);

        const featList = form.features_input.split(',').map(s => s.trim()).filter(Boolean);
        const featuresJson = JSON.stringify(featList);

        try {
            const url = editId ? `${API_URL}/home-batches/${editId}` : `${API_URL}/home-batches`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    status: form.status,
                    seats_left: form.seats_left,
                    schedule: form.schedule,
                    description: form.description,
                    features_json: featuresJson,
                    color: form.color,
                    enroll_link: form.enroll_link,
                    order_index: Number(form.order_index)
                }),
            });
            if (res.ok) { closeModal(); fetchBatches(); }
            else alert('Failed to save batch');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this batch card from the website?')) return;
        await fetch(`${API_URL}/home-batches/${id}`, { method: 'DELETE' });
        fetchBatches();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner shadow-[#656CFF]/5">
                        <Navigation size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Active Class Batches</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure active classroom batches, target years, schedules, and course inclusions</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add Target Batch
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Batches...</span>
                </div>
            ) : batches.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <Navigation className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No batches found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.sort((a,b) => a.order_index - b.order_index).map((b) => {
                        let parsedFeats = [];
                        try { parsedFeats = JSON.parse(b.features_json); } catch { parsedFeats = []; }
                        return (
                            <div key={b.id} className="admin-card group p-6 flex flex-col justify-between hover:border-[#656CFF]/40 transition-all bg-[#15171C]">
                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <span className="text-[10px] font-black text-[#656CFF] bg-[#656CFF]/15 border border-[#656CFF]/30 px-3 py-1.5 rounded-md uppercase tracking-wider">{b.status}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(b)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(b.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-[#656CFF] transition-colors">{b.name}</h4>
                                    <p className="text-[10px] text-amber-500 font-bold tracking-wider mt-1">{b.seats_left}</p>
                                    <p className="text-xs text-slate-400 font-mono font-bold mt-2">📅 {b.schedule}</p>
                                    <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">{b.description}</p>
                                    
                                    {parsedFeats.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[#23262D] space-y-2">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Inclusions Check-list:</span>
                                            <ul className="space-y-1">
                                                {parsedFeats.map((feat, idx) => (
                                                    <li key={idx} className="text-[10px] text-slate-400 flex items-center gap-2">
                                                        <span className="text-emerald-500">✓</span> {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                    Sort Order Index: {b.order_index}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-2xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Class Batch</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">Add homepage promotional batch information</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Batch Name</label>
                                    <input
                                        type="text" placeholder="e.g. A/L 2026 Theory"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Status Tag</label>
                                    <input
                                        type="text" placeholder="e.g. Enrolling Now / Fast Filling"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Seats Left Label</label>
                                    <input
                                        type="text" placeholder="e.g. 14 seats remaining"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.seats_left} onChange={e => setForm({...form, seats_left: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Order Index</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Theme Style</label>
                                    <select
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-4 py-4 text-sm font-bold text-slate-400 focus:border-[#656CFF]/50 outline-none"
                                        value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                                    >
                                        <option value="border-blue-200 bg-blue-50/10 hover:border-blue-400">Blue Card</option>
                                        <option value="border-indigo-200 bg-indigo-50/10 hover:border-indigo-400">Indigo Card</option>
                                        <option value="border-teal-200 bg-teal-50/10 hover:border-teal-400">Teal Card</option>
                                        <option value="border-rose-200 bg-rose-50/10 hover:border-rose-400">Rose Card</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Schedule Details</label>
                                    <input
                                        type="text" placeholder="e.g. Thursdays · 4:00 PM - 7:00 PM"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Enroll CTA Path</label>
                                    <input
                                        type="text" placeholder="e.g. /login or external link"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.enroll_link} onChange={e => setForm({...form, enroll_link: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Syllabus Overview</label>
                                <input
                                    type="text" placeholder="Overview text describing the batch focus..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                    value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Course Inclusion Items (Comma Separated)</label>
                                <textarea
                                    placeholder="e.g. Weekly adaptive assessments, Hardcopy study packs, Personal tutor support..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-20 resize-none"
                                    value={form.features_input} onChange={e => setForm({...form, features_input: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-14 bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving Batch...' : 'Save Class Batch'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Testimonials List Manager ───
function TestimonialsListManager() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_TESTIMONIAL_FORM);

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/home-testimonials`);
            if (res.ok) setReviews(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_TESTIMONIAL_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (r) => { setForm({ ...EMPTY_TESTIMONIAL_FORM, ...r }); setEditId(r.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_TESTIMONIAL_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.quote.trim() || !form.name.trim() || !form.result.trim()) return alert('Quote, Name, and Result required');
        setIsSaving(true);
        try {
            const url = editId ? `${API_URL}/home-testimonials/${editId}` : `${API_URL}/home-testimonials`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, stars: Number(form.stars), order_index: Number(form.order_index) }),
            });
            if (res.ok) { closeModal(); fetchReviews(); }
            else alert('Failed to save review');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this testimonial review from the website?')) return;
        await fetch(`${API_URL}/home-testimonials/${id}`, { method: 'DELETE' });
        fetchReviews();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner shadow-[#656CFF]/5">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Student Success Stories</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure student feedback, quotes, results, and district/island ranks</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add Testimonial
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Reviews...</span>
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <CheckCircle className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No reviews found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.sort((a,b) => a.order_index - b.order_index).map((r) => (
                        <div key={r.id} className="admin-card group p-6 flex flex-col justify-between hover:border-[#656CFF]/40 transition-all bg-[#15171C]">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-amber-500 text-lg">{'★'.repeat(r.stars || 5)}</div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(r)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(r.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed italic">"{r.quote}"</p>
                                <h5 className="font-extrabold text-white text-sm mt-4">{r.name}</h5>
                                <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">{r.result}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#23262D] text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                Review Index: {r.order_index}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-xl rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Testimonial</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">Add homepage success review item</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Student Name</label>
                                    <input
                                        type="text" placeholder="e.g. Sanduni Perera"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Academic Result / Rank</label>
                                    <input
                                        type="text" placeholder="e.g. Island Rank 12 - A/L Physics"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.result} onChange={e => setForm({...form, result: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Star Rating (1-5)</label>
                                    <input
                                        type="number" min="1" max="5"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.stars} onChange={e => setForm({...form, stars: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Sort Index</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Success Quote Quote</label>
                                <textarea
                                    placeholder="Enter student review paragraph text..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-24 resize-none"
                                    value={form.quote} onChange={e => setForm({...form, quote: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-14 bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving Review...' : 'Save Student Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Faqs List Manager ───
function FaqsListManager() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FAQ_FORM);

    useEffect(() => { fetchFaqs(); }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/home-faqs`);
            if (res.ok) setFaqs(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_FAQ_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (f) => { setForm({ ...EMPTY_FAQ_FORM, ...f }); setEditId(f.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_FAQ_FORM); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.question.trim() || !form.answer.trim()) return alert('Question and Answer required');
        setIsSaving(true);
        try {
            const url = editId ? `${API_URL}/home-faqs/${editId}` : `${API_URL}/home-faqs`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, order_index: Number(form.order_index) }),
            });
            if (res.ok) { closeModal(); fetchFaqs(); }
            else alert('Failed to save FAQ');
        } catch (e) { console.error(e); alert('Connection Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this FAQ from the website?')) return;
        await fetch(`${API_URL}/home-faqs/${id}`, { method: 'DELETE' });
        fetchFaqs();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 admin-card bg-transparent border-dashed">
                <div className="flex gap-6 items-center flex-1">
                    <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner shadow-[#656CFF]/5">
                        <HelpCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Website FAQs</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure accordion FAQ questions and answers displayed on the landing page</p>
                    </div>
                </div>
                <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/20 hover:bg-[#545bd9] transition-all active:scale-95">
                    <Plus size={20} /> Add FAQ Item
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading FAQs...</span>
                </div>
            ) : faqs.length === 0 ? (
                <div className="py-32 text-center admin-card">
                    <HelpCircle className="mx-auto text-slate-800 mb-6 opacity-20" size={64} />
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No FAQs found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {faqs.sort((a,b) => a.order_index - b.order_index).map((f) => (
                        <div key={f.id} className="admin-card p-6 bg-[#15171C] flex items-center justify-between gap-6 hover:border-[#656CFF]/30 transition-all">
                            <div className="flex-1 min-w-0">
                                <h5 className="font-extrabold text-white text-sm uppercase tracking-wider">{f.question}</h5>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.answer}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => openEdit(f)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(f.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-xl rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editId ? 'Edit' : 'Add'} <span className="text-[#656CFF]">FAQ</span></h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic text-wrap">Add homepage accordion FAQ item</p>
                            </div>
                            <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">FAQ Question</label>
                                    <input
                                        type="text" placeholder="e.g. Can I watch missed sessions?"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800"
                                        value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Sort Index</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none"
                                        value={form.order_index} onChange={e => setForm({...form, order_index: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">FAQ Answer</label>
                                <textarea
                                    placeholder="Enter descriptive answer text..."
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none placeholder:text-slate-800 h-32 resize-none"
                                    value={form.answer} onChange={e => setForm({...form, answer: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit" disabled={isSaving}
                                className="w-full h-14 bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving FAQ...' : 'Save FAQ Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

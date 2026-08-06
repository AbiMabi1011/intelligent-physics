import React, { useState, useEffect } from 'react';
import {
    Video, Plus, Trash2, Search, X, Link,
    Calendar, Users, Play, Loader2, Database, Shield, Globe, Layers, Sparkles
} from 'lucide-react';
import { API_URL } from '../../config';

const RecordingsPage = () => {
    const [recordings, setRecordings] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        video_url: '',
        selectedBatches: [],
        visibility: 'both'
    });

    useEffect(() => {
        fetchRecordings();
        fetchBatches();
    }, []);

    const fetchRecordings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/recordings`);
            if (res.ok) setRecordings(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) { console.error(err); }
    };

    const resetModal = () => {
        setShowModal(false);
        setForm({ title: '', video_url: '', selectedBatches: [], visibility: 'both' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return alert('Title is required');
        if (!form.video_url.trim()) return alert('Video URL is required');
        if (form.selectedBatches.length === 0) return alert('Please select at least one batch');

        setIsSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: null,
                video_url: form.video_url.trim(),
                class_name: form.selectedBatches.join(', '),
                subject: 'Physics',
                recorded_at: new Date().toISOString(),
                visibility: form.visibility
            };
            const res = await fetch(`${API_URL}/recordings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                resetModal();
                fetchRecordings();
            } else {
                alert('Failed to save recording');
            }
        } catch (err) {
            console.error(err);
            alert('Server connection error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this recording permanently?')) return;
        await fetch(`${API_URL}/recordings/${id}`, { method: 'DELETE' });
        fetchRecordings();
    };

    const filtered = recordings.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <Video size={32} className="text-[#656CFF]" /> Class Recordings
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
                        Manage and organize your class video recordings
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 bg-[#656CFF] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus size={20} /> Add New Recording
                </button>
            </div>

            {/* Tactical Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 relative group">
                    <div className="absolute inset-0 bg-[#656CFF]/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#656CFF] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title or batch..."
                        className="w-full bg-[#15171C] border border-[#23262D] rounded-[2rem] pl-16 pr-8 py-5 text-sm font-black text-white placeholder:text-slate-600 focus:ring-4 focus:ring-[#656CFF]/10 focus:border-[#656CFF]/50 transition-all outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="lg:col-span-4 flex items-center gap-4 px-8 admin-card bg-transparent border-dashed">
                   <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Database size={20} />
                   </div>
                   <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storage Status</p>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{recordings.length} Total Videos</p>
                   </div>
                </div>
            </div>

            {/* Recordings Grid */}
            {loading ? (
                <div className="py-32 text-center">
                    <Loader2 size={48} className="animate-spin mx-auto text-[#656CFF] mb-6" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Loading Recordings...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-40 text-center admin-card bg-transparent border-dashed">
                    <Video size={64} className="mx-auto text-slate-800 mb-6" />
                    <p className="text-xl font-black text-white mb-2">No Recordings Found</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-loose">Keep track of your classes here.<br/>Add your first recording to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((rec) => (
                        <div key={rec.id} className="admin-card group hover:scale-[1.02] active:scale-95 transition-all p-6 bg-[#15171C] border-[#23262D] relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[60px] rounded-full translate-x-12 translate-y-[-12px]" />
                             
                             <div className="relative z-10">
                                 <div className="flex items-start justify-between mb-8">
                                     <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-inner group-hover:rotate-6 transition-transform">
                                         <Play size={24} fill="#656CFF" className="ml-1" />
                                     </div>
                                     <button 
                                        onClick={() => handleDelete(rec.id)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                        title="Delete Recording"
                                     >
                                         <Trash2 size={18} />
                                     </button>
                                 </div>
                                 
                                 <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3 truncate group-hover:text-[#656CFF] transition-colors">{rec.title}</h3>
                                 
                                 <div className="space-y-4 pt-4 border-t border-white/5">
                                     <div className="flex items-center gap-3">
                                         <Users size={14} className="text-slate-600" />
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{rec.class_name}</span>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <Calendar size={14} className="text-slate-600" />
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(rec.recorded_at).toLocaleDateString()}</span>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <Globe size={14} className="text-slate-600" />
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility: {rec.visibility?.toUpperCase()}</span>
                                     </div>
                                 </div>
                                 
                                 <a 
                                     href={rec.video_url} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="mt-8 w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#656CFF] hover:bg-[#656CFF] hover:text-white transition-all shadow-xl"
                                 >
                                    <Link size={14} /> Open Recording
                                 </a>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Area */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-2xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/10 blur-[80px] rounded-full -translate-y-12 translate-x-12" />
                        
                        <div className="flex items-center justify-between mb-12">
                             <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Add <span className="text-[#656CFF]">Recording</span></h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">New class video distribution</p>
                             </div>
                             <button onClick={resetModal} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                 <X size={24} />
                             </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-10 group">
                            <div className="space-y-4 group/field">
                                <label className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF] transition-colors">
                                    <Sparkles size={14} /> Recording Title
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-8 py-5 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                                    placeholder="E.G. MECHANICS - LESSON 01"
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>

                            <div className="space-y-4 group/field">
                                <label className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF] transition-colors">
                                    <Link size={14} /> Video Access Link
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-8 py-5 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                                    placeholder="HTTPS://VIMEO.COM/ABCDEFG"
                                    value={form.video_url}
                                    onChange={e => setForm({...form, video_url: e.target.value})}
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                                    <Layers size={14} className="text-[#656CFF]" /> Target Batches
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[{ id: 'kh', name: 'Knowledge Hub' }, ...batches].map(batch => (
                                        <button
                                            key={batch.id}
                                            type="button"
                                            onClick={() => {
                                                const current = form.selectedBatches;
                                                const next = current.includes(batch.name)
                                                    ? current.filter(b => b !== batch.name)
                                                    : [...current, batch.name];
                                                setForm({...form, selectedBatches: next});
                                            }}
                                            className={`
                                                group relative px-6 py-4 rounded-2xl border transition-all text-[9px] font-black tracking-widest uppercase truncate
                                                ${form.selectedBatches.includes(batch.name)
                                                    ? 'bg-[#656CFF] border-[#656CFF] text-white shadow-2xl shadow-[#656CFF]/30 active:scale-95'
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-[#656CFF]/30 hover:text-white'
                                                }
                                            `}
                                        >
                                            {batch.name}
                                            {form.selectedBatches.includes(batch.name) && (
                                                <div className="absolute top-2 right-2 h-1.5 w-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <label className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                                    <Globe size={14} className="text-[#FEBC2E]" /> Visibility Preference
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['both', 'mobile', 'website'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setForm({...form, visibility: v})}
                                            className={`
                                                px-6 py-4 rounded-2xl border transition-all text-[9px] font-black tracking-widest uppercase
                                                ${form.visibility === v
                                                    ? 'bg-[#FEBC2E] border-[#FEBC2E] text-black shadow-2xl shadow-[#FEBC2E]/30 active:scale-95'
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-[#FEBC2E]/30 hover:text-white'
                                                }
                                            `}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-4 py-6 bg-[#656CFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/40 hover:bg-[#545bd9] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <SaveIcon size={18} />}
                                {isSaving ? 'Saving...' : 'Add Recording'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SaveIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export default RecordingsPage;

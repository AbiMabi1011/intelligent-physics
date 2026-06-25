import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Megaphone,
    Trash2,
    Image as ImageIcon,
    Mail,
    X,
    Send,
    Users,
    Clock,
    CheckCircle,
    Eye,
    Globe,
    Lock,
    Loader2,
    Activity
} from 'lucide-react';
import { API_URL } from '../../config';

const AnnouncementsPage = () => {
    const [mode, setMode] = useState('list'); // 'list' | 'create'
    const [announcements, setAnnouncements] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [sendEmail, setSendEmail] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [visibility, setVisibility] = useState('both');
    const imageInputRef = useRef(null);

    useEffect(() => {
        fetchAnnouncements();
        fetchBatches();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/announcements`);
            if (res.ok) setAnnouncements(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setMode('list');
        setTitle('');
        setContent('');
        setSelectedBatches([]);
        setSendEmail(false);
        setImageFile(null);
        setImagePreview('');
        setVisibility('both');
    };

    const handleSubmit = async () => {
        if (!title.trim()) return alert('Title is required');
        if (!content.trim()) return alert('Content is required');
        if (selectedBatches.length === 0) return alert('Select at least one batch');

        setIsSubmitting(true);
        try {
            let imageUrl = '';
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.url || uploadData.file_url || '';
                }
            }

            const payload = {
                title: title.trim(),
                content: content.trim(),
                image_url: imageUrl || null,
                class_name: selectedBatches.join(', '),
                created_at: new Date().toISOString(),
                send_email: sendEmail,
                visibility: visibility
            };

            const res = await fetch(`${API_URL}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                resetForm();
                fetchAnnouncements();
            } else {
                const err = await res.json();
                alert('Failed: ' + (err.detail || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error posting announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            const res = await fetch(`${API_URL}/announcements/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAnnouncements();
        } catch (err) { console.error(err); }
    };

    if (mode === 'create') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">New Announcement</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Write and post a new update</p>
                    </div>
                    <button onClick={resetForm} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
                </div>

                <div className="admin-card p-10 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Announcement Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all"
                                    placeholder="Enter title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Update Content</label>
                                <textarea
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all h-64 resize-none"
                                    placeholder="Enter your message here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                             <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Target Batches / Classes</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {batches.map((batch) => (
                                        <button
                                            key={batch.id}
                                            onClick={() => {
                                                const next = selectedBatches.includes(batch.name)
                                                    ? selectedBatches.filter(b => b !== batch.name)
                                                    : [...selectedBatches, batch.name];
                                                setSelectedBatches(next);
                                            }}
                                            className={`px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                selectedBatches.includes(batch.name)
                                                    ? 'bg-[#656CFF] border-[#656CFF] text-white'
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
                                            }`}
                                        >
                                            {batch.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Update Image (Optional)</label>
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border-2 border-dashed border-[#23262D] rounded-[2rem] p-8 text-center cursor-pointer hover:border-[#656CFF]/50 transition-all group relative overflow-hidden h-48 flex flex-col items-center justify-center bg-white/[0.02]"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all" />
                                    ) : (
                                        <ImageIcon className="text-slate-700 group-hover:text-[#656CFF] mb-4 transition-colors" size={40} />
                                    )}
                                    <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-[0.2em] relative z-10">{imagePreview ? 'Change Image' : 'Select Hero Image'}</span>
                                    <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Send Email Notification?</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Send to all students in batches</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSendEmail(!sendEmail)}
                                    className={`h-7 w-12 rounded-full p-1 transition-all ${sendEmail ? 'bg-[#10B981]' : 'bg-slate-700'}`}
                                >
                                    <div className={`h-5 w-5 bg-white rounded-full transition-all ${sendEmail ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-14 bg-[#656CFF] text-white rounded-2xl px-12 font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {isSubmitting ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <Megaphone size={32} className="text-[#FEBC2E]" /> Announcements
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
                        Post important updates and news for all students
                    </p>
                </div>
                <button
                    onClick={() => setMode('create')}
                    className="h-14 bg-[#656CFF] text-white rounded-2xl px-10 font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} /> New Post
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="admin-card p-8 flex items-center gap-6">
                    <div className="h-14 w-14 rounded-[1.25rem] bg-[#FEBC2E]/10 flex items-center justify-center text-[#FEBC2E]">
                        <Activity size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Posts</p>
                        <h4 className="text-3xl font-black text-white leading-none tracking-tighter">{announcements.length}</h4>
                    </div>
                </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Clock size={20} className="text-[#656CFF]" /> Recent Updates
                    </h3>
                    <div className="h-px flex-1 bg-white/5 mx-6" />
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <Loader2 className="animate-spin mx-auto text-[#656CFF] mb-4" size={40} />
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Loading announcements...</span>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-[#23262D] rounded-[3rem] bg-white/[0.01]">
                        <Megaphone className="mx-auto text-slate-800 mb-6 opacity-30" size={64} />
                        <h4 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-2">No Announcements Found</h4>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Create your first update to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="admin-card group p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-[#656CFF]/30 transition-all bg-[#15171C]">
                                <div className="flex items-center gap-8 w-full">
                                    <div className="h-20 w-32 rounded-2xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0">
                                        {ann.image_url ? (
                                            <img src={ann.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-800">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-[#656CFF] uppercase tracking-[0.3em] mb-2">{ann.class_name}</p>
                                        <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight mb-2 truncate group-hover:text-[#656CFF] transition-colors">{ann.title}</h4>
                                        <div className="flex items-center gap-6 mt-3">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                <Clock size={12} /> {new Date(ann.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                <Users size={12} /> {ann.class_name?.split(',').length} Batches
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                     <button className="h-12 w-12 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                                         <Eye size={20} />
                                     </button>
                                     <button 
                                        onClick={() => handleDelete(ann.id)}
                                        className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl"
                                     >
                                         <Trash2 size={20} />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsPage;

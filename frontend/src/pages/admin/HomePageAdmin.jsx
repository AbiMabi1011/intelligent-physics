import React, { useState, useEffect, useRef } from 'react';
import {
    Home, Plus, Trash2, Edit2, X, Loader2,
    ToggleLeft, ToggleRight, Eye, EyeOff, Upload, Image,
    Layout, Megaphone, Save, BarChart3, GripVertical
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

const EMPTY_AD_FORM = {
    badge: '', title: '', description: '', cta_text: '', cta_link: '', image_url: '',
    position: 'left', accent: '#6366f1', gradient: 'linear-gradient(145deg,#0f0b2e,#1a116b)',
    is_active: true, order_index: 0,
};

const EMPTY_STAT_FORM = {
    value: '', label: '', icon: '',
    color: '#3b82f6', bg: 'rgba(59,130,246,.12)',
    is_active: true, order_index: 0,
};

// ─── Main Component ───
export default function HomePageAdmin() {
    const [tab, setTab] = useState('ads'); // 'ads' | 'stats'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 text-wrap">
                        <Home size={22} className="text-indigo-600 shrink-0" /> Homepage Manager
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Control the content visible to the public on the Intelligent Physics homepage.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl w-full sm:w-max">
                <button
                    onClick={() => setTab('ads')}
                    className={`flex-1 w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'ads' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'} `}
                >
                    <Megaphone size={16} /> Advertisements
                </button>
                <button
                    onClick={() => setTab('stats')}
                    className={`flex-1 w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'stats' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'} `}
                >
                    <BarChart3 size={16} /> Statistics Grid
                </button>
            </div>

            {tab === 'ads' && <AdsManager />}
            {tab === 'stats' && <StatsManager />}
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
        if (!form.value.trim() || !form.label.trim()) return alert('Value and Label are required');
        setIsSaving(true);
        try {
            const url = editId ? `${API_URL}/home-stats/${editId}` : `${API_URL}/home-stats`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, order_index: Number(form.order_index) }),
            });
            if (res.ok) { closeModal(); fetchStats(); }
            else alert('Failed to save stat');
        } catch (e) { console.error(e); alert('Error'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this stat?')) return;
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
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-sm text-indigo-800 flex-1 w-full object-cover">
                    <BarChart3 size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                    <p>Manage the large statistics blocks (e.g. "1,200+ Students") shown in the centre of the homepage.</p>
                </div>
                <button onClick={openCreate} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
                    <Plus size={16} /> New Stat
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400"><Loader2 size={32} className="animate-spin mx-auto mb-3" /> Loading stats...</div>
            ) : stats.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <BarChart3 size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold">No stats added yet</p>
                    <button onClick={openCreate} className="mt-5 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold">Create First Stat</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map(s => (
                        <div key={s.id} className={`bg-[#040c20] rounded-xl p-5 relative overflow-hidden transition ${!s.is_active && 'opacity-50'}`}>
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: s.color, opacity: 0.7 }} />
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-9 h-9 flex items-center justify-center rounded-lg text-sm" style={{ background: s.bg, color: s.color }}>
                                    {s.icon || '🌟'}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleActive(s)} className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition" title="Toggle active">
                                        {s.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button onClick={() => openEdit(s)} className="p-1 hover:bg-blue-500/20 rounded-md text-blue-400 transition"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(s.id)} className="p-1 hover:bg-red-500/20 rounded-md text-red-400 transition"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="text-[1.8rem] font-bold leading-none mt-2" style={{ color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                            <div className="text-[#2d3d54] text-xs font-bold uppercase mt-1 tracking-wide">{s.label}</div>
                            <div className="text-[9px] text-gray-600 mt-3 border-t border-gray-800 pt-2">Order: {s.order_index}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stat Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b bg-gray-50 text-gray-800">
                            <h2 className="font-bold flex items-center gap-2"><BarChart3 size={18} className="text-indigo-600" /> {editId ? 'Edit Stat' : 'Create Stat'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Large Value</label>
                                    <input className="w-full border rounded-lg p-2 text-sm font-bold bg-gray-50" placeholder="e.g. 1,200+" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Emoji Icon</label>
                                    <input className="w-full border rounded-lg p-2 text-sm text-center bg-gray-50" placeholder="🎓" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Short Label</label>
                                <input className="w-full border rounded-lg p-2 text-sm bg-gray-50" placeholder="e.g. Students Enrolled" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Text Color (Hex)</label><input className="w-full border rounded-lg p-2 text-xs font-mono" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">BG (RGBA)</label><input className="w-full border rounded-lg p-2 text-xs font-mono" value={form.bg} onChange={e => setForm({ ...form, bg: e.target.value })} /></div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Order Index (0=Left)</label>
                                <input type="number" className="w-full border rounded-lg p-2 text-sm bg-gray-50" value={form.order_index} onChange={e => setForm({ ...form, order_index: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" id="stat-active" className="rounded text-indigo-600" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                <label htmlFor="stat-active" className="text-sm font-semibold text-gray-700 cursor-pointer">Visible on homepage</label>
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full mt-4 bg-indigo-600 text-white rounded-lg py-2.5 font-bold hover:bg-indigo-700 transition">
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
    const [uploadMsg, setUploadMsg] = useState('');
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

    const openCreate = () => {
        setForm(EMPTY_AD_FORM);
        setEditId(null);
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

    const openEdit = (ad) => {
        setForm({ ...EMPTY_AD_FORM, ...ad });
        setEditId(ad.id);
        setImageFile(null);
        setImagePreview(ad.image_url?.startsWith('/') ? `${API_URL}${ad.image_url}` : ad.image_url || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setForm(EMPTY_AD_FORM);
        setImageFile(null);
        setImagePreview('');
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setImageFile(f);
        setImagePreview(URL.createObjectURL(f));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return alert('Title is required');
        setIsSaving(true);
        try {
            let imageUrl = form.image_url;
            if (imageFile) {
                setUploadMsg('Uploading image...');
                const fd = new FormData();
                fd.append('file', imageFile);
                const r = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd });
                if (!r.ok) throw new Error('Image upload failed');
                const d = await r.json();
                imageUrl = d.file_url || d.url;
            }
            setUploadMsg('Saving ad...');

            const url = editId ? `${API_URL}/home-ads/${editId}` : `${API_URL}/home-ads`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, image_url: imageUrl, order_index: Number(form.order_index) }),
            });
            if (res.ok) { closeModal(); fetchAds(); }
            else alert('Failed to save ad');
        } catch (e) { console.error(e); alert('Error'); }
        finally { setIsSaving(false); setUploadMsg(''); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ad?')) return;
        await fetch(`${API_URL}/home-ads/${id}`, { method: 'DELETE' });
        fetchAds();
    };

    const toggleActive = async (ad) => {
        await fetch(`${API_URL}/home-ads/${ad.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...ad, is_active: !ad.is_active }),
        });
        fetchAds();
    };

    const leftAds = ads.filter(a => a.position === 'left');
    const rightAds = ads.filter(a => a.position === 'right');

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-sm text-indigo-800 flex-1 w-full">
                    <Layout size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                        <strong>How it works:</strong> Assign ads to <em>Left</em> or <em>Right</em> positions to display them in the sidebars. Adjust the <em>Order</em> property to re-arrange stacked ads.
                    </div>
                </div>
                <button onClick={openCreate} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
                    <Plus size={16} /> New Ad
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400"><Loader2 size={32} className="animate-spin mx-auto mb-3" /> Loading ads...</div>
            ) : ads.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold">No homepage ads yet</p>
                    <button onClick={openCreate} className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">Create First Ad</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Sidebar Ads ({leftAds.length})
                        </h2>
                        <div className="space-y-4">{leftAds.length === 0 ? <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">No ads yet</div> : leftAds.map(ad => <AdCard key={ad.id} ad={ad} onEdit={openEdit} onDelete={handleDelete} onToggle={toggleActive} />)}</div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                {editId ? <Edit2 size={18} className="text-indigo-600" /> : <Plus size={18} className="text-indigo-600" />} {editId ? 'Edit Ad' : 'Create New Ad'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Image (Optional)</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`cursor-pointer rounded-xl border-2 border-dashed overflow-hidden transition
                                        ${imagePreview ? 'border-indigo-400' : 'border-gray-300 hover:border-indigo-400'}`}
                                >
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="preview" className="w-full h-32 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                <span className="text-white font-semibold text-sm">Click to change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                                            <Upload size={28} className="mb-2" />
                                            <p className="font-semibold text-sm">Upload optional image</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>

                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Badge (emoji + text)</label><input className="w-full border rounded-lg p-2.5 text-sm" placeholder='e.g. 🔥 Now Open' value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label><input className="w-full border rounded-lg p-2.5 text-sm" placeholder='e.g. A/L 2026 Batch' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Description</label><textarea rows={3} className="w-full border rounded-lg p-2.5 text-sm resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Button Label</label><input className="w-full border rounded-lg p-2.5 text-sm" placeholder='e.g. Enroll Now →' value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Button Link</label><input className="w-full border rounded-lg p-2.5 text-sm" placeholder='/login' value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Position</label>
                                    <select className="w-full border rounded-lg p-2.5 text-sm bg-white" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                                        <option value="left">Sidebar</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Order (0 = top)</label><input type="number" min={0} className="w-full border rounded-lg p-2.5 text-sm" value={form.order_index} onChange={e => setForm({ ...form, order_index: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Colour Theme</label>
                                <div className="flex flex-wrap gap-2">
                                    {ACCENT_PRESETS.map(p => (
                                        <button key={p.value} type="button" onClick={() => setForm({ ...form, accent: p.value, gradient: p.grad })} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition ${form.accent === p.value ? 'border-gray-800 bg-gray-100' : 'border-transparent bg-gray-50'}`}>
                                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: p.value }} /> {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>{form.is_active ? <ToggleRight size={30} className="text-indigo-600" /> : <ToggleLeft size={30} className="text-gray-400" />}</button>
                                <span className="text-sm font-medium text-gray-700">{form.is_active ? 'Active — visible on homepage' : 'Inactive — hidden from homepage'}</span>
                            </div>
                            {uploadMsg && (
                                <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 p-3 rounded-lg">
                                    <Loader2 size={16} className="animate-spin" /> {uploadMsg}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="w-full sm:w-auto px-5 py-2.5 border rounded-lg text-sm font-medium">Cancel</button>
                                <button type="submit" disabled={isSaving} className="w-full sm:w-auto justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60">{isSaving ? <Loader2 size={16} className="animate-spin" /> : null} {isSaving ? 'Saving…' : 'Save Ad'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function AdCard({ ad, onEdit, onDelete, onToggle }) {
    const imgSrc = ad.image_url?.startsWith('/') ? `${API_URL}${ad.image_url}` : ad.image_url;
    return (
        <div className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${ad.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
            <div className="flex items-start gap-3">
                {imgSrc ? (
                    <img src={imgSrc} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: ad.accent }} />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {ad.badge && <span className="text-[10px] text-gray-400 font-bold uppercase">{ad.badge}</span>}
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{ad.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm leading-snug">{ad.title}</p>
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">Order: {ad.order_index}</div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onToggle(ad)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"><Eye size={14} /></button>
                    <button onClick={() => onEdit(ad)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md"><Edit2 size={14} /></button>
                    <button onClick={() => onDelete(ad.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </div>
            </div>
        </div>
    );
}

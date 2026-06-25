import React, { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon, Plus, Trash2, Edit3, Search, X, Upload,
    ChevronUp, ChevronDown, Eye, EyeOff, Loader2,
    GripVertical, ExternalLink, Sparkles, Navigation, CheckCircle
} from 'lucide-react';
import { API_URL } from '../../config';

const empty = {
    title: '', subtitle: '', image_url: '',
    button_text: '', button_link: '', is_active: true, order_index: 0
};

const SliderPage = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlider, setEditingSlider] = useState(null);
    const [form, setForm] = useState(empty);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const fileRef = useRef(null);

    useEffect(() => { fetchSliders(); }, []);

    const fetchSliders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/sliders`);
            if (res.ok) setSliders(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openAdd = () => {
        setEditingSlider(null);
        setForm({ ...empty, order_index: sliders.length });
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

    const openEdit = (s) => {
        setEditingSlider(s);
        setForm({ ...s });
        setImagePreview(s.image_url?.startsWith('/') ? `${API_URL}${s.image_url}` : s.image_url);
        setImageFile(null);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setImageFile(f);
        setImagePreview(URL.createObjectURL(f));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!imagePreview && !form.image_url) return alert('Please select an image file');

        setIsSaving(true);
        try {
            let imageUrl = form.image_url;
            if (imageFile) {
                setUploadMsg('Uploading Image...');
                const fd = new FormData();
                fd.append('file', imageFile);
                const r = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd });
                if (!r.ok) throw new Error('Upload Failed');
                const d = await r.json();
                imageUrl = d.file_url || d.url;
            }

            setUploadMsg('Saving...');
            const payload = { ...form, image_url: imageUrl };

            const url = editingSlider
                ? `${API_URL}/sliders/${editingSlider.id}`
                : `${API_URL}/sliders`;
            const method = editingSlider ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                closeModal();
                fetchSliders();
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            alert(err.message || 'Operation failed');
        } finally {
            setIsSaving(false);
            setUploadMsg('');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSlider(null);
        setForm(empty);
        setImageFile(null);
        setImagePreview('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this slider permanently?')) return;
        await fetch(`${API_URL}/sliders/${id}`, { method: 'DELETE' });
        fetchSliders();
    };

    const toggleActive = async (slider) => {
        await fetch(`${API_URL}/sliders/${slider.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...slider, is_active: !slider.is_active })
        });
        fetchSliders();
    };

    const move = async (idx, dir) => {
        const next = sliders[idx + dir];
        const cur = sliders[idx];
        if (!next) return;
        await Promise.all([
            fetch(`${API_URL}/sliders/${cur.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cur, order_index: next.order_index })
            }),
            fetch(`${API_URL}/sliders/${next.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...next, order_index: cur.order_index })
            }),
        ]);
        fetchSliders();
    };

    const imgSrc = (url) => url?.startsWith('/') ? `${API_URL}${url}` : url;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <ImageIcon size={32} className="text-[#656CFF]" />
                        Home Sliders
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Manage the image banners on the student home page</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-3 rounded-2xl bg-[#656CFF] px-8 py-4 text-sm font-black text-white shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} /> Add New Slide
                </button>
            </div>

            {loading ? (
                <div className="py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#656CFF] mb-4" size={40} />
                    <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Sliders...</span>
                </div>
            ) : sliders.length === 0 ? (
                <div className="py-32 text-center admin-card bg-transparent border-dashed border-2 border-[#23262D]">
                    <ImageIcon className="mx-auto text-slate-800 mb-6 opacity-30" size={64} />
                    <h4 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-2">No Sliders Found</h4>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-loose">Add your first slider to get started.</p>
                </div>
            ) : (
                <div className="space-y-8">
                     <div className="flex items-center justify-between px-6 mb-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Navigation size={20} className="text-[#656CFF]" /> Slider List
                        </h3>
                        <div className="h-px flex-1 bg-white/5 mx-6" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {sliders.sort((a,b) => a.order_index - b.order_index).map((s, idx) => (
                            <div key={s.id} className="admin-card group p-6 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-[#656CFF]/30 transition-all bg-[#15171C]">
                                <div className="flex items-center gap-8 w-full">
                                    <div className="h-24 w-40 rounded-2xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0 relative">
                                        <img src={imgSrc(s.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.title} />
                                        {!s.is_active && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                <EyeOff size={24} className="text-white/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${s.is_active ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-slate-700/10 text-slate-500 border-white/5'}`}>
                                                {s.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-[#656CFF] transition-colors">{s.title || 'Untitled Slide'}</h4>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 truncate">{s.subtitle || 'No subtitle provided'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-2 mr-4 border-r border-white/5 pr-6">
                                        <button onClick={() => move(idx, -1)} disabled={idx === 0} className="h-8 w-8 rounded-lg bg-white/5 text-slate-500 hover:text-white disabled:opacity-20 flex items-center justify-center transition-all">
                                            <ChevronUp size={16} />
                                        </button>
                                        <button onClick={() => move(idx, 1)} disabled={idx === sliders.length - 1} className="h-8 w-8 rounded-lg bg-white/5 text-slate-500 hover:text-white disabled:opacity-20 flex items-center justify-center transition-all">
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => toggleActive(s)}
                                        className={`h-12 w-12 rounded-2xl transition-all flex items-center justify-center ${s.is_active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-700/10 text-slate-500'}`}
                                    >
                                        {s.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => openEdit(s)}
                                        className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 text-[#656CFF] hover:bg-[#656CFF] hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Edit3 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(s.id)}
                                        className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-4xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/10 blur-[80px] rounded-full -translate-y-12 translate-x-12" />
                         
                         <div className="flex items-center justify-between mb-12">
                             <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{editingSlider ? 'Edit' : 'Add'} <span className="text-[#656CFF]">Slider</span></h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">Home screen visual configuration</p>
                             </div>
                             <button onClick={closeModal} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                 <X size={24} />
                             </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Hero Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                                            placeholder="E.G. WELCOME TO PHYSICS"
                                            value={form.title}
                                            onChange={e => setForm({...form, title: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Subtitle Description</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                                            placeholder="E.G. NEW LESSONS UPLOADED"
                                            value={form.subtitle}
                                            onChange={e => setForm({...form, subtitle: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Button Text</label>
                                            <input
                                                type="text"
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                                                placeholder="START NOW"
                                                value={form.button_text}
                                                onChange={e => setForm({...form, button_text: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Button Redirect Link</label>
                                            <input
                                                type="text"
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                                                placeholder="/knowledge-hub"
                                                value={form.button_link}
                                                onChange={e => setForm({...form, button_link: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Background Image</label>
                                    <div 
                                        onClick={() => fileRef.current.click()}
                                        className={`group relative h-[300px] rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-white/[0.01] ${imagePreview ? 'border-[#10B981]' : 'border-[#23262D] hover:border-[#656CFF]/50'}`}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                                     <Upload className="text-white mb-2" size={32} />
                                                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Visual</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-8">
                                                <ImageIcon className="mx-auto text-slate-700 group-hover:text-[#656CFF] mb-4 transition-colors" size={48} />
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Drop Media or Click</p>
                                                <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest mt-2">{'(1920x800 RECOMMENDED)'}</p>
                                            </div>
                                        )}
                                        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex flex-col gap-6">
                                {uploadMsg && (
                                    <div className="flex items-center gap-3 text-sm font-black text-[#656CFF] animate-pulse">
                                        <Loader2 size={18} className="animate-spin" /> {uploadMsg}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="h-16 w-full bg-[#656CFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                                    {isSaving ? 'Processing...' : (editingSlider ? 'Update Slider' : 'Save Slider')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SliderPage;

import React, { useState, useEffect, useRef } from 'react';
import {
    Image, Plus, Trash2, Edit3, Search, X, Upload,
    ChevronUp, ChevronDown, Eye, EyeOff, Loader2,
    GripVertical, ExternalLink
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
        if (!imagePreview && !form.image_url) return alert('Please upload or provide an image');

        setIsSaving(true);
        try {
            let imageUrl = form.image_url;

            // Upload image if new file selected
            if (imageFile) {
                setUploadMsg('Uploading image...');
                const fd = new FormData();
                fd.append('file', imageFile);
                const r = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd });
                if (!r.ok) throw new Error('Image upload failed');
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
                alert('Failed to save slider');
            }
        } catch (err) {
            alert(err.message || 'Error');
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
        if (!confirm('Delete this slide?')) return;
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
        // Swap order_index
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Image size={24} className="text-blue-600" /> Slider Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage banners shown on the student dashboard hero section
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm transition"
                >
                    <Plus size={16} /> Add Slide
                </button>
            </div>

            {/* Slides List */}
            {loading ? (
                <div className="py-16 text-center text-gray-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-3" />
                    Loading slides...
                </div>
            ) : sliders.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <Image size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-semibold text-lg">No slides yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add a banner slide to display on the student dashboard</p>
                    <button onClick={openAdd}
                        className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition">
                        + Add First Slide
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sliders.map((s, idx) => (
                        <div key={s.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex transition ${s.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                            {/* Drag handle / order */}
                            <div className="flex flex-col items-center justify-center px-3 bg-gray-50 border-r border-gray-100 gap-1">
                                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-0.5">
                                    <ChevronUp size={16} />
                                </button>
                                <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                                <button onClick={() => move(idx, 1)} disabled={idx === sliders.length - 1}
                                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-0.5">
                                    <ChevronDown size={16} />
                                </button>
                            </div>

                            {/* Thumbnail */}
                            <div className="w-40 h-28 flex-shrink-0 bg-gray-100 overflow-hidden">
                                {s.image_url ? (
                                    <img src={imgSrc(s.image_url)} alt={s.title}
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Image size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{s.title}</h3>
                                        {s.subtitle && <p className="text-sm text-gray-500 mt-0.5">{s.subtitle}</p>}
                                        {s.button_text && (
                                            <div className="flex items-center gap-1 mt-2">
                                                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                                                    CTA: {s.button_text}
                                                </span>
                                                {s.button_link && (
                                                    <a href={s.button_link} target="_blank" rel="noreferrer"
                                                        className="text-gray-400 hover:text-blue-600">
                                                        <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button onClick={() => toggleActive(s)}
                                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition ${s.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {s.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {s.is_active ? 'Active' : 'Hidden'}
                                        </button>
                                        <button onClick={() => openEdit(s)}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(s.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview hint */}
            {sliders.length > 0 && (
                <div className="text-center text-sm text-gray-400 italic">
                    Active slides appear as a scrolling hero banner on the student dashboard
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingSlider ? 'Edit Slide' : 'Add New Slide'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Slide Image *</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`cursor-pointer rounded-xl border-2 border-dashed overflow-hidden transition
                                        ${imagePreview ? 'border-blue-400' : 'border-gray-300 hover:border-blue-400'}`}
                                >
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="preview"
                                                className="w-full h-44 object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                <span className="text-white font-semibold text-sm">Click to change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-44 flex flex-col items-center justify-center text-gray-400">
                                            <Upload size={32} className="mb-2" />
                                            <p className="font-semibold text-sm">Click to upload slide image</p>
                                            <p className="text-xs mt-1">Recommended: 1280×480px, JPG or PNG</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                    onChange={handleFileChange} />
                                {/* Or paste URL */}
                                <div className="mt-2">
                                    <input
                                        type="url"
                                        placeholder="Or paste an image URL..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        value={imageFile ? '' : form.image_url}
                                        onChange={e => {
                                            setForm({ ...form, image_url: e.target.value });
                                            setImagePreview(e.target.value);
                                            setImageFile(null);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Title <span className="font-normal text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Welcome to Intelligent Physics"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Subtitle <span className="font-normal text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Your journey to excellence starts here"
                                    value={form.subtitle}
                                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                                />
                            </div>

                            {/* CTA Button */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Button Text <span className="font-normal text-gray-400">(Optional)</span>
                                    </label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Start Learning"
                                        value={form.button_text}
                                        onChange={e => setForm({ ...form, button_text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Button Link <span className="font-normal text-gray-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="url"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://..."
                                        value={form.button_link}
                                        onChange={e => setForm({ ...form, button_link: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer"
                                        checked={form.is_active}
                                        onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm font-semibold text-gray-700">
                                    {form.is_active ? '✅ Visible to students' : '🔴 Hidden from students'}
                                </span>
                            </div>

                            {uploadMsg && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                    <Loader2 size={16} className="animate-spin" /> {uploadMsg}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-60">
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {isSaving ? 'Saving...' : (editingSlider ? 'Update Slide' : 'Add Slide')}
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

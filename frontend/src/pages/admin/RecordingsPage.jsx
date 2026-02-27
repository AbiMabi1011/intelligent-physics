import React, { useState, useEffect } from 'react';
import {
    Video, Plus, Trash2, Search, X, Link,
    Calendar, Users, Play, Loader2
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
        selectedBatches: []
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
        setForm({ title: '', video_url: '', selectedBatches: [] });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return alert('Title is required');
        if (!form.video_url.trim()) return alert('Recording link is required');
        if (form.selectedBatches.length === 0) return alert('Select at least one batch');

        setIsSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: null,
                video_url: form.video_url.trim(),
                class_name: form.selectedBatches.join(', '),
                subject: 'Physics',
                recorded_at: new Date().toISOString()
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
                alert('Failed to add recording');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving recording');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this recording?')) return;
        await fetch(`${API_URL}/recordings/${id}`, { method: 'DELETE' });
        fetchRecordings();
    };

    const filtered = recordings.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Video size={24} className="text-blue-600" /> Class Recordings
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm transition"
                >
                    <Plus size={16} /> Add Recording
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search recordings..."
                    className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Recordings Grid */}
            {loading ? (
                <div className="py-16 text-center text-gray-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-3" />
                    Loading recordings...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <Video size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No recordings yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add a Zoom recording link to share with students</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(rec => (
                        <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                            {/* Thumbnail-style header */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex items-center justify-center relative">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                    <Play size={28} className="text-white ml-1" />
                                </div>
                                <button
                                    onClick={() => handleDelete(rec.id)}
                                    className="absolute top-3 right-3 bg-white/20 hover:bg-red-500 text-white p-1.5 rounded-full transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-900 line-clamp-2">{rec.title}</h3>
                                {rec.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rec.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full font-medium">
                                        <Users size={11} /> {rec.class_name}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        <Calendar size={11} /> {rec.recorded_at ? new Date(rec.recorded_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="mt-auto pt-4">
                                    <a
                                        href={rec.video_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition"
                                    >
                                        <Play size={14} /> Watch Recording
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Recording Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Video size={20} className="text-blue-600" /> Add Class Recording
                            </h2>
                            <button onClick={resetModal} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. Chapter 5 - Waves & Optics (Feb 27)"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Zoom Link */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Zoom / Recording Link *</label>
                                <div className="relative">
                                    <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="url"
                                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://zoom.us/rec/..."
                                        value={form.video_url}
                                        onChange={e => setForm({ ...form, video_url: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Batch Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Batches *</label>
                                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto space-y-2">
                                    {batches.length === 0 ? (
                                        <p className="text-xs text-gray-400">No batches found.</p>
                                    ) : batches.map(b => (
                                        <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.selectedBatches.includes(b.name)}
                                                onChange={e => {
                                                    const arr = form.selectedBatches;
                                                    if (e.target.checked) setForm({ ...form, selectedBatches: [...arr, b.name] });
                                                    else setForm({ ...form, selectedBatches: arr.filter(x => x !== b.name) });
                                                }}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-gray-700">{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={resetModal}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-60">
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {isSaving ? 'Saving...' : 'Add Recording'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecordingsPage;

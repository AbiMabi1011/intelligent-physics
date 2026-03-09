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
    CheckCircle
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
            // Upload image if exists
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
                alert(sendEmail
                    ? '✅ Announcement posted and emails sent to students!'
                    : '✅ Announcement posted successfully!'
                );
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

    // --- Create Form ---
    if (mode === 'create') {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone size={24} className="text-blue-600" /> New Announcement
                    </h1>
                    <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 font-semibold px-4 py-2 border rounded-lg bg-white">
                        Cancel
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Special Class This Saturday"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                        <textarea
                            rows={5}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Write your announcement message here..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Image (Optional)</label>
                        <div
                            onClick={() => imageInputRef.current?.click()}
                            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                        >
                            {imagePreview ? (
                                <div className="relative w-full">
                                    <img src={imagePreview} alt="preview" className="rounded-lg max-h-48 w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-sm font-medium">Click to upload an image</span>
                                    <span className="text-xs mt-1">PNG, JPG, GIF up to 10MB</span>
                                </>
                            )}
                        </div>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Where? *</label>
                        <select
                            value={visibility}
                            onChange={e => setVisibility(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="both">Both (Learning Hub & Public Knowledge Center)</option>
                            <option value="portal">Learning Hub Only (Requires Login)</option>
                            <option value="hub">Public Knowledge Center Only (Homepage)</option>
                        </select>
                    </div>

                    {/* Target Batches */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Target Batches *</label>
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2 max-h-40 overflow-y-auto">
                            {batches.length === 0 ? (
                                <p className="text-sm text-gray-400">No batches found. Add batches first.</p>
                            ) : batches.map(b => (
                                <label key={b.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedBatches.includes(b.name)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedBatches(prev => [...prev, b.name]);
                                            else setSelectedBatches(prev => prev.filter(x => x !== b.name));
                                        }}
                                        className="rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-gray-700 font-medium">{b.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Email Notification Option */}
                    <div
                        onClick={() => setSendEmail(!sendEmail)}
                        className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border-2 transition-all ${sendEmail ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${sendEmail ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Send Email Notifications</p>
                                <p className="text-xs text-gray-500">
                                    {sendEmail
                                        ? 'Emails will be sent to all students in selected batches'
                                        : 'Only show on website (no email)'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors flex items-center ${sendEmail ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${sendEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {sendEmail && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
                            <Mail size={16} className="mt-0.5 shrink-0" />
                            <span>Emails will be sent to all students in: <strong>{selectedBatches.join(', ') || 'No batches selected yet'}</strong></span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        <Send size={20} />
                        {isSubmitting ? 'Posting...' : (sendEmail ? 'Post & Send Emails' : 'Post Announcement')}
                    </button>
                </div>
            </div>
        );
    }

    // --- List View ---
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Megaphone size={24} className="text-blue-600" /> Announcements
                </h1>
                <button
                    onClick={() => setMode('create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition"
                >
                    <Plus size={16} /> New Announcement
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading announcements...</div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No announcements yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first announcement to notify students</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            {ann.image_url && (
                                <img src={ann.image_url} alt={ann.title} className="w-full h-48 object-cover" />
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                                        <p className="text-gray-600 mt-2 whitespace-pre-wrap">{ann.content}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(ann.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition shrink-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        <Users size={12} /> {ann.class_name}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-medium">
                                        Visibility: {
                                            ann.visibility === 'portal' ? 'Portal Only' :
                                                ann.visibility === 'hub' ? 'Public Hub Only' : 'Both (Hub & Portal)'
                                        }
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock size={12} /> {ann.created_at ? new Date(ann.created_at).toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;

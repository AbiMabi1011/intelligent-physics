import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Upload, Search, Download, Trash2,
    Loader2, Plus, X, Eye, CheckCircle
} from 'lucide-react';
import { API_URL } from '../../config';

const PapersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [papers, setPapers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        title: '',
        subject: 'Physics',
        selectedBatches: [],
        paper_type: 'Past Paper',
        visibility: 'both'
    });
    const [paperFile, setPaperFile] = useState(null);
    const [schemeFile, setSchemeFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const paperInputRef = useRef(null);
    const schemeInputRef = useRef(null);

    useEffect(() => {
        fetchPapers();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchPapers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/papers`);
            if (res.ok) setPapers(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const uploadPdf = async (file, label) => {
        setUploadProgress(`Uploading ${label}...`);
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${label}`);
        const data = await res.json();
        return data.file_url || data.url;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return alert('Title is required');
        if (!paperFile) return alert('Please select a paper PDF');
        if (form.selectedBatches.length === 0) return alert('Select at least one batch');

        setIsSaving(true);
        try {
            const fileUrl = await uploadPdf(paperFile, 'Paper PDF');
            let schemeUrl = '';
            if (schemeFile) {
                schemeUrl = await uploadPdf(schemeFile, 'Marking Scheme PDF');
            }
            setUploadProgress('Saving record...');
            const payload = {
                title: form.title,
                subject: form.subject,
                class_name: form.selectedBatches.join(', '),
                paper_type: form.paper_type,
                file_url: fileUrl,
                scheme_url: schemeUrl,
                visibility: form.visibility
            };
            const res = await fetch(`${API_URL}/papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                resetModal();
                fetchPapers();
            } else {
                alert('Failed to save paper');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Upload failed');
        } finally {
            setIsSaving(false);
            setUploadProgress('');
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setForm({ title: '', subject: 'Physics', selectedBatches: [], paper_type: 'Past Paper', visibility: 'both' });
        setPaperFile(null);
        setSchemeFile(null);
        setUploadProgress('');
    };

    const deletePaper = async (id) => {
        if (!window.confirm('Delete this paper?')) return;
        await fetch(`${API_URL}/papers/${id}`, { method: 'DELETE' });
        fetchPapers();
    };

    const filteredPapers = papers.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const typeColor = {
        'Past Paper': { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' },
        'FWC Paper': { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
        'Model Paper': { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
        'Other': { bg: 'bg-gray-50', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Exam Papers</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
                >
                    <Plus size={16} className="mr-2" /> Upload Paper
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search papers..."
                    className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Loading papers...</div>
                ) : filteredPapers.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No papers found</p>
                    </div>
                ) : filteredPapers.map((p) => {
                    const colors = typeColor[p.paper_type] || typeColor['Other'];
                    return (
                        <div key={p.id} className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                            <div className="flex items-start justify-between">
                                <div className={`rounded-lg p-3 ${colors.bg} ${colors.text}`}>
                                    <FileText size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.badge}`}>
                                        {p.paper_type || 'Paper'}
                                    </span>
                                    <button
                                        onClick={() => deletePaper(p.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex-grow">
                                <h3 className="font-bold text-gray-800 line-clamp-2">{p.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{p.subject} • {p.class_name}</p>
                                <div className="mt-2 text-xs font-semibold px-2 py-0.5 inline-block rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                    Visibility: {p.visibility === 'portal' ? 'Portal Only' : p.visibility === 'hub' ? 'Public Hub Only' : 'Both (Hub & Portal)'}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-50">
                                <a
                                    href={p.file_url?.startsWith('/') ? `${API_URL}${p.file_url}` : p.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition"
                                >
                                    <Eye size={14} /> View Paper PDF
                                </a>
                                {p.scheme_url && (
                                    <a
                                        href={p.scheme_url?.startsWith('/') ? `${API_URL}${p.scheme_url}` : p.scheme_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition"
                                    >
                                        <Eye size={14} /> View Marking Scheme
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-800">Upload Exam Paper</h2>
                            <button onClick={resetModal} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. 2024 Mid-term Paper"
                                    required
                                />
                            </div>

                            {/* Type & Visibility & Batches */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Paper Type</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        value={form.paper_type}
                                        onChange={e => setForm({ ...form, paper_type: e.target.value })}
                                    >
                                        <option>Past Paper</option>
                                        <option>FWC Paper</option>
                                        <option>Model Paper</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Display Where?</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        value={form.visibility}
                                        onChange={e => setForm({ ...form, visibility: e.target.value })}
                                    >
                                        <option value="both">Both (Learning Hub & Knowledge Center)</option>
                                        <option value="portal">Learning Hub Only</option>
                                        <option value="hub">Public Knowledge Center Only</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Batches *</label>
                                    <div className="max-h-24 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50 space-y-1">
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
                                                <span>{b.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Paper PDF Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Paper PDF *</label>
                                <div
                                    onClick={() => paperInputRef.current?.click()}
                                    className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex items-center gap-3 transition
                                        ${paperFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${paperFile ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {paperFile ? (
                                            <>
                                                <p className="font-semibold text-blue-700 text-sm truncate">{paperFile.name}</p>
                                                <p className="text-xs text-gray-400">{(paperFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-600 text-sm">Click to upload Paper PDF</p>
                                                <p className="text-xs text-gray-400">PDF files only</p>
                                            </>
                                        )}
                                    </div>
                                    {paperFile && (
                                        <button type="button" onClick={e => { e.stopPropagation(); setPaperFile(null); }}
                                            className="text-red-400 hover:text-red-600">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <input ref={paperInputRef} type="file" accept=".pdf" className="hidden" onChange={e => setPaperFile(e.target.files[0])} />
                            </div>

                            {/* Scheme PDF Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Marking Scheme PDF <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div
                                    onClick={() => schemeInputRef.current?.click()}
                                    className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex items-center gap-3 transition
                                        ${schemeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 bg-gray-50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${schemeFile ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {schemeFile ? (
                                            <>
                                                <p className="font-semibold text-green-700 text-sm truncate">{schemeFile.name}</p>
                                                <p className="text-xs text-gray-400">{(schemeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-600 text-sm">Click to upload Marking Scheme PDF</p>
                                                <p className="text-xs text-gray-400">PDF files only</p>
                                            </>
                                        )}
                                    </div>
                                    {schemeFile && (
                                        <button type="button" onClick={e => { e.stopPropagation(); setSchemeFile(null); }}
                                            className="text-red-400 hover:text-red-600">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <input ref={schemeInputRef} type="file" accept=".pdf" className="hidden" onChange={e => setSchemeFile(e.target.files[0])} />
                            </div>

                            {uploadProgress && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                    <Loader2 size={16} className="animate-spin" />
                                    {uploadProgress}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={resetModal}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-60">
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {isSaving ? (uploadProgress || 'Uploading...') : 'Upload Paper'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PapersPage;

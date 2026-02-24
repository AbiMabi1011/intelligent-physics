import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Download, Trash2, Loader2, Globe } from 'lucide-react';
import { API_URL } from '../../config';

const PapersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Paper State
    const [newPaper, setNewPaper] = useState({
        title: '',
        subject: 'Physics',
        class_name: '11-A',
        file_url: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/papers`);
            if (res.ok) setPapers(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newPaper.title || !newPaper.file_url) return alert("Fill all fields");

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPaper)
            });
            if (res.ok) {
                setShowModal(false);
                setNewPaper({ title: '', subject: 'Physics', class_name: '11-A', file_url: '' });
                fetchPapers();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPapers = papers.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Exam Papers Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
                >
                    <Upload size={16} className="mr-2" /> Upload Link
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
                ) : filteredPapers.map((p) => (
                    <PaperCard key={p.id} paper={p} />
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-scale-in">
                        <h2 className="text-xl font-bold mb-4">Add Study Paper</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Title</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={newPaper.title}
                                    onChange={e => setNewPaper({ ...newPaper, title: e.target.value })}
                                    placeholder="e.g. 2024 Mid-term Paper"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">PDF/Drive URL</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={newPaper.file_url}
                                    onChange={e => setNewPaper({ ...newPaper, file_url: e.target.value })}
                                    placeholder="https://drive.google.com/..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center transition">
                                    {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload className="mr-2" size={16} />}
                                    Save Paper
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const PaperCard = ({ paper }) => (
    <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-start justify-between">
            <div className="rounded-lg bg-red-50 p-3 text-red-600">
                <FileText size={24} />
            </div>
            <a
                href={paper.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
            >
                <Globe size={18} />
            </a>
        </div>
        <div className="mt-4">
            <h3 className="font-bold text-gray-800 line-clamp-1">{paper.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{paper.subject} • {paper.class_name}</p>
        </div>
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400">Added: {paper.created_at}</span>
            <a
                href={paper.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
                View PDF <ArrowUpRight size={14} className="ml-1" />
            </a>
        </div>
    </div>
);

const ArrowUpRight = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
);

export default PapersPage;

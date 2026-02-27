import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Download, Trash2, Loader2, Globe } from 'lucide-react';
import { API_URL } from '../../config';

const PapersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [papers, setPapers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [newPaper, setNewPaper] = useState({
        title: '',
        subject: 'Physics',
        selectedBatches: [],
        paper_type: 'Past Paper',
        file_url: '',
        scheme_url: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPapers();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) {
            console.error("Failed to fetch batches:", err);
        }
    };

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
        if (newPaper.selectedBatches.length === 0) return alert("Please select at least one batch");

        setIsSaving(true);
        try {
            const payload = {
                title: newPaper.title,
                subject: newPaper.subject,
                class_name: newPaper.selectedBatches.join(', '),
                paper_type: newPaper.paper_type,
                file_url: newPaper.file_url,
                scheme_url: newPaper.scheme_url
            };
            const res = await fetch(`${API_URL}/papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowModal(false);
                setNewPaper({ title: '', subject: 'Physics', selectedBatches: [], paper_type: 'Past Paper', file_url: '', scheme_url: '' });
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Type</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm"
                                        value={newPaper.paper_type}
                                        onChange={e => setNewPaper({ ...newPaper, paper_type: e.target.value })}
                                    >
                                        <option value="Past Paper">Past Paper</option>
                                        <option value="FWC Paper">FWC Paper</option>
                                        <option value="Model Paper">Model Paper</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Batches</label>
                                    <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 space-y-2">
                                        {batches.length === 0 ? (
                                            <p className="text-xs text-gray-500">No batches available.</p>
                                        ) : batches.map(b => (
                                            <label key={b.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newPaper.selectedBatches.includes(b.name)}
                                                    onChange={e => {
                                                        const arr = newPaper.selectedBatches;
                                                        if (e.target.checked) setNewPaper({ ...newPaper, selectedBatches: [...arr, b.name] });
                                                        else setNewPaper({ ...newPaper, selectedBatches: arr.filter(x => x !== b.name) });
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{b.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Paper PDF/Drive URL</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={newPaper.file_url}
                                    onChange={e => setNewPaper({ ...newPaper, file_url: e.target.value })}
                                    placeholder="https://drive.google.com/..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Marking Scheme URL (Optional)</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={newPaper.scheme_url}
                                    onChange={e => setNewPaper({ ...newPaper, scheme_url: e.target.value })}
                                    placeholder="https://drive.google.com/..."
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
    <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
        <div className="flex items-start justify-between">
            <div className={`rounded-lg p-3 ${paper.paper_type === 'FWC Paper' ? 'bg-purple-50 text-purple-600' :
                paper.paper_type === 'Past Paper' ? 'bg-orange-50 text-orange-600' :
                    'bg-blue-50 text-blue-600'
                }`}>
                <FileText size={24} />
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paper.paper_type === 'FWC Paper' ? 'bg-purple-100 text-purple-800' :
                paper.paper_type === 'Past Paper' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {paper.paper_type || 'Paper'}
            </span>
        </div>
        <div className="mt-4 flex-grow">
            <h3 className="font-bold text-gray-800 line-clamp-2" title={paper.title}>{paper.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{paper.subject} • {paper.class_name}</p>
        </div>
        <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Added: {paper.created_at}</span>
                <a
                    href={paper.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                    View Paper <ArrowUpRight size={14} className="ml-1" />
                </a>
            </div>
            {paper.scheme_url && (
                <div className="flex items-center justify-end">
                    <a
                        href={paper.scheme_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
                    >
                        Marking Scheme <ArrowUpRight size={14} className="ml-1" />
                    </a>
                </div>
            )}
        </div>
    </div>
);

const ArrowUpRight = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
);

export default PapersPage;

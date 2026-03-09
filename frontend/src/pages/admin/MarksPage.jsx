import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, Trash2, Search, Loader2, Upload, FileText } from 'lucide-react';
import { API_URL } from '../../config';

const MarksPage = () => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fileRef = useRef(null);
    const [uploadFile, setUploadFile] = useState(null);

    const [newMark, setNewMark] = useState({
        title: '',
        class_name: 'A/L 2026',
        subject: 'Physics',
        term: 'Mid-Term'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const marksRes = await fetch(`${API_URL}/marks`);
            if (marksRes.ok) setMarks(await marksRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this marks record?")) return;
        // The backend doesn't have delete /marks/:id yet, so we assume it exists or we add it next
        try {
            const res = await fetch(`${API_URL}/marks/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (e) { }
    }

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newMark.title || !uploadFile) {
            return alert("Please enter a title and select a PDF file.");
        }

        setIsSaving(true);
        try {
            // Upload PDF
            const formData = new FormData();
            formData.append('file', uploadFile);
            const uploadRes = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });

            if (!uploadRes.ok) throw new Error("File upload failed");
            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.file_url;

            const res = await fetch(`${API_URL}/marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newMark.title,
                    class_name: newMark.class_name,
                    subject: newMark.subject,
                    term: newMark.term,
                    file_url: fileUrl
                })
            });

            if (res.ok) {
                setShowModal(false);
                setUploadFile(null);
                setNewMark({ ...newMark, title: '' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert("Error saving marks PDF");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredMarks = marks.filter(m =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.term.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FileText size={28} className="text-blue-600" />
                Marks & Results (PDF)
            </h1>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <strong>How it works:</strong> Upload result sheets (PDF format) for specific batches and terms. Students in the Learning Hub will be able to download and view these PDFs to check their marks.
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search marks..."
                        className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
                >
                    <Upload size={16} className="mr-2" /> Upload Results PDF
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Term</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">PDF File</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading marks...</td></tr>
                        ) : filteredMarks.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500 text-sm">No results uploaded yet.</td></tr>
                        ) : filteredMarks.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{m.title || 'Untitled Results'}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.class_name || 'All'}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.subject}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.term}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {m.file_url ? (
                                        <a href={`${API_URL}${m.file_url}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                                            <FileText size={16} /> View PDF
                                        </a>
                                    ) : <span className="text-gray-400 text-xs">No PDF</span>}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-500 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm">
                    <form onSubmit={handleSave} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                            <Upload className="text-blue-500" size={20} /> Upload Results PDF
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2.5 text-sm"
                                    placeholder="e.g. Mid-Term Top 100 Results"
                                    value={newMark.title}
                                    onChange={e => setNewMark({ ...newMark, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Batch / Class</label>
                                    <select
                                        className="w-full rounded-lg border p-2.5 text-sm bg-white"
                                        value={newMark.class_name}
                                        onChange={e => setNewMark({ ...newMark, class_name: e.target.value })}
                                    >
                                        <option value="A/L 2024">A/L 2024</option>
                                        <option value="A/L 2025">A/L 2025</option>
                                        <option value="A/L 2026">A/L 2026</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Term</label>
                                    <select
                                        className="w-full rounded-lg border p-2.5 text-sm bg-white"
                                        value={newMark.term}
                                        onChange={e => setNewMark({ ...newMark, term: e.target.value })}
                                    >
                                        <option value="Mid-Term">Mid-Term</option>
                                        <option value="Final Term">Final Term</option>
                                        <option value="Unit Test">Unit Test</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">PDF Document *</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        ref={fileRef}
                                        onChange={e => setUploadFile(e.target.files[0])}
                                    />
                                    {uploadFile ? (
                                        <div className="text-blue-600 font-semibold flex items-center justify-center gap-2">
                                            <FileText size={20} /> {uploadFile.name}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm">
                                            <span className="block mb-1 text-gray-700 font-medium">Click to select PDF file</span>
                                            Maximum size 10MB
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); setUploadFile(null); }}
                                className="px-5 py-2.5 border rounded-lg hover:bg-gray-50 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !uploadFile}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isSaving ? 'Uploading...' : 'Save Results'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MarksPage;

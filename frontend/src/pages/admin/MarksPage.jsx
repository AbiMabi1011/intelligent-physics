import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, Trash2, Search, Loader2, Upload, FileText, CheckCircle, X, Download } from 'lucide-react';
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
        if (!window.confirm("Delete these results permanently?")) return;
        try {
            const res = await fetch(`${API_URL}/marks/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (e) { }
    }

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newMark.title || !uploadFile) {
            return alert("Title and PDF file are required.");
        }

        setIsSaving(true);
        try {
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
            alert("Error saving results");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredMarks = marks.filter(m =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.term.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <FileText size={32} className="text-[#656CFF]" />
                        Class Results
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Manage and upload student result sheets</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 rounded-2xl bg-[#656CFF] px-6 py-4 text-sm font-black text-white shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:-translate-y-1 active:scale-95"
                >
                    <Upload size={20} /> Upload Results
                </button>
            </div>

            <div className="admin-card p-6 bg-gradient-to-r from-[#656CFF]/5 to-transparent border-l-4 border-l-[#656CFF]">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shrink-0 mt-1">
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">How to upload</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-bold">
                            Upload your class result sheets in <span className="text-[#656CFF]">PDF format</span>. These will be available for students to view in their dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-card p-6 flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[300px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#656CFF] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title or term..."
                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#23262D]">
                        <thead className="bg-white/[0.02]">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Title</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Batch</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Term</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">File Link</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-[#15171C]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 size={32} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading results...</span>
                                    </td>
                                </tr>
                            ) : filteredMarks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-600 uppercase tracking-widest text-[10px] font-black">
                                        No results found matching your search
                                    </td>
                                </tr>
                            ) : filteredMarks.map((mark) => (
                                <tr key={mark.id} className="group hover:bg-white/[0.01] transition-all">
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-white group-hover:text-[#656CFF] transition-colors uppercase tracking-tight">{mark.title}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mark.class_name}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mark.subject}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black text-[#FEBC2E] uppercase tracking-widest">{mark.term}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <a href={mark.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-[#656CFF] bg-[#656CFF]/10 px-3 py-1.5 rounded-lg border border-[#656CFF]/20 hover:bg-[#656CFF] hover:text-white transition-all w-fit">
                                            <Download size={12} /> View File
                                        </a>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button 
                                            onClick={() => handleDelete(mark.id)}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all mx-auto active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-xl rounded-[2.5rem] p-10 relative animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 translate-y-[-12px]" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Upload <span className="text-[#656CFF]">Results</span></h3>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Publish new student results PDF</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Title of Results</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                    placeholder="E.G. MID-TERM PHYSICS UNIT 01"
                                    value={newMark.title}
                                    onChange={(e) => setNewMark({ ...newMark, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Batch</label>
                                    <select
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-xs font-bold text-white focus:border-[#656CFF]/50 outline-none appearance-none"
                                        value={newMark.class_name}
                                        onChange={(e) => setNewMark({ ...newMark, class_name: e.target.value })}
                                    >
                                        <option value="A/L 2026">A/L 2026</option>
                                        <option value="A/L 2025">A/L 2025</option>
                                        <option value="A/L 2027">A/L 2027</option>
                                        <option value="Revision 2025">Revision 2025</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Exam Term</label>
                                    <select
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-xs font-bold text-white focus:border-[#656CFF]/50 outline-none appearance-none"
                                        value={newMark.term}
                                        onChange={(e) => setNewMark({ ...newMark, term: e.target.value })}
                                    >
                                        <option value="Mid-Term">Mid-Term</option>
                                        <option value="Final Term">Final Term</option>
                                        <option value="Monthly Test">Monthly Test</option>
                                        <option value="Unit Test">Unit Test</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">PDF Result Sheet</label>
                                <div 
                                    onClick={() => fileRef.current.click()}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white/[0.02] ${uploadFile ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#23262D]'}`}
                                >
                                    {uploadFile ? <CheckCircle className="mx-auto text-[#10B981] mb-2" size={32} /> : <Upload className="mx-auto text-slate-700 mb-2" size={32} />}
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{uploadFile ? uploadFile.name : 'Select PDF File'}</p>
                                    <input type="file" ref={fileRef} className="hidden" accept=".pdf" onChange={(e) => setUploadFile(e.target.files[0])} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-[#656CFF] text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                {isSaving ? 'Uploading...' : 'Save Results'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksPage;

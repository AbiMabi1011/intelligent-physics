import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Upload, Search, Download, Trash2,
    Loader2, Plus, X, Eye, CheckCircle, Globe, Lock, Layers
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
        if (!res.ok) throw new Error(`Upload Failed: ${label}`);
        const data = await res.json();
        return data.file_url || data.url;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return alert('Title is required');
        if (!paperFile) return alert('Please select a paper file');
        if (form.selectedBatches.length === 0) return alert('Please select at least one batch');

        setIsSaving(true);
        try {
            const fileUrl = await uploadPdf(paperFile, 'Question Paper');
            let schemeUrl = '';
            if (schemeFile) {
                schemeUrl = await uploadPdf(schemeFile, 'Marking Scheme');
            }
            setUploadProgress('Finishing up...');
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
                throw new Error('Failed to save to database');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Operation failed');
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
        if (!window.confirm('Delete this paper permanently?')) return;
        await fetch(`${API_URL}/papers/${id}`, { method: 'DELETE' });
        fetchPapers();
    };

    const filteredPapers = papers.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const typeColorMap = {
        'Past Paper': 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20',
        'FWC Paper': 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
        'Model Paper': 'from-[#656CFF]/20 to-[#656CFF]/5 text-[#656CFF] border-[#656CFF]/20',
        'Other': 'from-slate-500/20 to-slate-500/5 text-slate-400 border-slate-500/20',
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Study Materials</h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Manage past papers and marking schemes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 rounded-2xl bg-[#656CFF] px-6 py-4 text-sm font-black text-white shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} /> Upload New Paper
                </button>
            </div>

            {/* Filters */}
            <div className="admin-card p-6 flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[300px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#656CFF] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by paper title or subject..."
                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-4 pl-14 pr-6 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Papers</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider">{papers.length} Files</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Loading materials...</span>
                </div>
            ) : filteredPapers.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-[#23262D] rounded-[3rem] bg-white/[0.01]">
                    <FileText className="mx-auto text-slate-800 mb-6 opacity-30" size={64} />
                    <h4 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-2">No Papers Found</h4>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Upload your first paper to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPapers.map((paper) => (
                        <div key={paper.id} className="admin-card group hover:scale-[1.02] active:scale-95 transition-all p-8 flex flex-col justify-between bg-[#15171C] border-[#23262D] relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[60px] rounded-full translate-x-12 translate-y-[-12px]" />
                             
                             <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`px-4 py-2 bg-gradient-to-br ${typeColorMap[paper.paper_type] || typeColorMap['Other']} rounded-xl border text-[9px] font-black uppercase tracking-widest`}>
                                        {paper.paper_type}
                                    </div>
                                    <button 
                                        onClick={() => deletePaper(paper.id)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3 truncate group-hover:text-[#656CFF] transition-colors">{paper.title}</h4>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-2 mb-8"><Layers size={14} /> {paper.class_name}</p>

                                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-white/5">
                                    <a 
                                        href={paper.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="h-12 w-full flex items-center justify-center gap-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#656CFF] hover:bg-[#656CFF] hover:text-white transition-all shadow-xl group-active:scale-95"
                                    >
                                        <Download size={14} /> Question Paper
                                    </a>
                                    {paper.scheme_url && (
                                        <a 
                                            href={paper.scheme_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="h-12 w-full flex items-center justify-center gap-3 bg-[#10B981]/10 border border-[#10B981]/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#10B981] hover:bg-[#10B981] hover:text-white transition-all shadow-xl group-active:scale-95"
                                        >
                                            <CheckCircle size={14} /> Marking Scheme
                                        </a>
                                    )}
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetModal} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-3xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/10 blur-[80px] rounded-full -translate-y-12 translate-x-12" />
                        
                        <div className="flex items-center justify-between mb-12">
                             <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Upload <span className="text-[#656CFF]">Paper</span></h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">New study material distribution</p>
                             </div>
                             <button onClick={resetModal} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                                 <X size={24} />
                             </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Paper Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                            placeholder="E.G. PHYSICS A/L 2023"
                                            value={form.title}
                                            onChange={e => setForm({...form, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Paper Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Past Paper', 'FWC Paper', 'Model Paper', 'Other'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setForm({...form, paper_type: type})}
                                                    className={`px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        form.paper_type === type 
                                                        ? 'bg-[#656CFF] border-[#656CFF] text-white shadow-xl' 
                                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Target Batches</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[{ id: 'kh', name: 'Knowledge Hub' }, ...batches].map(batch => (
                                                <button
                                                    key={batch.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = form.selectedBatches;
                                                        const next = current.includes(batch.name)
                                                            ? current.filter(b => b !== batch.name)
                                                            : [...current, batch.name];
                                                        setForm({...form, selectedBatches: next});
                                                    }}
                                                    className={`px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        form.selectedBatches.includes(batch.name)
                                                        ? 'bg-[#FEBC2E] border-[#FEBC2E] text-black shadow-xl'
                                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                                                    }`}
                                                >
                                                    {batch.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Upload Question Paper (PDF)</label>
                                        <div 
                                            onClick={() => paperInputRef.current.click()}
                                            className={`p-10 border-2 border-dashed rounded-[2rem] text-center cursor-pointer transition-all ${paperFile ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#23262D] bg-white/[0.02] hover:border-[#656CFF]/50'}`}
                                        >
                                            {paperFile ? <CheckCircle className="mx-auto text-[#10B981] mb-3" size={32} /> : <Upload className="mx-auto text-slate-700 mb-3" size={32} />}
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{paperFile ? paperFile.name : 'Select PDF'}</p>
                                            <input type="file" ref={paperInputRef} className="hidden" accept=".pdf" onChange={e => setPaperFile(e.target.files[0])} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Upload Marking Scheme (Optional PDF)</label>
                                        <div 
                                            onClick={() => schemeInputRef.current.click()}
                                            className={`p-10 border-2 border-dashed rounded-[2rem] text-center cursor-pointer transition-all ${schemeFile ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#23262D] bg-white/[0.02] hover:border-[#656CFF]/50'}`}
                                        >
                                            {schemeFile ? <CheckCircle className="mx-auto text-[#10B981] mb-3" size={32} /> : <Upload className="mx-auto text-slate-700 mb-3" size={32} />}
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{schemeFile ? schemeFile.name : 'Select PDF'}</p>
                                            <input type="file" ref={schemeInputRef} className="hidden" accept=".pdf" onChange={e => setSchemeFile(e.target.files[0])} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                {uploadProgress && (
                                    <div className="flex items-center gap-3 text-sm font-black text-[#656CFF] animate-pulse">
                                        <Loader2 size={18} className="animate-spin" /> {uploadProgress}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="h-16 w-full bg-[#656CFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : 'Upload Now'}
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

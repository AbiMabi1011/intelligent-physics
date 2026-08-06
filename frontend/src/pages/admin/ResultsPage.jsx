import React, { useState, useEffect } from 'react';
import {
    BarChart,
    PieChart,
    Download,
    Search,
    ChevronDown,
    Loader2,
    Database,
    Target,
    Activity,
    Users,
    ChevronRight,
    Trophy,
    TrendingUp,
    ShieldCheck,
    X,
    AlertTriangle,
    Monitor,
    Globe,
    Clock,
    Cpu
} from 'lucide-react';
import { API_URL } from '../../config';

const ResultsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamFilter, setSelectedExamFilter] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/results`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique Exam / Quiz Names for Category Filtering
    const examCategories = Array.from(
        new Set(results.map(r => r.quiz?.title).filter(Boolean))
    ).sort();

    // Filter results strictly by Exam Name & Search Term
    const filteredResults = results.filter(r => {
        const matchesCategory = !selectedExamFilter || r.quiz?.title === selectedExamFilter;
        const matchesSearch = !searchTerm || (
            r.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.quiz?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesCategory && matchesSearch;
    });

    // Average score dynamically calculated for currently active category
    const categoryResults = selectedExamFilter ? results.filter(r => r.quiz?.title === selectedExamFilter) : results;
    const averageScore = categoryResults.length > 0
        ? (categoryResults.reduce((acc, r) => acc + (r.score / (r.total_questions || 1)), 0) / categoryResults.length * 100).toFixed(1)
        : 0;

    const getRank = (r) => {
        const sameQuizResults = results.filter(item => item.quiz_id === r.quiz_id || item.quiz?.id === r.quiz?.id || item.quiz?.title === r.quiz?.title);
        const higherScoresCount = sameQuizResults.filter(item => item.score > r.score).length;
        return {
            rank: higherScoresCount + 1,
            total: sameQuizResults.length
        };
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <Activity size={32} className="text-[#10B981]" /> Exam Results
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic text-wrap">
                        View and manage all student quiz scores categorized strictly by exam title
                    </p>
                </div>
                <button onClick={fetchResults} className="w-full lg:w-auto h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl px-10 transition-all border border-white/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl">
                    <TrendingUp size={18} className="text-[#10B981]" /> Refresh Results
                </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 admin-card group p-8 bg-gradient-to-br from-[#10B981]/10 to-transparent flex flex-col justify-between h-56 transition-all duration-500 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em] mb-1">
                                {selectedExamFilter ? `Average Score (${selectedExamFilter})` : 'Overall Average Score'}
                            </p>
                            <h3 className="text-5xl font-black text-white tracking-tighter italic">{averageScore}%</h3>
                         </div>
                         <div className="h-16 w-16 rounded-3xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shadow-2xl shadow-[#10B981]/20 group-hover:scale-110 transition-transform duration-700">
                             <Trophy size={32} />
                         </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Performance Distribution</span>
                            <span className="text-xs font-black text-[#10B981]">{averageScore}% Average</span>
                        </div>
                        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-1000 shadow-[0_0_15px_#10B981]" style={{ width: `${averageScore}%` }} />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 admin-card p-8 flex flex-col justify-center h-56 transition-all duration-500 hover:scale-[1.02]">
                    <div className="flex items-center gap-5 mb-4">
                        <div className="h-14 w-14 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                            <Target size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {selectedExamFilter ? 'Category Attempts' : 'Total Attempts'}
                            </p>
                            <p className="text-4xl font-black text-white leading-none tracking-tighter mt-1">{filteredResults.length}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-widest">
                        {selectedExamFilter ? `Submissions recorded for "${selectedExamFilter}"` : 'All student submissions across all exams.'}
                    </p>
                </div>
            </div>

            {/* EXAM CATEGORY & NAME FILTER BAR */}
            <div className="bg-[#15171C] border border-[#23262D] rounded-[2rem] p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Database size={18} className="text-[#656CFF]" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Filter by Exam Category</h3>
                    </div>
                    {selectedExamFilter && (
                        <button
                            onClick={() => setSelectedExamFilter('')}
                            className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                            <X size={12} /> Clear Exam Filter
                        </button>
                    )}
                </div>

                {/* Horizontal Category Pill Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => setSelectedExamFilter('')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                            !selectedExamFilter
                                ? 'bg-[#656CFF] text-white border-[#656CFF] shadow-lg shadow-[#656CFF]/30'
                                : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                        }`}
                    >
                        All Exams ({results.length})
                    </button>
                    {examCategories.map((title) => {
                        const count = results.filter(r => r.quiz?.title === title).length;
                        return (
                            <button
                                key={title}
                                onClick={() => setSelectedExamFilter(title)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                                    selectedExamFilter === title
                                        ? 'bg-[#10B981] text-white border-[#10B981] shadow-lg shadow-[#10B981]/30'
                                        : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {title} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Search Section */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#656CFF] transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by student name or email..."
                    className="w-full bg-[#15171C] border border-[#23262D] rounded-[2rem] pl-16 pr-8 py-5 text-sm font-black text-white placeholder:text-slate-600 focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981]/50 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Results List */}
            <div className="table-container animate-slide-up bg-transparent border-dashed">
                <table className="table-base">
                    <thead>
                        <tr className="bg-white/2">
                            <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#656CFF]">Student</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#656CFF]">Quiz Title</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#656CFF]">Score</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#656CFF]">Rank</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#656CFF]">Date Submitted</th>
                            <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#656CFF]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-10 py-24 text-center">
                                    <Loader2 size={40} className="animate-spin mx-auto text-[#656CFF] mb-4" />
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Loading Results...</span>
                                </td>
                            </tr>
                        ) : filteredResults.map((r) => (
                            <tr key={r.id} onClick={() => setSelectedResult(r)} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-5">
                                        <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] text-xs font-black transition-transform group-hover:scale-110">
                                            {r.student.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white leading-tight group-hover:text-[#656CFF] transition-colors">{r.student.full_name}</p>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1 italic">{r.student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{r.quiz.title}</span>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">{r.quiz.batch_name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-1.5 w-24 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                             <div className="h-full bg-[#10B981] shadow-[0_0_10px_#10B981]" style={{ width: `${(r.score / r.total_questions) * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-white italic">{r.score}/{r.total_questions}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {(() => {
                                        const { rank, total } = getRank(r);
                                        return (
                                            <span className="text-xs font-black text-white italic">
                                                Rank: <span className="text-[#10B981] font-black">{rank}</span>/{total}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(r.timestamp || r.created_at).toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedResult(r); }} className="h-10 w-10 rounded-xl bg-white/5 text-slate-500 hover:bg-[#656CFF]/10 hover:text-[#656CFF] transition-all group-hover:scale-110 active:scale-95 shadow-xl">
                                        <ChevronRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ══ SESSION PROCTORING DETAILS MODAL ══ */}
            {selectedResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        style={{ background: '#0D0E18' }}>
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between"
                            style={{ background: 'linear-gradient(135deg, #131424, #0D0E18)' }}>
                            <div>
                                <p className="text-[10px] font-black text-[#656CFF] uppercase tracking-[0.25em]">Security & Integrity Report</p>
                                <h3 className="text-lg font-black text-white mt-1">
                                    {selectedResult.student.full_name}'s Exam Session
                                </h3>
                            </div>
                            <button onClick={() => setSelectedResult(null)}
                                className="h-10 w-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scroll Container */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            
                            {/* Device & Connection Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-white/5 bg-[#090A10]/60 space-y-3">
                                    <div className="flex items-center gap-2.5 text-[#10B981]">
                                        <Globe size={18} />
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Connection</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500">IP Address</p>
                                        <p className="text-sm font-bold text-slate-200">
                                            {selectedResult.session?.ip_address || "Unknown / Logged-out Submission"}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl border border-white/5 bg-[#090A10]/60 space-y-3">
                                    <div className="flex items-center gap-2.5 text-[#656CFF]">
                                        <Cpu size={18} />
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Device fingerprint</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500">Timezone & Screen Details</p>
                                        <p className="text-xs text-slate-300 truncate" title={selectedResult.session?.device_fingerprint}>
                                            {selectedResult.session?.device_fingerprint 
                                                ? selectedResult.session.device_fingerprint.split('|').slice(1).join(' | ') 
                                                : "No Device Fingerprint Captured"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Session Times & Duration */}
                            <div className="p-4 rounded-2xl border border-white/5 bg-[#090A10]/60 flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Started At</p>
                                        <p className="text-xs font-bold text-slate-200 mt-0.5">
                                            {selectedResult.session?.started_at 
                                                ? new Date(selectedResult.session.started_at).toLocaleString() 
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Submitted At</p>
                                        <p className="text-xs font-bold text-slate-200 mt-0.5">
                                            {selectedResult.session?.submitted_at 
                                                ? new Date(selectedResult.session.submitted_at).toLocaleString() 
                                                : new Date(selectedResult.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-white/5 border border-white/8 rounded-xl text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Duration Taken</p>
                                    <p className="text-xs font-mono font-black text-white mt-0.5">
                                        {(() => {
                                            if (!selectedResult.session?.started_at) return "N/A";
                                            const start = new Date(selectedResult.session.started_at);
                                            const end = selectedResult.session.submitted_at 
                                                ? new Date(selectedResult.session.submitted_at) 
                                                : new Date(selectedResult.created_at);
                                            const diffSec = Math.floor((end - start) / 1000);
                                            if (isNaN(diffSec) || diffSec < 0) return "N/A";
                                            const mins = Math.floor(diffSec / 60);
                                            const secs = diffSec % 60;
                                            return `${mins}m ${secs}s`;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* Proctoring Violations Log list */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                    <span>Session Violations Logs</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 rounded">
                                        Total: {selectedResult.violations?.length || 0}
                                    </span>
                                </h4>

                                {(!selectedResult.violations || selectedResult.violations.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.02]">
                                        <ShieldCheck size={36} className="text-emerald-500 mb-3" />
                                        <p className="text-sm font-bold text-emerald-400">Shield Clean</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">No exam violations were logged for this session</p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-white/5 bg-[#090A10]/60 overflow-hidden">
                                        <div className="max-h-56 overflow-y-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-white/5 border-b border-white/5 text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                                                        <th className="px-4 py-3">Time</th>
                                                        <th className="px-4 py-3">Violation Type</th>
                                                        <th className="px-4 py-3 text-center">Trigger Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-xs">
                                                    {selectedResult.violations.map((v) => {
                                                        const labelMap = {
                                                            tab_switch: "Tab/Window Switch",
                                                            window_blur: "Window Focus Loss",
                                                            exit_fullscreen: "Exited Fullscreen",
                                                            devtools_shortcut: "DevTools Shortcut Attempt",
                                                            mouse_leave: "Cursor Left Screen",
                                                            window_resize: "Window Resized"
                                                        };
                                                        return (
                                                            <tr key={v.id} className="hover:bg-white/[0.01]">
                                                                <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                                                                    {new Date(v.timestamp).toLocaleTimeString()}
                                                                </td>
                                                                <td className="px-4 py-3 font-bold text-red-400">
                                                                    {labelMap[v.violation_type] || v.violation_type}
                                                                </td>
                                                                <td className="px-4 py-3 text-center font-mono font-black text-slate-200">
                                                                    {v.violation_count}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/8 bg-[#090A10]/60 flex justify-end">
                            <button onClick={() => setSelectedResult(null)}
                                className="px-6 py-2.5 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsPage;

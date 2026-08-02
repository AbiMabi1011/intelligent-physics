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
    ShieldCheck
} from 'lucide-react';
import { API_URL } from '../../config';

const ResultsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const filteredResults = results.filter(r =>
        r.student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const averageScore = results.length > 0
        ? (results.reduce((acc, r) => acc + (r.score / r.total_questions), 0) / results.length * 100).toFixed(1)
        : 0;

    const getRank = (r) => {
        const sameQuizResults = results.filter(item => item.quiz_id === r.quiz_id || item.quiz?.id === r.quiz?.id);
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
                        View and manage all student quiz scores and performance
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
                            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em] mb-1">Overall Average Score</p>
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
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Attempts</p>
                            <p className="text-4xl font-black text-white leading-none tracking-tighter mt-1">{results.length}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-widest">All students who have completed a quiz in this session.</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#656CFF] transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, email, or quiz..."
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
                        ) : filteredResults.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-10 py-24 text-center">
                                    <Database size={48} className="mx-auto text-slate-800 mb-4" />
                                    <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No results found.</p>
                                </td>
                            </tr>
                        ) : filteredResults.map((r) => (
                            <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
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
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(r.timestamp).toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <button className="h-10 w-10 rounded-xl bg-white/5 text-slate-500 hover:bg-[#656CFF]/10 hover:text-[#656CFF] transition-all group-hover:scale-110 active:scale-95 shadow-xl">
                                        <ChevronRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsPage;

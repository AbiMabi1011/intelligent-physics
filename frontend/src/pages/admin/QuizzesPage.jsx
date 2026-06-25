import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    Pencil,
    Eye,
    Clock,
    Layers,
    Calendar,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { API_URL } from '../../config';

const QuizzesPage = () => {
    // Mode: 'list', 'create', or 'view'
    const [mode, setMode] = useState('list');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState([]);

    // New Quiz State
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [currentQuizStatus, setCurrentQuizStatus] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [scheduledTime, setScheduledTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [expiryMode, setExpiryMode] = useState('end_time');
    const [expiryDays, setExpiryDays] = useState(1);
    const [questions, setQuestions] = useState([
        { text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Quizzes & Batches
    useEffect(() => {
        fetchQuizzes();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/quizzes`);
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Form Handlers
    const addQuestion = () => {
        setQuestions([...questions, { text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }]);
    };

    const removeQuestion = (index) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const resetForm = () => {
        setMode('list');
        setEditingQuizId(null);
        setCurrentQuizStatus(false);
        setQuizTitle('');
        setSelectedBatches([]);
        setScheduledTime('');
        setDurationMinutes(30);
        setExpiryMode('end_time');
        setExpiryDays(1);
        setQuestions([{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }]);
    };

    const handleEditQuiz = (quiz) => {
        setMode('create');
        setEditingQuizId(quiz.id);
        setCurrentQuizStatus(quiz.is_published);
        setQuizTitle(quiz.title || '');
        setSelectedBatches(quiz.class_name ? quiz.class_name.split(', ') : []);
        setScheduledTime(quiz.scheduled_time || '');
        setDurationMinutes(quiz.duration_minutes || 30);
        setExpiryMode(quiz.expiry_mode || 'end_time');
        setExpiryDays(quiz.expiry_days || 1);
        setQuestions(quiz.questions && quiz.questions.length > 0 ? quiz.questions : [{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }]);
    };

    const handleViewQuiz = (quiz) => {
        setMode('view');
        setQuizTitle(quiz.title || '');
        setSelectedBatches(quiz.class_name ? quiz.class_name.split(', ') : []);
        setScheduledTime(quiz.scheduled_time || '');
        setDurationMinutes(quiz.duration_minutes || 30);
        setExpiryMode(quiz.expiry_mode || 'end_time');
        setExpiryDays(quiz.expiry_days || 1);
        setQuestions(quiz.questions || []);
    };

    const handleSaveQuiz = async () => {
        if (!quizTitle) return alert("Quiz Title is required");
        if (selectedBatches.length === 0) return alert("Please select at least one batch");
        if (questions.length === 0) return alert("Add at least one question");

        setIsSubmitting(true);
        const payload = {
            title: quizTitle,
            description: "Generated Quiz",
            class_name: selectedBatches.join(', '),
            is_published: editingQuizId ? currentQuizStatus : false,
            scheduled_time: scheduledTime || null,
            duration_minutes: durationMinutes,
            expiry_mode: expiryMode,
            expiry_days: expiryDays,
            questions: questions
        };

        try {
            const endpoint = editingQuizId ? `${API_URL}/quizzes/${editingQuizId}` : `${API_URL}/quizzes`;
            const method = editingQuizId ? 'PUT' : 'POST';
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingQuizId ? "Quiz Updated Successfully!" : "Quiz Saved Successfully!");
                resetForm();
                fetchQuizzes();
            } else {
                alert("Failed to save quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const publishQuiz = async (quizId) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${quizId}/publish`, { method: 'PUT' });
            if (res.ok) {
                alert("Quiz Published!");
                fetchQuizzes();
            } else {
                alert("Failed to publish quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error publishing quiz");
        }
    };

    const deleteQuiz = async (id) => {
        if (!window.confirm("Delete this quiz permanently?")) return;
        try {
            const res = await fetch(`${API_URL}/quizzes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchQuizzes();
        } catch (e) { }
    };

    if (mode === 'create') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">{editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Set up your quiz details and questions</p>
                    </div>
                    <button onClick={resetForm} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
                </div>

                <div className="admin-card p-10 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Quiz Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none"
                                    placeholder="e.g. Thermodynamics Mastery Test"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Duration (Min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none transition-all"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Batches</label>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-[#0D0E12] border border-[#23262D] rounded-2xl max-h-[160px] overflow-y-auto custom-scrollbar">
                                    {batches.map(b => (
                                        <label key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedBatches.includes(b.name) ? 'bg-[#656CFF]/10 border-[#656CFF]/50 text-[#656CFF]' : 'bg-transparent border-[#23262D] text-slate-500 hover:border-slate-700'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedBatches.includes(b.name)}
                                                onChange={e => {
                                                    const arr = selectedBatches;
                                                    if (e.target.checked) setSelectedBatches([...arr, b.name]);
                                                    else setSelectedBatches(arr.filter(x => x !== b.name));
                                                }}
                                            />
                                            <span className="text-[11px] font-black uppercase tracking-tight">{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Quiz Availability</label>
                                <select
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none appearance-none"
                                    value={expiryMode}
                                    onChange={(e) => setExpiryMode(e.target.value)}
                                >
                                    <option value="end_time">Standard (Ends at time)</option>
                                    <option value="one_day">Extend 1 Day</option>
                                    <option value="custom_days">Custom Days</option>
                                    <option value="never">No Expiry</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-white tracking-tight">Questions</h2>
                        <span className="text-xs font-black text-[#656CFF] bg-[#656CFF]/10 px-3 py-1.5 rounded-full uppercase tracking-widest">{questions.length} Items</span>
                    </div>

                    <div className="grid gap-6">
                        {questions.map((q, idx) => (
                            <div key={idx} className="admin-card p-8 group relative border-l-4 border-l-[#656CFF]">
                                <div className="absolute top-6 right-6">
                                    <button onClick={() => removeQuestion(idx)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-8 bg-[#656CFF]/10 text-[#656CFF] flex items-center justify-center rounded-lg font-black text-xs">
                                        Q{idx + 1}
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest opacity-80">Question Content</h3>
                                </div>

                                <div className="space-y-6">
                                    <textarea
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-4 px-6 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#656CFF]/20 transition-all outline-none"
                                        placeholder="Enter your question here..."
                                        rows="3"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                    ></textarea>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {['a', 'b', 'c', 'd', 'e'].map(opt => (
                                            <div key={opt} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{`Option ${opt.toUpperCase()}`}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all"
                                                    value={q[`option_${opt}`]}
                                                    onChange={(e) => updateQuestion(idx, `option_${opt}`, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Correct Answer</label>
                                            <div className="flex bg-[#0D0E12] p-1 rounded-xl border border-[#23262D]">
                                                {['A', 'B', 'C', 'D', 'E'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => updateQuestion(idx, 'correct_option', opt)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${q.correct_option === opt ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addQuestion}
                            className="bg-white/5 border-2 border-dashed border-[#23262D] rounded-[2rem] p-10 text-center hover:bg-[#656CFF]/10 hover:border-[#656CFF]/50 transition-all group active:scale-[0.98]"
                        >
                            <Plus className="mx-auto text-slate-600 group-hover:text-[#656CFF] mb-3 transition-colors" size={32} />
                            <span className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">Append New Question Instance</span>
                        </button>
                    </div>
                </div>

                <div className="pt-10 flex justify-end gap-4">
                    <button onClick={handleSaveQuiz} disabled={isSubmitting} className="h-16 bg-[#656CFF] text-white rounded-2xl px-12 font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50">
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        {isSubmitting ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 italic italic">
                        <Layers size={32} className="text-[#656CFF]" /> All Quizzes
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
                        Create and manage your student quizzes
                    </p>
                </div>
                <button
                    onClick={() => setMode('create')}
                    className="h-14 bg-[#656CFF] text-white rounded-2xl px-10 font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} /> Create Quiz
                </button>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#656CFF] mb-4" size={40} />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Loading Quizzes...</span>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-[#23262D] rounded-[3rem] bg-white/[0.01]">
                    <Layers className="mx-auto text-slate-800 mb-6 opacity-30" size={64} />
                    <h4 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-2">No Quizzes Found</h4>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Create your first quiz to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {quizzes.map((q) => (
                        <div key={q.id} className="admin-card group p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-[#656CFF]/30 transition-all bg-[#15171C]">
                            <div className="flex items-center gap-8 w-full flex-1">
                                <div className="h-16 w-16 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Clock size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[9px] font-black text-[#656CFF] uppercase tracking-[0.3em]">{q.class_name}</span>
                                        <div className={`h-1.5 w-1.5 rounded-full ${q.is_published ? 'bg-[#10B981]' : 'bg-slate-700'}`} />
                                    </div>
                                    <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight mb-2 truncate group-hover:text-[#656CFF] transition-colors">{q.title}</h4>
                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <Calendar size={12} /> {new Date(q.scheduled_time).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <Clock size={12} /> {q.duration_minutes} Min
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                 {!q.is_published && (
                                     <button onClick={() => publishQuiz(q.id)} className="h-12 px-6 flex items-center gap-3 rounded-2xl bg-[#10B981]/10 text-[#10B981] text-[9px] font-black uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-all shadow-xl">
                                         <CheckCircle size={16} /> Publish Now
                                     </button>
                                 )}
                                 <button onClick={() => handleEditQuiz(q)} className="h-12 w-12 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                                     <Pencil size={20} />
                                 </button>
                                 <button onClick={() => deleteQuiz(q.id)} className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl">
                                     <Trash2 size={20} />
                                 </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizzesPage;

import React, { useState, useEffect, useRef } from 'react';
import {
    Clock, Flag, Grid3X3, X, Check, Zap, Eye, RotateCcw,
    Trophy, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight,
    BookOpen, Target, TrendingUp, Award, Maximize2, ShieldCheck,
    BarChart2, Star
} from 'lucide-react';

export default function AdvancedQuizPortal({
    currentQuiz,
    answers,
    setAnswers,
    timeLeft,
    quizResult,
    handleSubmit,
    setCurrentQuiz,
    setQuizResult,
    API_URL,
    logo,
    studentEmail = '',
    studentName = '',
    sessionToken = '',
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flagged, setFlagged] = useState({});
    const [showPalette, setShowPalette] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [expandedImg, setExpandedImg] = useState(null);
    const [violationCount, setViolationCount] = useState(0);
    const [showViolationWarning, setShowViolationWarning] = useState(false);
    const [violationWarningMsg, setViolationWarningMsg] = useState('');
    const mainRef = useRef(null);
    const violationCountRef = useRef(0);

    const questions = currentQuiz?.questions || [];
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;
    const unansweredCount = totalCount - answeredCount;
    const flaggedCount = Object.keys(flagged).filter(k => flagged[k]).length;
    const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

    const isWarning = timeLeft != null && timeLeft <= 120;
    const isDanger = timeLeft != null && timeLeft <= 30;

    const formatTime = (s) => {
        if (s == null) return '∞';
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const getImgSrc = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${API_URL}${url}`;
    };

    const goTo = (idx) => {
        setCurrentIndex(Math.max(0, Math.min(totalCount - 1, idx)));
        if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fullscreen mode requirement removed as requested

    // Keyboard navigation and shortcut blocking (F12, Ctrl+U, Ctrl+Shift+I, etc.)
    useEffect(() => {
        const onKey = (e) => {
            const isCtrlShiftI = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i';
            const isCtrlShiftJ = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j';
            const isCtrlShiftC = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c';
            const isCtrlU = e.ctrlKey && e.key.toLowerCase() === 'u';
            const isCtrlS = e.ctrlKey && e.key.toLowerCase() === 's';
            const isF12 = e.key === 'F12' || e.keyCode === 123;

            if (isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlU || isCtrlS || isF12) {
                e.preventDefault();
                e.stopPropagation();
                reportViolation('devtools_shortcut');
                return;
            }

            if (showSubmitModal || showExitModal || expandedImg || quizResult || showViolationWarning) return;
            if (e.key === 'ArrowRight') goTo(currentIndex + 1);
            else if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
            else if (e.key.toLowerCase() === 'f' && currentQ) setFlagged(p => ({ ...p, [currentQ.id]: !p[currentQ.id] }));
            else if (['1', '2', '3', '4', '5'].includes(e.key) && currentQ) {
                const opt = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' }[e.key];
                setAnswers(p => ({ ...p, [currentQ.id]: opt }));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentIndex, currentQ, showSubmitModal, showExitModal, expandedImg, quizResult, showViolationWarning]);

    // ── PROCTORING: Report violation to admin ──
    const reportViolation = (type) => {
        if (quizResult) return; // Don't report after exam is done
        violationCountRef.current += 1;
        const count = violationCountRef.current;
        setViolationCount(count);
        try {
            fetch(`${API_URL}/quizzes/violation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_email: studentEmail,
                    student_name: studentName,
                    quiz_title: currentQuiz?.title || 'Unknown Quiz',
                    quiz_id: currentQuiz?.id,
                    violation_type: type,
                    violation_count: count,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (_) {}
    };

    // ── 1. beforeunload: block tab close / page refresh / URL change ──
    useEffect(() => {
        if (quizResult) return;
        const handler = (e) => {
            reportViolation('beforeunload');
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [quizResult, currentQuiz]);

    // ── 2. popstate: neutralise browser back button ──
    useEffect(() => {
        if (quizResult) return;
        window.history.pushState({ examActive: true }, '', window.location.href);
        const handler = () => {
            reportViolation('back_button');
            window.history.pushState({ examActive: true }, '', window.location.href);
        };
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, [quizResult, currentQuiz]);

    // ── 3. visibilitychange: detect tab switch or minimizing browser ──
    useEffect(() => {
        if (quizResult) return;
        const handleVisibilityChange = () => {
            if (document.hidden) {
                reportViolation('tab_switch');
                setViolationWarningMsg('Switching tabs, minimizing the browser, or switching applications is strictly prohibited.');
                setShowViolationWarning(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [quizResult, currentQuiz]);

    // ── 5. resize: detect split screen / resize attempts ──
    useEffect(() => {
        if (quizResult) return;
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                reportViolation('window_resize');
                setViolationWarningMsg('Resizing the exam window or splitting your screen is strictly prohibited.');
                setShowViolationWarning(true);
            }, 500);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [quizResult, currentQuiz]);

    // ── 6. Block copy, cut, paste, and right-click context menu ──
    useEffect(() => {
        if (quizResult || !currentQuiz) return;
        const preventDefault = (e) => e.preventDefault();
        window.addEventListener('contextmenu', preventDefault);
        window.addEventListener('copy', preventDefault);
        window.addEventListener('cut', preventDefault);
        window.addEventListener('paste', preventDefault);
        return () => {
            window.removeEventListener('contextmenu', preventDefault);
            window.removeEventListener('copy', preventDefault);
            window.removeEventListener('cut', preventDefault);
            window.removeEventListener('paste', preventDefault);
        };
    }, [quizResult, currentQuiz]);

    // ── 7. Periodic progress sync to backend ──
    useEffect(() => {
        if (quizResult || !currentQuiz || !sessionToken) return;
        const syncAnswers = async () => {
            try {
                await fetch(`${API_URL}/quizzes/${currentQuiz.id}/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_email: studentEmail,
                        session_token: sessionToken,
                        answers: answers
                    })
                });
            } catch (e) {
                console.error("Failed to sync answers:", e);
            }
        };
        
        const delay = setTimeout(syncAnswers, 1500);
        return () => clearTimeout(delay);
    }, [answers, quizResult, currentQuiz, sessionToken, studentEmail]);


    /* ═══════════════════════════════════════════════════
       RESULT SCREEN
    ═══════════════════════════════════════════════════ */
    if (quizResult) {
        const pct = quizResult.percentage ?? ((quizResult.score / (quizResult.total || 1)) * 100);
        const passed = pct >= 50;
        const grade = pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
        const gradeColor = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444';

        return (
            <div className="min-h-screen bg-[#06070E] text-white flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full"
                        style={{ background: `radial-gradient(ellipse, ${passed ? '#10B981' : '#EF4444'}18 0%, transparent 70%)` }} />
                </div>

                {/* Header */}
                <header className="relative z-20 border-b border-white/8 bg-[#06070E]/95 backdrop-blur-2xl px-6 md:px-10 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-white/10 shrink-0">
                            <img src={logo} alt="IP" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Intelligent Physics</p>
                            <p className="text-sm font-bold text-white truncate max-w-xs">{currentQuiz.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setCurrentQuiz(null); setQuizResult(null); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #656CFF, #4F46E5)' }}
                    >
                        <RotateCcw size={13} /> Return to Portal
                    </button>
                </header>

                <main className="flex-1 relative z-10 px-4 md:px-10 py-10 max-w-5xl mx-auto w-full space-y-8">
                    {/* Score Hero */}
                    <div className="rounded-3xl border border-white/10 overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #0E0F18, #11131E)' }}>
                        <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-10">
                            {/* Grade Badge */}
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-6xl font-black border-2 shadow-2xl"
                                    style={{ background: `${gradeColor}18`, borderColor: `${gradeColor}40`, color: gradeColor, boxShadow: `0 0 60px ${gradeColor}25` }}>
                                    {grade}
                                </div>
                                <span className="mt-3 text-xs font-bold uppercase tracking-widest" style={{ color: gradeColor }}>
                                    {passed ? 'Excellent Work' : 'Needs Improvement'}
                                </span>
                            </div>

                            {/* Score details */}
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Exam Score</p>
                                <div className="text-7xl md:text-8xl font-black leading-none mb-4" style={{ color: gradeColor }}>
                                    {pct.toFixed(1)}<span className="text-4xl text-slate-400">%</span>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    You scored <span className="text-white font-bold text-base">{quizResult.score}</span> out of{' '}
                                    <span className="text-white font-bold text-base">{quizResult.total}</span> marks
                                </p>

                                {/* Progress bar */}
                                <div className="mt-5 h-2.5 bg-white/8 rounded-full overflow-hidden max-w-sm mx-auto md:mx-0">
                                    <div className="h-full rounded-full transition-all duration-1000 delay-300"
                                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}88)` }} />
                                </div>
                            </div>

                            {/* Rank box */}
                            {quizResult.rank != null && (
                                <div className="shrink-0 text-center p-6 rounded-2xl border border-white/10 min-w-[140px]"
                                    style={{ background: '#0A0B14' }}>
                                    <Trophy size={22} className="text-amber-400 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Your Rank</p>
                                    <p className="text-4xl font-black text-amber-400">#{quizResult.rank}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">of {quizResult.total_participants ?? 0}</p>
                                </div>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-4 border-t border-white/8">
                            {[
                                { label: 'Total Questions', value: totalCount, icon: <BookOpen size={14} />, color: '#656CFF' },
                                { label: 'Answered', value: answeredCount, icon: <Check size={14} />, color: '#10B981' },
                                { label: 'Skipped', value: unansweredCount, icon: <AlertTriangle size={14} />, color: '#F59E0B' },
                                { label: 'Flagged', value: flaggedCount, icon: <Flag size={14} />, color: '#EF4444' },
                            ].map((s, i) => (
                                <div key={i} className={`px-4 py-5 text-center ${i < 3 ? 'border-r border-white/8' : ''}`}>
                                    <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: s.color }}>
                                        {s.icon}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
                                    </div>
                                    <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       ACTIVE EXAM SCREEN
    ═══════════════════════════════════════════════════ */
    const getQStatus = (q, idx) => {
        if (idx === currentIndex) return 'active';
        if (flagged[q.id]) return 'flagged';
        if (answers[q.id]) return 'answered';
        return 'unanswered';
    };

    const statusStyle = {
        active:     { bg: '#656CFF', border: '#656CFF', text: '#FFFFFF' },
        answered:   { bg: '#10B98120', border: '#10B98160', text: '#6EE7B7' },
        flagged:    { bg: '#F59E0B20', border: '#F59E0B60', text: '#FCD34D' },
        unanswered: { bg: '#ffffff08', border: '#ffffff15', text: '#475569' },
    };

    return (
        <div className="min-h-screen bg-[#06070E] text-white flex flex-col select-none" style={{ fontFamily: "'Inter', system-ui, sans-serif", userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>

            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full"
                    style={{ background: 'radial-gradient(ellipse, #656CFF14 0%, transparent 70%)' }} />
                {isWarning && (
                    <div className="absolute top-0 right-0 w-[400px] h-[200px] rounded-full"
                        style={{ background: 'radial-gradient(ellipse, #EF444418 0%, transparent 70%)' }} />
                )}
            </div>

            {/* ══ TOP HEADER ══ */}
            <header className="relative z-30 border-b border-white/8 bg-[#06070E]/95 backdrop-blur-2xl px-4 md:px-8 py-0 flex items-stretch" style={{ minHeight: '52px' }}>
                {/* Logo + title */}
                <div className="flex items-center gap-3 flex-1 py-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/10 shrink-0">
                        <img src={logo} alt="IP" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 leading-none">Intelligent Physics · Spark Exam</p>
                        <p className="text-xs font-bold text-white truncate leading-snug mt-0.5">{currentQuiz.title}</p>
                    </div>
                </div>

                {/* Center: Progress micro-bar */}
                <div className="hidden md:flex items-center justify-center px-6 border-x border-white/8">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                            <span style={{ color: '#656CFF' }}>{answeredCount}</span>
                            <span className="text-white/20">/</span>
                            <span>{totalCount}</span>
                            <span className="text-slate-500 ml-1">answered</span>
                        </div>
                        <div className="w-48 h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #656CFF, #10B981)' }} />
                        </div>
                    </div>
                </div>

                {/* Right: Timer + controls */}
                <div className="flex items-center gap-3 py-3 pl-4">
                    {/* Violation badge */}
                    {violationCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-black"
                            style={violationCount >= 3
                                ? { background: '#EF444420', borderColor: '#EF444450', color: '#FCA5A5' }
                                : { background: '#F59E0B18', borderColor: '#F59E0B45', color: '#FCD34D' }}>
                            <AlertCircle size={11} />
                            {violationCount} {violationCount === 1 ? 'violation' : 'violations'}
                        </div>
                    )}

                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-base border transition-all ${isDanger ? 'animate-pulse' : ''}`}
                        style={isDanger
                            ? { background: '#EF444420', borderColor: '#EF444450', color: '#FCA5A5' }
                            : isWarning
                                ? { background: '#F59E0B18', borderColor: '#F59E0B45', color: '#FCD34D' }
                                : { background: '#ffffff0A', borderColor: '#ffffff15', color: '#E2E8F0' }}>
                        <Clock size={15} style={{ color: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#656CFF' }} />
                        {formatTime(timeLeft)}
                    </div>

                    {/* Palette button */}
                    <button onClick={() => setShowPalette(true)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold text-slate-300 hover:text-white transition-all"
                        style={{ background: '#ffffff08', borderColor: '#ffffff15' }}>
                        <Grid3X3 size={15} style={{ color: '#656CFF' }} />
                        <span className="hidden sm:inline">Navigator</span>
                    </button>

                    {/* Exit */}
                    <button onClick={() => setShowExitModal(true)}
                        className="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all"
                        style={{ background: '#EF444412', borderColor: '#EF444430', color: '#F87171' }}>
                        <X size={15} />
                    </button>
                </div>
            </header>

            {/* ══ BODY: sidebar + content ══ */}
            <div className="flex flex-1 overflow-hidden relative z-10">

                {/* ── LEFT SIDEBAR (desktop) ── */}
                <aside className="hidden lg:flex flex-col w-64 border-r border-white/8 bg-[#07080F] overflow-y-auto shrink-0">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/8">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Question Index</p>
                        <div className="flex gap-4 mt-3">
                            {[
                                { label: 'Done', count: answeredCount, color: '#10B981' },
                                { label: 'Flagged', count: flaggedCount, color: '#F59E0B' },
                                { label: 'Pending', count: unansweredCount, color: '#475569' },
                            ].map(s => (
                                <div key={s.label} className="flex flex-col items-center">
                                    <span className="text-lg font-black" style={{ color: s.color }}>{s.count}</span>
                                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 p-4 grid grid-cols-5 gap-1.5 content-start auto-rows-min">
                        {questions.map((q, idx) => {
                            const st = getQStatus(q, idx);
                            const ss = statusStyle[st];
                            return (
                                <button key={q.id}
                                    onClick={() => goTo(idx)}
                                    className="h-10 rounded-xl font-mono font-black text-xs flex flex-col items-center justify-center transition-all border"
                                    style={{ background: ss.bg, borderColor: ss.border, color: ss.text, transform: st === 'active' ? 'scale(1.1)' : undefined, boxShadow: st === 'active' ? '0 0 12px #656CFF50' : undefined }}>
                                    {idx + 1}
                                    {flagged[q.id] && <span style={{ lineHeight: 0, marginTop: '1px', fontSize: '6px', color: '#F59E0B' }}>●</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="px-5 py-4 border-t border-white/8 space-y-2">
                        {[
                            { color: '#656CFF', label: 'Current' },
                            { color: '#10B981', label: 'Answered' },
                            { color: '#F59E0B', label: 'Flagged' },
                            { color: '#475569', label: 'Unanswered' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
                                <span className="text-[10px] text-slate-500 font-medium">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── MAIN QUESTION AREA ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div ref={mainRef} className="flex-1 overflow-y-auto px-3 py-3">

                        {currentQ && (
                            <div className="w-full h-full">
                                {/* ── QUESTION CARD: left/right split ── */}
                                <div className="rounded-2xl border border-white/10 overflow-hidden flex flex-col" style={{ background: 'linear-gradient(145deg, #0D0E18, #0F1020)', minHeight: 'calc(100vh - 140px)' }}>

                                    {/* Top bar: Q number + flag */}
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[11px] text-white"
                                                style={{ background: 'linear-gradient(135deg, #656CFF, #4F46E5)' }}>
                                                {currentIndex + 1}
                                            </span>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                Q {currentIndex + 1}<span className="text-white/20 mx-1">/</span>{totalCount}
                                                <span className="text-white/20 mx-1.5">·</span>
                                                <span className="text-slate-600">1 Mark</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setFlagged(p => ({ ...p, [currentQ.id]: !p[currentQ.id] }))}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-all"
                                            style={flagged[currentQ.id]
                                                ? { background: '#F59E0B20', borderColor: '#F59E0B50', color: '#FCD34D' }
                                                : { background: '#ffffff08', borderColor: '#ffffff15', color: '#64748B' }}>
                                            <Flag size={10} style={flagged[currentQ.id] ? { fill: '#F59E0B', color: '#F59E0B' } : {}} />
                                            {flagged[currentQ.id] ? 'Flagged' : 'Flag'}
                                        </button>
                                    </div>

                                    {/* ── BODY: LEFT question | RIGHT options ── */}
                                    <div className="flex flex-col md:flex-row flex-1 divide-y md:divide-y-0 md:divide-x divide-white/8 min-h-0">

                                        {/* LEFT: Question text + image */}
                                        <div className="md:w-1/2 flex flex-col p-4 gap-3 overflow-y-auto">
                                            <p className="text-sm font-semibold text-slate-100 leading-relaxed">{currentQ.text}</p>

                                            {currentQ.image_url && (
                                                <div className="relative group inline-block rounded-xl overflow-hidden border border-white/10 bg-black/40 self-start">
                                                    <img
                                                        src={getImgSrc(currentQ.image_url)}
                                                        alt="Diagram"
                                                        className="max-h-40 object-contain cursor-zoom-in"
                                                        onClick={() => setExpandedImg(getImgSrc(currentQ.image_url))}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-zoom-in"
                                                        onClick={() => setExpandedImg(getImgSrc(currentQ.image_url))}>
                                                        <Maximize2 size={18} className="text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Keyboard hints inline, bottom of left panel */}
                                            <div className="mt-auto flex items-center gap-3 flex-wrap text-[9px] text-slate-700 font-mono pt-2">
                                                {[['←→', 'Nav'], ['1-5', 'Pick'], ['F', 'Flag']].map(([k, v]) => (
                                                    <span key={k} className="flex items-center gap-1">
                                                        <kbd className="px-1.5 py-0.5 rounded border border-white/8 bg-white/5 text-slate-600">{k}</kbd>
                                                        <span>{v}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* RIGHT: Answer options */}
                                        <div className="md:w-1/2 flex flex-col justify-center p-4 gap-2 overflow-y-auto">
                                            {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                                                const txt = currentQ[`option_${opt.toLowerCase()}`];
                                                const img = currentQ[`option_${opt.toLowerCase()}_image_url`];
                                                if (!txt && !img) return null;
                                                const sel = answers[currentQ.id] === opt;
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setAnswers(p => ({ ...p, [currentQ.id]: opt }))}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 text-left transition-all group active:scale-[0.99]"
                                                        style={sel
                                                            ? { background: '#656CFF15', borderColor: '#656CFF', boxShadow: '0 0 0 3px #656CFF10' }
                                                            : { background: '#ffffff05', borderColor: '#ffffff10' }}>
                                                        {/* Badge */}
                                                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 transition-all"
                                                            style={sel
                                                                ? { background: '#656CFF', color: '#fff' }
                                                                : { background: '#ffffff0F', color: '#64748B' }}>
                                                            {opt}
                                                        </span>
                                                        {/* Text / image */}
                                                        <div className="flex-1 min-w-0">
                                                            {txt && <span className={`text-xs font-medium leading-snug block ${sel ? 'text-white' : 'text-slate-300 group-hover:text-white'} transition-colors`}>{txt}</span>}
                                                            {img && (
                                                                <img src={getImgSrc(img)} alt={`Option ${opt}`}
                                                                    className="mt-1 max-h-16 object-contain rounded-lg border border-white/10 bg-black/30" />
                                                            )}
                                                        </div>
                                                        {/* Radio dot */}
                                                        <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                                            style={sel ? { borderColor: '#656CFF', background: '#656CFF' } : { borderColor: '#ffffff20' }}>
                                                            {sel && <Check size={8} className="text-white" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── BOTTOM DOCK ── */}
                    <div className="border-t border-white/8 bg-[#06070E]/90 backdrop-blur-xl px-3 md:px-6 py-2.5">
                        <div className="max-w-3xl mx-auto flex items-center gap-3">
                            {/* Prev */}
                            <button onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                                style={{ background: '#ffffff08', borderColor: '#ffffff15' }}>
                                <ChevronLeft size={15} />
                                <span className="hidden sm:inline">Prev</span>
                            </button>

                            {/* Submit CTA */}
                            <button onClick={() => setShowSubmitModal(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-[0.99]"
                                style={{ background: 'linear-gradient(135deg, #656CFF 0%, #4F46E5 50%, #10B981 100%)', boxShadow: '0 6px 24px #656CFF25' }}>
                                <Zap size={14} style={{ fill: 'white' }} />
                                Submit Exam · {answeredCount}/{totalCount}
                            </button>

                            {/* Next */}
                            <button onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === totalCount - 1}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                                style={{ background: '#ffffff08', borderColor: '#ffffff15' }}>
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight size={15} />
                            </button>
                        </div>

                        {/* Mobile progress */}
                        <div className="flex items-center justify-center gap-3 mt-1.5 md:hidden text-[10px] text-slate-500 font-mono">
                            <span style={{ color: '#656CFF' }}>{answeredCount}</span>
                            <div className="w-28 h-1 bg-white/8 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#656CFF,#10B981)' }} />
                            </div>
                            <span>{totalCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ PALETTE MODAL ══ */}
            {showPalette && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
                    <div className="w-full max-w-md rounded-3xl border border-white/12 overflow-hidden" style={{ background: '#0D0E18' }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                            <div className="flex items-center gap-3">
                                <Grid3X3 size={18} style={{ color: '#656CFF' }} />
                                <h2 className="text-base font-black text-white">Question Navigator</h2>
                            </div>
                            <button onClick={() => setShowPalette(false)} className="p-2 rounded-xl text-slate-400 hover:text-white" style={{ background: '#ffffff0A' }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Legend row */}
                        <div className="px-6 py-3 border-b border-white/8 flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
                            {[['#656CFF', 'Current'], ['#10B981', 'Answered'], ['#F59E0B', 'Flagged'], ['#475569', 'Unanswered']].map(([c, l]) => (
                                <div key={l} className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm" style={{ background: c }} />
                                    {l}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 grid grid-cols-8 gap-2 max-h-72 overflow-y-auto">
                            {questions.map((q, idx) => {
                                const st = getQStatus(q, idx);
                                const ss = statusStyle[st];
                                return (
                                    <button key={q.id}
                                        onClick={() => { goTo(idx); setShowPalette(false); }}
                                        className="h-10 rounded-xl font-mono font-black text-xs flex items-center justify-center border transition-all"
                                        style={{ background: ss.bg, borderColor: ss.border, color: ss.text, boxShadow: st === 'active' ? '0 0 10px #656CFF50' : undefined }}>
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 border-t border-white/8">
                            {[['Answered', answeredCount, '#10B981'], ['Skipped', unansweredCount, '#F59E0B'], ['Flagged', flaggedCount, '#EF4444']].map(([l, v, c]) => (
                                <div key={l} className="py-4 text-center">
                                    <span className="text-xl font-black" style={{ color: c }}>{v}</span>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ SUBMIT MODAL ══ */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}>
                    <div className="w-full max-w-sm rounded-3xl border border-white/12 overflow-hidden" style={{ background: '#0D0E18' }}>
                        <div className="px-8 py-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                                style={{ background: '#F59E0B18', border: '1px solid #F59E0B40' }}>
                                <ShieldCheck size={30} style={{ color: '#F59E0B' }} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">Submit Exam?</h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Once submitted, your answers cannot be changed. Make sure you've reviewed all questions.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 border-y border-white/8 mx-0">
                            {[['Answered', answeredCount, '#10B981'], ['Skipped', unansweredCount, '#F59E0B'], ['Total', totalCount, '#656CFF']].map(([l, v, c]) => (
                                <div key={l} className="py-5 text-center">
                                    <span className="text-2xl font-black" style={{ color: c }}>{v}</span>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{l}</p>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-5 flex gap-3">
                            <button onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-300"
                                style={{ background: '#ffffff0A', border: '1px solid #ffffff15' }}>
                                Continue
                            </button>
                            <button onClick={() => { setShowSubmitModal(false); handleSubmit(); }}
                                className="flex-1 py-3 rounded-2xl text-sm font-black text-white"
                                style={{ background: 'linear-gradient(135deg, #656CFF, #4F46E5)', boxShadow: '0 4px 20px #656CFF40' }}>
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ EXIT MODAL ══ */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}>
                    <div className="w-full max-w-sm rounded-3xl border border-white/12 overflow-hidden" style={{ background: '#0D0E18' }}>
                        <div className="px-8 py-8 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                                style={{ background: '#EF444418', border: '1px solid #EF444440' }}>
                                <AlertCircle size={26} style={{ color: '#EF4444' }} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">Exit Exam?</h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Your progress will be permanently lost if you leave without submitting.
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowExitModal(false)}
                                className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-300"
                                style={{ background: '#ffffff0A', border: '1px solid #ffffff15' }}>
                                Resume
                            </button>
                            <button onClick={() => { setShowExitModal(false); setCurrentQuiz(null); }}
                                className="flex-1 py-3 rounded-2xl text-sm font-black text-white"
                                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 20px #EF444430' }}>
                                Exit Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ IMAGE LIGHTBOX ══ */}
            {expandedImg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
                    onClick={() => setExpandedImg(null)}>
                    <div className="relative max-w-5xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <img src={expandedImg} alt="Full diagram"
                            className="max-h-[85vh] max-w-full object-contain rounded-2xl border border-white/15" />
                        <button onClick={() => setExpandedImg(null)}
                            className="absolute -top-4 -right-4 w-9 h-9 rounded-full flex items-center justify-center text-white"
                            style={{ background: '#656CFF' }}>
                            <X size={17} />
                        </button>
                    </div>
                </div>
            )}

            {/* ══ VIOLATION WARNING OVERLAY ══ */}
            {showViolationWarning && !quizResult && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(20px)' }}>
                    <div className="w-full max-w-md rounded-3xl border overflow-hidden"
                        style={{ background: '#0D0E18', borderColor: violationCount >= 3 ? '#EF444440' : '#F59E0B40' }}>

                        {/* Red/amber top stripe */}
                        <div className="h-1.5 w-full"
                            style={{ background: violationCount >= 3 ? '#EF4444' : '#F59E0B' }} />

                        <div className="px-8 py-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                                style={violationCount >= 3
                                    ? { background: '#EF444418', border: '2px solid #EF444450' }
                                    : { background: '#F59E0B18', border: '2px solid #F59E0B50' }}>
                                <AlertTriangle size={30} style={{ color: violationCount >= 3 ? '#EF4444' : '#F59E0B' }} />
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2"
                                style={{ color: violationCount >= 3 ? '#EF4444' : '#F59E0B' }}>
                                {violationCount >= 3 ? 'Serious Violation' : 'Exam Warning'}
                            </p>
                            <h2 className="text-xl font-black text-white mb-3">Exam Integrity Alert</h2>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                {violationWarningMsg || 'Switching tabs, minimizing, or leaving the exam page is not allowed.'}
                                <strong className="text-white"> Your teacher has been notified.</strong>
                            </p>

                            {/* Violation counter */}
                            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl mb-6 w-full justify-center"
                                style={{ background: violationCount >= 3 ? '#EF444412' : '#F59E0B12', border: `1px solid ${violationCount >= 3 ? '#EF444430' : '#F59E0B30'}` }}>
                                <AlertCircle size={16} style={{ color: violationCount >= 3 ? '#EF4444' : '#F59E0B' }} />
                                <span className="text-sm font-bold" style={{ color: violationCount >= 3 ? '#FCA5A5' : '#FCD34D' }}>
                                    Violation {violationCount} of session
                                    {violationCount >= 3 ? ' — HIGH RISK' : ''}
                                </span>
                            </div>

                            <button
                                onClick={() => setShowViolationWarning(false)}
                                className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90"
                                style={{ background: violationCount >= 3 ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
                                I understand — Return to Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

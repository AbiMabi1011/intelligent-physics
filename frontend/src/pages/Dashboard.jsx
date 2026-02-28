import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, CheckCircle, Award, Clock, LogOut, Play, Video,
    FileText, Megaphone, ChevronLeft, ChevronRight, ExternalLink,
    Menu, X, GraduationCap, Zap, Star, ArrowRight, Flame, ArrowUp,
    Home, Filter, TrendingUp
} from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

const batchMatch = (t, c) => !t || t.split(',').some(b => b.trim() === (c || '').trim());
const imgSrc = u => u?.startsWith('/') ? `${API_URL}${u}` : u || '';
const isNew = d => d && (Date.now() - new Date(d).getTime()) < 7 * 86400000;

/* ── Animated counter hook ── */
const useCounter = (target, visible) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!visible || target === 0) { setVal(target); return; }
        let s = 0; const step = Math.ceil(target / 30);
        const t = setInterval(() => { s = Math.min(s + step, target); setVal(s); if (s >= target) clearInterval(t); }, 40);
        return () => clearInterval(t);
    }, [visible, target]);
    return val;
};

/* ── Intersection observer hook ── */
const useVisible = (ref) => {
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return vis;
};

/* ─── AnimatedSection wrapper ─── */
const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const vis = useVisible(ref);
    return (
        <div ref={ref} className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

/* ─── Stat Counter Card ─── */
const StatCard = ({ label, value, icon, gradient, visible }) => {
    const count = useCounter(value, visible);
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-5 text-white text-center shadow-xl flex-1 min-w-[90px]`}>
            <div className="flex justify-center mb-2 opacity-80">{icon}</div>
            <div className="text-3xl font-black">{count}</div>
            <div className="text-xs font-semibold opacity-70 mt-0.5">{label}</div>
        </div>
    );
};

/* ═══════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════ */
const Dashboard = () => {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();
    const myClass = user?.class_name || '';

    // resolvedClass: always use the fresh class_name from the server.
    // This heals stale localStorage sessions that are missing class_name.
    const [resolvedClass, setResolvedClass] = useState(myClass);

    useEffect(() => {
        if (!user) navigate('/login');
        else if (user.role === 'admin') navigate('/admin/dashboard');
    }, [user, navigate]);

    // Fetch fresh user profile to get up-to-date class_name
    useEffect(() => {
        if (!user?.email) return;
        // If class_name already in session, use it immediately
        if (user.class_name) { setResolvedClass(user.class_name); return; }
        // Otherwise fetch from backend and patch the stored user
        fetch(`${API_URL}/users`)
            .then(r => r.ok ? r.json() : [])
            .then(users => {
                const me = users.find(u => u.email === user.email);
                if (me?.class_name) {
                    setResolvedClass(me.class_name);
                    // Patch localStorage so next load is instant
                    login({ ...user, class_name: me.class_name });
                }
            })
            .catch(() => { });
    }, [user?.email]);

    const [sliders, setSliders] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [taken, setTaken] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [papers, setPapers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [paperFilter, setPaperFilter] = useState('All');
    const [showTop, setShowTop] = useState(false);

    const statsRef = useRef(null);
    const statsVis = useVisible(statsRef);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 50);
            setShowTop(window.scrollY > 400);
            const sections = ['home', 'announcements', 'quizzes', 'recordings', 'papers'];
            for (const id of [...sections].reverse()) {
                const el = document.getElementById(id);
                if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            fetch(`${API_URL}/sliders`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/quizzes`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/quizzes/student/${user.email}/taken`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/recordings`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/papers`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/announcements`).then(r => r.ok ? r.json() : []),
        ]).then(([sl, qz, tk, rc, pp, an]) => {
            setSliders(sl.filter(s => s.is_active));
            setQuizzes(qz);
            setTaken(tk);
            // Use resolvedClass (fresh from server) for all batch filtering
            setRecordings(rc.filter(r => batchMatch(r.class_name, resolvedClass)));
            setPapers(pp.filter(p => batchMatch(p.class_name, resolvedClass)));
            setAnnouncements(an.filter(a => batchMatch(a.class_name, resolvedClass)));
        }).catch(console.error).finally(() => setLoading(false));
    }, [user, resolvedClass]);

    const visibleQ = quizzes.filter(q => {
        if (!q.is_published || !batchMatch(q.class_name, resolvedClass)) return false;
        if (q.scheduled_time && new Date(q.scheduled_time) > new Date()) return false;
        return true;
    });
    const doneCount = visibleQ.filter(q => taken.includes(q.id)).length;

    const isEnded = q => {
        if (!q.scheduled_time) return false;
        const st = new Date(q.scheduled_time).getTime();
        const dur = q.expiry_mode === 'end_time' ? (q.duration_minutes || 30) * 60000
            : q.expiry_mode === 'one_day' ? 86400000
                : q.expiry_mode === 'custom_days' ? (q.expiry_days || 1) * 86400000 : null;
        return dur && Date.now() > st + dur;
    };

    /* quiz timer */
    useEffect(() => {
        if (currentQuiz && !quizResult && timeLeft > 0) {
            const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
            return () => clearInterval(t);
        } else if (timeLeft === 0 && currentQuiz && !quizResult) handleSubmit(true);
    }, [currentQuiz, quizResult, timeLeft]);

    const startQuiz = async id => {
        const res = await fetch(`${API_URL}/quizzes/${id}`);
        if (res.ok) { const d = await res.json(); setCurrentQuiz(d); setAnswers({}); setQuizResult(null); setTimeLeft((d.duration_minutes || 30) * 60); }
    };
    const handleSubmit = async (force = false) => {
        if (!currentQuiz || quizResult) return;
        if (!force) { const a = Object.keys(answers).length, t = currentQuiz.questions.length; if (a < t && !window.confirm(`Answered ${a}/${t}. Submit?`)) return; }
        const res = await fetch(`${API_URL}/quizzes/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quiz_id: currentQuiz.id, student_email: user?.email, answers }) });
        if (res.ok) setQuizResult(await res.json());
    };

    const paperTypes = ['All', ...new Set(papers.map(p => p.paper_type).filter(Boolean))];
    const filteredPapers = paperFilter === 'All' ? papers : papers.filter(p => p.paper_type === paperFilter);

    /* ── QUIZ SCREEN ── */
    if (currentQuiz) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex flex-col">
            <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10 px-4 py-3">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="IP" className="h-8 w-8 rounded-xl object-contain" />
                        <div>
                            <p className="text-white font-bold text-sm line-clamp-1">{currentQuiz.title}</p>
                            <p className="text-white/40 text-xs">{Object.keys(answers).length}/{currentQuiz.questions.length} answered</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${timeLeft <= 60 ? 'bg-red-500/30 text-red-300 animate-pulse' : 'bg-white/10 text-white'}`}>
                            <Clock size={13} />{timeLeft != null ? `${Math.floor(timeLeft / 60)}:${('0' + timeLeft % 60).slice(-2)}` : '∞'}
                        </span>
                        {!quizResult && <button onClick={() => window.confirm('Exit quiz? Progress will be lost.') && setCurrentQuiz(null)} className="text-white/50 hover:text-red-400 text-sm transition">Exit</button>}
                    </div>
                </div>
                {/* Progress bar */}
                <div className="max-w-3xl mx-auto mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(Object.keys(answers).length / currentQuiz.questions.length) * 100}%` }} />
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6 space-y-4 pb-32">
                {quizResult ? (
                    <div className="mt-8 bg-white/10 backdrop-blur-2xl rounded-3xl p-10 text-center border border-white/20">
                        <div className="inline-flex p-5 rounded-full bg-yellow-400/20 text-yellow-300 mb-5 ring-4 ring-yellow-400/10">
                            <Award size={56} />
                        </div>
                        <p className="text-white/60 font-semibold uppercase tracking-widest text-xs mb-2">Quiz Completed!</p>
                        <div className="text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                            {quizResult.percentage?.toFixed(0)}%
                        </div>
                        <p className="text-white/70 mb-8">Score: <span className="text-white font-bold">{quizResult.score}</span> / <span className="text-white font-bold">{quizResult.total}</span></p>
                        <button onClick={() => { setCurrentQuiz(null); setQuizResult(null); }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-transform">
                            Back to Dashboard
                        </button>
                    </div>
                ) : currentQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white/8 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">{idx + 1}</span>
                            <p className="text-white font-semibold leading-relaxed pt-1">{q.text}</p>
                        </div>
                        <div className="space-y-2 ml-11">
                            {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                const txt = q[`option_${opt.toLowerCase()}`];
                                if (!txt) return null;
                                const sel = answers[q.id] === opt;
                                return (
                                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${sel ? 'border-blue-400 bg-blue-500/25 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:border-blue-400/40 hover:text-white hover:bg-white/10'}`}>
                                        <span className={`font-black mr-2 ${sel ? 'text-blue-300' : 'text-white/30'}`}>{opt}.</span>{txt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>
            {!quizResult && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10">
                    <div className="max-w-3xl mx-auto">
                        <button onClick={() => handleSubmit()}
                            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-[1.01] transition-transform">
                            Submit Quiz · {Object.keys(answers).length}/{currentQuiz.questions.length} answered
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    /* ════════════════════ PORTAL ════════════════════ */
    const navLinks = [
        { id: 'home', label: 'Home', icon: <Home size={14} /> },
        { id: 'quizzes', label: 'Quizzes', icon: <BookOpen size={14} /> },
        { id: 'recordings', label: 'Recordings', icon: <Video size={14} /> },
        { id: 'papers', label: 'Papers', icon: <FileText size={14} /> },
        { id: 'announcements', label: 'News', icon: <Megaphone size={14} /> },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9ff]">

            {/* ════ NAVBAR ════ */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/85 backdrop-blur-2xl shadow-xl shadow-black/5 border-b border-gray-200/50' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                    <a href="#home" className="flex items-center gap-2.5 shrink-0">
                        <div className="h-9 w-9 rounded-xl overflow-hidden shadow-lg ring-2 ring-blue-500/20">
                            <img src={logo} alt="IP" className="h-full w-full object-contain" />
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <p className={`font-black text-sm tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>Intelligent Physics</p>
                            <p className={`text-[10px] font-bold ${scrolled ? 'text-blue-600' : 'text-white/50'}`}>STUDENT PORTAL</p>
                        </div>
                    </a>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center rounded-2xl gap-0.5 p-1 bg-black/5 backdrop-blur-sm">
                        {navLinks.map(l => (
                            <a key={l.id} href={`#${l.id}`}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${activeSection === l.id ? (scrolled ? 'bg-white shadow-sm text-blue-600' : 'bg-white/20 text-white') : (scrolled ? 'text-gray-600 hover:text-gray-900 hover:bg-white/70' : 'text-white/70 hover:text-white hover:bg-white/10')}`}>
                                {l.icon}{l.label}
                                {l.id === 'quizzes' && visibleQ.length > 0 && <span className="ml-0.5 text-[10px] bg-blue-500 text-white font-black px-1.5 py-0.5 rounded-full">{visibleQ.length}</span>}
                                {l.id === 'announcements' && announcements.some(a => isNew(a.created_at)) && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 ${scrolled ? 'bg-gray-100' : 'bg-white/10 backdrop-blur-sm'}`}>
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                                {user?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div className="hidden lg:block leading-tight">
                                <p className={`text-xs font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>{user?.full_name?.split(' ')[0]}</p>
                                {myClass && <p className="text-[10px] text-blue-500 font-bold">{myClass}</p>}
                            </div>
                        </div>
                        <button onClick={() => { logout(); navigate('/login'); }}
                            className={`flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-xl transition-all ${scrolled ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <LogOut size={15} /><span className="hidden sm:block">Logout</span>
                        </button>
                        <button onClick={() => setMobileOpen(p => !p)}
                            className={`md:hidden p-2 rounded-xl ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="md:hidden bg-slate-900/97 backdrop-blur-2xl border-t border-white/10 px-4 pb-6 pt-2">
                        <div className="flex items-center gap-3 py-3 mb-2 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black">
                                {user?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div><p className="text-white font-bold">{user?.full_name}</p>{myClass && <p className="text-blue-400 text-xs font-semibold">{myClass}</p>}</div>
                        </div>
                        {navLinks.map(l => (
                            <a key={l.id} href={`#${l.id}`} onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition mb-1 ${activeSection === l.id ? 'bg-blue-600/30 text-blue-300' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                                {l.icon}{l.label}<ArrowRight size={14} className="ml-auto opacity-40" />
                            </a>
                        ))}
                    </div>
                )}
            </nav>

            {/* ════ HERO ════ */}
            <section id="home">
                <HeroSlider slides={sliders} />
            </section>

            {/* ════ STATS CARD (overlaps hero) ════ */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-14 relative z-10 mb-12" ref={statsRef}>
                <Reveal>
                    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/10 p-6 md:p-8 border border-white/60">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/80 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full mb-3">
                                    <Star size={11} className="fill-yellow-400 text-yellow-400" />
                                    {myClass ? `Batch ${myClass}` : 'Student Portal'}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                    Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'Student'}</span> 👋
                                </h1>
                                <p className="text-gray-400 mt-1.5 text-sm font-medium">Intelligent Physics Academy — your all-in-one learning portal</p>
                                {visibleQ.length > 0 && (
                                    <div className="mt-4 max-w-xs">
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                            <span>Quiz Completion</span><span>{doneCount}/{visibleQ.length}</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                                                style={{ width: `${visibleQ.length > 0 ? (doneCount / visibleQ.length) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <StatCard label="Quizzes" value={visibleQ.length} icon={<BookOpen size={20} />} gradient="from-blue-500 to-indigo-600" visible={statsVis} />
                                <StatCard label="Videos" value={recordings.length} icon={<Video size={20} />} gradient="from-violet-500 to-purple-600" visible={statsVis} />
                                <StatCard label="Papers" value={papers.length} icon={<FileText size={20} />} gradient="from-emerald-500 to-teal-600" visible={statsVis} />
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ════ ANNOUNCEMENTS ════ */}
            {announcements.length > 0 && (
                <section id="announcements" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                    <Reveal><SectionHeader icon={<Megaphone size={18} />} label="Latest News" title="Announcements" gradient="from-orange-500 to-rose-500" /></Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {announcements.map((a, i) => (
                            <Reveal key={a.id} delay={i * 80}>
                                <div className="card-lift bg-white rounded-3xl border border-orange-100/80 shadow-sm overflow-hidden flex group cursor-default h-full">
                                    {a.image_url ? (
                                        <div className="w-32 shrink-0 overflow-hidden">
                                            <img src={imgSrc(a.image_url)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ) : (
                                        <div className="w-1.5 bg-gradient-to-b from-orange-400 to-rose-500 shrink-0" />
                                    )}
                                    <div className="p-5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {isNew(a.created_at) && <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                                            <span className="text-xs text-gray-400 ml-auto">{a.created_at?.slice(0, 10)}</span>
                                        </div>
                                        <h3 className="font-black text-gray-900 leading-snug line-clamp-2 mb-1.5">{a.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{a.content}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>
            )}

            {/* ════ PROMO BANNER ════ */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal>
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 md:p-10 shadow-2xl">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-lg">
                                <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/25 text-yellow-300 text-xs font-black px-3 py-1.5 rounded-full mb-4">
                                    <Flame size={12} /> STUDY TIP
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white leading-snug mb-3">
                                    Consistency beats intensity — <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">30 minutes daily</span> transforms your score!
                                </h2>
                                <p className="text-white/40 text-sm">Join hundreds of students mastering A/L Physics with Intelligent Physics Academy.</p>
                            </div>
                            <div className="shrink-0 text-center glass rounded-3xl px-8 py-6">
                                <img src={logo} alt="IP" className="h-14 w-14 mx-auto rounded-2xl mb-2 shadow-xl" />
                                <p className="font-black text-white">Intelligent Physics</p>
                                <div className="flex justify-center gap-0.5 mt-1.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ════ QUIZZES ════ */}
            <section id="quizzes" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal><SectionHeader icon={<Zap size={18} />} label="Test Yourself" title="Quizzes & Tests" gradient="from-blue-500 to-indigo-500" count={visibleQ.length} badge={`${doneCount}/${visibleQ.length} done`} /></Reveal>
                {loading ? <SkeletonGrid /> : visibleQ.length === 0 ? (
                    <EmptyBox icon={<BookOpen size={40} />} title="No quizzes yet" desc="Quizzes for your batch will appear here" color="blue" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleQ.map((q, i) => {
                            const done = taken.includes(q.id), ended = isEnded(q);
                            return (
                                <Reveal key={q.id} delay={i * 60}>
                                    <div className={`card-lift bg-white rounded-3xl border shadow-sm overflow-hidden group h-full flex flex-col ${done ? 'border-green-200' : ended ? 'border-red-200' : 'border-indigo-100'}`}>
                                        <div className={`h-1.5 ${done ? 'bg-gradient-to-r from-green-400 to-emerald-500' : ended ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${done ? 'bg-green-50' : 'ended' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                                    {done ? <CheckCircle size={22} className="text-green-600" /> : ended ? <Clock size={22} className="text-red-500" /> : <BookOpen size={22} className="text-blue-600" />}
                                                </div>
                                                {ended && <span className="text-[10px] bg-red-100 text-red-600 font-black px-2 py-1 rounded-full">ENDED</span>}
                                                {done && !ended && <span className="text-[10px] bg-green-100 text-green-600 font-black px-2 py-1 rounded-full">DONE ✓</span>}
                                                {isNew(q.created_at) && !done && !ended && <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-1 rounded-full">NEW</span>}
                                            </div>
                                            <h3 className="font-black text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">{q.title}</h3>
                                            <p className="text-sm text-gray-400 line-clamp-2 flex-1 mb-5 leading-relaxed">{q.description || 'No description provided.'}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                                    <Clock size={11} />{q.duration_minutes || 30} min
                                                </span>
                                                {done ? (<span className="text-sm font-bold text-green-600">Completed ✓</span>
                                                ) : ended ? (<span className="text-sm font-bold text-red-400">Expired</span>
                                                ) : (
                                                    <button onClick={() => startQuiz(q.id)}
                                                        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                                                        <Play size={13} className="ml-0.5" />Start
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ════ RECORDINGS ════ */}
            <section id="recordings" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal><SectionHeader icon={<Video size={18} />} label="Watch & Learn" title="Class Recordings" gradient="from-violet-500 to-purple-600" count={recordings.length} /></Reveal>
                {loading ? <SkeletonGrid /> : recordings.length === 0 ? (
                    <EmptyBox icon={<Video size={40} />} title="No recordings yet" desc="Class recordings will appear here when uploaded" color="purple" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recordings.map((rec, i) => (
                            <Reveal key={rec.id} delay={i * 60}>
                                <div className="card-lift bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col group">
                                    <div className="relative overflow-hidden h-44 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,rgba(255,255,255,0.8) 1px,transparent 0)', backgroundSize: '22px 22px' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-2xl">
                                                <Play size={28} className="text-white ml-1 drop-shadow" />
                                            </div>
                                        </div>
                                        {rec.class_name && <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{rec.class_name}</span>}
                                        {isNew(rec.created_at) && <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">NEW</span>}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-purple-700 transition-colors">{rec.title}</h3>
                                        {rec.description && <p className="text-sm text-gray-400 line-clamp-2 mb-4">{rec.description}</p>}
                                        <a href={rec.video_url} target="_blank" rel="noreferrer"
                                            className="mt-auto flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold py-3 rounded-2xl hover:from-violet-700 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all">
                                            <Play size={14} /> Watch Recording
                                        </a>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>

            {/* ════ PAPERS ════ */}
            <section id="papers" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal><SectionHeader icon={<FileText size={18} />} label="Study Resources" title="Exam Papers" gradient="from-emerald-500 to-teal-600" count={papers.length} /></Reveal>

                {paperTypes.length > 2 && (
                    <Reveal delay={100}>
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {paperTypes.map(t => (
                                <button key={t} onClick={() => setPaperFilter(t)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${paperFilter === t ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'}`}>
                                    <Filter size={12} />{t}
                                </button>
                            ))}
                        </div>
                    </Reveal>
                )}

                {loading ? <SkeletonGrid /> : filteredPapers.length === 0 ? (
                    <EmptyBox icon={<FileText size={40} />} title="No papers yet" desc="Exam papers will appear here when uploaded" color="emerald" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredPapers.map((p, i) => {
                            const m = {
                                'Past Paper': { g: 'from-orange-400 to-amber-500', bg: 'bg-orange-50', tx: 'text-orange-600' },
                                'FWC Paper': { g: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', tx: 'text-violet-600' },
                                'Model Paper': { g: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', tx: 'text-blue-600' },
                            }[p.paper_type] || { g: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', tx: 'text-gray-500' };
                            return (
                                <Reveal key={p.id} delay={i * 50}>
                                    <div className="card-lift bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                                        <div className={`bg-gradient-to-br ${m.g} p-7 flex items-center justify-center relative overflow-hidden`}>
                                            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '18px 18px' }} />
                                            <div className="relative w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <FileText size={30} className="text-white drop-shadow" />
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <span className={`self-start text-[10px] font-black uppercase tracking-widest ${m.bg} ${m.tx} px-2.5 py-1 rounded-lg mb-2`}>{p.paper_type}</span>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-snug flex-1 mb-4">{p.title}</h3>
                                            <div className="flex flex-col gap-2 mt-auto">
                                                <a href={imgSrc(p.file_url)} target="_blank" rel="noreferrer"
                                                    className={`flex items-center justify-center gap-1.5 w-full bg-gradient-to-r ${m.g} text-white text-sm font-bold py-2.5 rounded-2xl hover:opacity-90 hover:shadow-lg transition-all`}>
                                                    <FileText size={12} />View Paper
                                                </a>
                                                {p.scheme_url && (
                                                    <a href={imgSrc(p.scheme_url)} target="_blank" rel="noreferrer"
                                                        className="flex items-center justify-center gap-1.5 w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-bold py-2.5 rounded-2xl transition-colors">
                                                        <CheckCircle size={12} />Marking Scheme
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ════ FOOTER ════ */}
            <footer className="bg-slate-900 text-white mt-4">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <img src={logo} alt="IP" className="h-12 w-12 rounded-2xl ring-2 ring-white/20 object-contain" />
                            <div>
                                <p className="font-black text-xl">Intelligent Physics</p>
                                <p className="text-slate-500 text-sm">Excellence in A/L Physics Education</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            {navLinks.map(l => <a key={l.id} href={`#${l.id}`} className="text-slate-400 hover:text-blue-400 font-semibold text-sm transition-colors">{l.label}</a>)}
                        </div>
                    </div>
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-sm">
                        <p>© {new Date().getFullYear()} Intelligent Physics. All rights reserved.</p>
                        {myClass && <p className="text-blue-500 font-bold">Batch: {myClass}</p>}
                    </div>
                </div>
            </footer>

            {/* ════ MOBILE BOTTOM NAV ════ */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-gray-200/80 shadow-2xl">
                <div className="flex">
                    {navLinks.map(l => (
                        <a key={l.id} href={`#${l.id}`}
                            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-bold transition-colors gap-1
                                ${activeSection === l.id ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={`p-1.5 rounded-xl transition-all ${activeSection === l.id ? 'bg-blue-100 text-blue-600' : ''}`}>{React.cloneElement(l.icon, { size: 18 })}</span>
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* ════ BACK TO TOP ════ */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-blue-300/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <ArrowUp size={20} />
            </button>
        </div>
    );
};

/* ════════════════════ SUBCOMPONENTS ════════════════════ */

const SectionHeader = ({ icon, label, title, gradient, count, badge }) => (
    <div className="mb-7">
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-md`}>{icon}</div>
                    <span className={`text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{label}</span>
                    {count !== undefined && <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">{count}</span>}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">{title}</h2>
            </div>
            {badge && <span className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-xl"><TrendingUp size={14} />{badge}</span>}
        </div>
        <div className={`mt-3 h-1 w-14 rounded-full bg-gradient-to-r ${gradient}`} />
    </div>
);

const EmptyBox = ({ icon, title, desc, color }) => {
    const c = { blue: 'text-blue-300 bg-blue-50/50', purple: 'text-purple-300 bg-purple-50/50', emerald: 'text-emerald-300 bg-emerald-50/50' };
    return (
        <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <div className={`inline-flex p-5 rounded-3xl mb-4 ${c[color]}`}>{icon}</div>
            <p className="text-gray-700 font-bold text-lg">{title}</p>
            <p className="text-gray-400 text-sm mt-1">{desc}</p>
        </div>
    );
};

const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-40 bg-gray-100/80 shimmer" />
                <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-full shimmer w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full shimmer w-1/2" />
                    <div className="h-10 bg-gray-100 rounded-2xl shimmer mt-4 w-full" />
                </div>
            </div>
        ))}
    </div>
);

/* ════ HERO SLIDER ════ */
const HeroSlider = ({ slides }) => {
    const [cur, setCur] = useState(0);
    const timer = useRef(null);
    const touchStartX = useRef(null);
    const go = useCallback(d => setCur(c => (c + d + slides.length) % slides.length), [slides.length]);

    // Auto-advance
    useEffect(() => {
        if (slides.length <= 1) return;
        timer.current = setInterval(() => go(1), 5500);
        return () => clearInterval(timer.current);
    }, [slides.length, go]);

    // Touch swipe handlers for mobile
    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
        touchStartX.current = null;
    };

    // ── Empty state (no slides added yet) ──
    if (slides.length === 0) return (
        <div className="bg-mesh relative flex items-center justify-center overflow-hidden"
            style={{ minHeight: 'clamp(420px, 70vh, 92vh)', paddingBottom: '5rem' }}>
            <div className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl float" />
            <div className="absolute bottom-1/4 right-1/4 w-48 md:w-72 h-48 md:h-72 bg-purple-500/20 rounded-full blur-3xl float" style={{ animationDelay: '2s' }} />
            <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 glass text-white/80 text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />A/L Physics Academy - Sri Lanka
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-5">
                    Master Physics.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        Score Straight A's.
                    </span>
                </h1>
                <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                    Everything you need for A/L Physics — quizzes, class recordings, past papers &amp; more, all in one place.
                </p>
                <a href="#quizzes"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 font-black text-sm px-6 py-3.5 rounded-2xl hover:bg-blue-50 shadow-2xl hover:scale-105 transition-all">
                    Start Learning <ArrowRight size={16} />
                </a>
            </div>
        </div>
    );

    const s = slides[cur];
    return (
        <div
            className="relative overflow-hidden"
            style={{ minHeight: 'clamp(420px, 70vh, 92vh)' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url(${imgSrc(s.image_url)})`, transform: 'scale(1.04)' }}
            />

            {/* Gradient overlays — stronger on mobile for readability */}
            {/* Bottom-to-top dark gradient (always) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            {/* Left-to-right gradient (desktop) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent hidden sm:block" />
            {/* Full dark tint on mobile so text is always readable */}
            <div className="absolute inset-0 bg-black/40 sm:hidden" />

            {/* ── Content ── */}
            <div className="absolute inset-0 flex items-end sm:items-center px-5 sm:px-10 md:px-16 lg:px-20 pb-20 sm:pb-16 md:pb-10">
                <div className="w-full sm:max-w-xl lg:max-w-2xl text-center sm:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 glass text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-5">
                        <Zap size={11} className="text-yellow-400" />Intelligent Physics
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.12] drop-shadow-2xl mb-3 sm:mb-4">
                        {s.title}
                    </h1>

                    {/* Subtitle */}
                    {s.subtitle && (
                        <p className="text-white/80 text-sm sm:text-base md:text-lg mb-5 sm:mb-7 max-w-md mx-auto sm:mx-0 leading-relaxed line-clamp-3 sm:line-clamp-none">
                            {s.subtitle}
                        </p>
                    )}

                    {/* CTA Button */}
                    {s.button_text && (
                        <a href={s.button_link || '#'} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-gray-900 font-black text-sm px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl hover:scale-105 shadow-2xl transition-all">
                            {s.button_text}<ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>

            {/* ── Navigation arrows (hidden on very small screens) ── */}
            {slides.length > 1 && (
                <>
                    <button onClick={() => go(-1)}
                        className="hidden sm:flex absolute left-3 md:left-5 top-1/2 -translate-y-1/2 glass text-white p-2.5 md:p-3 rounded-2xl hover:bg-white/20 hover:scale-110 transition-all items-center justify-center">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => go(1)}
                        className="hidden sm:flex absolute right-3 md:right-5 top-1/2 -translate-y-1/2 glass text-white p-2.5 md:p-3 rounded-2xl hover:bg-white/20 hover:scale-110 transition-all items-center justify-center">
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* ── Dots + counter ── */}
            {slides.length > 1 && (
                <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3">
                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <button key={i} onClick={() => setCur(i)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === cur ? 'bg-white w-8 sm:w-10' : 'bg-white/40 w-2.5 sm:w-3 hover:bg-white/70'}`} />
                        ))}
                    </div>
                    <div className="glass text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full">
                        {cur + 1}/{slides.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

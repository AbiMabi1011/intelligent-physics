import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    BookOpen, CheckCircle, Award, Clock, LogOut, Play, Video,
    FileText, Megaphone, ChevronLeft, ChevronRight, ExternalLink,
    Menu, X, GraduationCap, Zap, Star, ArrowRight, Flame, ArrowUp,
    Home, Filter, TrendingUp, QrCode, Bell, Download, Sun, Moon, Settings
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';
import Footer from '../components/Footer';
import AdvancedQuizPortal from '../components/AdvancedQuizPortal';

const batchMatch = (t, c) => !t || t.split(',').some(b => b.trim() === (c || '').trim());
const imgSrc = u => u?.startsWith('/') ? `${API_URL}${u}` : u || '';
const isNew = d => d && (Date.now() - new Date(d).getTime()) < 7 * 86400000;

const isEnded = q => {
    if (!q.scheduled_time) return false;
    const st = new Date(q.scheduled_time).getTime();
    const dur = q.expiry_mode === 'end_time' ? (q.duration_minutes || 30) * 60000
        : q.expiry_mode === 'one_day' ? 86400000
            : q.expiry_mode === 'custom_days' ? (q.expiry_days || 1) * 86400000 : null;
    return dur && Date.now() > st + dur;
};

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
        <div className="relative overflow-hidden rounded-none p-6 bg-[#f9f6ee] border border-[#d5d0c2] group hover:bg-[#ede9da] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-40 w-44">
            <div className="flex items-center justify-between relative z-10">
                <div className="p-3 bg-[#0a0a0a] text-[#f4f0e6] transition-transform duration-300 group-hover:scale-105">
                    {icon}
                </div>
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#6b6558] border border-[#d5d0c2] px-2 py-0.5">PORTAL</span>
            </div>
            
            <div className="mt-4 relative z-10">
                <span className="text-3xl md:text-4xl font-bold tracking-tight text-[#0a0a0a]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                <p className="text-[9px] font-bold tracking-widest uppercase text-[#6b6558] mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
            </div>
        </div>
    );
};
const LiquidNav = ({ sections, activeSection, visibleQ, announcements, isNew, logo, user, myClass, mobileOpen, setMobileOpen, scrolled, logout, navigate, theme, toggleTheme, setShowQRModal, setShowSettingsModal }) => {
    const navRef = useRef(null);
    const linkRefs = useRef({});
    const [pill, setPill] = React.useState({ left: 0, width: 0, opacity: 0 });
    
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    React.useEffect(() => {
        const update = () => {
            const active = linkRefs.current[activeSection];
            const nav = navRef.current;
            if (!active || !nav) return;
            const navRect = nav.getBoundingClientRect();
            const rect = active.getBoundingClientRect();
            setPill({ left: rect.left - navRect.left, width: rect.width, opacity: 1 });
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [activeSection]);

    React.useEffect(() => {
        const handleOutsideClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            background: scrolled 
                ? (theme === 'dark' ? 'rgba(8,8,12,0.97)' : 'rgba(255,255,255,0.96)') 
                : (theme === 'dark' ? 'linear-gradient(180deg,rgba(8,8,12,0.88) 0%,rgba(8,8,12,0.0) 100%)' : 'linear-gradient(180deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.0) 100%)'),
            backdropFilter: scrolled ? 'blur(24px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
            borderBottom: scrolled ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : 'none',
            transition: 'background 0.4s, border-color 0.4s',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Aurora glow strip */}
            {scrolled && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '20%', width: '40%', height: '200%', background: theme === 'dark' ? 'radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)' : 'radial-gradient(ellipse,rgba(99,102,241,0.04) 0%,transparent 70%)', filter: 'blur(20px)' }} />
                    <div style={{ position: 'absolute', top: '-50%', right: '15%', width: '30%', height: '200%', background: theme === 'dark' ? 'radial-gradient(ellipse,rgba(168,85,247,0.05) 0%,transparent 70%)' : 'radial-gradient(ellipse,rgba(168,85,247,0.03) 0%,transparent 70%)', filter: 'blur(20px)' }} />
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 62, position: 'relative', zIndex: 1 }}>

                {/* Logo */}
                <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: -2, borderRadius: 0, background: '#b91c1c', opacity: 0.7, filter: 'blur(3px)' }} />
                        <div style={{ position: 'relative', width: 30, height: 30, borderRadius: 0, overflow: 'hidden', background: '#0a0a0a' }}>
                            <img src={logo} alt="IP" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <div style={{ lineHeight: 1.1 }}>
                        <p style={{ fontWeight: 400, fontFamily: "'Bebas Neue', cursive", fontSize: '1.4rem', color: theme === 'dark' ? '#fff' : '#0a0a0a', letterSpacing: '1.5px', margin: 0, transition: 'color 0.3s', textTransform: 'uppercase' }}>Intelligent Physics</p>
                        <p style={{ fontSize: '0.62rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#b91c1c', margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Learning Hub</p>
                    </div>
                </a>

                {/* Liquid centre nav */}
                <div ref={navRef} className="hidden md:flex"
                    style={{
                        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                        alignItems: 'center', gap: 2,
                        background: '#0a0a0a',
                        border: '1px solid #222222',
                        borderRadius: 0, padding: '4px',
                    }}>
                    {/* Sliding liquid pill */}
                    <div style={{
                        position: 'absolute', top: 4, bottom: 4,
                        left: pill.left + 4, width: pill.width, opacity: pill.opacity,
                        background: '#b91c1c',
                        borderRadius: 0,
                        border: 'none',
                        boxShadow: 'none',
                        transition: 'left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s',
                        pointerEvents: 'none', zIndex: 0,
                    }} />
                    {sections.map(l => (
                        <a key={l.id} href={`#${l.id}`}
                            ref={el => { linkRefs.current[l.id] = el; }}
                            style={{
                                position: 'relative', zIndex: 1,
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 13px', borderRadius: 0,
                                fontSize: '0.72rem',
                                fontFamily: "'JetBrains Mono', monospace",
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: activeSection === l.id ? 700 : 400,
                                color: activeSection === l.id 
                                    ? '#f4f0e6' 
                                    : 'rgba(255, 255, 255, 0.5)',
                                textDecoration: 'none', whiteSpace: 'nowrap',
                                transition: 'color 0.22s',
                            }}
                            onMouseEnter={e => { if (activeSection !== l.id) e.currentTarget.style.color = '#ffffff'; }}
                            onMouseLeave={e => { if (activeSection !== l.id) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'; }}>
                            <span style={{ opacity: activeSection === l.id ? 1 : 0.6 }}>{l.icon}</span>
                            {l.label}
                            {l.id === 'quizzes' && visibleQ.length > 0 && (
                                <span style={{ fontSize: 9, background: '#b91c1c', color: '#fff', fontWeight: 800, padding: '1px 6px', borderRadius: 0 }}>{visibleQ.length}</span>
                            )}
                            {l.id === 'announcements' && announcements.some(a => isNew(a.created_at)) && (
                                <span style={{ width: 5, height: 5, background: '#b91c1c', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #b91c1c' }} />
                            )}
                            {l.count > 0 && l.id !== 'quizzes' && l.id !== 'announcements' && (
                                <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, padding: '1px 5px', borderRadius: 0 }}>{l.count}</span>
                            )}
                        </a>
                    ))}
                </div>

                {/* Right profile dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, position: 'relative' }} ref={menuRef}>
                    {/* User profile avatar trigger button */}
                    <button 
                        onClick={() => setMenuOpen(p => !p)}
                        className="relative flex items-center justify-center w-9 h-9 rounded-none bg-[#b91c1c] text-[#f4f0e6] font-bold text-sm cursor-pointer hover:scale-105 transition-transform select-none border border-[#d5d0c2]"
                    >
                        {user?.full_name?.charAt(0) || 'S'}
                    </button>

                    {/* Unified profile dropdown menu */}
                    {menuOpen && (
                        <div className="absolute right-0 top-11 w-64 rounded-none border border-[#d5d0c2] bg-[#f9f6ee] text-[#0a0a0a] p-4 flex flex-col gap-3.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg shadow-black/5">
                            {/* User details info panel */}
                            <div className="flex items-center gap-3 pb-3 border-b border-[#d5d0c2]">
                                <div className="w-10 h-10 rounded-none bg-[#0a0a0a] flex items-center justify-center text-[#f4f0e6] font-bold text-sm">
                                    {user?.full_name?.charAt(0) || 'S'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm truncate leading-tight">{user?.full_name}</p>
                                    <p className="text-[10px] truncate mt-0.5 text-[#6b6558]">{user?.email}</p>
                                    {myClass && <span className="inline-block mt-1.5 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-none bg-[#b91c1c] text-[#f4f0e6]">Batch {myClass}</span>}
                                </div>
                            </div>

                            {/* Dropdown Items list */}
                            <div className="flex flex-col gap-1.5">
                                {/* Account Settings Option */}
                                <button 
                                    onClick={() => { setShowSettingsModal(true); setMenuOpen(false); }}
                                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-none text-xs font-bold transition-colors cursor-pointer hover:bg-[#ede9da] text-[#0a0a0a]"
                                >
                                    <Settings size={14} className="text-[#b91c1c]" />
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settings</span>
                                </button>

                                {/* Divider line */}
                                <div className="h-[1px] w-full my-1 bg-[#d5d0c2]" />

                                {/* Logout button option */}
                                <button 
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-none text-xs font-bold transition-colors cursor-pointer text-[#b91c1c] hover:bg-red-50"
                                >
                                    <LogOut size={14} />
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hamburger */}
                    <button onClick={() => setMobileOpen(p => !p)}
                        className="md:hidden flex flex-col justify-center items-center"
                        style={{ width: 36, height: 36, gap: 5, background: '#0a0a0a', border: '1px solid #222222', borderRadius: 0, cursor: 'pointer' }}>
                        <span style={{ width: 16, height: 1.5, background: '#fff', transform: mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none', transition: 'all 0.25s', display: 'block' }} />
                        <span style={{ width: 16, height: 1.5, background: '#fff', opacity: mobileOpen ? 0 : 1, transition: 'all 0.25s', display: 'block' }} />
                        <span style={{ width: 16, height: 1.5, background: '#fff', transform: mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none', transition: 'all 0.25s', display: 'block' }} />
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden" style={{ background: (theme === 'dark' ? 'rgba(10,10,16,0.99)' : 'rgba(255,255,255,0.99)'), backdropFilter: 'blur(24px)', borderTop: (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'), padding: '10px 14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 6px 14px', borderBottom: (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'), marginBottom: 8 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 0 14px rgba(99,102,241,0.4)' }}>
                            {user?.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <p style={{ color: (theme === 'dark' ? '#fff' : '#0f172a'), fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{user?.full_name}</p>
                            {myClass && <p style={{ fontWeight: 700, fontSize: '0.65rem', background: 'linear-gradient(90deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>{myClass}</p>}
                        </div>
                    </div>
                    {sections.map(s => (
                        <a key={s.id} href={`#${s.id}`} onClick={() => setMobileOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '11px 12px', borderRadius: 12, marginBottom: 3,
                                fontSize: '0.875rem', fontWeight: activeSection === s.id ? 700 : 400,
                                color: activeSection === s.id 
                                    ? (theme === 'dark' ? '#e0e7ff' : '#4f46e5') 
                                    : (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)'),
                                background: activeSection === s.id 
                                    ? (theme === 'dark' ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.12))' : 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(168,85,247,0.04))') 
                                    : 'transparent',
                                border: activeSection === s.id 
                                    ? (theme === 'dark' ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.1)') 
                                    : '1px solid transparent',
                                textDecoration: 'none', transition: 'all 0.18s',
                            }}>
                            {s.icon}{s.label}
                            {s.count > 0 && (
                                <span style={{ marginLeft: 'auto', fontSize: 9, background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontWeight: 800, padding: '2px 7px', borderRadius: 99, boxShadow: '0 0 8px rgba(99,102,241,0.4)' }}>{s.count}</span>
                            )}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
};

/* ═══════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════ */
const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, login, logout, updateUser } = useAuth();
    const myClass = user?.class_name || '';

    // resolvedClass: always use the fresh class_name from the server.
    // This heals stale localStorage sessions that are missing class_name.
    const [resolvedClass, setResolvedClass] = useState(myClass);

    useEffect(() => {
        if (!user) navigate('/login' + window.location.search);
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
    const [studentScores, setStudentScores] = useState({});
    const [recordings, setRecordings] = useState([]);
    const [papers, setPapers] = useState([]);
    const [marks, setMarks] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuiz, setCurrentQuizRaw] = useState(null);
    const [answers, setAnswersRaw] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // ── Quiz session persistence (fixed key, email stored inside JSON) ──
    const QUIZ_SESSION_KEY = 'ip_quiz_session';

    const getStoredSession = () => {
        try { const r = localStorage.getItem(QUIZ_SESSION_KEY); return r ? JSON.parse(r) : null; }
        catch (_) { return null; }
    };

    const setCurrentQuiz = (quiz) => {
        setCurrentQuizRaw(quiz);
        if (!quiz) localStorage.removeItem(QUIZ_SESSION_KEY);
    };

    const setAnswers = (updater) => {
        setAnswersRaw(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            try {
                const session = getStoredSession();
                if (session) localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify({ ...session, answers: next }));
            } catch (_) {}
            return next;
        });
    };

    // On mount: restore session if browser was refreshed mid-quiz
    useEffect(() => {
        const session = getStoredSession();
        if (!session?.quiz || !session?.startedAt || !session?.durationSeconds) return;
        const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
        const remaining = session.durationSeconds - elapsed;
        if (remaining <= 0) { localStorage.removeItem(QUIZ_SESSION_KEY); return; }
        setCurrentQuizRaw(session.quiz);
        setAnswersRaw(session.answers || {});
        setTimeLeft(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [paperFilter, setPaperFilter] = useState('All');
    const [showTop, setShowTop] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsTab, setSettingsTab] = useState('profile');
    const [profileName, setProfileName] = useState(user?.full_name || '');
    const [profileWhatsApp, setProfileWhatsApp] = useState(user?.whatsapp_number || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [settingsError, setSettingsError] = useState('');
    const [settingsSuccess, setSettingsSuccess] = useState('');
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 1000);
    };

    useEffect(() => {
        if (showSettingsModal && user) {
            setProfileName(user.full_name || '');
            setProfileWhatsApp(user.whatsapp_number || '');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSettingsError('');
            setSettingsSuccess('');
        }
    }, [showSettingsModal, user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        console.log("handleSaveProfile called. Current user state:", user);
        console.log("Attempting to update profile for user ID:", user?.user_id || user?.id);
        setSettingsError('');
        setSettingsSuccess('');
        setSettingsSaving(true);
        try {
            const userId = user?.user_id || user?.id;
            if (!userId) {
                throw new Error("User ID is missing from session");
            }
            const res = await fetch(`${API_URL}/users/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: profileName,
                    whatsapp_number: profileWhatsApp
                })
            });
            const data = await res.json();
            console.log("Profile update response data:", data);
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to update profile');
            }
            updateUser({
                full_name: data.full_name,
                whatsapp_number: data.whatsapp_number
            });
            setSettingsSuccess('Profile updated successfully!');
            showNotification('Profile updated successfully!');
            setTimeout(() => {
                setShowSettingsModal(false);
            }, 1000);
        } catch (err) {
            console.error("Profile update error:", err);
            setSettingsError(err.message);
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setSettingsError('');
        setSettingsSuccess('');
        if (newPassword !== confirmPassword) {
            setSettingsError('New passwords do not match');
            return;
        }
        if (newPassword.length < 5) {
            setSettingsError('Password must be at least 5 characters long');
            return;
        }
        setSettingsSaving(true);
        try {
            const res = await fetch(`${API_URL}/users/change-password/${user.user_id || user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Failed to change password');
            }
            setSettingsSuccess('Password updated successfully!');
            showNotification('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowSettingsModal(false);
            }, 1000);
        } catch (err) {
            setSettingsError(err.message);
        } finally {
            setSettingsSaving(false);
        }
    };
    const theme = 'light';
    const toggleTheme = () => {};

    const statsRef = useRef(null);
    const statsVis = useVisible(statsRef);

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const svgSize = svg.getBoundingClientRect();
        canvas.width = svgSize.width * 2;
        canvas.height = svgSize.height * 2;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${user?.full_name?.replace(/\s+/g, '_')}_QR_ID.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

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
            fetch(`${API_URL}/quizzes/student/${user.email}/scores`).then(r => r.ok ? r.json() : {}),
            fetch(`${API_URL}/recordings`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/papers`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/marks`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/announcements`).then(r => r.ok ? r.json() : []),
        ]).then(([sl, qz, tk, sc, rc, pp, mk, an]) => {
            setSliders(sl.filter(s => s.is_active));
            setQuizzes(qz);
            setTaken(tk);
            setStudentScores(sc);
            // Use resolvedClass (fresh from server) for all batch filtering
            setRecordings(rc.filter(r => batchMatch(r.class_name, resolvedClass) && (r.visibility === 'both' || r.visibility === 'portal')));
            setPapers(pp.filter(p => batchMatch(p.class_name, resolvedClass) && (p.visibility === 'both' || p.visibility === 'portal')));
            // Only show the logged-in student's marks in their portal
            setMarks(mk.filter(m => (m.user_id === user.id || m.user_id === user.user_id) && batchMatch(m.class_name, resolvedClass)));
            setAnnouncements(an.filter(a => batchMatch(a.class_name, resolvedClass) && (a.visibility === 'both' || a.visibility === 'portal')));
        }).catch(console.error).finally(() => setLoading(false));
    }, [user, resolvedClass]);

    const visibleQ = quizzes.filter(q => {
        if (!q.is_published || !batchMatch(q.class_name, resolvedClass)) return false;
        if (q.scheduled_time && new Date(q.scheduled_time) > new Date()) return false;
        return true;
    });
    const doneCount = visibleQ.filter(q => taken.includes(q.id)).length;

    const handleSubmit = async (force = false) => {
        if (!currentQuiz || quizResult) return;
        if (!force) { const a = Object.keys(answers).length, t = currentQuiz.questions.length; if (a < t && !window.confirm(`Answered ${a}/${t}. Submit?`)) return; }
        // Clear session on submit
        localStorage.removeItem(QUIZ_SESSION_KEY);
        const res = await fetch(`${API_URL}/quizzes/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quiz_id: currentQuiz.id, student_email: user?.email, answers }) });
        if (res.ok) {
            const data = await res.json();
            setQuizResult(data);
            setTaken(p => p.includes(currentQuiz.id) ? p : [...p, currentQuiz.id]);
            setStudentScores(p => ({
                ...p,
                [currentQuiz.id]: {
                    score: data.score,
                    total: data.total,
                    rank: data.rank,
                    total_participants: data.total_participants
                }
            }));
        }
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
        if (res.ok) {
            const d = await res.json();
            const durationSeconds = (d.duration_minutes || 30) * 60;
            const startedAt = Date.now();
            // Persist session so a refresh restores the exam
            localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify({
                quiz: d,
                answers: {},
                startedAt,
                durationSeconds,
            }));
            setCurrentQuizRaw(d);
            setAnswersRaw({});
            setQuizResult(null);
            setTimeLeft(durationSeconds);
        }
    };

    useEffect(() => {
        if (loading) return;
        const qid = searchParams.get('quiz_id');
        if (!qid) return;
        const quizId = parseInt(qid, 10);
        if (isNaN(quizId)) return;

        // If there's already a valid in-progress session for this quiz, don't restart it
        const session = getStoredSession();
        if (session?.quiz?.id === quizId) {
            // Session is already restored from localStorage on mount — don't reset timer
            return;
        }

        const quizExists = quizzes.find(q => q.id === quizId);
        if (quizExists) {
            if (taken.includes(quizId)) {
                alert("You have already completed this quiz.");
            } else {
                startQuiz(quizId);
            }
        } else {
            alert("This quiz is not available for your class or batch.");
        }
    }, [loading, searchParams, quizzes, taken]);

    const paperTypes = ['All', ...new Set(papers.map(p => p.paper_type).filter(Boolean))];
    const filteredPapers = paperFilter === 'All' ? papers : papers.filter(p => p.paper_type === paperFilter);

    /* ── QUIZ SCREEN (Advanced Portal) ── */
    if (currentQuiz) return (
        <AdvancedQuizPortal
            currentQuiz={currentQuiz}
            answers={answers}
            setAnswers={setAnswers}
            timeLeft={timeLeft}
            quizResult={quizResult}
            handleSubmit={handleSubmit}
            setCurrentQuiz={setCurrentQuiz}
            setQuizResult={setQuizResult}
            API_URL={API_URL}
            logo={logo}
            studentEmail={user?.email || ''}
            studentName={user?.full_name || ''}
        />
    );

    const completedQuizzes = visibleQ.filter(q => taken.includes(q.id));

    /* ════════════════════ PORTAL ════════════════════ */
    const sections = [
        { id: 'home', label: 'Overview', icon: <Play size={16} /> },
        { id: 'announcements', label: 'Announcements', icon: <Bell size={16} />, count: announcements.length },
        { id: 'quizzes', label: 'Spark Exam', icon: <Zap size={16} />, count: visibleQ.length },
        { id: 'recordings', label: 'Recordings', icon: <Video size={16} />, count: recordings.length },
        { id: 'papers', label: 'Resources', icon: <FileText size={16} />, count: papers.length },
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden pb-10 transition-all duration-500 bg-[var(--paper)] text-[var(--ink)]">
            {/* Fine sand-grid layout */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(213,208,194,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(213,208,194,0.22)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-[0.8] z-0" />

            {/* ════ LIQUID NAVBAR ════ */}
            <LiquidNav
                sections={sections}
                activeSection={activeSection}
                visibleQ={visibleQ}
                announcements={announcements}
                isNew={isNew}
                logo={logo}
                user={user}
                myClass={myClass}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                scrolled={scrolled}
                logout={logout}
                navigate={navigate}
                theme={theme}
                toggleTheme={toggleTheme}
                setShowQRModal={setShowQRModal}
                setShowSettingsModal={setShowSettingsModal}
            />

            {/* ════ STATS CARD ════ */}
            <section id="home" className="max-w-7xl mx-auto px-4 md:px-8 pt-28 relative z-10 mb-12" ref={statsRef}>
                <Reveal>
                    <div className="rounded-none p-8 md:p-10 bg-[#f9f6ee] border border-[#d5d0c2] shadow-none">
                         <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                             <div className="flex-1">
                                 <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-[#b91c1c] text-[#f4f0e6] rounded-none">
                                     <Star size={10} className="fill-[#f4f0e6]" />
                                     {myClass ? `Batch ${myClass}` : 'Learning Hub'}
                                 </div>
                                 <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-none text-[#0a0a0a] mt-3.5 mb-2 uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                                     Welcome Back, <span className="text-[#b91c1c]">{user?.full_name?.split(' ')[0] || 'Student'}</span> 👋
                                 </h1>
                                 <p className="text-xs font-mono uppercase tracking-wider text-[#6b6558] font-bold">Intelligent Physics Academy — your all-in-one learning portal</p>
                                 {visibleQ.length > 0 && (
                                     <div className="mt-5 max-w-xs">
                                         <div className="flex justify-between text-[9px] font-bold font-mono tracking-widest uppercase mb-1.5 text-[#6b6558]">
                                             <span>Quiz Completion</span><span>{doneCount}/{visibleQ.length}</span>
                                         </div>
                                         <div className="h-2 rounded-none bg-[#ede9da] border border-[#d5d0c2] overflow-hidden">
                                             <div className="h-full bg-[#b91c1c] rounded-none transition-all duration-1000"
                                                  style={{ width: `${visibleQ.length > 0 ? (doneCount / visibleQ.length) * 100 : 0}%` }} />
                                         </div>
                                     </div>
                                 )}
                             </div>
                             <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                                 <StatCard label="Quizzes" value={visibleQ.length} icon={<BookOpen size={20} />} gradient="from-[#656CFF] to-indigo-600" visible={statsVis} />
                                 <StatCard label="Videos" value={recordings.length} icon={<Video size={20} />} gradient="from-[#656CFF] to-indigo-600" visible={statsVis} />
                                 <StatCard label="Papers" value={papers.length} icon={<FileText size={20} />} gradient="from-[#656CFF] to-indigo-600" visible={statsVis} />
                             </div>
                         </div>
                    </div>
                </Reveal>
            </section>



            {/* ════ ANNOUNCEMENTS ════ */}
            <section id="announcements" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal>
                    <div className="flex items-center justify-between mb-6 border-b border-[#d5d0c2] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-[#0a0a0a] text-[#f4f0e6] flex items-center justify-center">
                                <Megaphone size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] font-mono font-bold text-[#b91c1c] uppercase tracking-widest">Latest News</p>
                                <h2 className="text-3xl font-normal uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>Announcements</h2>
                            </div>
                        </div>
                        {announcements.length > 0 && (
                            <span className="text-[9px] font-mono font-bold bg-[#0a0a0a] text-[#f4f0e6] px-3 py-1">
                                {announcements.length} notice{announcements.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </Reveal>

                {announcements.length === 0 ? (
                    <Reveal delay={100}>
                        <div className="flex flex-col items-center justify-center py-16 rounded-none border border-[#d5d0c2] bg-[#f9f6ee]">
                            <div className="w-14 h-14 rounded-none flex items-center justify-center mb-4 text-[#0a0a0a] bg-[#f4f0e6] border border-[#d5d0c2]">
                                <Bell size={24} />
                            </div>
                            <p className="font-bold text-lg mb-1 text-[#0a0a0a] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>No announcements yet</p>
                            <p className="text-xs text-center max-w-xs text-[#6b6558] font-semibold leading-relaxed">We will notify you here when new announcements are published by your teacher.</p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {announcements.map((a, i) => (
                            <Reveal key={a.id} delay={i * 60}>
                                <div className="rounded-none border border-[#d5d0c2] p-6 relative overflow-hidden flex transition-all duration-300 bg-[#f9f6ee] hover:bg-[#ede9da] hover:border-[#0a0a0a] hover:-translate-y-0.5">
                                    <div className="shrink-0 w-11 h-11 rounded-none border border-[#d5d0c2] bg-[#f4f0e6] text-[#0a0a0a] flex items-center justify-center">
                                        <Megaphone size={20} />
                                    </div>
                                    <div className="ml-5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {isNew(a.created_at) && <span className="text-[9px] bg-[#b91c1c] text-[#f4f0e6] font-mono px-2 py-0.5 rounded-none font-bold">NEW NOTICE</span>}
                                            <span className="text-[9px] font-mono text-[#6b6558] ml-auto">{a.created_at?.slice(0, 10)}</span>
                                        </div>
                                        <h3 className="font-bold text-[#0a0a0a] leading-snug line-clamp-2 mb-1.5 transition-colors duration-300 group-hover:text-[#b91c1c]" style={{ fontFamily: "'Archivo', sans-serif" }}>{a.title}</h3>
                                        <p className="text-xs text-[#6b6558] line-clamp-3 leading-relaxed font-semibold">{a.content}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>

            {/* ════ INTELLIGENT PHYSICS — THINK POSITIVE BANNER ════ */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal>
                    <div className="relative rounded-none overflow-hidden transition-all duration-300 border border-[#d5d0c2] bg-[#f9f6ee]">
                        {/* Subtle sand grid dots */}
                        <div className="absolute inset-0 opacity-[0.08]"
                            style={{ backgroundImage: 'radial-gradient(#0a0a0a 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">

                            {/* Left — Logo card */}
                            <div className="shrink-0 flex flex-col items-center text-center">
                                <div className="relative mb-3">
                                    <div className="absolute inset-0 bg-[#b91c1c]/10 rounded-none scale-105" />
                                    <img src={logo} alt="Intelligent Physics"
                                        className="relative h-20 w-20 md:h-24 md:w-24 rounded-none object-contain shadow-none ring-1 ring-[#d5d0c2]" />
                                </div>
                                <p className="font-bold text-base md:text-lg tracking-tight text-[#0a0a0a] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>Intelligent Physics</p>
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <span className="mt-2 text-[9px] font-mono font-bold tracking-widest uppercase text-[#b91c1c]">A/L Physics Academy</span>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px self-stretch mx-2 bg-[#d5d0c2]" />
                            <div className="block md:hidden h-px w-full bg-[#d5d0c2]" />

                            {/* Right — Think Positive quotes */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 border border-[#d5d0c2] text-[9px] font-mono font-bold px-3 py-1 rounded-none mb-4 tracking-widest uppercase bg-[#f4f0e6] text-[#b91c1c]">
                                    <Zap size={11} className="fill-[#b91c1c]" /> Think Positive
                                </div>

                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-none mb-3 text-[#0a0a0a] uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                                    Every expert was once a{' '}
                                    <span className="text-[#b91c1c]">
                                        beginner.
                                    </span>
                                </h2>
                                <p className="text-xs leading-relaxed mb-6 max-w-lg mx-auto md:mx-0 text-[#6b6558] font-medium">
                                    Believe in your potential. Each question you practice, each recording you watch, and each paper you solve brings you one step closer to your dream score. <span className="text-[#b91c1c] font-bold">You've got this! 🚀</span>
                                </p>

                                {/* Motivational stat pills */}
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {[
                                        { icon: <BookOpen size={12} />, text: 'Practice Daily' },
                                        { icon: <Star size={12} />, text: "Aim for A's" },
                                        { icon: <Zap size={12} />, text: 'Stay Focused' },
                                        { icon: <Flame size={12} />, text: 'Never Give Up' },
                                    ].map(({ icon, text }) => (
                                        <span key={text} className="flex items-center gap-1.5 border border-[#d5d0c2] text-[10px] font-mono font-bold px-3 py-1.5 rounded-none bg-[#f4f0e6] text-[#6b6558] hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors">
                                            {icon}{text}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </Reveal>
            </section>


            {/* ════ MY RESULTS & RANKINGS ════ */}
            <section id="results" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal>
                    <div className="flex items-center justify-between mb-6 border-b border-[#d5d0c2] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-[#0a0a0a] text-[#f4f0e6] flex items-center justify-center">
                                <Award size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] font-mono font-bold text-[#b91c1c] uppercase tracking-widest">My Achievements</p>
                                <h2 className="text-3xl font-normal uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>My Results & Rankings</h2>
                            </div>
                        </div>
                        {(completedQuizzes.length > 0 || marks.length > 0) && (
                            <span className="text-[9px] font-mono font-bold bg-[#0a0a0a] text-[#f4f0e6] px-3 py-1">
                                {completedQuizzes.length + marks.length} Result{(completedQuizzes.length + marks.length) !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </Reveal>

                {completedQuizzes.length === 0 && marks.length === 0 ? (
                    <Reveal delay={100}>
                        <div className="flex flex-col items-center justify-center py-16 rounded-none border border-[#d5d0c2] bg-[#f9f6ee]">
                            <div className="w-14 h-14 rounded-none flex items-center justify-center mb-4 text-[#0a0a0a] bg-[#f4f0e6] border border-[#d5d0c2]">
                                <Award size={24} />
                            </div>
                            <p className="font-bold text-lg mb-1 text-[#0a0a0a] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>No results yet</p>
                            <p className="text-xs text-center max-w-xs text-[#6b6558] font-semibold leading-relaxed">Your exam marks and quiz ranks will appear here after you complete tests.</p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Online Quiz Results */}
                        {completedQuizzes.map((q, i) => {
                            const scoreInfo = studentScores[q.id];
                            return (
                                <Reveal key={`quiz-res-${q.id}`} delay={i * 50}>
                                    <div className="rounded-none border-2 border-[#0a0a0a] p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 bg-[#f9f6ee] hover:bg-[#ede9da] hover:-translate-y-0.5">
                                        {/* Left Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-none border border-[#0a0a0a] bg-[#0a0a0a] text-white flex items-center justify-center shadow-md">
                                                <Zap size={22} />
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-mono font-bold bg-[#b91c1c] text-white px-2 py-0.5 rounded-none uppercase">Online Quiz</span>
                                                <h3 className="font-bold text-lg text-[#0a0a0a] mt-2 mb-1 leading-tight" style={{ fontFamily: "'Archivo', sans-serif" }}>{q.title}</h3>
                                                <p className="text-[10px] font-mono text-[#6b6558]">Completed successfully</p>
                                            </div>
                                        </div>
                                        
                                        {/* Right Performance Stats (BIG bold text) */}
                                        <div className="flex gap-6 mt-4 md:mt-0 w-full md:w-auto border-t md:border-t-0 border-[#d5d0c2] pt-4 md:pt-0">
                                            <div className="flex-1 md:flex-initial text-center md:text-right">
                                                <p className="text-[8px] font-mono font-bold text-[#6b6558] uppercase">Marks</p>
                                                <p className="text-3xl font-black text-[#0a0a0a] tracking-tight mt-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
                                                    <span className="text-[#b91c1c]">{scoreInfo?.score ?? 0}</span>
                                                    <span className="text-sm text-[#6b6558] font-bold">/{scoreInfo?.total ?? 0}</span>
                                                </p>
                                            </div>
                                            {scoreInfo?.rank !== undefined && scoreInfo?.rank !== null && (
                                                <div className="flex-1 md:flex-initial text-center md:text-right border-l border-[#d5d0c2] pl-6">
                                                    <p className="text-[8px] font-mono font-bold text-[#6b6558] uppercase">Rank</p>
                                                    <p className="text-3xl font-black text-[#0a0a0a] tracking-tight mt-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
                                                        <span className="text-[#656CFF]">{scoreInfo?.rank}</span>
                                                        <span className="text-sm text-[#6b6558] font-bold">/{scoreInfo?.total_participants ?? 0}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}

                        {/* Manual Exam Results */}
                        {marks.map((m, i) => (
                            <Reveal key={`mark-res-${m.id}`} delay={(completedQuizzes.length + i) * 50}>
                                <div className="rounded-none border-2 border-[#0a0a0a] p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 bg-[#f9f6ee] hover:bg-[#ede9da] hover:-translate-y-0.5">
                                    {/* Left Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-none border border-[#0a0a0a] bg-[#656CFF] text-white flex items-center justify-center shadow-md">
                                            <Award size={22} />
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-mono font-bold bg-[#656CFF] text-white px-2 py-0.5 rounded-none uppercase">{m.term || 'Exam'}</span>
                                            <h3 className="font-bold text-lg text-[#0a0a0a] mt-2 mb-1 leading-tight" style={{ fontFamily: "'Archivo', sans-serif" }}>{m.title || 'Official Evaluation'}</h3>
                                            <p className="text-[10px] font-mono text-[#6b6558]">{m.subject || 'Physics'}</p>
                                        </div>
                                    </div>

                                    {/* Right Performance Stats (BIG bold text) */}
                                    <div className="flex gap-6 mt-4 md:mt-0 w-full md:w-auto border-t md:border-t-0 border-[#d5d0c2] pt-4 md:pt-0 items-center justify-end">
                                        <div className="text-center md:text-right">
                                            <p className="text-[8px] font-mono font-bold text-[#6b6558] uppercase">Score</p>
                                            <p className="text-3xl font-black text-[#0a0a0a] tracking-tight mt-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
                                                <span className="text-[#b91c1c]">{m.score}</span>
                                                <span className="text-sm text-[#6b6558] font-bold">/{m.max_score || 100}</span>
                                            </p>
                                        </div>
                                        {m.file_url && (
                                            <a href={imgSrc(m.file_url)} target="_blank" rel="noreferrer" className="ml-4 h-9 w-9 rounded-none bg-[#0a0a0a] text-white flex items-center justify-center hover:bg-[#b91c1c] transition-colors" title="Download paper attachment">
                                                <FileText size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>


            {/* ════ QUIZZES ════ */}
            <section id="quizzes" className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                <Reveal><SectionHeader icon={<Zap size={18} />} label="Test Yourself" title="Quizzes & Tests" gradient="from-[#656CFF] to-indigo-650" count={visibleQ.length} badge={`${doneCount}/${visibleQ.length} done`} theme={theme} /></Reveal>
                {loading ? <SkeletonGrid theme={theme} /> : visibleQ.length === 0 ? (
                    <EmptyBox icon={<BookOpen size={40} />} title="No quizzes yet" desc="Quizzes for your batch will appear here" color="blue" theme={theme} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleQ.map((q, i) => {
                            const done = taken.includes(q.id), ended = isEnded(q);
                            return (
                                <Reveal key={q.id} delay={i * 60}>
                                    <div className="rounded-none border border-[#d5d0c2] overflow-hidden group h-full flex flex-col transition-all duration-300 bg-[#f9f6ee] hover:bg-[#ede9da] hover:border-[#0a0a0a] hover:-translate-y-0.5">
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-11 h-11 rounded-none border border-[#d5d0c2] bg-[#f4f0e6] flex items-center justify-center text-[#0a0a0a]">
                                                    {done ? <CheckCircle size={20} className="text-[#b91c1c]" /> : ended ? <Clock size={20} /> : <BookOpen size={20} />}
                                                </div>
                                                {ended && <span className="text-[9px] text-[#6b6558] border border-[#d5d0c2] font-mono px-2 py-0.5 rounded-none font-bold">Expired</span>}
                                                {done && !ended && <span className="text-[9px] bg-[#0a0a0a] text-[#f4f0e6] font-mono px-2 py-0.5 rounded-none font-bold">Completed</span>}
                                                {isNew(q.created_at) && !done && !ended && <span className="text-[9px] bg-[#b91c1c] text-white font-mono px-2 py-0.5 rounded-none font-bold animate-pulse">NEW</span>}
                                            </div>
                                            <h3 className="font-bold text-[#0a0a0a] text-lg mb-2 leading-snug line-clamp-2 transition-colors duration-300 group-hover:text-[#b91c1c]" style={{ fontFamily: "'Archivo', sans-serif" }}>{q.title}</h3>
                                            <p className="text-xs text-[#6b6558] line-clamp-2 flex-1 mb-5 leading-relaxed font-medium">{q.description || 'No description provided.'}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2.5 py-1 rounded-none border border-[#d5d0c2] text-[#6b6558] bg-[#f4f0e6]">
                                                    <Clock size={11} className="text-[#b91c1c]" />{q.duration_minutes || 30} MINS
                                                </span>
                                                {done ? (
                                                    <div className="flex flex-col items-end gap-0.5 font-mono text-[9px] uppercase text-[#6b6558] font-bold">
                                                        <span>Score: <span className="text-[#b91c1c] font-black">{studentScores[q.id]?.score ?? 0}</span>/{studentScores[q.id]?.total ?? 0}</span>
                                                        {studentScores[q.id]?.rank !== undefined && studentScores[q.id]?.rank !== null && (
                                                            <span>Rank: <span className="text-[#b91c1c] font-black">{studentScores[q.id]?.rank}</span>/{studentScores[q.id]?.total_participants ?? 0}</span>
                                                        )}
                                                    </div>
                                                ) : ended ? (<span className="text-xs font-mono font-bold uppercase text-[#6b6558]">EXPIRED</span>
                                                ) : (
                                                    <button onClick={() => startQuiz(q.id)}
                                                        className="flex items-center gap-1.5 bg-[#0a0a0a] text-[#f4f0e6] text-[10px] font-mono uppercase px-4.5 py-2.5 rounded-none hover:bg-[#b91c1c] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer">
                                                        <Play size={11} className="ml-0.5" />Start Quiz
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
                <Reveal><SectionHeader icon={<Video size={18} />} label="Watch & Learn" title="Class Recordings" gradient="from-red-500 to-rose-600" count={recordings.length} theme={theme} /></Reveal>
                {loading ? <SkeletonGrid theme={theme} /> : recordings.length === 0 ? (
                    <EmptyBox icon={<Video size={40} />} title="No recordings yet" desc="Class recordings will appear here when uploaded" color="red" theme={theme} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recordings.map((rec, i) => (
                            <Reveal key={rec.id} delay={i * 60}>
                                <div className="rounded-none border border-[#d5d0c2] overflow-hidden flex flex-col group transition-all duration-300 bg-[#f9f6ee] hover:bg-[#ede9da] hover:border-[#0a0a0a] hover:-translate-y-0.5">
                                    <div className="relative overflow-hidden h-44 bg-[#0a0a0a] border-b border-[#d5d0c2]">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,rgba(255,255,255,0.8) 1px,transparent 0)', backgroundSize: '22px 22px' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 bg-[#b91c1c] rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Play size={24} className="text-white ml-0.5" />
                                            </div>
                                        </div>
                                        {rec.class_name && <span className="absolute top-3 right-3 bg-[#0a0a0a]/65 text-[#f4f0e6] text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none">{rec.class_name}</span>}
                                        {isNew(rec.created_at) && <span className="absolute top-3 left-3 bg-[#b91c1c] text-white text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none font-bold animate-pulse">NEW</span>}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-[#0a0a0a] text-base line-clamp-2 mb-1.5 group-hover:text-[#b91c1c] transition-colors duration-300" style={{ fontFamily: "'Archivo', sans-serif" }}>{rec.title}</h3>
                                        {rec.description && <p className="text-xs text-[#6b6558] line-clamp-2 mb-4 leading-relaxed font-medium">{rec.description}</p>}
                                        <a href={rec.video_url} target="_blank" rel="noreferrer"
                                            className="mt-auto flex items-center justify-center gap-1.5 w-full bg-[#0a0a0a] text-[#f4f0e6] text-[10px] font-mono uppercase py-3 rounded-none hover:bg-[#b91c1c] hover:-translate-y-0.5 transition-all cursor-pointer">
                                            <Play size={11} /> Watch Recording
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
                <Reveal><SectionHeader icon={<FileText size={18} />} label="Study Resources" title="Exam Papers" gradient="from-[#656CFF] to-indigo-650" count={papers.length} /></Reveal>

                {paperTypes.length > 2 && (
                    <Reveal delay={100}>
                        <div className="flex gap-2.5 mb-6 flex-wrap">
                            {paperTypes.map(t => (
                                <button key={t} onClick={() => setPaperFilter(t)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${paperFilter === t ? 'bg-gradient-to-r from-[#656CFF] to-indigo-650 text-white shadow-lg shadow-[#656CFF]/10' : 'bg-white text-slate-500 border border-slate-200 hover:border-[#656CFF]/30 hover:text-[#656CFF] hover:bg-slate-50 shadow-sm'}`}>
                                    <Filter size={12} />{t}
                                </button>
                            ))}
                        </div>
                    </Reveal>
                )}

                {loading ? <SkeletonGrid theme={theme} /> : filteredPapers.length === 0 ? (
                    <EmptyBox icon={<FileText size={40} />} title="No papers yet" desc="Exam papers will appear here when uploaded" color="blue" theme={theme} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredPapers.map((p, i) => {
                            return (
                                <Reveal key={p.id} delay={i * 50}>
                                    <div className="rounded-none border border-[#d5d0c2] overflow-hidden flex flex-col group transition-all duration-300 bg-[#f9f6ee] hover:bg-[#ede9da] hover:border-[#0a0a0a] hover:-translate-y-0.5">
                                        <div className="bg-[#ede9da] p-7 flex items-center justify-center relative overflow-hidden border-b border-[#d5d0c2]">
                                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,#0a0a0a 1px,transparent 0)', backgroundSize: '18px 18px' }} />
                                            <div className="relative w-14 h-14 bg-[#0a0a0a] text-[#f4f0e6] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <FileText size={26} className="drop-shadow" />
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <span className="self-start text-[8px] font-mono font-bold uppercase tracking-wider bg-[#0a0a0a] text-[#f4f0e6] px-2 py-0.5 rounded-none mb-3.5">{p.paper_type}</span>
                                            <h3 className="font-bold line-clamp-2 text-sm leading-snug flex-1 mb-4 text-[#0a0a0a]" style={{ fontFamily: "'Archivo', sans-serif" }}>{p.title}</h3>
                                            <div className="flex flex-col gap-2 mt-auto">
                                                <a href={imgSrc(p.file_url)} target="_blank" rel="noreferrer"
                                                    className="flex items-center justify-center gap-1.5 w-full bg-[#0a0a0a] text-[#f4f0e6] text-[10px] font-mono uppercase py-2.5 rounded-none hover:bg-[#b91c1c] hover:-translate-y-0.5 transition-all cursor-pointer">
                                                    <FileText size={12} />View Paper
                                                </a>
                                                {p.scheme_url && (
                                                    <a href={imgSrc(p.scheme_url)} target="_blank" rel="noreferrer"
                                                        className="flex items-center justify-center gap-1.5 w-full text-[10px] font-mono uppercase py-2.5 rounded-none transition-all border border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#f4f0e6] hover:-translate-y-0.5 cursor-pointer">
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
            <Footer />

            {/* ════ MOBILE BOTTOM NAV ════ */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl border-t shadow-2xl transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0d0e12]/90 border-white/5' : 'bg-white/90 border-gray-200/80'}`}>
                <div className="flex">
                    {sections.map(l => (
                        <a key={l.id} href={`#${l.id}`}
                            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-bold transition-colors gap-1
                                ${activeSection === l.id ? 'text-blue-500' : theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                            <span className={`p-1.5 rounded-xl transition-all ${activeSection === l.id ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') : ''}`}>{React.cloneElement(l.icon, { size: 18 })}</span>
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* ════ BACK TO TOP ════ */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-12 h-12 bg-gradient-to-br from-blue-500 to-red-600 text-white rounded-2xl shadow-xl shadow-blue-300/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <ArrowUp size={20} />
            </button>



            {/* ════ ACCOUNT SETTINGS MODAL ════ */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
                    <div className={`border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative transition-all duration-300 ${theme === 'dark' ? 'bg-[#101217] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'}`}>
                        <button onClick={() => setShowSettingsModal(false)} className={`absolute top-5 right-5 transition-colors cursor-pointer ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-950'}`}><X size={20} /></button>
                        
                        <h3 className={`font-black text-2xl tracking-tight uppercase italic mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Account <span className="text-[#656CFF]">Settings</span></h3>
                        <p className={`text-[10px] uppercase tracking-wider font-bold mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Manage your account details and security</p>

                        {/* Tabs */}
                        <div className="flex gap-2 p-1 rounded-xl bg-slate-500/10 mb-6">
                            <button 
                                onClick={() => { setSettingsTab('profile'); setSettingsError(''); setSettingsSuccess(''); }}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${settingsTab === 'profile' ? 'bg-[#656CFF] text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Profile Details
                            </button>
                            <button 
                                onClick={() => { setSettingsTab('security'); setSettingsError(''); setSettingsSuccess(''); }}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${settingsTab === 'security' ? 'bg-[#656CFF] text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Password / Security
                            </button>
                        </div>

                        {/* Notifications */}
                        {settingsError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {settingsError}
                            </div>
                        )}
                        {settingsSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {settingsSuccess}
                            </div>
                        )}

                        {/* Tab Content */}
                        {settingsTab === 'profile' ? (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={profileName} 
                                        onChange={e => setProfileName(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#656CFF] transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>WhatsApp Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. +94771234567" 
                                        value={profileWhatsApp} 
                                        onChange={e => setProfileWhatsApp(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#656CFF] transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={settingsSaving}
                                    className="w-full bg-[#656CFF] hover:bg-[#545bd9] disabled:bg-[#656CFF]/50 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-[#656CFF]/20 mt-6"
                                >
                                    {settingsSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={currentPassword} 
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#656CFF] transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>New Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#656CFF] transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#656CFF] transition-all ${theme === 'dark' ? 'bg-[#1a1c23] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={settingsSaving}
                                    className="w-full bg-[#656CFF] hover:bg-[#545bd9] disabled:bg-[#656CFF]/50 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-[#656CFF]/20 mt-6"
                                >
                                    {settingsSaving ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border font-bold text-sm bg-emerald-500/90 border-emerald-500/20 text-white`}>
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ════════════════════ SUBCOMPONENTS ════════════════════ */

const SectionHeader = ({ icon, label, title, gradient, count, badge }) => (
    <div className="mb-8 border-b border-[#d5d0c2] pb-4">
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-none flex items-center justify-center bg-[#0a0a0a] text-[#f4f0e6]">{icon}</div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#b91c1c]">{label}</span>
                    {count !== undefined && <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-none bg-[#0a0a0a] text-[#f4f0e6]">{count}</span>}
                </div>
                <h2 className="text-3xl md:text-4xl font-normal text-[#0a0a0a] uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>{title}</h2>
            </div>
            {badge && <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-none text-[#6b6558] bg-[#f9f6ee] border border-[#d5d0c2]">{badge}</span>}
        </div>
    </div>
);

const EmptyBox = ({ icon, title, desc, color }) => {
    const c = { 
        blue: 'text-[#b91c1c] bg-[#b91c1c]/5 border border-[#b91c1c]/15', 
        purple: 'text-[#b91c1c] bg-[#b91c1c]/5 border border-[#b91c1c]/15', 
        emerald: 'text-[#b91c1c] bg-[#b91c1c]/5 border border-[#b91c1c]/15',
        red: 'text-[#b91c1c] bg-[#b91c1c]/5 border border-[#b91c1c]/15'
    };
    return (
        <div className="py-14 px-8 rounded-none border border-[#d5d0c2] bg-[#f9f6ee] text-center max-w-md mx-auto transition-all duration-300 hover:bg-[#ede9da] animate-in fade-in duration-500">
            <div className={`inline-flex p-4 rounded-none mb-4 transition-transform duration-300 hover:scale-105 ${c[color]}`}>{icon}</div>
            <p className="font-bold text-lg text-[#0a0a0a] tracking-tight uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>{title}</p>
            <p className="text-xs mt-2 text-[#6b6558] leading-relaxed max-w-xs mx-auto font-medium">{desc}</p>
        </div>
    );
};

const SkeletonGrid = ({ theme }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
            <div key={i} className={`rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-[#0d0e12]/60 border-white/5' : 'bg-white border-slate-200'}`}>
                <div className={`h-40 shimmer ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
                <div className="p-5 space-y-3">
                    <div className={`h-4 rounded-full shimmer w-3/4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
                    <div className={`h-3 rounded-full shimmer w-1/2 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
                    <div className={`h-10 rounded-2xl shimmer mt-4 w-full ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
                </div>
            </div>
        ))}
    </div>
);

/* ─── Interactive Physics Formula Card ─── */
function InteractiveFormulaCard() {
    const canvasRef = useRef(null);
    const [freq, setFreq] = useState(2.5);
    const [amp, setAmp] = useState(30);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frameId;
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        let time = 0;
        const draw = () => {
            ctx.fillStyle = 'rgba(10, 11, 15, 0.3)';
            ctx.fillRect(0, 0, width, height);

            // Center line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Wave
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(6, 182, 212, 1)';
            ctx.lineWidth = 2;
            for (let x = 0; x < width; x++) {
                const y = height / 2 + Math.sin(x * 0.015 * freq + time * 0.08) * amp * Math.cos(x * 0.003);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Wave peaks (glowing dots)
            ctx.fillStyle = '#656CFF';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#656CFF';
            for (let x = 30; x < width; x += 60) {
                const y = height / 2 + Math.sin(x * 0.015 * freq + time * 0.08) * amp * Math.cos(x * 0.003);
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;

            time += 0.5;
            frameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
        };
    }, [freq, amp]);

    const velocity = (freq * (120 / amp)).toFixed(1);

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">LAB INTERACTIVE</span>
                    <h3 className="text-base font-black tracking-tight text-white uppercase italic mt-1">Wave Theory Simulator</h3>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold">
                    v = f × λ
                </div>
            </div>

            <div className="relative h-28 bg-slate-950/80 rounded-2xl overflow-hidden border border-white/5 mb-4">
                <canvas ref={canvasRef} className="w-full h-full block" />
                <div className="absolute top-2 right-3 bg-black/60 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    v = {velocity} m/s
                </div>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Frequency (f)</span>
                        <span className="text-white font-bold">{freq.toFixed(1)} Hz</span>
                    </div>
                    <input 
                        type="range" min="0.5" max="5.0" step="0.1"
                        value={freq} onChange={e => setFreq(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#656CFF]"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Amplitude (A)</span>
                        <span className="text-white font-bold">{amp.toFixed(0)} mm</span>
                    </div>
                    <input 
                        type="range" min="10" max="50" step="1"
                        value={amp} onChange={e => setAmp(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>
            </div>
        </div>
    );
}

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
        <div className="bg-[#04091c] relative flex items-center justify-center overflow-hidden w-full aspect-video md:aspect-[21/9] lg:aspect-[3/1]"
            style={{ paddingTop: '90px' }}>
            <div className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl float" />
            <div className="absolute bottom-1/4 right-1/4 w-48 md:w-72 h-48 md:h-72 bg-red-500/20 rounded-full blur-3xl float" style={{ animationDelay: '2s' }} />
            <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 glass text-white/80 text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />A/L Physics Academy - Sri Lanka
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-5">
                    Master Physics.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-red-400 to-pink-400">
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
            className="relative overflow-hidden bg-[#04091c] w-full"
            style={{ paddingTop: '90px' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* ── Main Image Layer (Responsive Auto-Height) ── */}
            <div className="relative w-full">
                <img
                    src={imgSrc(s.image_url)}
                    alt="Slider Banner"
                    className="w-full h-auto object-cover sm:object-fill min-h-[300px]"
                />

                {/* ── Bottom Gradient Blend ── */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04091c] via-[#04091c]/20 to-transparent pointer-events-none" />
            </div>

            {/* ── Content ── */}
            <div className="absolute left-0 right-0 top-[90px] bottom-0 flex items-center justify-center px-5 pb-10 z-20">
                <div className="w-full max-w-3xl text-center">


                    {/* Title */}
                    {s.title && (
                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.12] drop-shadow-2xl mb-3 sm:mb-4">
                            {s.title}
                        </h1>
                    )}

                    {/* Subtitle */}
                    {s.subtitle && (
                        <p className="text-white/80 text-sm sm:text-base md:text-lg mb-5 sm:mb-7 max-w-lg mx-auto leading-relaxed line-clamp-3 sm:line-clamp-none">
                            {s.subtitle}
                        </p>
                    )}

                    {/* CTA Button */}
                    {s.button_text && (
                        <a href={s.button_link || '#'} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-gray-900 font-black text-sm px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl hover:scale-105 shadow-2xl transition-all mx-auto">
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

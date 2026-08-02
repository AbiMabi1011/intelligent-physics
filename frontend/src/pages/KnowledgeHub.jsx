import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';
import Footer from '../components/Footer';
import * as Lucide from 'lucide-react';

/* Helper to parse YouTube IDs */
function getYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&#?\s]{11})/);
    return m ? m[1] : null;
}

function src(url) {
    if (!url) return '';
    return url.startsWith('/') ? `${API_URL}${url}` : url;
}

/* ─── Premium Light Theme CSS (Widescreen Layout) ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

.kh-page-wrapper *, .kh-page-wrapper *::before, .kh-page-wrapper *::after { box-sizing: border-box; }
.kh-page-wrapper {
  font-family: 'Inter', sans-serif;
  background: #fafafa;
  color: #171717;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #fafafa; }
::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: #d4d4d4; }

/* Grid Background */
.physics-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: 
    radial-gradient(circle at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 50%),
    linear-gradient(#f4f4f5 1px, transparent 1px),
    linear-gradient(90deg, #f4f4f5 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px, 24px 24px;
}

/* Nav */
.kh-nav {
  position: sticky; top: 0; z-index: 500; height: 64px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 32px;
  background: rgba(255, 255, 255, 0.85); border-bottom: 1px solid #eaeaea;
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
}
.kh-nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
.kh-nav-logo { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e5e5e5; }
.kh-nav-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem; color: #000; letter-spacing: -0.01em; }
.kh-nav-sub { font-size: 0.58rem; color: #4f46e5; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-left: 6px; padding: 2px 6px; background: rgba(99,102,241,0.08); border-radius: 4px; }

/* Layout Wrapper - Full Widescreen */
.workspace-wrapper {
  width: 100%; max-width: 1800px; margin: 0 auto; padding: 40px 32px 100px;
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 40px;
}

/* Header Split */
.header-split {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 32px;
}

/* Hero Section */
.workspace-hero {
  max-width: 100%;
}
.workspace-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ffffff; border: 1px solid #e5e5e5; padding: 6px 12px;
  border-radius: 99px; font-size: 0.72rem; font-weight: 600; color: #4f46e5;
  margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.workspace-title {
  font-family: 'Outfit', sans-serif; font-weight: 850; font-size: 2.6rem;
  color: #000; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 12px;
}
.workspace-desc {
  font-size: 0.9rem; color: #52525b; line-height: 1.6;
}

/* Dashboard CTA Bar */
.cta-banner {
  background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px;
  padding: 24px; display: flex; flex-direction: column; gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.01);
}
.cta-text h3 { font-size: 0.95rem; font-weight: 600; color: #171717; }
.cta-text p { font-size: 0.8rem; color: #71717a; margin-top: 4px; line-height: 1.4; }

/* Grid Layout: Main & Sidebar */
.workspace-grid {
  display: grid;
  grid-template-columns: 3.2fr 1fr;
  gap: 40px;
  align-items: start;
}

/* Left Workspace Main */
.workspace-main-panel {
  display: flex; flex-direction: column; gap: 32px;
}

/* Right Sidebar Panel */
.workspace-sidebar {
  display: flex; flex-direction: column; gap: 24px;
  position: sticky; top: 100px;
}

.sidebar-widget {
  background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);
}
.widget-title {
  font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #71717a;
  letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
}

/* Control Bar (Filters & Search) */
.workspace-control-bar {
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  border-bottom: 1px solid #e5e5e5; padding-bottom: 16px;
}

.workspace-tabs {
  display: flex; gap: 4px; background: #f4f4f5; padding: 4px; border-radius: 8px;
}
.tab-trigger {
  padding: 6px 14px; border-radius: 6px; border: none; background: transparent;
  color: #71717a; font-size: 0.8rem; font-weight: 500; cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.tab-trigger:hover { color: #18181b; }
.tab-trigger.active {
  background: #ffffff; color: #18181b; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.workspace-search {
  position: relative; width: 100%; max-width: 280px;
}
.workspace-search input {
  width: 100%; background: #ffffff; border: 1px solid #e5e5e5;
  border-radius: 8px; padding: 8px 12px 8px 36px; color: #171717;
  font-size: 0.82rem; outline: none; transition: border-color 0.2s;
}
.workspace-search input:focus { border-color: #a3a3a3; }
.workspace-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a1a1aa; }

/* Content List Rows */
.list-container {
  display: flex; flex-direction: column; gap: 8px;
}
.row-item {
  background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;
  padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;
  transition: all 0.2s; cursor: default;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);
}
.row-item:hover {
  border-color: #d4d4d4; box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.row-left {
  display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;
}
.row-icon-wrapper {
  width: 36px; height: 36px; border-radius: 6px; background: #f4f4f5;
  display: flex; align-items: center; justify-content: center; color: #71717a;
  border: 1px solid #e5e5e5; flex-shrink: 0;
}
.row-item:hover .row-icon-wrapper {
  background: rgba(99,102,241,0.08); color: #4f46e5; border-color: rgba(99,102,241,0.15);
}

.row-details { min-width: 0; }
.row-title { font-size: 0.85rem; font-weight: 600; color: #171717; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
.row-meta { display: flex; align-items: center; gap: 12px; font-size: 0.72rem; color: #71717a; }
.meta-badge { background: #f4f4f5; color: #18181b; padding: 2px 6px; border-radius: 4px; font-weight: 500; font-size: 0.65rem; }

.row-actions {
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
}

/* Premium Button style */
.btn-action {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 500;
  border: 1px solid #e5e5e5; background: #ffffff; color: #171717;
  cursor: pointer; text-decoration: none; transition: all 0.15s;
}
.btn-action:hover {
  background: #171717; color: #ffffff; border-color: #171717;
}
.btn-action-primary {
  background: #171717; color: #ffffff; border-color: #171717;
}
.btn-action-primary:hover {
  background: #404040; border-color: #404040;
}

/* Video Spotlight Row */
.spotlight-banner {
  background: linear-gradient(to right, #09090b, #18181b); border-radius: 12px;
  padding: 24px 32px; display: flex; justify-content: space-between; align-items: center;
  color: #ffffff; position: relative; overflow: hidden; border: 1px solid #27272a;
}
.spotlight-info { max-width: 550px; z-index: 2; }
.spotlight-info h2 { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: #ffffff; }
.spotlight-info p { font-size: 0.8rem; color: #a1a1aa; margin-top: 6px; line-height: 1.5; }
.spotlight-action { z-index: 2; }

/* Video Modal overlay */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-content {
  background: #ffffff; border: 1px solid #e5e5e5;
  border-radius: 16px; width: 100%; max-width: 800px;
  position: relative; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.12);
}
.video-ratio { position: relative; width: 100%; padding-bottom: 56.25%; }
.video-ratio iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
.modal-close {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px; border-radius: 50%;
  background: #f4f4f5; border: 1px solid #e5e5e5;
  color: #171717; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
}
.modal-close:hover { background: #e4e4e7; }

/* Dynamic Fullscreen Quiz Screen */
.quiz-screen-container {
  min-height: 100vh; background: #fcfcfc; display: flex; flex-direction: column; z-index: 1000; position: fixed; inset: 0; overflow-y: auto;
}
.quiz-header {
  position: sticky; top: 0; background: #ffffff; border-bottom: 1px solid #e5e5e5; padding: 16px 32px;
  display: flex; flex-direction: column; gap: 8px; z-index: 10;
}
.quiz-header-top { display: flex; justify-content: space-between; align-items: center; }
.quiz-timer { font-weight: 700; color: #4f46e5; background: rgba(99,102,241,0.08); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; }
.quiz-progress-bar-bg { width: 100%; height: 4px; background: #f4f4f5; border-radius: 99px; overflow: hidden; }
.quiz-progress-bar-fill { height: 100%; background: #4f46e5; transition: width 0.3s; }

.quiz-main {
  max-width: 800px; width: 100%; margin: 40px auto 120px; padding: 0 24px; display: flex; flex-direction: column; gap: 24px;
}
.quiz-question-card {
  background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.quiz-question-text { font-size: 1rem; font-weight: 600; color: #171717; margin-bottom: 16px; line-height: 1.5; }
.quiz-options-list { display: flex; flex-direction: column; gap: 8px; }
.quiz-option-btn {
  width: 100%; text-align: left; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 8px;
  background: #ffffff; color: #3f3f46; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
.quiz-option-btn:hover:not(:disabled) { border-color: #a1a1aa; background: #fafafa; }

/* Option status colors */
.quiz-option-btn.selected { border-color: #6366f1; background: rgba(99,102,241,0.04); color: #4f46e5; font-weight: 600; }
.quiz-option-btn.correct { border-color: #10b981; background: rgba(16,185,129,0.06); color: #065f46; font-weight: 600; }
.quiz-option-btn.incorrect { border-color: #ef4444; background: rgba(239,68,68,0.06); color: #991b1b; }

.quiz-bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-top: 1px solid #e5e5e5; padding: 16px; text-align: center; z-index: 10;
}

/* Responsive adjustments */
@media(max-width: 1100px) {
  .header-split { grid-template-columns: 1fr; gap: 24px; }
  .workspace-grid { grid-template-columns: 1fr; gap: 32px; }
  .workspace-sidebar { position: static; }
}
@media(max-width: 600px) {
  .workspace-wrapper { padding: 24px 16px; }
  .kh-nav { padding: 0 16px; }
  .workspace-control-bar { flex-direction: column; align-items: stretch; }
  .workspace-search { max-width: none; }
  .row-item { flex-direction: column; align-items: stretch; gap: 16px; }
  .row-actions { justify-content: flex-end; }
  .spotlight-banner { flex-direction: column; align-items: flex-start; gap: 20px; }
}
`;

export default function KnowledgeHub() {
    const navigate = useNavigate();
    const [papers, setPapers] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('recordings');
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [activeVideoId, setActiveVideoId] = useState(null);

    /* Local storage to track completed public quizzes (single attempt limit) */
    const [takenQuizzes, setTakenQuizzes] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('taken_public_quizzes') || '{}');
        } catch {
            return {};
        }
    });

    /* Practice Quiz States */
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/papers`).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_URL}/recordings`).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_URL}/quizzes`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([p, r, q]) => {
            setPapers((p || []).filter(x => x.visibility === 'hub' || x.visibility === 'both'));
            setRecordings((r || []).filter(x => x.visibility === 'hub' || x.visibility === 'both'));
            setQuizzes((q || []).filter(x => x.is_published && x.class_name && x.class_name.split(',').some(b => b.trim() === 'knowledge hub')));
        }).finally(() => {
            setLoading(false);
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch {
                console.log("AdSense load deferred");
            }
        });
    }, []);

    /* Quiz Timer Effect */
    useEffect(() => {
        if (currentQuiz && timeLeft != null && !quizResult) {
            if (timeLeft <= 0) {
                handleLocalSubmit(true);
            } else {
                const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentQuiz, timeLeft, quizResult]);

    /* Filters */
    const years = [...new Set(papers.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);

    const filteredPapers = papers.filter(p => {
        const q = search.toLowerCase();
        const matchQ = !q || (p.title || '').toLowerCase().includes(q) || (p.year + '').includes(q) || (p.class_name || '').toLowerCase().includes(q);
        const matchY = !yearFilter || String(p.year) === yearFilter;
        return matchQ && matchY;
    });

    const filteredRecs = recordings.filter(r => {
        const q = search.toLowerCase();
        return !q || (r.title || '').toLowerCase().includes(q) || (r.class_name || '').toLowerCase().includes(q);
    });

    const filteredQuizzes = quizzes.filter(qz => {
        const q = search.toLowerCase();
        return !q || (qz.title || '').toLowerCase().includes(q) || (qz.class_name || '').toLowerCase().includes(q);
    });

    // Spotlight Video (First item of recordings)
    const spotlightRec = recordings[0];
    const spotlightYtId = spotlightRec ? getYouTubeId(spotlightRec.video_url) : null;

    /* Start Practice Quiz */
    const startQuiz = async (quizId) => {
        if (takenQuizzes[quizId]) {
            alert("You have already completed this practice quiz.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/quizzes/${quizId}`);
            if (res.ok) {
                const d = await res.json();
                setCurrentQuiz(d);
                setAnswers({});
                setQuizResult(null);
                setTimeLeft((d.duration_minutes || 30) * 60);
            }
        } catch (e) {
            console.error("Failed to load quiz", e);
        } finally {
            setLoading(false);
        }
    };

    /* Submit Quiz locally (no student email check required) */
    const handleLocalSubmit = (force = false) => {
        if (!currentQuiz || quizResult) return;

        const answeredCount = Object.keys(answers).length;
        const totalCount = currentQuiz.questions.length;

        if (!force && answeredCount < totalCount) {
            if (!window.confirm(`You answered ${answeredCount}/${totalCount} questions. Submit anyway?`)) {
                return;
            }
        }

        // Calculate score locally on the frontend
        let score = 0;
        currentQuiz.questions.forEach(q => {
            if (answers[q.id] === q.correct_option) {
                score++;
            }
        });

        const result = {
            score,
            total: totalCount,
            percentage: (score / totalCount) * 100
        };

        setQuizResult(result);

        // Enforce attempt restriction by saving the result to localStorage
        const updated = { ...takenQuizzes, [currentQuiz.id]: result };
        setTakenQuizzes(updated);
        localStorage.setItem('taken_public_quizzes', JSON.stringify(updated));
    };

    /* Render Quiz View if active */
    if (currentQuiz) {
        const answered = Object.keys(answers).length;
        const total = currentQuiz.questions.length;
        return (
            <>
                <style>{CSS}</style>
                <div className="quiz-screen-container">
                    <header className="quiz-header">
                        <div className="quiz-header-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={logo} alt="" style={{ width: 28, height: 28, borderRadius: 6 }} />
                                <div>
                                    <h2 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{currentQuiz.title}</h2>
                                    <p style={{ fontSize: '0.72rem', color: '#71717a' }}>{answered} of {total} answered</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                {timeLeft != null && !quizResult && (
                                    <div className="quiz-timer">
                                        Time Left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                                    </div>
                                )}
                                <button className="btn-action" onClick={() => (quizResult || window.confirm("Exit practice? Your progress will be lost.")) && setCurrentQuiz(null)}>
                                    Exit View
                                </button>
                            </div>
                        </div>
                        <div className="quiz-progress-bar-bg">
                            <div className="quiz-progress-bar-fill" style={{ width: `${(answered / total) * 100}%` }} />
                        </div>
                    </header>

                    <main className="quiz-main">
                        {quizResult ? (
                            <div className="quiz-question-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                                <div style={{ display: 'inline-flex', padding: 16, background: 'rgba(99,102,241,0.08)', color: '#4f46e5', borderRadius: '50%', marginBottom: 20 }}>
                                    <Lucide.Award size={48} />
                                </div>
                                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: '#171717' }}>Practice Quiz Completed!</h2>
                                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#4f46e5', margin: '16px 0' }}>
                                    {quizResult.percentage.toFixed(0)}%
                                </div>
                                <p style={{ color: '#52525b', fontSize: '0.9rem', marginBottom: 32 }}>
                                    You got <span style={{ fontWeight: 700, color: '#171717' }}>{quizResult.score}</span> correct answers out of <span style={{ fontWeight: 700, color: '#171717' }}>{quizResult.total}</span> questions.
                                </p>

                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                    <button className="btn-action btn-action-primary" onClick={() => setCurrentQuiz(null)}>
                                        Back to Knowledge Hub
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {currentQuiz.questions.map((q, idx) => {
                            const isSubmitted = !!quizResult;
                            const selectedOpt = answers[q.id];
                            const correctOpt = q.correct_option;
                            return (
                                <div key={q.id} className="quiz-question-card">
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p className="quiz-question-text">{q.text}</p>

                                            {q.image_url && (
                                                <div style={{ background: '#f4f4f5', border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, marginBottom: 16, display: 'inline-block' }}>
                                                    <img src={`${API_URL}${q.image_url}`} alt="" style={{ maxHeight: 200, objectFit: 'contain' }} />
                                                </div>
                                            )}

                                            <div className="quiz-options-list">
                                                {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                                    const optionText = q[`option_${opt.toLowerCase()}`];
                                                    if (!optionText) return null;

                                                    // Calculate classes/status for post-submit display
                                                    let optClass = '';
                                                    if (isSubmitted) {
                                                        if (opt === correctOpt) optClass = ' correct';
                                                        else if (selectedOpt === opt) optClass = ' incorrect';
                                                    } else {
                                                        if (selectedOpt === opt) optClass = ' selected';
                                                    }

                                                    return (
                                                        <button
                                                            key={opt}
                                                            className={`quiz-option-btn${optClass}`}
                                                            disabled={isSubmitted}
                                                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                                        >
                                                            <span style={{ fontWeight: 700, marginRight: 8 }}>{opt}.</span>
                                                            {optionText}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </main>

                    {!quizResult && (
                        <div className="quiz-bottom-bar">
                            <button className="btn-action btn-action-primary" onClick={() => handleLocalSubmit()} style={{ minWidth: 280, padding: '12px 24px' }}>
                                Submit Answers ({answered} of {total})
                            </button>
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            <style>{CSS}</style>

            {/* Grid layout decoration background */}
            <div className="physics-bg" />

            <div className="kh-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* ─── TOP NAVBAR ─── */}
                <nav className="kh-nav">
                    <div className="kh-nav-brand" onClick={() => navigate('/')}>
                        <img src={logo} className="kh-nav-logo" alt="" />
                        <div className="kh-nav-text" style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="kh-nav-name">Intelligent Physics</span>
                            <span className="kh-nav-sub">Knowledge Hub</span>
                        </div>
                    </div>
                    <div className="kh-nav-actions">
                        <button className="btn-action" onClick={() => navigate('/')} style={{ padding: '6px 12px' }}>
                            <Lucide.ArrowLeft size={13} />
                            Exit Hub
                        </button>
                    </div>
                </nav>

                {/* ─── WORKSPACE LAYOUT ─── */}
                <div className="workspace-wrapper">

                    {/* HERO & HEADER SPLIT */}
                    <div className="header-split">
                        <div className="workspace-hero">
                            <div className="workspace-badge">
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                                Public Class Vault
                            </div>
                            <h1 className="workspace-title">
                                <span style={{ color: '#c00202ff' }}>Intelligent Physics</span> Study Material & Video Archives
                            </h1>
                            <p className="workspace-desc">
                                Access syllabus-aligned class videos, study modules, and legacy past paper solutions. Sign in to unlock full student dash panels and interact with local physics evaluations.
                            </p>
                        </div>

                        {/* CTA / Intro Video BLOCK (Direct Embed format with sound) */}
                        <div className="cta-banner" style={{ padding: '16px', border: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
                                <iframe
                                    src="https://www.youtube.com/embed/BIiL9o2-kjE?autoplay=1&mute=1&controls=1&rel=0"
                                    title="Introduction Video"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div style={{ padding: '0 4px' }}>
                                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#171717' }}>Watch Introduction Video</h3>
                                <p style={{ fontSize: '0.78rem', color: '#71717a', marginTop: 4, marginBottom: 12 }}>Sign in below to access batch resources.</p>
                                <button className="btn-action btn-action-primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                                    Sign In to Student Dashboard
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ADVERTISEMENT / PROMO SECTION */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', margin: '8px 0' }}>
                        {/* Custom Promo Ad */}
                        <div style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecdd3 100%)', border: '1px solid #fda4af', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <div>
                                <span style={{ fontSize: '0.62rem', background: '#c00202ff', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Special Promo</span>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991b1b', marginTop: 8 }}>Theory & Revision Batch Registration</h3>
                                <p style={{ fontSize: '0.76rem', color: '#be123c', marginTop: 4 }}>Get direct teacher feedback & unlock mock exams. Limited seats left!</p>
                            </div>
                            <button className="btn-action" onClick={() => navigate('/login')} style={{ background: '#c00202ff', color: '#ffffff', border: 'none', fontWeight: 600 }}>
                                Enroll Now
                            </button>
                        </div>

                        {/* Google AdSense / Monetization Slot */}
                        <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: '100px' }}>
                            <span style={{ position: 'absolute', top: 8, right: 12, fontSize: '0.58rem', color: '#a1a1aa', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', zIndex: 10 }}>Sponsored Ad</span>
                            
                            {/* React-compatible AdSense Element */}
                            <ins className="adsbygoogle"
                                 style={{ display: 'block', width: '100%', minHeight: '80px' }}
                                 data-ad-client="ca-pub-2891295631901898"
                                 data-ad-slot="6454512107"
                                 data-ad-format="auto"
                                 data-full-width-responsive="true">
                            </ins>
                        </div>
                    </div>

                    {/* TWO-COLUMN GRID */}
                    <div className="workspace-grid">

                        {/* LEFT COLUMN: Main Hub Content */}
                        <div className="workspace-main-panel">
                            {/* SPOTLIGHT VIDEO */}
                            {spotlightRec && spotlightYtId && (
                                <div className="spotlight-banner">
                                    <div className="spotlight-info">
                                        <span style={{ fontSize: '0.62rem', background: '#3f3f46', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Featured Video</span>
                                        <h2 style={{ marginTop: 10 }}>{spotlightRec.title}</h2>
                                        <p>{spotlightRec.class_name || 'Physics Theory Walkthrough'} • Open Preview</p>
                                    </div>
                                    <div className="spotlight-action">
                                        <button className="btn-action" onClick={() => setActiveVideoId(spotlightYtId)} style={{ background: '#fff', color: '#000', border: 'none', fontWeight: 600 }}>
                                            <Lucide.Play size={13} fill="#000" style={{ marginRight: 4 }} /> Watch Preview
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CONTROLS & CONTENT LIST */}
                            <div>
                                <div className="workspace-control-bar">
                                    <div className="workspace-tabs">
                                        <button className={`tab-trigger${tab === 'recordings' ? ' active' : ''}`} onClick={() => { setTab('recordings'); setSearch(''); setYearFilter(''); }}>
                                            <Lucide.Video size={14} />
                                            Class Videos
                                        </button>
                                        <button className={`tab-trigger${tab === 'papers' ? ' active' : ''}`} onClick={() => { setTab('papers'); setSearch(''); setYearFilter(''); }}>
                                            <Lucide.FileText size={14} />
                                            Past Papers
                                        </button>
                                        <button className={`tab-trigger${tab === 'quizzes' ? ' active' : ''}`} onClick={() => { setTab('quizzes'); setSearch(''); setYearFilter(''); }}>
                                            <Lucide.Zap size={14} />
                                            Spark Exam
                                        </button>
                                    </div>

                                    <div className="workspace-search">
                                        <Lucide.Search size={14} />
                                        <input
                                            placeholder="Search resources..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MAIN WORKSPACE CONTENT LIST */}
                            <div style={{ minHeight: '300px' }}>
                                {loading ? <Spinner /> : (
                                    <div key={tab} style={{ animation: 'fadeIn 0.2s ease-out' }}>
                                        <div className="list-container">
                                            {tab === 'papers' && (
                                                filteredPapers.length === 0 ? (
                                                    <Empty icon="📄" msg="No papers match your search parameters." />
                                                ) : (
                                                    filteredPapers.map((p, i) => (
                                                        <div key={p.id || i} className="row-item">
                                                            <div className="row-left">
                                                                <div className="row-icon-wrapper">
                                                                    <Lucide.FileText size={18} />
                                                                </div>
                                                                <div className="row-details">
                                                                    <h3 className="row-title">{p.title || p.name || 'Physics Resource File'}</h3>
                                                                    <div className="row-meta">
                                                                        <span className="meta-badge">{p.year || 'A/L'}</span>
                                                                        <span>{p.class_name || 'General physics theory'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row-actions">
                                                                {p.file_url ? (
                                                                    <a href={src(p.file_url)} target="_blank" rel="noreferrer" className="btn-action btn-action-primary">
                                                                        <Lucide.Download size={13} /> Download PDF
                                                                    </a>
                                                                ) : (
                                                                    <button className="btn-action" onClick={() => navigate('/login')}>
                                                                        <Lucide.Lock size={12} /> Locked
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            )}

                                            {tab === 'recordings' && (
                                                filteredRecs.length === 0 ? (
                                                    <Empty icon="🎥" msg="No recordings match your search parameters." />
                                                ) : (
                                                    filteredRecs.map((r, i) => {
                                                        const ytId = getYouTubeId(r.video_url);
                                                        return (
                                                            <div key={r.id || i} className="row-item">
                                                                <div className="row-left">
                                                                    <div className="row-icon-wrapper">
                                                                        <Lucide.Play size={18} />
                                                                    </div>
                                                                    <div className="row-details">
                                                                        <h3 className="row-title">{r.title}</h3>
                                                                        <div className="row-meta">
                                                                            <span>{r.class_name}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="row-actions">
                                                                    <button onClick={() => setActiveVideoId(ytId || r.video_url)} className="btn-action btn-action-primary">
                                                                        <Lucide.Tv size={13} /> Watch Preview
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )
                                            )}

                                            {tab === 'quizzes' && (
                                                filteredQuizzes.length === 0 ? (
                                                    <Empty icon="⚡" msg="No practice quizzes available at the moment." />
                                                ) : (
                                                    filteredQuizzes.map((qz, i) => {
                                                        const isAttempted = !!takenQuizzes[qz.id];
                                                        return (
                                                            <div key={qz.id || i} className="row-item">
                                                                <div className="row-left">
                                                                    <div className="row-icon-wrapper">
                                                                        <Lucide.Zap size={18} />
                                                                    </div>
                                                                    <div className="row-details">
                                                                        <h3 className="row-title">{qz.title}</h3>
                                                                        <div className="row-meta">
                                                                            <span className="meta-badge">{qz.duration_minutes || 30} mins</span>
                                                                            <span>{qz.class_name || 'Physics Practice Test'}</span>
                                                                            {isAttempted && (
                                                                                <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                                    <Lucide.CheckCircle size={12} /> Score: {takenQuizzes[qz.id].score}/{takenQuizzes[qz.id].total} ({takenQuizzes[qz.id].percentage.toFixed(0)}%)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="row-actions">
                                                                    {isAttempted ? (
                                                                        <button disabled className="btn-action" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                                                            Completed
                                                                        </button>
                                                                    ) : (
                                                                        <button onClick={() => startQuiz(qz.id)} className="btn-action btn-action-primary">
                                                                            <Lucide.Play size={13} style={{ marginRight: 4 }} /> Start Practice
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar Filters & Info */}
                        <div className="workspace-sidebar">

                            {/* Year Filter Widget */}
                            {tab === 'papers' && years.length > 0 && (
                                <div className="sidebar-widget">
                                    <div className="widget-title">
                                        <Lucide.Filter size={13} />
                                        Filter by Year
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <button
                                            className={`btn-action${!yearFilter ? ' btn-action-primary' : ''}`}
                                            onClick={() => setYearFilter('')}
                                            style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 12px' }}
                                        >
                                            All Years
                                        </button>
                                        {years.map(y => (
                                            <button
                                                key={y}
                                                className={`btn-action${yearFilter === String(y) ? ' btn-action-primary' : ''}`}
                                                onClick={() => setYearFilter(String(y))}
                                                style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 12px' }}
                                            >
                                                Year {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Help / Instructions Widget */}
                            <div className="sidebar-widget">
                                <div className="widget-title">
                                    <Lucide.Info size={13} />
                                    Learning Resources
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.5 }}>
                                    Welcome to our workspace portal. Here, you can search and reference public resources. For complete mock tests, homework submissions, and personal support, please log in with your credentials.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                <Footer />
            </div>

            {/* Video Modal Player Overlay */}
            {activeVideoId && (
                <div className="modal-overlay" onClick={() => setActiveVideoId(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveVideoId(null)}>
                            <Lucide.X size={14} />
                        </button>
                        <div className="video-ratio">
                            {activeVideoId.length === 11 ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', height: '100%', position: 'absolute', inset: 0, padding: 30, background: '#ffffff', color: '#171717', textAlign: 'center' }}>
                                    <p className="font-bold mb-4" style={{ fontWeight: 600 }}>Opening in external player...</p>
                                    <a href={activeVideoId} target="_blank" rel="noreferrer" className="btn-action" style={{ maxWidth: 200 }}>Open Link</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Spinner ── */
const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #e5e5e5', borderTopColor: '#171717', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
);

/* ── Empty ── */
const Empty = ({ icon, msg }) => (
    <div className="kh-empty" style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #e5e5e5', borderRadius: '12px', background: '#ffffff' }}>
        <div className="kh-empty-icon" style={{ fontSize: '2rem', opacity: 0.6 }}>{icon}</div>
        <div className="kh-empty-text" style={{ fontSize: '0.82rem', color: '#71717a', marginTop: 8 }}>{msg}</div>
    </div>
);

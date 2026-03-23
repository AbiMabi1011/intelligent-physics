import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';
import Footer from '../components/Footer';

/* ─── Data ─── */
const SYLLABUS = [
  { topic: 'Measurement', icon: '📏', desc: 'Physical quantities, SI units, scalars & vectors, errors and uncertainties.' },
  { topic: 'Mechanics', icon: '⚙️', desc: "Kinematics, Newton's Laws, momentum, work, energy, power and circular motion." },
  { topic: 'Oscillation & Waves', icon: '〰️', desc: 'SHM, wave properties, sound, light, diffraction and interference.' },
  { topic: 'Thermal Physics', icon: '🌡️', desc: 'Heat transfer, ideal gas laws, internal energy and first law of thermodynamics.' },
  { topic: 'Gravitational Field', icon: '🪐', desc: "Newton's law of gravitation, gravitational potential and satellite motion." },
  { topic: 'Electric Field', icon: '⚡', desc: "Coulomb's law, electric potential, capacitance and energy in electric fields." },
  { topic: 'Magnetic Field', icon: '🧲', desc: 'Magnetic flux density, force on conductors, electromagnetic induction.' },
  { topic: 'Current Electricity', icon: '🔌', desc: "Ohm's law, resistance, EMF, Kirchhoff's laws and AC circuits." },
  { topic: 'Electronics', icon: '💡', desc: 'Semiconductors, diodes, transistors, logic gates and op-amps.' },
  { topic: 'Mechanical Properties', icon: '🔩', desc: "Stress, strain, Young's modulus, elasticity and fluid pressure." },
  { topic: 'Matter & Radiation', icon: '☢️', desc: 'Photoelectric effect, atomic structure, nuclear reactions and radioactive decay.' },
];

const FEATURES = [
  { icon: '📋', title: 'Past Paper Bank', desc: 'Full archive of A/L past papers with marking schemes and examiner notes.' },
  { icon: '🧩', title: 'Adaptive Quizzes', desc: 'Smart quizzes that target your weak topics and adapt difficulty in real-time.' },
  { icon: '🎬', title: 'HD Class Recordings', desc: 'Every class recorded in full HD — rewatch, pause and revise at your pace.' },
  { icon: '📊', title: 'Live Results & Marks', desc: 'Marks published instantly after assessments with detailed teacher feedback.' },
  { icon: '📢', title: 'Batch Announcements', desc: 'Real-time notices for class changes, exam dates and important updates.' },
  { icon: '🏆', title: 'Ranking System', desc: 'Track your position in the batch leaderboard and monitor your progress.' },
];

const FALLBACK_STATS = [
  { value: '1,200+', label: 'Students Enrolled', color: '#3b82f6', bg: 'rgba(59,130,246,.12)', icon: '🎓' },
  { value: '500+', label: 'Past Papers', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', icon: '📄' },
  { value: '300+', label: 'Recorded Sessions', color: '#06b6d4', bg: 'rgba(6,182,212,.12)', icon: '🎥' },
  { value: '94%', label: 'Pass Rate', color: '#10b981', bg: 'rgba(16,185,129,.12)', icon: '✅' },
];

const FAQS = [
  { q: 'Who is Intelligent Physics for?', a: 'Sri Lankan A-Level Physics students following the national curriculum, from first-year through to exam year.' },
  { q: 'How do I join a batch?', a: 'Register through the Learning Hub, select your batch during sign-up, and await admin approval within 24 hours.' },
  { q: 'Can I access recordings after class?', a: 'Yes. All sessions are uploaded within 6 hours of the live class and remain accessible for your full enrolment period.' },
  { q: 'How are marks and results shared?', a: 'Marks are published instantly through the portal after grading, with detailed feedback visible online.' },
];

const FALLBACK_SLIDES = [
  { id: 1, title: 'Intelligent Physics', subtitle: "Sri Lanka's Premier A/L Physics Digital Platform", button_text: 'Access Portal', button_link: '/login', gradient: 'linear-gradient(160deg,#04091c 0%,#081530 50%,#0a1a42 100%)' },
  { id: 2, title: 'A/L 2026 Batch — Now Open!', subtitle: 'Expert teaching · Full digital access · Limited seats available', button_text: 'Enroll Now', button_link: '/login', gradient: 'linear-gradient(160deg,#060412 0%,#11063a 50%,#180852 100%)' },
];

const IMG = url => (!url ? '' : url.startsWith('/') ? `${API_URL}${url}` : url);


/* ─── Fallback Ad Data (used when no ads exist in DB) ─── */
const FALLBACK_LEFT = [
  { id: 'f1', badge: '🔥 Now Open', title: 'A/L 2026 Batch', description: 'Limited seats left. Register now to secure your spot in the upcoming batch.', cta_text: 'Enroll Now', cta_link: '/login', gradient: 'linear-gradient(145deg,#0f0b2e,#1a116b)', accent: '#6366f1' },
  { id: 'f2', badge: '📄 Free Access', title: 'Past Paper Bank', description: 'Access 500+ A/L Physics past papers with full mark schemes. First 2 are free.', cta_text: 'Browse Papers', cta_link: '/learning-hub', gradient: 'linear-gradient(145deg,#0a1a2e,#0d2b55)', accent: '#3b82f6' },
  { id: 'f3', badge: '🏆 94% Pass Rate', title: 'Proven Results', description: 'Our students consistently achieve district-top results in the A/L examination.', cta_text: 'Learn More', cta_link: '#about', gradient: 'linear-gradient(145deg,#061a14,#0a2e20)', accent: '#10b981' },
];

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Inter',system-ui,sans-serif;background:#04091c;color:#8b9ab5;overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.6;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(59,130,246,.25);border-radius:99px;}

@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes barIn{from{width:0;}to{width:100%;}}
@keyframes shimmer{from{left:-100%;}to{left:200%;}}
@keyframes gradMove{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
@keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.3);}50%{box-shadow:0 0 0 8px rgba(99,102,241,0);}}

/* NAVBAR */
.nav{position:fixed;top:0;left:0;right:0;z-index:500;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;transition:background .3s,border-color .3s;border-bottom:1px solid transparent;}
.nav.sc{background:rgba(4,9,28,.92);border-bottom-color:rgba(255,255,255,.06);backdrop-filter:blur(24px);}
.nav-brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
.nav-brand img{width:34px;height:34px;object-fit:contain;border-radius:8px;border:1px solid rgba(255,255,255,.12);}
.nav-brand span{font-weight:800;font-size:.95rem;color:#e2e8f0;letter-spacing:-.01em;}
.nav-links{display:flex;align-items:center;gap:6px;list-style:none;}
.nav-links li button{background:none;border:none;cursor:pointer;color:#64748b;font-size:.85rem;font-weight:500;transition:color .2s;font-family:inherit;padding:7px 14px;border-radius:8px;}
.nav-links li button:hover{color:#e2e8f0;background:rgba(255,255,255,.04);}
.nav-cta{background:linear-gradient(135deg,#3b82f6,#6366f1)!important;color:#fff!important;font-weight:700!important;box-shadow:0 4px 14px rgba(59,130,246,.35)!important;padding:8px 20px!important;border-radius:9px!important;}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,130,246,.5)!important;}
.hbg{display:none;background:none;border:none;cursor:pointer;padding:6px;color:#94a3b8;}
.mob{display:none;position:fixed;top:64px;left:0;right:0;background:rgba(4,9,28,.98);backdrop-filter:blur(24px);padding:20px 24px 28px;z-index:499;border-bottom:1px solid rgba(255,255,255,.06);animation:slideDown .2s ease;}
.mob.open{display:block;}
.mob ul{list-style:none;display:flex;flex-direction:column;gap:12px;}
.mob li button{background:none;border:none;cursor:pointer;color:#64748b;font-size:.95rem;font-weight:500;display:block;width:100%;text-align:left;padding:8px 0;font-family:inherit;border-bottom:1px solid rgba(255,255,255,.04);}
@media(max-width:768px){.nav-links{display:none;}.hbg{display:block;}.nav{padding:0 18px;}}

/* 3-COLUMN PAGE WRAPPER (below hero) */
.page-wrap{display:grid;grid-template-columns:240px 1fr;gap:0;max-width:1440px;margin:0 auto;padding:0 24px;}
@media(max-width:1200px){.page-wrap{grid-template-columns:200px 1fr;}}
@media(max-width:960px){.page-wrap{grid-template-columns:1fr;padding:0 16px;}.ad-col{display:none;}}
.ad-col{padding:28px 0;display:flex;flex-direction:column;gap:16px;}
.ad-col-left{padding-right:20px;}
.main-col{min-width:0;border-left:1px solid rgba(255,255,255,.04);}

/* AD CARDS */
.ad-card{border-radius:16px;padding:20px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.07);transition:transform .25s,box-shadow .25s;}
.ad-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,.3);}
.ad-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--ac,.6) 50%,transparent);}
.ad-badge{display:inline-flex;align-items:center;gap:5px;font-size:.63rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;border-radius:9999px;padding:3px 9px;margin-bottom:11px;}
.ad-title{font-family:'Space Grotesk',sans-serif;font-size:.98rem;font-weight:800;color:#f1f5f9;line-height:1.25;letter-spacing:-.02em;margin-bottom:8px;}
.ad-desc{color:#3d5475;font-size:.76rem;line-height:1.65;margin-bottom:14px;}
.ad-btn{display:block;width:100%;padding:9px 12px;border-radius:9px;border:none;font-size:.78rem;font-weight:700;cursor:pointer;text-align:center;transition:all .22s;font-family:inherit;text-decoration:none;position:relative;overflow:hidden;}
.ad-shimmer{position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);animation:shimmer 3s ease-in-out infinite 1s;}

/* sticky ad wrappers */
.ad-sticky{position:sticky;top:88px;display:flex;flex-direction:column;gap:16px;}

/* Quick links card */
.ql-card{border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);padding:18px;overflow:hidden;}
.ql-card-hdr{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.ql-card-title{font-weight:700;color:#e2e8f0;font-size:.88rem;letter-spacing:-.01em;}
.ql-link{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;text-decoration:none;transition:background .18s;border:1px solid transparent;}
.ql-link:hover{background:rgba(59,130,246,.07);border-color:rgba(59,130,246,.15);}
.ql-link-ico{width:28px;height:28px;border-radius:7px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.15);display:flex;align-items:center;justify-content:center;font-size:.76rem;flex-shrink:0;}
.ql-link-lbl{color:#64748b;font-size:.78rem;font-weight:600;transition:color .18s;}
.ql-link:hover .ql-link-lbl{color:#93c5fd;}

/* Testimonial card */
.tm-card{border-radius:16px;padding:20px;border:1px solid rgba(255,255,255,.07);position:relative;overflow:hidden;}
.tm-quote{color:#475569;font-size:.78rem;line-height:1.7;font-style:italic;margin-bottom:14px;position:relative;padding-left:14px;}
.tm-quote::before{content:'"';position:absolute;left:0;top:-4px;font-size:1.8rem;color:rgba(6,182,212,.3);font-style:normal;line-height:1;}
.tm-name{font-weight:700;color:#e2e8f0;font-size:.8rem;}
.tm-result{color:#334155;font-size:.72rem;margin-top:2px;}

/* Schedule card */
.sched-card{border-radius:16px;padding:20px;border:1px solid rgba(255,255,255,.07);overflow:hidden;}
.sched-day{font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:800;color:#f1f5f9;margin-bottom:4px;}
.sched-time{color:#475569;font-size:.76rem;}
.sched-icon{font-size:1.6rem;margin-bottom:10px;}

/* MAIN SECTIONS */
.sec{padding:64px 40px;}
.sec-alt{background:rgba(255,255,255,.016);}
.con{max-width:780px;margin:0 auto;}
@media(max-width:768px){.sec{padding:52px 22px;}}

.ew{display:inline-flex;align-items:center;gap:8px;color:#3b82f6;font-size:.7rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;margin-bottom:14px;}
.ew::before{content:'';display:block;width:16px;height:2px;background:linear-gradient(90deg,#3b82f6,#6366f1);border-radius:2px;flex-shrink:0;}
.hd{font-family:'Space Grotesk',system-ui,sans-serif;font-size:clamp(1.7rem,3.2vw,2.4rem);font-weight:800;line-height:1.15;letter-spacing:-.03em;margin-bottom:14px;color:#f1f5f9;}
.hd b{background:linear-gradient(135deg,#60a5fa,#818cf8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.sb{color:#3d5475;font-size:.92rem;line-height:1.78;max-width:500px;}

/* STATS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
.stat-card{background:#040c20;padding:24px 20px;display:flex;flex-direction:column;gap:8px;transition:background .22s;cursor:default;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,#3b82f6);opacity:.7;}
.stat-card:hover{background:rgba(59,130,246,.04);}
.stat-ico{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.95rem;background:var(--bg);margin-bottom:2px;}
.stat-val{font-family:'Space Grotesk',sans-serif;font-size:1.9rem;font-weight:900;color:var(--c,#3b82f6);line-height:1;}
.stat-lbl{color:#2d3d54;font-size:.76rem;font-weight:600;}

/* ABOUT */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
@media(max-width:680px){.about-grid{grid-template-columns:1fr;gap:32px;}}
.about-visual{position:relative;border-radius:18px;border:1px solid rgba(255,255,255,.07);overflow:hidden;background:linear-gradient(145deg,#0b1628,#061022);display:flex;align-items:center;justify-content:center;min-height:280px;padding:40px;}
.about-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.03) 1px,transparent 1px);background-size:36px 36px;}
.checklist{display:flex;flex-direction:column;gap:10px;margin-top:20px;}
.check-item{display:flex;align-items:center;gap:10px;}
.check-ico{width:20px;height:20px;border-radius:5px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.check-txt{color:#4f6180;font-size:.86rem;}

/* SYLLABUS */
.syl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
.syl-card{background:#04091c;padding:20px 18px;transition:background .22s;display:flex;flex-direction:column;gap:7px;}
.syl-card:hover{background:rgba(59,130,246,.04);}
.syl-icon{font-size:1.2rem;margin-bottom:4px;}
.syl-topic{font-weight:700;color:#e2e8f0;font-size:.87rem;letter-spacing:-.01em;}
.syl-desc{color:#2d3d54;font-size:.76rem;line-height:1.65;}

/* FEATURES */
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
.feat-card{background:#04091c;padding:22px 18px;transition:background .22s;}
.feat-card:hover{background:rgba(59,130,246,.04);}
.feat-ico-wrap{width:38px;height:38px;border-radius:10px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.18);display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:.95rem;}
.feat-title{font-weight:700;color:#e2e8f0;font-size:.9rem;margin-bottom:6px;letter-spacing:-.01em;}
.feat-desc{color:#2d3d54;font-size:.8rem;line-height:1.7;}

/* FAQ */
.faq-item{border-bottom:1px solid rgba(255,255,255,.05);padding:18px 0;}
.faq-btn{background:none;border:none;cursor:pointer;width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;text-align:left;font-family:inherit;}
.faq-q{color:#cbd5e1;font-weight:600;font-size:.92rem;line-height:1.45;}
.faq-chevron{flex-shrink:0;transition:transform .22s;color:#3b82f6;}
.faq-a{color:#3d5475;font-size:.86rem;line-height:1.75;margin-top:12px;padding-right:28px;}

/* CONTACT */
.contact-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
.contact-card{background:#04091c;padding:24px 20px;display:flex;flex-direction:column;gap:8px;text-decoration:none;transition:background .22s;}
.contact-card:hover{background:rgba(59,130,246,.04);}
.contact-ico{width:40px;height:40px;border-radius:11px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.18);display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:4px;}
.contact-lbl{font-weight:700;color:#e2e8f0;font-size:.88rem;}
.contact-val{color:#2d3d54;font-size:.79rem;}

/* CTA */
.cta-section{padding:0 40px 80px;}
@media(max-width:768px){.cta-section{padding:0 22px 60px;}}
.cta-box{border-radius:18px;padding:60px 48px;background:linear-gradient(145deg,#0a1020,#0d1835);border:1px solid rgba(255,255,255,.07);text-align:center;position:relative;overflow:hidden;}
.cta-top-bar{position:absolute;top:0;left:50%;transform:translateX(-50%);height:2px;background:linear-gradient(90deg,transparent,#3b82f6,#8b5cf6,#6366f1,transparent);width:0;animation:barIn 1.6s ease .2s forwards;}
.cta-glow{position:absolute;top:-60%;left:50%;transform:translateX(-50%);width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.08),transparent 70%);pointer-events:none;}
@media(max-width:768px){.cta-box{padding:40px 22px;}}

/* FOOTER */
/* Tailwind classes are used instead for full responsiveness */

/* HERO */
.hero-wrap{position:relative;width:100%;height:65vh;min-height:480px;max-height:800px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-top:64px;background-color:#04091c;}
.hero-content{position:relative;z-index:10;text-align:center;padding:0 24px;max-width:820px;width:100%;}
.hero-slide-transition{transition:opacity .28s,transform .28s;}

/* general util */
.pbtn{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border:none;cursor:pointer;padding:12px 26px;border-radius:9px;font-size:.9rem;font-weight:700;display:inline-flex;align-items:center;gap:8px;font-family:inherit;transition:all .22s;box-shadow:0 4px 16px rgba(59,130,246,.35);}
.pbtn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,130,246,.5);}
.gbtn{background:transparent;border:1px solid rgba(255,255,255,.12);color:#8b9ab5;cursor:pointer;padding:12px 22px;border-radius:9px;font-size:.9rem;font-weight:600;font-family:inherit;transition:all .22s;}
.gbtn:hover{border-color:rgba(255,255,255,.28);color:#e2e8f0;}
`;

/* ─── Hero Slider ─── */
function HeroSlider({ slides, navigate }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef(null);
  const go = useCallback(n => { setFading(true); setTimeout(() => { setIdx(n); setFading(false); }, 300); }, []);
  const next = useCallback(() => go((idx + 1) % slides.length), [idx, go, slides.length]);
  const prev = useCallback(() => go((idx - 1 + slides.length) % slides.length), [idx, go, slides.length]);
  useEffect(() => { timer.current = setInterval(next, 6000); return () => clearInterval(timer.current); }, [next]);
  const reset = () => { clearInterval(timer.current); timer.current = setInterval(next, 6000); };
  const s = slides[idx];
  const hasBg = !!s.image_url;
  const goLink = link => {
    if (!link || link === '/login') { navigate('/login'); return; }
    if (link.startsWith('#')) document.getElementById(link.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else navigate(link);
  };
  return (
    <div className="hero-wrap">
      <div style={{ position: 'absolute', inset: 0, transition: 'opacity .3s', opacity: fading ? .5 : 1, ...(hasBg ? { backgroundImage: `url(${IMG(s.image_url)})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top' } : { background: s.gradient || '#04091c' }) }}>
        {hasBg && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(4,9,28,.1),rgba(4,9,28,.05) 50%,rgba(4,9,28,.95))' }} />}
      </div>
      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.03) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%,#000 30%,transparent 100%)', pointerEvents: 'none' }} />
      {/* Glow */}
      <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)', pointerEvents: 'none' }} />
      {/* Content */}
      <div className="hero-content hero-slide-transition" style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(12px)' : 'translateY(0)' }}>

        {s.title && <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(2.2rem,6vw,4rem)', fontWeight: 900, lineHeight: 1.07, letterSpacing: '-.04em', margin: '0 0 18px', color: '#f8fafc' }}>{s.title}</h1>}
        {s.subtitle && <p style={{ fontSize: 'clamp(.88rem,1.8vw,1.05rem)', color: '#3d5475', lineHeight: 1.78, maxWidth: 540, margin: '0 auto 36px' }}>{s.subtitle}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {s.button_text && s.button_text !== 'Access Portal' && (
            <button className="gbtn" style={{ fontSize: '.97rem', padding: '14px 24px' }} onClick={() => goLink(s.button_link)}>{s.button_text}</button>
          )}
        </div>
      </div>
      {/* Arrows */}
      {['left', 'right'].map(d => (
        <button key={d} onClick={() => { d === 'left' ? prev() : next(); reset(); }} aria-label={d}
          style={{ position: 'absolute', top: '50%', [d]: 20, transform: 'translateY(-50%)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, transition: 'background .2s' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points={d === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} /></svg>
        </button>
      ))}
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 20 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => { go(i); reset(); }} aria-label={`Slide ${i + 1}`}
            style={{ width: i === idx ? 24 : 7, height: 7, borderRadius: 9999, border: 'none', cursor: 'pointer', background: i === idx ? '#6366f1' : 'rgba(255,255,255,.15)', transition: 'all .25s' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', color: '#1e293b', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', zIndex: 20, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'bounce 2.2s ease-in-out infinite' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        Scroll
      </div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-btn" onClick={() => setOpen(v => !v)}>
        <span className="faq-q">{q}</span>
        <svg className="faq-chevron" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

/* ─── Dynamic Ad Card (left OR right) ─── */
function DynAdCard({ ad, navigate }) {
  const accent = ad.accent || '#6366f1';
  const grad = ad.gradient || 'linear-gradient(145deg,#0f0b2e,#1a116b)';
  const imgSrc = ad.image_url?.startsWith('/') ? `${API_URL}${ad.image_url}` : ad.image_url;
  const goLink = (link) => {
    if (!link) return;
    if (link.startsWith('/')) navigate(link);
    else if (link.startsWith('#')) document.getElementById(link.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.open(link, '_blank');
  };
  return (
    <div className="ad-card" style={{ background: grad, '--ac': accent, position: 'relative', overflow: 'hidden' }}>
      {imgSrc && (
        <div style={{ margin: '-24px -24px 20px -24px' }}>
          <img src={imgSrc} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      {ad.badge && (
        <div className="ad-badge" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}>
          {ad.badge}
        </div>
      )}
      <div className="ad-title">{ad.title}</div>
      {ad.description && <div className="ad-desc">{ad.description}</div>}
      {ad.cta_text && (
        <button className="ad-btn" style={{ background: accent, color: '#fff', boxShadow: `0 4px 16px ${accent}55` }}
          onClick={() => goLink(ad.cta_link)}>
          <span className="ad-shimmer" />
          {ad.cta_text} →
        </button>
      )}
    </div>
  );
}


/* ─── Main Export ─── */
export default function HomePage() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [homeAds, setHomeAds] = useState([]);
  const [homeStats, setHomeStats] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/sliders`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/home-ads`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/home-stats`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([sliders, ads, stats]) => {
      const active = (sliders || []).filter(s => s.is_active).sort((a, b) => a.order_index - b.order_index);
      setSlides(active.length ? active : FALLBACK_SLIDES);
      setHomeAds((ads || []).filter(a => a.is_active));
      setHomeStats((stats || []).filter(s => s.is_active));
    }).finally(() => setLoaded(true));
  }, []);

  // Derive left / right ads; fall back to FALLBACK_LEFT / empty when DB has nothing
  const leftAds = homeAds.filter(a => a.position === 'left');
  const rightAds = homeAds.filter(a => a.position === 'right');
  const showLeftAds = leftAds.length > 0 ? leftAds : FALLBACK_LEFT;

  const showStats = homeStats.length > 0 ? homeStats : FALLBACK_STATS;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? ' sc' : ''}`}>
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="" />
          <span>Intelligent Physics</span>
        </div>
        <ul className="nav-links">
          <li><button onClick={() => scrollTo('contact')}>Contact Us</button></li>
          <li><button onClick={() => navigate('/learning-hub')} style={{ color: '#93c5fd', fontWeight: 600 }}>Knowledge Hub</button></li>
          <li><button className="nav-cta" onClick={() => navigate('/login')}>Learning Hub</button></li>
        </ul>
        <button className="hbg" onClick={() => setMenuOpen(v => !v)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`mob${menuOpen ? ' open' : ''}`}>
        <ul>
          <li><button onClick={() => { scrollTo('contact'); setMenuOpen(false); }}>Contact Us</button></li>
          <li><button onClick={() => { navigate('/learning-hub'); setMenuOpen(false); }} style={{ color: '#93c5fd', fontWeight: 600 }}>Knowledge Hub</button></li>
          <li><button onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ color: '#60a5fa', fontWeight: 700 }}>Learning Hub →</button></li>
        </ul>
      </div>

      {/* ── HERO (full width) ── */}
      {loaded
        ? <HeroSlider slides={slides} navigate={navigate} />
        : <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#04091c' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        </div>
      }

      {/* ── 3-COLUMN LAYOUT ── */}
      <div className="page-wrap">

        {/* LEFT AD COLUMN */}
        <div className="ad-col ad-col-left">
          <div className="ad-sticky">
            {showLeftAds.map(ad => <DynAdCard key={ad.id} ad={ad} navigate={navigate} />)}
          </div>
        </div>

        {/* CENTER MAIN CONTENT */}
        <div className="main-col">

          {/* STATS */}
          <section className="sec">
            <div className="stats-grid">
              {showStats.map(s => (
                <div key={s.id || s.label} className="stat-card" style={{ '--c': s.color, '--bg': s.bg }}>
                  <div className="stat-ico">{s.icon}</div>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="sec sec-alt">
            <div className="con">
              <div className="about-grid">
                <div className="about-visual">
                  <div className="about-grid-bg" />
                  <img src={logo} alt="Intelligent Physics" style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 18, filter: 'drop-shadow(0 0 40px rgba(99,102,241,.4))', animation: 'float 5s ease-in-out infinite', position: 'relative', zIndex: 1 }} />
                </div>
                <div>
                  <div className="ew">About</div>
                  <h2 className="hd">A/L Physics, <b>Mastered Together</b></h2>
                  <p className="sb">A dedicated Advanced-Level Physics platform built for Sri Lankan students — expert tuition, comprehensive digital tools, and a proven track record of top results.</p>
                  <div className="checklist">
                    {['National A/L syllabus fully covered', 'Expert teacher with district-topping results', 'Personal performance tracking per batch', 'Instant marks, detailed feedback', '24/7 access from any device'].map(t => (
                      <div key={t} className="check-item">
                        <div className="check-ico"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <span className="check-txt">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                    <button className="pbtn" onClick={() => navigate('/login')}>Enroll Now</button>
                    <button className="gbtn" onClick={() => scrollTo('features')}>See Features</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SYLLABUS */}
          <section id="syllabus" className="sec">
            <div style={{ marginBottom: 36, textAlign: 'center' }}>
              <div className="ew">Curriculum</div>
              <h2 className="hd">Full A/L Syllabus Coverage</h2>
              <p className="sb" style={{ margin: '0 auto', textAlign: 'center' }}>Every unit of the national curriculum — structured, thorough and exam-focused.</p>
            </div>
            <div className="syl-grid">
              {SYLLABUS.map(s => (
                <div key={s.topic} className="syl-card">
                  <div className="syl-icon">{s.icon}</div>
                  <div className="syl-topic">{s.topic}</div>
                  <div className="syl-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="sec sec-alt">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="ew">Platform</div>
              <h2 className="hd">Built for Serious Students</h2>
              <p className="sb" style={{ margin: '0 auto', textAlign: 'center' }}>Everything you need to reach your A/L Physics target.</p>
            </div>
            <div className="feat-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feat-card">
                  <div className="feat-ico-wrap">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="sec">
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              <div className="ew">FAQ</div>
              <h2 className="hd">Common Questions</h2>
              {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="sec sec-alt">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="ew">Contact</div>
              <h2 className="hd">Get in Touch</h2>
              <p className="sb" style={{ margin: '0 auto', textAlign: 'center' }}>Have questions about Intelligent Physics? We're here to help.</p>
            </div>
            <div className="contact-grid">
              {[
                { icon: '📱', label: 'WhatsApp', value: 'Message us on WhatsApp', href: 'https://wa.me/94000000000' },
                { icon: '📧', label: 'Email', value: 'info@intelligentphysics.lk', href: 'mailto:info@intelligentphysics.lk' },
                { icon: '📍', label: 'Location', value: 'Sri Lanka', href: '#' },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="contact-card"
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,.04)'}
                  onMouseOut={e => e.currentTarget.style.background = '#04091c'}>
                  <div className="contact-ico">{c.icon}</div>
                  <div className="contact-lbl">{c.label}</div>
                  <div className="contact-val">{c.value}</div>
                </a>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="cta-section">
            <div className="cta-box">
              <div className="cta-top-bar" />
              <div className="cta-glow" />
              <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
                <div className="ew" style={{ justifyContent: 'center' }}>Get Started</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: 14, letterSpacing: '-.03em', lineHeight: 1.15 }}>
                  Ready to Excel in Physics?
                </h2>
                <p style={{ color: '#3d5475', fontSize: '.92rem', lineHeight: 1.75, marginBottom: 28 }}>
                  Join over 1,200 students on the platform. Access your portal or enrol in the next batch.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                  <button className="pbtn" id="cta-portal-btn" style={{ padding: '13px 30px', fontSize: '.95rem' }} onClick={() => navigate('/login')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                    Learning Hub
                  </button>
                  <button className="gbtn" style={{ padding: '13px 30px', fontSize: '.95rem' }} onClick={() => navigate('/register')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

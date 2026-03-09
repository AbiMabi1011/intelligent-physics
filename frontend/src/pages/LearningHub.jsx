import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';

/* ─── helpers ─── */
function getYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#\s]{11})/);
    return m ? m[1] : null;
}
function src(url) {
    if (!url) return '';
    return url.startsWith('/') ? `${API_URL}${url}` : url;
}
function fmtDate(raw) {
    if (!raw) return '';
    try { return new Date(raw).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
}

/* ─── global styles ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #010409;
  color: #8b9ab5;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,.25); border-radius: 99px; }

/* ── keyframes ── */
@keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin     { to { transform:rotate(360deg); } }
@keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
@keyframes orbit1   { from{transform:rotate(0deg)   translateX(108px) rotate(0deg);}   to{transform:rotate(360deg)  translateX(108px) rotate(-360deg);} }
@keyframes orbit2   { from{transform:rotate(130deg) translateX(148px) rotate(-130deg);} to{transform:rotate(490deg)  translateX(148px) rotate(-490deg);} }
@keyframes orbit3   { from{transform:rotate(260deg) translateX(84px)  rotate(-260deg);} to{transform:rotate(620deg)  translateX(84px)  rotate(-620deg);} }
@keyframes gradMove { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
@keyframes shimmer  { from{left:-100%;} to{left:200%;} }
@keyframes glowRing { 0%,100%{box-shadow:0 0 28px rgba(99,102,241,.2);} 50%{box-shadow:0 0 52px rgba(99,102,241,.45),0 0 80px rgba(139,92,246,.18);} }
@keyframes borderPulse { 0%,100%{border-color:rgba(99,102,241,.2);} 50%{border-color:rgba(99,102,241,.5);} }
@keyframes badgePulse  { 0%,100%{opacity:.7;transform:scale(1);} 50%{opacity:1;transform:scale(1.15);} }
@keyframes slideChip   { from{opacity:0;transform:translateX(12px);} to{opacity:1;transform:translateX(0);} }

/* ── navbar ── */
.n { position:sticky; top:0; z-index:500; height:66px; display:flex; align-items:center; justify-content:space-between; padding:0 40px; background:rgba(1,4,9,.88); border-bottom:1px solid rgba(255,255,255,.06); backdrop-filter:blur(24px); }
.n-brand { display:flex; align-items:center; gap:13px; cursor:pointer; }
.n-img { width:40px; height:40px; border-radius:11px; object-fit:contain; border:1.5px solid rgba(99,102,241,.35); box-shadow:0 0 18px rgba(99,102,241,.22); transition:box-shadow .3s; }
.n-brand:hover .n-img { box-shadow:0 0 32px rgba(99,102,241,.5); }
.n-name { font-weight:800; font-size:.97rem; color:#f1f5f9; letter-spacing:-.02em; }
.n-tag  { font-size:.63rem; color:#6366f1; font-weight:700; letter-spacing:.14em; text-transform:uppercase; margin-top:1px; }
.n-right { display:flex; align-items:center; gap:10px; }
.btn-g { padding:8px 18px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:none; color:#64748b; font-size:.81rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; font-family:inherit; transition:all .2s; }
.btn-g:hover { border-color:rgba(255,255,255,.18); color:#e2e8f0; background:rgba(255,255,255,.04); }
.btn-p { padding:9px 22px; border-radius:9px; border:none; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:.83rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:7px; font-family:inherit; box-shadow:0 4px 20px rgba(99,102,241,.38); transition:all .2s; position:relative; overflow:hidden; }
.btn-p::after { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); animation:shimmer 3.5s ease-in-out infinite 1.5s; }
.btn-p:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(99,102,241,.55); }

/* ── hero ── */
.hero { position:relative; overflow:hidden; padding:80px 40px 70px; min-height:440px; display:flex; align-items:center; }
.hero-bg    { position:absolute; inset:0; background:#010409; }
.hero-glow1 { position:absolute; top:-15%; right:-5%;  width:640px; height:640px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.17) 0%,rgba(139,92,246,.07) 40%,transparent 70%); pointer-events:none; }
.hero-glow2 { position:absolute; bottom:-25%; left:-8%; width:480px; height:480px; border-radius:50%; background:radial-gradient(circle,rgba(59,130,246,.11) 0%,transparent 65%); pointer-events:none; }
.hero-grid  { position:absolute; inset:0; background-image:linear-gradient(rgba(99,102,241,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.038) 1px,transparent 1px); background-size:54px 54px; mask-image:radial-gradient(ellipse 90% 80% at 50% 0%,#000 25%,transparent 75%); }
.hero-left  { position:relative; z-index:2; max-width:640px; }
.hero-right { position:absolute; right:64px; top:50%; transform:translateY(-50%); z-index:2; }

.badge { display:inline-flex; align-items:center; gap:9px; background:linear-gradient(135deg,rgba(99,102,241,.14),rgba(139,92,246,.08)); border:1px solid rgba(99,102,241,.3); color:#a5b4fc; font-size:.69rem; font-weight:800; letter-spacing:.14em; padding:6px 16px; border-radius:9999px; margin-bottom:24px; text-transform:uppercase; }
.badge-dot { width:6px; height:6px; border-radius:50%; background:#818cf8; box-shadow:0 0 8px rgba(129,140,248,.8); animation:badgePulse 2.2s ease-in-out infinite; }

.h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(2.3rem,5.5vw,3.6rem); font-weight:900; line-height:1.07; letter-spacing:-.04em; color:#f8fafc; margin-bottom:18px; }
.h1-hi { background:linear-gradient(135deg,#818cf8,#c4b5fd,#67e8f9,#818cf8); background-size:300% 300%; animation:gradMove 6s ease infinite; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

.sub { color:#3d5475; font-size:.97rem; line-height:1.82; max-width:510px; margin-bottom:36px; }

.hero-btns { display:flex; flex-wrap:wrap; gap:12px; }
.btn-hero { padding:13px 30px; border-radius:11px; border:none; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:.95rem; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:9px; font-family:inherit; box-shadow:0 6px 26px rgba(99,102,241,.46); transition:all .25s; }
.btn-hero:hover { transform:translateY(-2px); box-shadow:0 12px 34px rgba(99,102,241,.6); }
.btn-hero-out { padding:13px 26px; border-radius:11px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.035); color:#8b9ab5; font-size:.95rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .25s; }
.btn-hero-out:hover { border-color:rgba(255,255,255,.2); color:#f1f5f9; background:rgba(255,255,255,.07); }

/* hero stat pills */
.hero-pills { display:flex; flex-wrap:wrap; gap:10px; margin-top:32px; }
.hero-pill  { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:9999px; padding:7px 16px; font-size:.77rem; font-weight:600; color:#64748b; white-space:nowrap; }
.hero-pill-icon { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.7rem; }

/* ── TAB BAR ── */
.tabbar { background:rgba(1,4,9,.75); border-bottom:1px solid rgba(255,255,255,.06); backdrop-filter:blur(20px); position:sticky; top:66px; z-index:400; }
.tabbar-inner { max-width:1260px; margin:0 auto; padding:0 40px; display:flex; }
.tab { background:none; border:none; border-bottom:2.5px solid transparent; padding:17px 30px; font-size:.87rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:9px; white-space:nowrap; transition:all .22s; color:#2d3d54; font-family:inherit; }
.tab.on { color:#818cf8; border-bottom-color:#6366f1; }
.tab:not(.on):hover { color:#4f6180; }
.tab-cnt { padding:2px 9px; border-radius:9999px; font-size:.69rem; font-weight:800; transition:all .22s; }
.tab.on  .tab-cnt { background:rgba(99,102,241,.18); color:#818cf8; }
.tab:not(.on) .tab-cnt { background:rgba(255,255,255,.04); color:#1e293b; }

/* ── LAYOUT ── */
.page-body { flex:1; }
.layout { max-width:1260px; margin:0 auto; padding:44px 40px 100px; display:grid; grid-template-columns:1fr 320px; gap:36px; align-items:start; }

/* section header */
.shdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:10px; }
.stitle { font-family:'Space Grotesk',sans-serif; font-size:1.18rem; font-weight:800; color:#e2e8f0; letter-spacing:-.02em; display:flex; align-items:center; gap:10px; }
.stitle::before { content:''; width:3px; height:18px; background:linear-gradient(180deg,#6366f1,#7c3aed); border-radius:2px; flex-shrink:0; }
.scnt { font-size:.77rem; color:#1e293b; font-weight:600; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); padding:4px 12px; border-radius:9999px; }

/* lock bar */
.lockbar { background:linear-gradient(135deg,rgba(99,102,241,.07),rgba(139,92,246,.04)); border:1px solid rgba(99,102,241,.17); border-radius:14px; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:24px; flex-wrap:wrap; }
.lockbar-t { color:#3d5475; font-size:.83rem; display:flex; align-items:center; gap:10px; }
.lockbar-btn { background:rgba(99,102,241,.14); border:1px solid rgba(99,102,241,.26); color:#818cf8; border-radius:8px; padding:8px 18px; font-size:.79rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:all .2s; font-family:inherit; }
.lockbar-btn:hover { background:rgba(99,102,241,.24); color:#a5b4fc; }

/* search / filter bar */
.filter-bar { display:flex; align-items:center; gap:10px; margin-bottom:22px; flex-wrap:wrap; }
.search-box { flex:1; min-width:180px; position:relative; }
.search-box input { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:10px 14px 10px 38px; color:#cbd5e1; font-size:.85rem; font-family:inherit; outline:none; transition:border-color .2s; }
.search-box input::placeholder { color:#2d3d54; }
.search-box input:focus { border-color:rgba(99,102,241,.4); }
.search-box svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; }
.filter-chip { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:9999px; padding:7px 15px; font-size:.78rem; font-weight:600; color:#2d3d54; cursor:pointer; transition:all .2s; font-family:inherit; white-space:nowrap; }
.filter-chip.sel { background:rgba(99,102,241,.15); border-color:rgba(99,102,241,.3); color:#818cf8; }
.filter-chip:hover:not(.sel) { border-color:rgba(255,255,255,.15); color:#64748b; }

/* ── PAPER CARDS ── */
.papers-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(274px,1fr)); gap:16px; }
.paper-card {
  background:rgba(255,255,255,.027);
  border:1px solid rgba(255,255,255,.07);
  border-radius:18px; padding:22px;
  display:flex; flex-direction:column; gap:16px;
  transition:all .25s; position:relative; overflow:hidden;
  cursor:default;
}
.paper-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(59,130,246,.5),transparent); opacity:0; transition:opacity .25s; }
.paper-card:hover { border-color:rgba(59,130,246,.28); transform:translateY(-4px); box-shadow:0 18px 48px rgba(0,0,0,.32),0 0 0 1px rgba(59,130,246,.05); }
.paper-card:hover::before { opacity:1; }
.paper-card.free-card::after { content:'FREE'; position:absolute; top:12px; right:12px; background:linear-gradient(135deg,rgba(16,185,129,.15),rgba(52,211,153,.1)); border:1px solid rgba(16,185,129,.3); color:#34d399; border-radius:9999px; padding:3px 10px; font-size:.63rem; font-weight:800; letter-spacing:.07em; }
.paper-ico { width:48px; height:48px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
.paper-title { font-weight:700; color:#e2e8f0; font-size:.92rem; line-height:1.45; margin-bottom:4px; }
.paper-meta  { color:#2d3d54; font-size:.74rem; font-weight:500; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.meta-dot { width:3px; height:3px; background:#1e293b; border-radius:50%; }
.dl-btn { display:flex; align-items:center; justify-content:center; gap:8px; border-radius:11px; padding:11px; font-size:.83rem; font-weight:700; cursor:pointer; transition:all .22s; text-decoration:none; border:none; font-family:inherit; width:100%; }
.dl-open { background:linear-gradient(135deg,rgba(59,130,246,.14),rgba(99,102,241,.1)); border:1px solid rgba(59,130,246,.3); color:#93c5fd; }
.dl-open:hover { background:linear-gradient(135deg,rgba(59,130,246,.25),rgba(99,102,241,.18)); box-shadow:0 4px 18px rgba(59,130,246,.2); }
.dl-lock { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); color:#1e293b; }
.dl-lock:hover { border-color:rgba(99,102,241,.28); color:#818cf8; background:rgba(99,102,241,.06); }

/* ── VIDEO CARDS ── */
.recs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:18px; }
.rec-card {
  background:rgba(255,255,255,.027);
  border:1px solid rgba(255,255,255,.07);
  border-radius:18px; overflow:hidden;
  display:flex; flex-direction:column;
  transition:all .25s;
}
.rec-card:hover { border-color:rgba(99,102,241,.3); transform:translateY(-4px); box-shadow:0 18px 48px rgba(0,0,0,.32); }
.rec-thumb { height:172px; background:linear-gradient(135deg,#0c0a28,#0d1f52); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.rec-thumb img { width:100%; height:100%; object-fit:cover; }
.play-circle { width:56px; height:56px; background:rgba(255,255,255,.14); border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,.24); backdrop-filter:blur(4px); transition:transform .2s; }
.rec-card:hover .play-circle { transform:scale(1.08); }
.lock-overlay { position:absolute; inset:0; background:rgba(1,4,9,.65); backdrop-filter:blur(5px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
.free-tag { position:absolute; top:10px; left:10px; background:rgba(16,185,129,.14); border:1px solid rgba(16,185,129,.28); color:#34d399; border-radius:9999px; padding:3px 10px; font-size:.63rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
.members-tag { color:rgba(255,255,255,.5); font-size:.67rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; }
.rec-body { padding:18px 20px; flex:1; display:flex; flex-direction:column; gap:10px; }
.rec-title { font-weight:700; color:#e2e8f0; font-size:.91rem; line-height:1.42; }
.rec-meta  { display:flex; align-items:center; gap:6px; color:#2d3d54; font-size:.75rem; }
.watch-btn { display:flex; align-items:center; justify-content:center; gap:8px; border-radius:11px; padding:11px; font-size:.84rem; font-weight:700; cursor:pointer; transition:all .22s; text-decoration:none; border:none; font-family:inherit; margin-top:auto; width:100%; }
.watch-open { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; box-shadow:0 4px 16px rgba(99,102,241,.33); }
.watch-open:hover { box-shadow:0 8px 24px rgba(99,102,241,.52); opacity:.92; }
.watch-lock { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); color:#1e293b; }
.watch-lock:hover { border-color:rgba(99,102,241,.28); color:#818cf8; background:rgba(99,102,241,.06); }

/* ── SIDEBAR CARD ── */
.side-card { background:linear-gradient(155deg,rgba(10,12,30,.98),rgba(22,10,60,.8)); border:1px solid rgba(99,102,241,.22); border-radius:22px; padding:30px 26px; position:sticky; top:130px; animation:borderPulse 4.5s ease-in-out infinite; overflow:hidden; }
.side-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(99,102,241,.6),rgba(167,139,250,.4),transparent); }
.side-hdr { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.side-ico { width:46px; height:46px; border-radius:13px; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 4px 18px rgba(99,102,241,.4); }
.side-ttl { font-weight:800; color:#f1f5f9; font-size:1.02rem; letter-spacing:-.01em; }
.side-sub { color:#3d5475; font-size:.77rem; margin-top:2px; }
.side-login-btn { width:100%; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border:none; border-radius:12px; padding:15px; font-size:.95rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px; box-shadow:0 6px 24px rgba(99,102,241,.44); margin-bottom:22px; transition:all .25s; font-family:inherit; position:relative; overflow:hidden; }
.side-login-btn::after { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); animation:shimmer 3s ease-in-out infinite 2s; }
.side-login-btn:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(99,102,241,.58); }
.side-divider { font-size:.67rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:#1e293b; margin-bottom:13px; }
.side-feature { display:flex; align-items:center; gap:11px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.035); }
.side-feature:last-child { border-bottom:none; }
.side-feature-ico { width:32px; height:32px; border-radius:9px; background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.15); display:flex; align-items:center; justify-content:center; font-size:.86rem; flex-shrink:0; }
.side-feature-lbl { color:#3d5475; font-size:.82rem; line-height:1.35; }

/* ── EMPTY STATE ── */
.empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; text-align:center; gap:14px; }
.empty-ico { font-size:3.2rem; opacity:.2; filter:grayscale(1); }
.empty-msg { color:#1e293b; font-size:.9rem; line-height:1.75; }

/* ── FOOTER ── */
/* Tailwind classes used for the footer instead */

/* ── RESPONSIVE ── */
@media(max-width:1060px) { .hero-right { display:none; } }
@media(max-width:860px) {
  .layout { grid-template-columns:1fr; }
  .side-card { display:none; }
}
@media(max-width:700px) {
  .n, .hero, .tabbar-inner, .layout, .footer { padding-left:18px; padding-right:18px; }
  .papers-grid, .recs-grid { grid-template-columns:1fr; }
}
`;

/* ── Orbit Visual ── */
function Orb() {
    const rings = [280, 210, 145];
    const orbs = [
        { anim: 'orbit1 9s linear infinite', size: 13, bg: 'linear-gradient(135deg,#60a5fa,#818cf8)' },
        { anim: 'orbit2 14s linear infinite', size: 10, bg: '#a78bfa' },
        { anim: 'orbit3 7s linear infinite', size: 9, bg: 'linear-gradient(135deg,#34d399,#6366f1)' },
    ];
    return (
        <div style={{ width: 310, height: 310, position: 'relative', flexShrink: 0, animation: 'float 8s ease-in-out infinite' }}>
            {rings.map((s, i) => (
                <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: s, height: s, borderRadius: '50%', border: `1px solid rgba(99,102,241,${.06 + i * .05})` }} />
            ))}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 55px rgba(99,102,241,.6),0 0 100px rgba(99,102,241,.18),inset 0 1px 0 rgba(255,255,255,.2)', zIndex: 5 }}>
                <img src={logo} alt="" style={{ width: '74%', height: '74%', objectFit: 'contain', borderRadius: '50%' }} />
            </div>
            {orbs.map((o, i) => (
                <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, animation: o.anim, zIndex: 4 }}>
                    <div style={{ width: o.size, height: o.size, borderRadius: '50%', background: o.bg, boxShadow: `0 0 ${o.size + 4}px rgba(99,102,241,.55)`, marginTop: -o.size / 2, marginLeft: -o.size / 2 }} />
                </div>
            ))}
            {[
                { style: { top: '4%', right: '-2%' }, icon: '📄', label: 'Past Papers', delay: '0s' },
                { style: { bottom: '8%', right: '-4%' }, icon: '🎥', label: 'Class Videos', delay: '.7s' },
                { style: { top: '44%', left: '-8%' }, icon: '🏆', label: 'Free Preview', delay: '1.4s' },
            ].map(({ style, icon, label, delay }) => (
                <div key={label} style={{ position: 'absolute', ...style, background: 'rgba(8,12,30,.88)', border: '1px solid rgba(99,102,241,.22)', borderRadius: 11, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(12px)', zIndex: 10, whiteSpace: 'nowrap', animation: `float 5s ${delay} ease-in-out infinite`, boxShadow: '0 4px 20px rgba(0,0,0,.35)' }}>
                    <span style={{ fontSize: '.88rem' }}>{icon}</span>
                    <span style={{ color: '#a5b4fc', fontSize: '.71rem', fontWeight: 700 }}>{label}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Sidebar ── */
function Sidebar({ navigate }) {
    const features = [
        ['📋', 'All past papers & mark schemes'],
        ['🎬', 'Full HD class recordings'],
        ['📊', 'Marks, rankings & feedback'],
        ['🧩', 'Live quizzes & instant results'],
        ['📢', 'Private batch announcements'],
        ['🗓️', 'Class schedule & reminders'],
    ];
    return (
        <div className="side-card">
            <div className="side-hdr">
                <div className="side-ico">🎓</div>
                <div>
                    <div className="side-ttl">Student Portal</div>
                    <div className="side-sub">Unlock your full experience</div>
                </div>
            </div>
            <button id="sidebar-login-btn" className="side-login-btn" onClick={() => navigate('/login')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Login to Learning Hub
            </button>
            <div className="side-divider">What you unlock</div>
            {features.map(([icon, lbl]) => (
                <div key={lbl} className="side-feature">
                    <div className="side-feature-ico">{icon}</div>
                    <span className="side-feature-lbl">{lbl}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Spinner ── */
const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '90px 0' }}>
        <div style={{ width: 42, height: 42, border: '3px solid rgba(99,102,241,.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin .85s linear infinite' }} />
    </div>
);

/* ── Empty ── */
const Empty = ({ icon, msg }) => (
    <div className="empty">
        <div className="empty-ico">{icon}</div>
        <div className="empty-msg">{msg}</div>
    </div>
);

/* ── Main ── */
export default function LearningHub() {
    const navigate = useNavigate();
    const [papers, setPapers] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('recordings');
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/papers`).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_URL}/recordings`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([p, r]) => {
            setPapers((p || []).filter(x => x.visibility === 'hub' || x.visibility === 'both'));
            setRecordings((r || []).filter(x => x.visibility === 'hub' || x.visibility === 'both'));
        }).finally(() => setLoading(false));
    }, []);

    /* derived filters */
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

    const tabs = [
        { id: 'recordings', label: 'Class Videos', icon: '🎥', count: recordings.length },
        { id: 'papers', label: 'Past Papers', icon: '📄', count: papers.length },
    ];

    return (
        <>
            <style>{CSS}</style>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#010409' }}>

                {/* ─── NAV ─── */}
                <nav className="n">
                    <div className="n-brand" onClick={() => navigate('/')}>
                        <img src={logo} className="n-img" alt="" />
                        <div>
                            <div className="n-name">Intelligent Physics</div>
                            <div className="n-tag">Knowledge Center</div>
                        </div>
                    </div>
                    <div className="n-right">
                        <button className="btn-g" onClick={() => navigate('/')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                            Back to Home
                        </button>
                        <button id="nav-login-btn" className="btn-p" onClick={() => navigate('/login')}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                            Learning Hub
                        </button>
                    </div>
                </nav>

                {/* ─── HERO ─── */}
                <section className="hero" style={{ animation: 'fadeUp .5s both' }}>
                    <div className="hero-bg" />
                    <div className="hero-glow1" />
                    <div className="hero-glow2" />
                    <div className="hero-grid" />

                    <div className="hero-left">
                        <div className="badge">
                            <div className="badge-dot" />
                            Knowledge Center
                        </div>
                        <h1 className="h1">
                            Intelligent Physics<br />
                            <span className="h1-hi">Knowledge Hub</span>
                        </h1>
                        <p className="sub">
                            Browse past exam papers and recorded class sessions from Sri Lanka's leading A/L Physics platform. Login to unlock your full personalised portal.
                        </p>
                        <div className="hero-btns">
                            <button id="hero-login-btn" className="btn-hero" onClick={() => navigate('/login')}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                                Login to Learning Hub
                            </button>
                            <button className="btn-hero-out" onClick={() => navigate('/')}>
                                Explore Website
                            </button>
                        </div>
                        {!loading && (
                            <div className="hero-pills" style={{ animation: 'fadeUp .5s .25s both' }}>
                                {[
                                    { icon: '📄', label: `${papers.length} Past Papers`, bg: 'rgba(239,68,68,.1)', b: 'rgba(239,68,68,.18)' },
                                    { icon: '🎥', label: `${recordings.length} Recordings`, bg: 'rgba(99,102,241,.1)', b: 'rgba(99,102,241,.18)' },
                                    { icon: '🆓', label: '2 Free Previews', bg: 'rgba(16,185,129,.1)', b: 'rgba(16,185,129,.18)' },
                                ].map(p => (
                                    <div key={p.label} className="hero-pill">
                                        <div className="hero-pill-icon" style={{ background: p.bg, border: `1px solid ${p.b}` }}>{p.icon}</div>
                                        {p.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hero-right" style={{ animation: 'fadeUp .5s .15s both' }}>
                        <Orb />
                    </div>
                </section>

                {/* ─── TABS ─── */}
                <div className="tabbar">
                    <div className="tabbar-inner">
                        {tabs.map(t => (
                            <button key={t.id} className={`tab${tab === t.id ? ' on' : ''}`} onClick={() => { setTab(t.id); setSearch(''); setYearFilter(''); }}>
                                <span>{t.icon}</span>
                                {t.label}
                                <span className="tab-cnt">{t.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── CONTENT ─── */}
                <div className="page-body">
                    <div className="layout">

                        {/* ── Main column ── */}
                        <div style={{ minWidth: 0 }}>
                            {loading ? <Spinner /> : (
                                <div key={tab} style={{ animation: 'fadeUp .35s both' }}>

                                    {/* PAST PAPERS */}
                                    {tab === 'papers' && (
                                        <>
                                            <div className="shdr">
                                                <div className="stitle">Past Exam Papers</div>
                                                <div className="scnt">{filteredPapers.length} of {papers.length}</div>
                                            </div>

                                            {/* Filter bar */}
                                            <div className="filter-bar">
                                                <div className="search-box">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d3d54" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                    <input placeholder="Search papers…" value={search} onChange={e => setSearch(e.target.value)} />
                                                </div>
                                                {years.slice(0, 6).map(y => (
                                                    <button key={y} className={`filter-chip${yearFilter === String(y) ? ' sel' : ''}`} onClick={() => setYearFilter(yearFilter === String(y) ? '' : String(y))}>
                                                        {y}
                                                    </button>
                                                ))}
                                            </div>


                                            {filteredPapers.length === 0
                                                ? <Empty icon="📄" msg="No papers match your search. Try a different keyword or year." />
                                                : (
                                                    <div className="papers-grid">
                                                        {filteredPapers.map((p, i) => {
                                                            const isFree = i < 2;
                                                            return (
                                                                <div key={p.id} className={`paper-card${isFree ? ' free-card' : ''}`}>
                                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                                                                        <div className="paper-ico" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.18)' }}>📋</div>
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div className="paper-title">{p.title || p.name || `Past Paper #${i + 1}`}</div>
                                                                            <div className="paper-meta">
                                                                                {p.subject || 'Physics'}
                                                                                {p.year && <><div className="meta-dot" />{p.year}</>}
                                                                                {p.class_name && <><div className="meta-dot" />{p.class_name}</>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {isFree && p.file_url ? (
                                                                        <a href={src(p.file_url)} target="_blank" rel="noreferrer" className="dl-btn dl-open">
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                                            Download Paper
                                                                        </a>
                                                                    ) : (
                                                                        <button className="dl-btn dl-lock" onClick={() => navigate('/login')}>
                                                                            🔒 &nbsp;Login to Download
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )
                                            }
                                        </>
                                    )}

                                    {/* RECORDINGS */}
                                    {tab === 'recordings' && (
                                        <>
                                            <div className="shdr">
                                                <div className="stitle">Class Recordings</div>
                                                <div className="scnt">{filteredRecs.length} of {recordings.length}</div>
                                            </div>

                                            {/* Filter bar */}
                                            <div className="filter-bar">
                                                <div className="search-box">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d3d54" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                    <input placeholder="Search videos…" value={search} onChange={e => setSearch(e.target.value)} />
                                                </div>
                                            </div>


                                            {filteredRecs.length === 0
                                                ? <Empty icon="🎥" msg="No recordings match your search. Try a different keyword." />
                                                : (
                                                    <div className="recs-grid">
                                                        {filteredRecs.map((r, i) => {
                                                            const ytId = getYouTubeId(r.video_url);
                                                            const isOpen = i < 2;
                                                            return (
                                                                <div key={r.id} className="rec-card">
                                                                    <div className="rec-thumb">
                                                                        {ytId
                                                                            ? <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={r.title} />
                                                                            : <div className="play-circle"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                                                                        }
                                                                        {ytId && isOpen && (
                                                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 3 }}>
                                                                                <div className="play-circle"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                                                                            </div>
                                                                        )}
                                                                        {!isOpen && (
                                                                            <div className="lock-overlay">
                                                                                <div style={{ width: 46, height: 46, background: 'rgba(0,0,0,.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🔒</div>
                                                                                <div className="members-tag">Members Only</div>
                                                                            </div>
                                                                        )}
                                                                        {isOpen && <div className="free-tag">Free Preview</div>}
                                                                    </div>
                                                                    <div className="rec-body">
                                                                        <div className="rec-title">{r.title}</div>
                                                                        {r.class_name && (
                                                                            <div className="rec-meta">
                                                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                                                                {r.class_name}
                                                                                {r.recorded_at && <span style={{ marginLeft: 5 }}>· {new Date(r.recorded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                                                                            </div>
                                                                        )}
                                                                        {isOpen && r.video_url
                                                                            ? <a href={r.video_url} target="_blank" rel="noreferrer" className="watch-btn watch-open"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>Watch Recording</a>
                                                                            : <button className="watch-btn watch-lock" onClick={() => navigate('/login')}>🔒 &nbsp;Login to Watch</button>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )
                                            }
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar ── */}
                        <Sidebar navigate={navigate} />
                    </div>
                </div>

                {/* ─── FOOTER ─── */}
                <footer className="border-t border-white/5 bg-[#010409] py-8 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 mt-auto">
                    <div className="flex flex-wrap items-center justify-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} className="w-8 h-8 rounded-lg object-contain border border-white/10" alt="" />
                        <span className="font-bold text-sm text-[#e2e8f0]">Intelligent Physics</span>
                        <span className="text-[#8b9ab5] text-xs px-2 border-l border-white/10">Knowledge Center</span>
                    </div>
                    <span className="text-[#4f6180] text-xs text-center md:text-left">© {new Date().getFullYear()} Intelligent Physics · All rights reserved</span>
                    <button className="bg-transparent border-none text-[#64748b] hover:text-[#818cf8] text-[0.85rem] font-semibold cursor-pointer transition-colors" onClick={() => navigate('/login')}>Student Login →</button>
                </footer>
            </div>
        </>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';
import Footer from '../components/Footer';

/* ─── helpers ─── */
function getYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&#?\s]{11})/);
    return m ? m[1] : null;
}
function src(url) {
    if (!url) return '';
    return url.startsWith('/') ? `${API_URL}${url}` : url;
}


/* ─── Ultra-Premium White Theme CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: #fafbfc;
  color: #4a5568;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,.18); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,.3); }

/* ── keyframes ── */
@keyframes fadeUp      { from { opacity:0; transform:translateY(28px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
@keyframes spin        { to { transform:rotate(360deg); } }
@keyframes float       { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-12px) rotate(.5deg);} }
@keyframes orbit1      { from{transform:rotate(0deg) translateX(108px) rotate(0deg);} to{transform:rotate(360deg) translateX(108px) rotate(-360deg);} }
@keyframes orbit2      { from{transform:rotate(130deg) translateX(148px) rotate(-130deg);} to{transform:rotate(490deg) translateX(148px) rotate(-490deg);} }
@keyframes orbit3      { from{transform:rotate(260deg) translateX(84px) rotate(-260deg);} to{transform:rotate(620deg) translateX(84px) rotate(-620deg);} }
@keyframes gradMove    { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
@keyframes shimmer     { from{left:-100%;} to{left:200%;} }
@keyframes glowPulse   { 0%,100%{opacity:.4;} 50%{opacity:.8;} }
@keyframes borderGlow  { 0%,100%{border-color:rgba(99,102,241,.08);} 50%{border-color:rgba(99,102,241,.22);} }
@keyframes dotPulse    { 0%,100%{opacity:.6;transform:scale(1);} 50%{opacity:1;transform:scale(1.2);} }
@keyframes slideIn     { from{opacity:0;transform:translateX(16px);} to{opacity:1;transform:translateX(0);} }
@keyframes scaleIn     { from{opacity:0;transform:scale(.92);} to{opacity:1;transform:scale(1);} }
@keyframes breathe     { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.12);} 50%{box-shadow:0 0 0 8px rgba(99,102,241,.04);} }

/* ── navbar (frosted glass) ── */
.kh-nav { position:sticky; top:0; z-index:500; height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 48px; background:rgba(250,251,252,.82); border-bottom:1px solid rgba(0,0,0,.04); backdrop-filter:blur(20px) saturate(200%); -webkit-backdrop-filter:blur(20px) saturate(200%); }
.kh-nav-brand { display:flex; align-items:center; gap:14px; cursor:pointer; text-decoration:none; }
.kh-nav-logo { width:40px; height:40px; border-radius:11px; object-fit:contain; border:1.5px solid rgba(99,102,241,.12); box-shadow:0 2px 8px rgba(99,102,241,.06); transition:all .3s cubic-bezier(.4,0,.2,1); }
.kh-nav-brand:hover .kh-nav-logo { box-shadow:0 4px 18px rgba(99,102,241,.18); transform:scale(1.03); }
.kh-nav-text { display:flex; flex-direction:column; }
.kh-nav-name { font-weight:800; font-size:.95rem; color:#0f172a; letter-spacing:-.025em; }
.kh-nav-sub { font-size:.6rem; color:#6366f1; font-weight:700; letter-spacing:.15em; text-transform:uppercase; margin-top:1px; }
.kh-nav-actions { display:flex; align-items:center; gap:10px; }
.kh-btn-ghost { padding:9px 20px; border-radius:10px; border:1px solid rgba(0,0,0,.06); background:white; color:#64748b; font-size:.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:7px; font-family:inherit; transition:all .22s cubic-bezier(.4,0,.2,1); box-shadow:0 1px 2px rgba(0,0,0,.03); }
.kh-btn-ghost:hover { border-color:rgba(99,102,241,.18); color:#0f172a; box-shadow:0 4px 12px rgba(99,102,241,.06); transform:translateY(-1px); }
.kh-btn-primary { padding:9px 22px; border-radius:10px; border:none; background:linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#818cf8 100%); color:#fff; font-size:.82rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:7px; font-family:inherit; box-shadow:0 2px 12px rgba(99,102,241,.24),0 0 0 1px rgba(99,102,241,.08); transition:all .22s cubic-bezier(.4,0,.2,1); position:relative; overflow:hidden; }
.kh-btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent,rgba(255,255,255,.1),transparent); opacity:0; transition:opacity .3s; }
.kh-btn-primary:hover::before { opacity:1; }
.kh-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,.32),0 0 0 1px rgba(99,102,241,.12); }

/* ── hero section ── */
.kh-hero { position:relative; overflow:hidden; padding:72px 48px 64px; min-height:420px; display:flex; align-items:center; }
.kh-hero-bg { position:absolute; inset:0; background:linear-gradient(160deg,#fafbfc 0%,#f0f1ff 25%,#eef2ff 50%,#f5f3ff 75%,#fafbfc 100%); }
.kh-hero-noise { position:absolute; inset:0; opacity:.35; background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.025'/%3E%3C/svg%3E"); }
.kh-hero-glow1 { position:absolute; top:-20%; right:5%; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.07) 0%,rgba(139,92,246,.03) 45%,transparent 70%); pointer-events:none; animation:glowPulse 8s ease-in-out infinite; }
.kh-hero-glow2 { position:absolute; bottom:-30%; left:-5%; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(59,130,246,.05) 0%,transparent 65%); pointer-events:none; animation:glowPulse 10s ease-in-out infinite 2s; }
.kh-hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(99,102,241,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.025) 1px,transparent 1px); background-size:48px 48px; mask-image:radial-gradient(ellipse 85% 75% at 50% 10%,#000 20%,transparent 70%); -webkit-mask-image:radial-gradient(ellipse 85% 75% at 50% 10%,#000 20%,transparent 70%); }
.kh-hero-left { position:relative; z-index:2; max-width:620px; }
.kh-hero-right { position:absolute; right:72px; top:50%; transform:translateY(-50%); z-index:2; }

.kh-badge { display:inline-flex; align-items:center; gap:8px; background:white; border:1px solid rgba(99,102,241,.12); color:#4f46e5; font-size:.68rem; font-weight:800; letter-spacing:.16em; padding:7px 16px 7px 12px; border-radius:9999px; margin-bottom:28px; text-transform:uppercase; box-shadow:0 1px 4px rgba(99,102,241,.04); animation:fadeUp .5s .1s both; }
.kh-badge-dot { width:7px; height:7px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#818cf8); box-shadow:0 0 8px rgba(99,102,241,.4); animation:dotPulse 2.5s ease-in-out infinite; }

.kh-h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(2.2rem,5vw,3.4rem); font-weight:900; line-height:1.05; letter-spacing:-.045em; color:#0f172a; margin-bottom:20px; animation:fadeUp .5s .15s both; }
.kh-h1-accent { background:linear-gradient(135deg,#4338ca,#6366f1,#3b82f6,#6366f1); background-size:300% 300%; animation:gradMove 8s ease infinite, fadeUp .5s .15s both; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

.kh-subtitle { color:#64748b; font-size:.98rem; line-height:1.85; max-width:500px; margin-bottom:36px; font-weight:400; animation:fadeUp .5s .25s both; }

.kh-hero-actions { display:flex; flex-wrap:wrap; gap:12px; animation:fadeUp .5s .3s both; }
.kh-btn-hero { padding:14px 32px; border-radius:12px; border:none; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; font-size:.95rem; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:9px; font-family:inherit; box-shadow:0 4px 18px rgba(99,102,241,.28),inset 0 1px 0 rgba(255,255,255,.15); transition:all .25s cubic-bezier(.4,0,.2,1); position:relative; overflow:hidden; letter-spacing:-.01em; }
.kh-btn-hero::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent); animation:shimmer 4s ease-in-out infinite 1.5s; }
.kh-btn-hero:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(99,102,241,.38),inset 0 1px 0 rgba(255,255,255,.2); }
.kh-btn-outline { padding:14px 28px; border-radius:12px; border:1.5px solid rgba(0,0,0,.08); background:white; color:#475569; font-size:.95rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .25s cubic-bezier(.4,0,.2,1); box-shadow:0 1px 4px rgba(0,0,0,.03); letter-spacing:-.01em; }
.kh-btn-outline:hover { border-color:rgba(99,102,241,.2); color:#0f172a; box-shadow:0 6px 16px rgba(99,102,241,.06); transform:translateY(-1px); }

/* hero stat chips */
.kh-stats { display:flex; flex-wrap:wrap; gap:10px; margin-top:32px; animation:fadeUp .5s .4s both; }
.kh-stat { display:flex; align-items:center; gap:8px; background:white; border:1px solid rgba(0,0,0,.05); border-radius:12px; padding:8px 16px; font-size:.79rem; font-weight:600; color:#64748b; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,.02); transition:all .22s cubic-bezier(.4,0,.2,1); }
.kh-stat:hover { box-shadow:0 4px 14px rgba(99,102,241,.08); border-color:rgba(99,102,241,.1); transform:translateY(-1px); }
.kh-stat-icon { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:.72rem; }

/* ── tab bar ── */
.kh-tabbar { background:rgba(250,251,252,.85); border-bottom:1px solid rgba(0,0,0,.04); backdrop-filter:blur(16px) saturate(180%); -webkit-backdrop-filter:blur(16px) saturate(180%); position:sticky; top:72px; z-index:400; }
.kh-tabbar-inner { max-width:1280px; margin:0 auto; padding:0 48px; display:flex; gap:4px; }
.kh-tab { background:none; border:none; border-bottom:2px solid transparent; padding:16px 28px; font-size:.87rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; white-space:nowrap; transition:all .2s; color:#94a3b8; font-family:inherit; position:relative; }
.kh-tab.active { color:#4f46e5; border-bottom-color:#4f46e5; }
.kh-tab:not(.active):hover { color:#64748b; }
.kh-tab-count { padding:2px 8px; border-radius:6px; font-size:.68rem; font-weight:800; transition:all .2s; letter-spacing:.02em; }
.kh-tab.active .kh-tab-count { background:rgba(79,70,229,.08); color:#4f46e5; }
.kh-tab:not(.active) .kh-tab-count { background:rgba(0,0,0,.03); color:#b0b8c8; }

/* ── layout ── */
.kh-body { flex:1; background:#fafbfc; }
.kh-layout { max-width:1280px; margin:0 auto; padding:40px 48px 100px; display:grid; grid-template-columns:1fr 300px; gap:40px; align-items:start; }

/* section header */
.kh-section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:10px; }
.kh-section-title { font-family:'Space Grotesk',sans-serif; font-size:1.2rem; font-weight:800; color:#0f172a; letter-spacing:-.02em; display:flex; align-items:center; gap:10px; }
.kh-section-title::before { content:''; width:3px; height:20px; background:linear-gradient(180deg,#4f46e5,#818cf8); border-radius:3px; flex-shrink:0; }
.kh-section-count { font-size:.77rem; color:#94a3b8; font-weight:700; background:white; border:1px solid rgba(0,0,0,.05); padding:4px 14px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.02); }

/* search / filter */
.kh-filters { display:flex; align-items:center; gap:10px; margin-bottom:24px; flex-wrap:wrap; }
.kh-search { flex:1; min-width:200px; position:relative; }
.kh-search input { width:100%; background:white; border:1.5px solid rgba(0,0,0,.06); border-radius:12px; padding:12px 16px 12px 42px; color:#0f172a; font-size:.87rem; font-family:inherit; font-weight:500; outline:none; transition:all .22s cubic-bezier(.4,0,.2,1); box-shadow:0 1px 3px rgba(0,0,0,.02); }
.kh-search input::placeholder { color:#b0b8c8; font-weight:400; }
.kh-search input:focus { border-color:rgba(99,102,241,.3); box-shadow:0 0 0 4px rgba(99,102,241,.06),0 2px 8px rgba(99,102,241,.04); }
.kh-search svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); pointer-events:none; color:#b0b8c8; }
.kh-chip { background:white; border:1.5px solid rgba(0,0,0,.06); border-radius:9px; padding:8px 16px; font-size:.79rem; font-weight:600; color:#94a3b8; cursor:pointer; transition:all .2s cubic-bezier(.4,0,.2,1); font-family:inherit; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,.02); }
.kh-chip.selected { background:linear-gradient(135deg,rgba(79,70,229,.06),rgba(99,102,241,.04)); border-color:rgba(79,70,229,.2); color:#4f46e5; font-weight:700; box-shadow:0 2px 8px rgba(99,102,241,.06); }
.kh-chip:hover:not(.selected) { border-color:rgba(99,102,241,.12); color:#64748b; transform:translateY(-1px); }

/* ── paper cards ── */
.kh-papers { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
.kh-paper {
  background:white;
  border:1.5px solid rgba(0,0,0,.04);
  border-radius:18px; padding:24px;
  display:flex; flex-direction:column; gap:18px;
  transition:all .3s cubic-bezier(.4,0,.2,1); position:relative; overflow:hidden;
  cursor:default;
  box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.01);
}
.kh-paper::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#4f46e5,#3b82f6,#06b6d4); transform:scaleX(0); transition:transform .4s cubic-bezier(.4,0,.2,1); transform-origin:left; }
.kh-paper:hover { border-color:rgba(99,102,241,.12); transform:translateY(-3px); box-shadow:0 8px 30px rgba(99,102,241,.06),0 2px 8px rgba(0,0,0,.04); }
.kh-paper:hover::before { transform:scaleX(1); }
.kh-paper.free::after { content:'FREE'; position:absolute; top:16px; right:16px; background:linear-gradient(135deg,#ecfdf5,#d1fae5); border:1px solid rgba(16,185,129,.15); color:#059669; border-radius:8px; padding:3px 10px; font-size:.62rem; font-weight:800; letter-spacing:.08em; }
.kh-paper-icon { width:48px; height:48px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; transition:transform .25s; }
.kh-paper:hover .kh-paper-icon { transform:scale(1.05) rotate(-2deg); }
.kh-paper-title { font-weight:700; color:#0f172a; font-size:.92rem; line-height:1.45; }
.kh-paper-meta { color:#94a3b8; font-size:.74rem; font-weight:500; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.kh-paper-meta-dot { width:3px; height:3px; background:#d1d5db; border-radius:50%; }
.kh-dl { display:flex; align-items:center; justify-content:center; gap:8px; border-radius:11px; padding:12px; font-size:.84rem; font-weight:700; cursor:pointer; transition:all .22s cubic-bezier(.4,0,.2,1); text-decoration:none; border:none; font-family:inherit; width:100%; }
.kh-dl-open { background:linear-gradient(135deg,rgba(59,130,246,.06),rgba(99,102,241,.04)); border:1.5px solid rgba(59,130,246,.12); color:#3b82f6; }
.kh-dl-open:hover { background:linear-gradient(135deg,rgba(59,130,246,.1),rgba(99,102,241,.08)); box-shadow:0 4px 14px rgba(59,130,246,.1); color:#2563eb; transform:translateY(-1px); }
.kh-dl-lock { background:rgba(0,0,0,.015); border:1.5px solid rgba(0,0,0,.05); color:#b0b8c8; }
.kh-dl-lock:hover { border-color:rgba(99,102,241,.15); color:#4f46e5; background:rgba(99,102,241,.03); }

/* ── video cards ── */
.kh-videos { display:grid; grid-template-columns:repeat(auto-fill,minmax(310px,1fr)); gap:18px; }
.kh-video {
  background:white;
  border:1.5px solid rgba(0,0,0,.04);
  border-radius:18px; overflow:hidden;
  display:flex; flex-direction:column;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.01);
}
.kh-video:hover { border-color:rgba(99,102,241,.12); transform:translateY(-4px); box-shadow:0 12px 36px rgba(99,102,241,.06),0 2px 8px rgba(0,0,0,.04); }
.kh-video-thumb { height:185px; background:linear-gradient(135deg,#eef2ff 0%,#e0e7ff 50%,#ede9fe 100%); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.kh-video-thumb img { width:100%; height:100%; object-fit:cover; transition:transform .4s cubic-bezier(.4,0,.2,1); }
.kh-video:hover .kh-video-thumb img { transform:scale(1.03); }
.kh-play { width:56px; height:56px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; backdrop-filter:blur(8px); transition:all .3s cubic-bezier(.4,0,.2,1); box-shadow:0 4px 20px rgba(0,0,0,.08),0 0 0 1px rgba(99,102,241,.06); cursor:pointer; }
.kh-video:hover .kh-play { transform:scale(1.08); box-shadow:0 6px 24px rgba(99,102,241,.15),0 0 0 1px rgba(99,102,241,.1); }
.kh-lock-overlay { position:absolute; inset:0; background:rgba(250,251,252,.7); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
.kh-free-badge { position:absolute; top:12px; left:12px; background:white; border:1px solid rgba(16,185,129,.12); color:#059669; border-radius:8px; padding:4px 12px; font-size:.63rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.kh-members-tag { color:#94a3b8; font-size:.67rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.kh-video-body { padding:20px 22px; flex:1; display:flex; flex-direction:column; gap:10px; }
.kh-video-title { font-weight:700; color:#0f172a; font-size:.92rem; line-height:1.45; }
.kh-video-meta { display:flex; align-items:center; gap:6px; color:#94a3b8; font-size:.76rem; }
.kh-watch { display:flex; align-items:center; justify-content:center; gap:8px; border-radius:11px; padding:12px; font-size:.85rem; font-weight:700; cursor:pointer; transition:all .22s cubic-bezier(.4,0,.2,1); text-decoration:none; border:none; font-family:inherit; margin-top:auto; width:100%; }
.kh-watch-open { background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; box-shadow:0 3px 12px rgba(99,102,241,.22); }
.kh-watch-open:hover { box-shadow:0 6px 22px rgba(99,102,241,.32); transform:translateY(-1px); }
.kh-watch-lock { background:rgba(0,0,0,.015); border:1.5px solid rgba(0,0,0,.05); color:#b0b8c8; }
.kh-watch-lock:hover { border-color:rgba(99,102,241,.15); color:#4f46e5; background:rgba(99,102,241,.03); }

/* ── sidebar ── */
.kh-sidebar { background:white; border:1.5px solid rgba(99,102,241,.08); border-radius:22px; padding:28px 24px; position:sticky; top:140px; overflow:hidden; box-shadow:0 2px 12px rgba(99,102,241,.04),0 1px 2px rgba(0,0,0,.02); animation:borderGlow 8s ease-in-out infinite; }
.kh-sidebar::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(99,102,241,.3),rgba(139,92,246,.2),transparent); }
.kh-sidebar::after { content:''; position:absolute; bottom:-60px; right:-60px; width:200px; height:200px; background:radial-gradient(circle,rgba(99,102,241,.03) 0%,transparent 70%); pointer-events:none; }
.kh-side-header { display:flex; align-items:center; gap:13px; margin-bottom:20px; position:relative; z-index:1; }
.kh-side-icon { width:46px; height:46px; border-radius:13px; background:linear-gradient(135deg,#4338ca,#6366f1); display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 4px 14px rgba(99,102,241,.25); }
.kh-side-title { font-weight:800; color:#0f172a; font-size:1.02rem; letter-spacing:-.01em; }
.kh-side-subtitle { color:#64748b; font-size:.77rem; margin-top:2px; }
.kh-side-cta { width:100%; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; border:none; border-radius:13px; padding:15px; font-size:.93rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px; box-shadow:0 4px 18px rgba(99,102,241,.25); margin-bottom:22px; transition:all .25s cubic-bezier(.4,0,.2,1); font-family:inherit; position:relative; overflow:hidden; z-index:1; letter-spacing:-.01em; }
.kh-side-cta::after { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent); animation:shimmer 3.5s ease-in-out infinite 2s; }
.kh-side-cta:hover { transform:translateY(-2px); box-shadow:0 8px 26px rgba(99,102,241,.35); }
.kh-side-label { font-size:.65rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#b0b8c8; margin-bottom:14px; position:relative; z-index:1; }
.kh-side-item { display:flex; align-items:center; gap:12px; padding:9px 0; border-bottom:1px solid rgba(0,0,0,.03); position:relative; z-index:1; transition:all .2s; }
.kh-side-item:last-child { border-bottom:none; }
.kh-side-item:hover { transform:translateX(3px); }
.kh-side-item-ico { width:32px; height:32px; border-radius:9px; background:rgba(99,102,241,.04); border:1px solid rgba(99,102,241,.07); display:flex; align-items:center; justify-content:center; font-size:.84rem; flex-shrink:0; transition:all .2s; }
.kh-side-item:hover .kh-side-item-ico { background:rgba(99,102,241,.08); border-color:rgba(99,102,241,.14); }
.kh-side-item-text { color:#475569; font-size:.82rem; line-height:1.35; font-weight:500; }

/* ── empty state ── */
.kh-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; text-align:center; gap:16px; }
.kh-empty-icon { font-size:3rem; opacity:.25; }
.kh-empty-text { color:#94a3b8; font-size:.9rem; line-height:1.75; max-width:320px; }

/* ── responsive ── */
@media(max-width:1060px) { .kh-hero-right { display:none; } }
@media(max-width:860px) {
  .kh-layout { grid-template-columns:1fr; }
  .kh-sidebar { display:none; }
}
@media(max-width:700px) {
  .kh-nav, .kh-hero, .kh-tabbar-inner, .kh-layout { padding-left:20px; padding-right:20px; }
  .kh-papers, .kh-videos { grid-template-columns:1fr; }
  .kh-hero { padding:48px 20px 40px; min-height:auto; }
  .kh-h1 { font-size:1.8rem; }
}
`;

/* ── Orbit Visual ── */
function Orb() {
    const rings = [280, 210, 145];
    const orbs = [
        { anim: 'orbit1 10s linear infinite', size: 12, bg: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
        { anim: 'orbit2 15s linear infinite', size: 9, bg: 'linear-gradient(135deg,#818cf8,#a78bfa)' },
        { anim: 'orbit3 8s linear infinite', size: 8, bg: 'linear-gradient(135deg,#10b981,#34d399)' },
    ];
    return (
        <div style={{ width: 310, height: 310, position: 'relative', flexShrink: 0, animation: 'float 8s ease-in-out infinite' }}>
            {rings.map((s, i) => (
                <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: s, height: s, borderRadius: '50%', border: `1.5px solid rgba(99,102,241,${.04 + i * .03})` }} />
            ))}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 86, height: 86, borderRadius: '50%', background: 'linear-gradient(135deg,#4338ca,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99,102,241,.2),0 0 60px rgba(99,102,241,.06),inset 0 1px 0 rgba(255,255,255,.25)', zIndex: 5 }}>
                <img src={logo} alt="" style={{ width: '72%', height: '72%', objectFit: 'contain', borderRadius: '50%' }} />
            </div>
            {orbs.map((o, i) => (
                <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, animation: o.anim, zIndex: 4 }}>
                    <div style={{ width: o.size, height: o.size, borderRadius: '50%', background: o.bg, boxShadow: `0 0 ${o.size + 6}px rgba(99,102,241,.25)`, marginTop: -o.size / 2, marginLeft: -o.size / 2 }} />
                </div>
            ))}
            {[
                { style: { top: '2%', right: '-4%' }, icon: '📄', label: 'Past Papers', delay: '0s' },
                { style: { bottom: '6%', right: '-6%' }, icon: '🎥', label: 'Class Videos', delay: '.7s' },
                { style: { top: '42%', left: '-10%' }, icon: '🏆', label: 'Free Preview', delay: '1.4s' },
            ].map(({ style, icon, label, delay }) => (
                <div key={label} style={{ position: 'absolute', ...style, background: 'white', border: '1px solid rgba(99,102,241,.08)', borderRadius: 11, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(12px)', zIndex: 10, whiteSpace: 'nowrap', animation: `float 6s ${delay} ease-in-out infinite`, boxShadow: '0 4px 16px rgba(0,0,0,.04),0 1px 3px rgba(0,0,0,.02)' }}>
                    <span style={{ fontSize: '.85rem' }}>{icon}</span>
                    <span style={{ color: '#4f46e5', fontSize: '.71rem', fontWeight: 700, letterSpacing: '-.01em' }}>{label}</span>
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
        <div className="kh-sidebar">
            <div className="kh-side-header">
                <div className="kh-side-icon">🎓</div>
                <div>
                    <div className="kh-side-title">Student Portal</div>
                    <div className="kh-side-subtitle">Unlock your full experience</div>
                </div>
            </div>
            <button id="sidebar-login-btn" className="kh-side-cta" onClick={() => navigate('/login')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Login to Knowledge Hub
            </button>
            <div className="kh-side-label">What you unlock</div>
            {features.map(([icon, lbl]) => (
                <div key={lbl} className="kh-side-item">
                    <div className="kh-side-item-ico">{icon}</div>
                    <span className="kh-side-item-text">{lbl}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Spinner ── */
const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,.08)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin .85s linear infinite' }} />
    </div>
);

/* ── Empty ── */
const Empty = ({ icon, msg }) => (
    <div className="kh-empty">
        <div className="kh-empty-icon">{icon}</div>
        <div className="kh-empty-text">{msg}</div>
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
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafbfc' }}>

                {/* ─── NAV ─── */}
                <nav className="kh-nav">
                    <div className="kh-nav-brand" onClick={() => navigate('/')}>
                        <img src={logo} className="kh-nav-logo" alt="" />
                        <div className="kh-nav-text">
                            <div className="kh-nav-name">Intelligent Physics</div>
                            <div className="kh-nav-sub">Knowledge Hub</div>
                        </div>
                    </div>
                    <div className="kh-nav-actions">
                        <button className="kh-btn-ghost" onClick={() => navigate('/')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                            Home
                        </button>
                        <button id="nav-login-btn" className="kh-btn-primary" onClick={() => navigate('/login')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                            Student Login
                        </button>
                    </div>
                </nav>

                {/* ─── HERO ─── */}
                <section className="kh-hero">
                    <div className="kh-hero-bg" />
                    <div className="kh-hero-noise" />
                    <div className="kh-hero-glow1" />
                    <div className="kh-hero-glow2" />
                    <div className="kh-hero-grid" />

                    <div className="kh-hero-left">
                        <div className="kh-badge">
                            <div className="kh-badge-dot" />
                            Knowledge Center
                        </div>
                        <h1 className="kh-h1">
                            Intelligent Physics<br />
                            <span className="kh-h1-accent">Knowledge Hub</span>
                        </h1>
                        <p className="kh-subtitle">
                            Browse past exam papers and recorded class sessions from Sri Lanka's leading A/L Physics platform. Login to unlock your personalised portal.
                        </p>
                        <div className="kh-hero-actions">
                            <button id="hero-login-btn" className="kh-btn-hero" onClick={() => navigate('/login')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                                Login to Learning Hub
                            </button>
                            <button className="kh-btn-outline" onClick={() => navigate('/')}>
                                Explore Website
                            </button>
                        </div>
                        {!loading && (
                            <div className="kh-stats">
                                {[
                                    { icon: '📄', label: `${papers.length} Past Papers`, bg: 'rgba(239,68,68,.04)', b: 'rgba(239,68,68,.08)' },
                                    { icon: '🎥', label: `${recordings.length} Recordings`, bg: 'rgba(99,102,241,.04)', b: 'rgba(99,102,241,.08)' },
                                    { icon: '🆓', label: '2 Free Previews', bg: 'rgba(16,185,129,.04)', b: 'rgba(16,185,129,.08)' },
                                ].map(p => (
                                    <div key={p.label} className="kh-stat">
                                        <div className="kh-stat-icon" style={{ background: p.bg, border: `1px solid ${p.b}` }}>{p.icon}</div>
                                        {p.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="kh-hero-right" style={{ animation: 'fadeUp .6s .2s both' }}>
                        <Orb />
                    </div>
                </section>

                {/* ─── TABS ─── */}
                <div className="kh-tabbar">
                    <div className="kh-tabbar-inner">
                        {tabs.map(t => (
                            <button key={t.id} className={`kh-tab${tab === t.id ? ' active' : ''}`} onClick={() => { setTab(t.id); setSearch(''); setYearFilter(''); }}>
                                <span>{t.icon}</span>
                                {t.label}
                                <span className="kh-tab-count">{t.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── CONTENT ─── */}
                <div className="kh-body">
                    <div className="kh-layout">

                        {/* ── Main column ── */}
                        <div style={{ minWidth: 0 }}>
                            {loading ? <Spinner /> : (
                                <div key={tab} style={{ animation: 'fadeUp .4s both' }}>

                                    {/* PAST PAPERS */}
                                    {tab === 'papers' && (
                                        <>
                                            <div className="kh-section-hdr">
                                                <div className="kh-section-title">Past Exam Papers</div>
                                                <div className="kh-section-count">{filteredPapers.length} of {papers.length}</div>
                                            </div>

                                            <div className="kh-filters">
                                                <div className="kh-search">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                    <input placeholder="Search papers…" value={search} onChange={e => setSearch(e.target.value)} />
                                                </div>
                                                {years.slice(0, 6).map(y => (
                                                    <button key={y} className={`kh-chip${yearFilter === String(y) ? ' selected' : ''}`} onClick={() => setYearFilter(yearFilter === String(y) ? '' : String(y))}>
                                                        {y}
                                                    </button>
                                                ))}
                                            </div>

                                            {filteredPapers.length === 0
                                                ? <Empty icon="📄" msg="No papers match your search. Try a different keyword or year." />
                                                : (
                                                    <div className="kh-papers">
                                                        {filteredPapers.map((p, i) => {
                                                            const isFree = true;
                                                            return (
                                                                <div key={p.id} className={`kh-paper${isFree ? ' free' : ''}`} style={{ animation: `fadeUp .4s ${i * .04}s both` }}>
                                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                                                        <div className="kh-paper-icon" style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.08)' }}>📋</div>
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div className="kh-paper-title">{p.title || p.name || `Past Paper #${i + 1}`}</div>
                                                                            <div className="kh-paper-meta">
                                                                                {p.subject || 'Physics'}
                                                                                {p.year && <><div className="kh-paper-meta-dot" />{p.year}</>}
                                                                                {p.class_name && <><div className="kh-paper-meta-dot" />{p.class_name}</>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {isFree && p.file_url ? (
                                                                        <a href={src(p.file_url)} target="_blank" rel="noreferrer" className="kh-dl kh-dl-open">
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                                            Download Paper
                                                                        </a>
                                                                    ) : (
                                                                        <button className="kh-dl kh-dl-lock" onClick={() => navigate('/login')}>
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
                                            <div className="kh-section-hdr">
                                                <div className="kh-section-title">Class Recordings</div>
                                                <div className="kh-section-count">{filteredRecs.length} of {recordings.length}</div>
                                            </div>

                                            <div className="kh-filters">
                                                <div className="kh-search">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                    <input placeholder="Search videos…" value={search} onChange={e => setSearch(e.target.value)} />
                                                </div>
                                            </div>

                                            {filteredRecs.length === 0
                                                ? <Empty icon="🎥" msg="No recordings match your search. Try a different keyword." />
                                                : (
                                                    <div className="kh-videos">
                                                        {filteredRecs.map((r, i) => {
                                                            const ytId = getYouTubeId(r.video_url);
                                                            const isOpen = true;
                                                            return (
                                                                <div key={r.id} className="kh-video" style={{ animation: `fadeUp .4s ${i * .05}s both` }}>
                                                                    <div className="kh-video-thumb">
                                                                        {ytId
                                                                            ? <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={r.title} />
                                                                            : <div className="kh-play"><svg width="20" height="20" viewBox="0 0 24 24" fill="#4f46e5"><polygon points="6 3 20 12 6 21 6 3" /></svg></div>
                                                                        }
                                                                        {ytId && isOpen && (
                                                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 3 }}>
                                                                                <div className="kh-play"><svg width="20" height="20" viewBox="0 0 24 24" fill="#4f46e5"><polygon points="6 3 20 12 6 21 6 3" /></svg></div>
                                                                            </div>
                                                                        )}
                                                                        {!isOpen && (
                                                                            <div className="kh-lock-overlay">
                                                                                <div style={{ width: 46, height: 46, background: 'rgba(99,102,241,.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', border: '1px solid rgba(99,102,241,.1)' }}>🔒</div>
                                                                                <div className="kh-members-tag">Members Only</div>
                                                                            </div>
                                                                        )}
                                                                        {isOpen && <div className="kh-free-badge">Free Preview</div>}
                                                                    </div>
                                                                    <div className="kh-video-body">
                                                                        <div className="kh-video-title">{r.title}</div>
                                                                        {r.class_name && (
                                                                            <div className="kh-video-meta">
                                                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                                                                {r.class_name}
                                                                                {r.recorded_at && <span style={{ marginLeft: 5 }}>· {new Date(r.recorded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                                                                            </div>
                                                                        )}
                                                                        {isOpen && r.video_url
                                                                            ? <a href={r.video_url} target="_blank" rel="noreferrer" className="kh-watch kh-watch-open"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3" /></svg>Watch Recording</a>
                                                                            : <button className="kh-watch kh-watch-lock" onClick={() => navigate('/login')}>🔒 &nbsp;Login to Watch</button>
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

                <Footer />
            </div>
        </>
    );
}

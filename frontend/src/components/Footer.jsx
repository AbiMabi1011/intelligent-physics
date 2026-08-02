import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Youtube, Facebook, ChevronRight, Send, Instagram } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export default function Footer() {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show footer on login/register/admin pages
    if (['/login', '/register', '/admin'].includes(location.pathname) || location.pathname.startsWith('/admin')) {
        return null;
    }

    const scrollTo = (id) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="relative bg-[#030712] text-slate-300 pt-2 pb-8 mt-12 z-10 w-full">

            {/* Custom Premium Liquid Animation Keyframes */}
            <style>{`
                @keyframes liquid-drift-1 {
                    0% { transform: translateX(0) scaleY(1); }
                    50% { transform: translateX(-15%) scaleY(1.06); }
                    100% { transform: translateX(-30%) scaleY(1); }
                }
                @keyframes liquid-drift-2 {
                    0% { transform: translateX(-30%) scaleY(0.94); }
                    50% { transform: translateX(-15%) scaleY(1.03); }
                    100% { transform: translateX(0) scaleY(0.94); }
                }
                @keyframes liquid-drift-3 {
                    0% { transform: translateX(0) scaleY(1.02); }
                    50% { transform: translateX(-8%) scaleY(0.98); }
                    100% { transform: translateX(-16%) scaleY(1.02); }
                }
                @keyframes organic-float {
                    0% { transform: translateY(0px) scale(1) rotate(0deg); }
                    50% { transform: translateY(-40px) scale(1.08) rotate(180deg); }
                    100% { transform: translateY(0px) scale(1) rotate(360deg); }
                }
                @keyframes organic-bubble {
                    0% { transform: translateY(150px) scale(0.6); opacity: 0; }
                    15% { opacity: 0.55; }
                    85% { opacity: 0.55; }
                    100% { transform: translateY(-420px) scale(1.4); opacity: 0; }
                }
                .liquid-wave-1 {
                    animation: liquid-drift-1 20s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
                }
                .liquid-wave-2 {
                    animation: liquid-drift-2 24s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
                }
                .liquid-wave-3 {
                    animation: liquid-drift-3 28s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
                }
                .organic-orb-1 {
                    animation: organic-float 20s ease-in-out infinite;
                }
                .organic-orb-2 {
                    animation: organic-float 25s ease-in-out infinite;
                }
                .liquid-bubble {
                    animation: organic-bubble 14s ease-in-out infinite;
                }
            `}</style>

            {/* Layered Liquid Waves at the top (Now fully visible as overflow-hidden is removed from parent) */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-[98%] pointer-events-none select-none z-20">
                <svg className="relative block w-[140%] h-[90px] md:h-[135px] min-w-[1200px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="liquid-gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.12" />
                            <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.22" />
                            <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.12" />
                        </linearGradient>
                        <linearGradient id="liquid-gradient-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.08" />
                            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.24" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                        </linearGradient>
                    </defs>

                    {/* Deep wave back layer */}
                    <path
                        d="M0,45 C180,85 380,10 550,55 C720,100 920,10 1200,45 L1200,120 L0,120 Z"
                        fill="url(#liquid-gradient-blue)"
                        className="liquid-wave-1 origin-center"
                    />

                    {/* Middle wave middle layer */}
                    <path
                        d="M0,65 C220,15 420,90 620,45 C820,0 1020,90 1200,65 L1200,120 L0,120 Z"
                        fill="url(#liquid-gradient-cyan)"
                        className="liquid-wave-2 origin-center"
                    />

                    {/* Front wave matching background */}
                    <path
                        d="M0,35 C180,75 360,15 540,55 C720,95 900,30 1200,75 L1200,120 L0,120 Z"
                        fill="#030712"
                        className="liquid-wave-3 origin-center"
                    />
                </svg>
            </div>

            {/* Inner background content wrapped with overflow-hidden to keep background effects contained */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:36px_36px]" />

                {/* Glowing Ambient Lights */}
                <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[450px] h-[450px] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 blur-[130px] rounded-full organic-orb-1" />
                <div className="absolute bottom-12 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-red-600/10 to-blue-600/5 blur-[130px] rounded-full organic-orb-2" />

                {/* Floating Organic Bubbles */}
                <div className="liquid-bubble absolute left-[15%] bottom-0 w-3.5 h-3.5 bg-blue-500/25 rounded-full blur-[1px]" style={{ animationDelay: '0s', animationDuration: '14s' }} />
                <div className="liquid-bubble absolute left-[35%] bottom-0 w-5.5 h-5.5 bg-indigo-500/20 rounded-full blur-[2px]" style={{ animationDelay: '3s', animationDuration: '22s' }} />
                <div className="liquid-bubble absolute left-[55%] bottom-0 w-3 h-3 bg-red-500/25 rounded-full blur-[1px]" style={{ animationDelay: '7s', animationDuration: '18s' }} />
                <div className="liquid-bubble absolute left-[75%] bottom-0 w-4.5 h-4.5 bg-emerald-500/20 rounded-full blur-[2px]" style={{ animationDelay: '2s', animationDuration: '16s' }} />
                <div className="liquid-bubble absolute left-[90%] bottom-0 w-6 h-6 bg-blue-600/15 rounded-full blur-[3px]" style={{ animationDelay: '10s', animationDuration: '20s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 w-full animate-fadeIn">

                {/* 4-Column Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left bg-white/[0.02] border border-white/[0.04] p-6 rounded-[32px] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.08] transition-all duration-300">
                        <div
                            className="flex items-center gap-4 mb-6 cursor-pointer group"
                            onClick={() => { if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); else navigate('/'); }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/95 p-1 border border-slate-800 shadow-lg flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform duration-300">
                                <img src={logo} alt="Intelligent Physics" className="w-full h-full object-contain rounded-xl" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-extrabold text-white tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                                    Intelligent Physics
                                </span>
                                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-0.5">Premium LMS</span>
                            </div>
                        </div>
                        <p className="text-slate-455 text-sm leading-relaxed max-w-[300px]">
                            Sri Lanka's leading digital platform for Advanced Level Physics. Empowering students with interactive lessons, adaptive tests, and resources.
                        </p>

                        {/* Social Buttons */}
                        <div className="flex gap-4 mt-6">
                            <a
                                href="https://www.facebook.com/p/Intelligent-Physics-100064162955141/"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl bg-slate-950/60 border border-slate-900/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_18px_rgba(59,130,246,0.4)] transition-all duration-300 group"
                                title="Follow us on Facebook"
                            >
                                <Facebook size={18} className="group-hover:scale-115 transition-transform duration-300" />
                            </a>
                            <a
                                href="https://www.youtube.com/c/IntelligentPhysics"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl bg-slate-950/60 border border-slate-900/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-500 hover:shadow-[0_0_18px_rgba(239,68,68,0.4)] transition-all duration-300 group"
                                title="Subscribe on YouTube"
                            >
                                <Youtube size={18} className="group-hover:scale-115 transition-transform duration-300" />
                            </a>
                            <a
                                href="https://www.instagram.com/intelligentphysics/"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl bg-slate-950/60 border border-slate-900/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-500 hover:shadow-[0_0_18px_rgba(239,68,68,0.4)] transition-all duration-300 group"
                                title="Follow Us on Instagram"
                            >
                                <Instagram size={18} className="group-hover:scale-115 transition-transform duration-300" />
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="flex flex-col items-center md:items-start bg-white/[0.02] border border-white/[0.04] p-6 rounded-[32px] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.08] transition-all duration-300">
                        <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> Platform
                        </h4>
                        <nav className="flex flex-col gap-4 text-center md:text-left w-full">
                            {['Features', 'Syllabus Units', 'Knowledge Hub'].map((item, idx) => {
                                const target = item === 'Knowledge Hub' ? '/knowledge-hub' : (item === 'Features' ? 'features' : 'syllabus');
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => target.startsWith('/') ? navigate(target) : scrollTo(target)}
                                        className="text-slate-400 hover:text-white text-sm font-semibold transition-all duration-200 bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-1.5 w-fit relative overflow-hidden"
                                    >
                                        <ChevronRight size={14} className="text-blue-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        <span className="relative py-0.5">
                                            {item}
                                            <span className="absolute bottom-0 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Support Links */}
                    <div className="flex flex-col items-center md:items-start bg-white/[0.02] border border-white/[0.04] p-6 rounded-[32px] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.08] transition-all duration-300">
                        <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" /> Support
                        </h4>
                        <nav className="flex flex-col gap-4 text-center md:text-left w-full">
                            {['About Us', 'FAQ', 'Contact Us'].map((item, idx) => {
                                const target = item === 'About Us' ? 'about' : (item === 'FAQ' ? 'faq' : 'contact');
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => scrollTo(target)}
                                        className="text-slate-400 hover:text-white text-sm font-semibold transition-all duration-200 bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-1.5 w-fit relative overflow-hidden"
                                    >
                                        <ChevronRight size={14} className="text-indigo-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        <span className="relative py-0.5">
                                            {item}
                                            <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300" />
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="flex flex-col items-center md:items-start bg-white/[0.02] border border-white/[0.04] p-6 rounded-[32px] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.08] transition-all duration-300 w-full">
                        <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> Newsletter
                        </h4>
                        <div className="flex flex-col gap-5 w-full">
                            <p className="text-sm text-slate-400 leading-relaxed text-center md:text-left">
                                Subscribe to stay updated with mock exams, seminar dates, and new uploads.
                            </p>
                            <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-950/60 border border-slate-800/85 rounded-xl py-3 pl-4 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors duration-200 cursor-pointer"
                                >
                                    <Send size={12} />
                                </button>
                            </form>
                            <div className="flex flex-col items-center md:items-start gap-1 mt-1">
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Email Us</span>
                                <a href="mailto:info@intelligentphysics.lk" className="text-slate-350 hover:text-emerald-400 text-sm font-semibold flex items-center gap-1.5 transition-colors">
                                    <Mail size={14} />
                                    <span>info@intelligentphysics.lk</span>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <p className="text-slate-500 text-sm font-medium text-center md:text-left">
                        &copy; {new Date().getFullYear()} <span className="text-slate-400 font-semibold">Intelligent Physics</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-slate-500 text-sm font-medium justify-center">
                        <span className="hover:text-white cursor-pointer transition-colors duration-200">Privacy Policy</span>
                        <span className="hover:text-white cursor-pointer transition-colors duration-200">Terms of Service</span>
                    </div>

                    {/* Applomic Powered By Badge */}
                    <a
                        href="https://applomic.com"
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-900 bg-[#070b13] hover:border-slate-800/80 hover:bg-[#0a0f1b] hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 no-underline"
                    >
                        <div className="w-5.5 h-5.5 rounded-md bg-gradient-to-br from-[#656CFF] to-[#ef4444] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-black text-[10px] leading-none">A</span>
                        </div>
                        <div className="flex flex-col leading-none text-left">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-400 transition-colors">Powered by</span>
                            <span className="text-[14px] font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#656CFF] to-[#ef4444] group-hover:from-[#7c82ff] group-hover:to-[#ff6b6b] transition-all">
                                Applomic
                            </span>
                        </div>
                    </a>
                </div>

            </div>
        </footer>
    );
}

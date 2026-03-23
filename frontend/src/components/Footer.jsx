import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

export default function Footer() {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show footer on login/register pages
    if (['/login', '/register', '/admin'].includes(location.pathname)) {
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
        <footer className="relative bg-[#04091c] border-t border-white/5 pt-20 pb-10 overflow-hidden mt-auto">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

                    {/* Brand Section */}
                    <div className="lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => { if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); else navigate('/'); }}>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1 border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex items-center justify-center shrink-0">
                                <img src={logo} alt="Intelligent Physics" className="w-full h-full object-contain rounded-lg" />
                            </div>
                            <span className="font-black text-[#f8fafc] tracking-tight text-xl">Intelligent Physics</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
                            Sri Lanka's premier digital platform for Advanced Level Physics. Empowering students with interactive learning, adaptive testing, and comprehensive resources.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-start lg:pl-8">
                        <h4 className="text-[#f8fafc] font-black text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Platform
                        </h4>
                        <nav className="flex flex-col gap-4 text-center md:text-left">
                            <button onClick={() => scrollTo('features')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Features
                            </button>
                            <button onClick={() => scrollTo('syllabus')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Syllabus
                            </button>
                            <button onClick={() => navigate('/learning-hub')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Knowledge Center
                            </button>
                        </nav>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col items-center md:items-start lg:pl-8">
                        <h4 className="text-[#f8fafc] font-black text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500" /> Support
                        </h4>
                        <nav className="flex flex-col gap-4 text-center md:text-left">
                            <button onClick={() => scrollTo('about')} className="text-slate-400 hover:text-purple-400 text-sm font-medium transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-purple-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> About Us
                            </button>
                            <button onClick={() => scrollTo('faq')} className="text-slate-400 hover:text-purple-400 text-sm font-medium transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-purple-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> FAQ
                            </button>
                            <button onClick={() => scrollTo('contact')} className="text-slate-400 hover:text-purple-400 text-sm font-medium transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-purple-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Contact Us
                            </button>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-start lg:pl-8">
                        <h4 className="text-[#f8fafc] font-black text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connect
                        </h4>
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <div className="flex flex-col items-center md:items-start gap-1 text-slate-400 text-sm font-medium">
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Email</span>
                                <a href="mailto:info@intelligentphysics.lk" className="hover:text-emerald-400 transition-colors decoration-transparent">info@intelligentphysics.lk</a>
                            </div>

                            <div className="flex gap-4 mt-2 justify-center md:justify-start">
                                <a href="https://www.facebook.com/intelligentphysics.lk" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/5 flex items-center justify-center text-slate-400 hover:bg-[#1e293b] hover:text-blue-500 hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-blue-500/20">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                </a>
                                <a href="https://www.youtube.com/@intelligentphysics" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/5 flex items-center justify-center text-slate-400 hover:bg-[#1e293b] hover:text-red-500 hover:border-red-500/30 transition-all group shadow-sm hover:shadow-red-500/20">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform"><path d="M2.5 17.5c0-.8.7-1.5 1.5-1.5h16c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5h-16c-.8 0-1.5-.7-1.5-1.5v-2zm0-10c0-.8.7-1.5 1.5-1.5h16c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5h-16c-.8 0-1.5-.7-1.5-1.5v-2zm0-10c0-.8.7-1.5 1.5-1.5h16c.8 0 1.5.7 1.5 1.5v2c0 .8-.7 1.5-1.5 1.5h-16c-.8 0-1.5-.7-1.5-1.5v-2z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 text-xs font-medium text-center md:text-left">
                        &copy; {new Date().getFullYear()} <span className="text-slate-400">Intelligent Physics</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-slate-500 text-xs font-medium justify-center">
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium text-center md:text-right">
                        Made with 💙 by <a href="https://www.linkedin.com/in/ravindu-prabashana/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors decoration-transparent font-semibold">Dev</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

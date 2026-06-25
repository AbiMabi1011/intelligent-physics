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
        <footer className="relative bg-[#f8fafc] border-t border-slate-200 pt-24 pb-12 overflow-hidden mt-auto">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

                    {/* Brand Section */}
                    <div className="lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => { if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); else navigate('/'); }}>
                            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                                <img src={logo} alt="Intelligent Physics" className="w-full h-full object-contain rounded-lg" />
                            </div>
                            <span className="font-extrabold text-[#0f172a] tracking-tight text-xl">Intelligent Physics</span>
                        </div>
                        <p className="text-slate-600 text-base leading-relaxed max-w-[320px]">
                            Sri Lanka's premier digital platform for Advanced Level Physics. Empowering students with interactive learning, adaptive testing, and comprehensive resources.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-start lg:pl-8">
                        <h4 className="text-[#0f172a] font-extrabold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" /> Platform
                        </h4>
                        <nav className="flex flex-col gap-4 text-center md:text-left">
                            <button onClick={() => scrollTo('features')} className="text-slate-655 hover:text-blue-650 text-base font-bold transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Features
                            </button>
                            <button onClick={() => scrollTo('syllabus')} className="text-slate-655 hover:text-blue-650 text-base font-bold transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Syllabus
                            </button>
                            <button onClick={() => navigate('/knowledge-hub')} className="text-slate-655 hover:text-blue-650 text-base font-bold transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Knowledge Hub
                            </button>
                        </nav>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col items-center md:items-start lg:pl-8">
                        <h4 className="text-[#0f172a] font-extrabold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" /> Support
                        </h4>
                        <nav className="flex flex-col gap-4 text-center md:text-left">
                            <button onClick={() => scrollTo('about')} className="text-slate-655 hover:text-indigo-650 text-base font-bold transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> About Us
                            </button>
                            <button onClick={() => scrollTo('faq')} className="text-slate-655 hover:text-indigo-650 text-base font-bold transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> FAQ
                            </button>
                            <button onClick={() => scrollTo('contact')} className="text-slate-655 hover:text-indigo-650 text-base font-bold transition-colors bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center md:justify-start gap-2">
                                <span className="text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden md:block">▸</span> Contact Us
                            </button>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-start lg:pl-8">
                        <h4 className="text-[#0f172a] font-extrabold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" /> Connect
                        </h4>
                        <div className="flex flex-col gap-5 text-center md:text-left">
                            <div className="flex flex-col items-center md:items-start gap-1 text-slate-700 text-base font-bold">
                                <span className="text-slate-500 text-sm uppercase tracking-widest font-extrabold">Email</span>
                                <a href="mailto:info@intelligentphysics.lk" className="hover:text-emerald-600 transition-colors decoration-transparent text-base">info@intelligentphysics.lk</a>
                            </div>

                            <div className="flex gap-4 mt-1 justify-center md:justify-start">
                                <a href="https://www.facebook.com/intelligentphysics.lk" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all group shadow-sm hover:shadow-md">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                </a>
                                <a href="https://www.youtube.com/@intelligentphysics" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-red-600 hover:border-red-200 transition-all group shadow-sm hover:shadow-md">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-600 text-sm font-semibold text-center md:text-left">
                        &copy; {new Date().getFullYear()} <span className="text-slate-700 font-bold">Intelligent Physics</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-slate-600 text-sm font-semibold justify-center">
                        <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
                    </div>
                    <p className="text-slate-600 text-sm font-semibold text-center md:text-right">
                        Made with 💙 by <a href="https://www.linkedin.com/in/ravindu-prabashana/" target="_blank" rel="noreferrer" className="text-slate-700 hover:text-blue-600 transition-colors decoration-transparent font-extrabold">Dev</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

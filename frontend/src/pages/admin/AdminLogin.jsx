import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Key, Loader2, Sparkles, User, Database, Monitor, Activity, ArrowLeft, Home } from 'lucide-react';
import logo from '../../assets/logo.jpeg';

// Left-side interactive graph structure for Admin (Emerald & Cyan theme)
const QuantumGraphCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);

        const nodes = [];
        const nodeCount = 50;
        // Emerald, Cyan, Slate colors for Admin
        const colors = ['rgba(16, 185, 129, 0.7)', 'rgba(6, 182, 212, 0.7)', 'rgba(52, 211, 153, 0.7)'];

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        let mouse = { x: width / 2, y: height / 2, active: false, targetX: width / 2, targetY: height / 2 };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.targetX = e.clientX - rect.left;
            mouse.targetY = e.clientY - rect.top;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.active = false;
        };

        canvas.parentElement.addEventListener('mousemove', handleMouseMove);
        canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Gravitational point follows mouse
            if (mouse.active) {
                mouse.x += (mouse.targetX - mouse.x) * 0.1;
                mouse.y += (mouse.targetY - mouse.y) * 0.1;
            }

            // Draw connection lines and nodes
            nodes.forEach((n, idx) => {
                n.x += n.vx;
                n.y += n.vy;

                // Soft bounce off borders
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                // Gravitational pull towards mouse if active
                if (mouse.active) {
                    const dx = mouse.x - n.x;
                    const dy = mouse.y - n.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 200) {
                        const force = (200 - dist) / 3500;
                        n.x += dx * force;
                        n.y += dy * force;
                    }
                }

                // Draw lines between nodes
                for (let j = idx + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n.x - n2.x;
                    const dy = n.y - n2.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 105) {
                        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 105)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }

                // Draw node
                ctx.fillStyle = n.color;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw mouse pulse glow
            if (mouse.active) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvas.parentElement) {
                canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
                canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
};

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const storedTheme = localStorage.getItem('admin-theme') || 'dark';
        if (storedTheme === 'light') {
            document.documentElement.classList.add('admin-theme-light');
        } else {
            document.documentElement.classList.remove('admin-theme-light');
        }

        return () => {
            document.documentElement.classList.remove('admin-theme-light');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const success = await login(username, password);
            if (success) {
                navigate('/admin/dashboard');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch {
            setError('Server error. Failed to connect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#07080B] text-white overflow-hidden font-sans select-none relative">
            
            {/* LEFT SIDE: Admin Network/Database Simulation Space */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#060a08] to-[#0d1512] border-r border-white/5 flex-col justify-between p-16">
                
                {/* Glowing Core Background */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#10b981]/10 blur-[160px] rounded-full" />
                <div className="absolute bottom-[-25%] right-[-10%] w-[70%] h-[70%] bg-[#06b6d4]/5 blur-[160px] rounded-full" />
                
                {/* Simulation Canvas */}
                <QuantumGraphCanvas />

                {/* Header Logo */}
                <div className="flex items-center gap-4 z-10">
                    <div className="h-12 w-12 p-2 bg-[#10b981]/10 rounded-2xl border border-[#10b981]/30 shadow-2xl flex items-center justify-center">
                        <img src={logo} alt="IP Logo" className="h-full w-full object-contain rounded-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-widest uppercase italic">Intelligent <span className="text-[#10b981]">Physics</span></h2>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">Admin Management Console</p>
                    </div>
                </div>

                {/* Slogan Info */}
                <div className="z-10 max-w-lg space-y-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#10b981]/10 text-[#52d3a3] border border-[#10b981]/20 inline-block animate-pulse">
                        Control Room & Systems
                    </span>
                    <h1 className="text-5xl font-black tracking-tight leading-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                        Administer the <span className="text-[#10b981] underline decoration-wavy underline-offset-8">Academic</span> backend database.
                    </h1>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                        Access student registration filters, announcements broadcast settings, live database logs, customized question creation banks, and test result distribution panels.
                    </p>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-widest z-10">
                    <p>© 2026 Intelligent Physics</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
                        <span>System Registry Secure</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Authentication Card Area */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 overflow-y-auto bg-[#07080B] relative custom-scrollbar z-10">
                
                {/* Background ambient light */}
                <div className="absolute right-0 top-0 w-80 h-80 bg-[#10b981]/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute left-10 bottom-10 w-60 h-60 bg-[#06b6d4]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* Portal Switcher & Quick Navigation */}
                    <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white transition-all"
                            >
                                Student Portal
                            </button>
                            <button
                                type="button"
                                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#10b981] text-white shadow-xl transition-all"
                            >
                                Admin Access
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg text-xs font-black uppercase tracking-wider animate-in fade-in duration-300"
                                title="Return to Home"
                            >
                                <Home size={14} /> Home
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg"
                                title="Back to Student Portal"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Glassmorphic Auth Card */}
                    <div className="bg-[#101217]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden group">
                        
                        {/* Hover card border light glow */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent group-hover:via-[#10b981]/60 transition-all duration-700" />
                        
                        {/* Header text */}
                        <div className="mb-10 text-center relative">
                            {/* Logo display on mobile */}
                            <div className="mx-auto mb-6 h-20 w-20 p-2.5 bg-[#10b981]/10 rounded-2xl border border-[#10b981]/20 shadow-2xl flex items-center justify-center lg:hidden">
                                <img src={logo} alt="IP Logo" className="h-full w-full object-contain rounded-md" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
                                Admin <span className="text-[#10b981]">Login</span>
                            </h2>
                            <p className="text-[9px] text-slate-500 mt-3 uppercase tracking-[0.35em] font-black flex items-center justify-center gap-2">
                                <Shield size={10} className="text-[#10b981]" /> Secure Registry Gateway
                            </p>
                        </div>

                        {/* Custom status alerts */}
                        {error && (
                            <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-[10px] text-red-400 font-bold uppercase tracking-widest text-center animate-shake flex items-center justify-center gap-2.5">
                                <ShieldAlert size={14} className="text-red-400 shrink-0" /> 
                                <span className="line-clamp-2">{error}</span>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            
                            {/* Username field */}
                            <div className="space-y-2 group/field">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within/field:text-[#10b981] transition-colors">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#10b981] transition-colors" />
                                    <input
                                        type="text"
                                        className="w-full bg-[#08090C]/90 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-xs font-bold text-white focus:border-[#10b981]/50 focus:ring-4 focus:ring-[#10b981]/10 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Enter admin username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2 group/field">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within/field:text-[#10b981] transition-colors">Password</label>
                                <div className="relative">
                                    <Key size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#10b981] transition-colors" />
                                    <input
                                        type="password"
                                        className="w-full bg-[#08090C]/90 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-xs font-bold text-white focus:border-[#10b981]/50 focus:ring-4 focus:ring-[#10b981]/10 outline-none transition-all placeholder:text-slate-700 tracking-widest"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Main submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#10b981] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:bg-[#0f9f6e] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {loading ? 'Logging in...' : 'Sign In Now'}
                            </button>
                        </form>

                        {/* System status indicators */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center gap-4 text-slate-600 font-bold uppercase tracking-widest text-[8px]">
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                                <span>Security Shield Active</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Database size={12} className="hover:text-white transition-colors" />
                                <Monitor size={12} className="hover:text-white transition-colors" />
                                <Activity size={12} className="hover:text-white transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

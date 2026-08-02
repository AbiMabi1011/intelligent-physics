import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Eye, EyeOff, Shield, Sparkles, Mail, User, BookOpen, Activity, ChevronRight, Home, Key, Database, Monitor } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

// Left-side interactive physics simulation
const PhysicsCanvas = () => {
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

        const particles = [];
        const particleCount = 60;
        const colors = ['rgba(101, 108, 255, 0.7)', 'rgba(6, 182, 212, 0.7)', 'rgba(168, 85, 247, 0.7)'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1.0,
                vy: (Math.random() - 0.5) * 1.0,
                radius: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                orbitRadius: Math.random() * 180 + 60,
                angle: Math.random() * Math.PI * 2,
                angularSpeed: (Math.random() - 0.5) * 0.012,
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

            if (mouse.active) {
                mouse.x += (mouse.targetX - mouse.x) * 0.1;
                mouse.y += (mouse.targetY - mouse.y) * 0.1;
            } else {
                mouse.x += (width / 2 - mouse.x) * 0.05;
                mouse.y += (height / 2 - mouse.y) * 0.05;
            }

            const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
            gradient.addColorStop(0, 'rgba(101, 108, 255, 0.07)');
            gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            ctx.lineWidth = 1;
            for (let r = 80; r <= 320; r += 80) {
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
                ctx.stroke();
            }

            particles.forEach((p) => {
                if (mouse.active) {
                    p.angle += p.angularSpeed;
                    const targetX = mouse.x + Math.cos(p.angle) * p.orbitRadius;
                    const targetY = mouse.y + Math.sin(p.angle) * p.orbitRadius;
                    p.x += (targetX - p.x) * 0.06;
                    p.y += (targetY - p.y) * 0.06;
                } else {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;
                }

                particles.forEach((p2) => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 90) {
                        ctx.strokeStyle = `rgba(101, 108, 255, ${0.12 * (1 - dist / 90)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

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
            className="absolute inset-0 w-full h-full pointer-events-none animate-in fade-in duration-700"
        />
    );
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [className, setClassName] = useState('');
    const [batches, setBatches] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Password strength state (for register mode)
    const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 3

    useEffect(() => {
        if (mode === 'register') {
            fetchBatches();
        }
    }, [mode]);

    useEffect(() => {
        if (mode === 'register') {
            let score = 0;
            if (password.length >= 8) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
            setPasswordStrength(score);
        } else {
            setPasswordStrength(0);
        }
    }, [password, mode]);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        let cleanInput = email.trim();
        if (cleanInput.includes('@')) {
            cleanInput = cleanInput.toLowerCase();
        }

        try {
            if (mode === 'login') {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: cleanInput,
                        password: password.trim()
                    })
                });
                const data = await response.json();
                if (!response.ok) {
                    setError(data.detail || 'Login failed. Please check credentials.');
                    setIsLoading(false);
                    return;
                }

                login(data);

                // Redirect user based on role:
                // - Admin to /admin/dashboard
                // - Students to /dashboard
                if (data.role === 'admin') {
                    navigate('/admin/dashboard' + window.location.search, { replace: true });
                } else {
                    navigate('/dashboard' + window.location.search, { replace: true });
                }
            }
            else if (mode === 'register') {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: cleanInput,
                        password: password.trim(),
                        full_name: fullName,
                        class_name: className
                    })
                });
                const data = await response.json();
                if (!response.ok) {
                    setError(data.detail || 'Registration failed.');
                } else {
                    setSuccessMsg("Registration successful! Your account is pending admin approval.");
                    setMode('login');
                    setPassword('');
                }
            }
            else if (mode === 'forgot') {
                const response = await fetch(`${API_URL}/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: cleanInput })
                });
                const data = await response.json();
                setSuccessMsg(data.message || "Reset link sent.");
                setMode('login');
                setPassword('');
            }
        } catch (err) {
            console.error(err);
            setError('Server connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#07080B] text-white overflow-hidden font-sans select-none relative">

            {/* LEFT SIDE: Physics Simulation Space */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#06070a] to-[#0d0e15] border-r border-white/5 flex-col justify-between p-16">

                {/* Glowing Core Background */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#656CFF]/10 blur-[160px] rounded-full" />
                <div className="absolute bottom-[-25%] right-[-10%] w-[70%] h-[70%] bg-[#a855f7]/5 blur-[160px] rounded-full" />

                {/* Simulation Canvas */}
                <PhysicsCanvas />

                {/* Header Logo */}
                <div className="flex items-center gap-4 z-10">
                    <div className="h-12 w-12 p-2 bg-[#656CFF]/10 border border-[#656CFF]/30 shadow-2xl flex items-center justify-center rounded-2xl">
                        <img src={logo} alt="IP Logo" className="h-full w-full object-contain rounded-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-widest uppercase italic">Intelligent <span className="text-[#656CFF]">Physics</span></h2>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">Interactive Learning Hub</p>
                    </div>
                </div>

                {/* Slogan Info */}
                <div className="z-10 max-w-lg space-y-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#656CFF]/10 text-[#8c91ff] border border-[#656CFF]/20 inline-block animate-pulse">
                        ⚡ NEXT-GEN G.C.E. A/L PREPARATION
                    </span>
                    <h1 className="text-5xl font-black tracking-tight leading-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                        Transforming your struggle into your greatest strength. <span className="text-[#656CFF] underline decoration-wavy underline-offset-8"></span> <br />
                    </h1>

                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-widest z-10">
                    <p>© 2026 Intelligent Physics</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#06b6d4] animate-ping" />
                        <span>Think Positive</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Authentication Card Area */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 overflow-y-auto bg-[#07080B] relative custom-scrollbar z-10">

                {/* Background ambient light */}
                <div className="absolute right-0 top-0 w-80 h-80 bg-[#656CFF]/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute left-10 bottom-10 w-60 h-60 bg-[#a855f7]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">

                    {/* Upper Navigation Bar */}
                    <div className="flex justify-end items-center mb-8 gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg text-xs font-black uppercase tracking-wider"
                            title="Return to Home"
                        >
                            <Home size={14} /> Home
                        </button>

                        {(mode === 'register' || mode === 'forgot') && (
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all shadow-lg animate-in slide-in-from-right-2 duration-300"
                                title="Back to Login"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}
                    </div>

                    {/* Glassmorphic Auth Card */}
                    <div className="bg-[#101217]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden group">

                        {/* Hover card border light glow */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#656CFF]/30 to-transparent group-hover:via-[#656CFF]/60 transition-all duration-700" />

                        {/* Header text */}
                        <div className="mb-10 text-center relative">
                            {/* Logo display on mobile */}
                            <div className="mx-auto mb-6 h-20 w-20 p-2.5 bg-[#656CFF]/10 rounded-2xl border border-[#656CFF]/20 shadow-2xl flex items-center justify-center lg:hidden">
                                <img src={logo} alt="IP Logo" className="h-full w-full object-contain rounded-md" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
                                {mode === 'login' ? 'Learning Hub' : mode === 'register' ? 'Create Your' : 'Reset'} <span className="text-[#656CFF]">{mode === 'login' ? 'Login' : mode === 'register' ? 'Space' : 'Access'}</span>
                            </h2>
                            <p className="text-[9px] text-slate-500 mt-3 uppercase tracking-[0.35em] font-black flex items-center justify-center gap-2">
                                <Shield size={10} className="text-[#656CFF]" />
                                {mode === 'login'
                                    ? 'Intelligent Physics Student Gateway'
                                    : mode === 'register'
                                        ? 'Register to enroll in batches'
                                        : 'We will send a reset link to your email'
                                }
                            </p>
                        </div>

                        {/* Custom status alerts */}
                        {error && (
                            <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-[10px] text-red-400 font-bold uppercase tracking-widest text-center animate-shake flex items-center justify-center gap-2.5">
                                <Activity size={14} className="text-red-400 shrink-0" />
                                <span className="line-clamp-2">{error}</span>
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2.5">
                                <Sparkles size={14} className="text-emerald-400 shrink-0" />
                                <span className="line-clamp-2">{successMsg}</span>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleLogin}>

                            {/* Full name field (register only) */}
                            {mode === 'register' && (
                                <div className="space-y-2 group/field animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF] transition-colors">Full Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#656CFF] transition-colors" />
                                        <input
                                            type="text"
                                            className="w-full bg-[#08090C]/90 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-xs font-bold text-white focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all placeholder:text-slate-700"
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email Address or Username field */}
                            <div className="space-y-2 group/field animate-in fade-in duration-300">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF] transition-colors">
                                    {mode === 'login' ? 'Email Address or Username' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    {mode === 'login' ? (
                                        <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#656CFF] transition-colors" />
                                    ) : (
                                        <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#656CFF] transition-colors" />
                                    )}
                                    <input
                                        type="text"
                                        name="username"
                                        className="w-full bg-[#08090C]/90 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-xs font-bold text-white focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all placeholder:text-slate-700 placeholder:normal-case focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10"
                                        placeholder={mode === 'login' ? 'name@domain.com or username' : 'name@domain.com'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Batch selector field (register only) */}
                            {mode === 'register' && (
                                <div className="space-y-2 group/field animate-in slide-in-from-top-4 duration-300 delay-75">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF] transition-colors">Assign Batch</label>
                                    <div className="relative">
                                        <BookOpen size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#656CFF] transition-colors" />
                                        <select
                                            className="w-full bg-[#08090C]/90 border border-white/5 rounded-2xl pl-14 pr-10 py-4 text-xs font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all appearance-none"
                                            value={className}
                                            onChange={(e) => setClassName(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select your batch</option>
                                            {batches.map(b => (
                                                <option key={b.id} value={b.name} className="bg-[#0c0d12] text-white">{b.name.toUpperCase()}</option>
                                            ))}
                                            <option value="N/A" className="bg-[#0c0d12] text-white">OTHER / NOT ASSIGNED</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password field */}
                            {mode !== 'forgot' && (
                                <div className="space-y-2 group/field">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest group-focus-within/field:text-[#656CFF] transition-colors">Password</label>
                                        {mode === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                                                className="text-[9px] font-black text-[#656CFF]/70 uppercase tracking-wider hover:text-[#656CFF] transition-colors italic"
                                            >
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#656CFF] shadow-[0_0_8px_#656CFF]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="w-full bg-[#08090C]/90 border border-white/5 rounded-2xl pl-14 pr-14 py-4 text-xs font-bold text-white focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all placeholder:text-slate-700 tracking-widest focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl h-8 w-8 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-inner"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator (Register only) */}
                                    {mode === 'register' && password && (
                                        <div className="space-y-1.5 pt-1.5 px-1 animate-in fade-in duration-300">
                                            <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                                <span>Password Strength:</span>
                                                <span className={
                                                    passwordStrength === 1 ? "text-red-400" :
                                                        passwordStrength === 2 ? "text-amber-400" :
                                                            passwordStrength === 3 ? "text-emerald-400" : "text-slate-600"
                                                }>
                                                    {passwordStrength === 1 && "Weak"}
                                                    {passwordStrength === 2 && "Medium"}
                                                    {passwordStrength === 3 && "Strong"}
                                                </span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                                                <div className={`h-full transition-all duration-300 ${passwordStrength >= 1 ? (passwordStrength === 1 ? 'bg-red-500 w-1/3' : passwordStrength === 2 ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full') : 'w-0'
                                                    }`} />
                                            </div>
                                            <ul className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wider space-y-0.5 list-disc list-inside">
                                                <li className={password.length >= 8 ? "text-emerald-500/80" : ""}>At least 8 characters</li>
                                                <li className={/[A-Z]/.test(password) ? "text-emerald-500/80" : ""}>At least one uppercase letter</li>
                                                <li className={(/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) ? "text-emerald-500/80" : ""}>At least one number or special character</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Main submit button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#656CFF] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(101,108,255,0.25)] hover:bg-[#545bd9] hover:shadow-[0_15px_35px_rgba(101,108,255,0.4)] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                                {isLoading ? 'Processing...' : mode === 'login' ? 'Login Now' : mode === 'register' ? 'Register Account' : 'Reset My Password'}
                            </button>

                            {/* Form switch links */}
                            {mode === 'login' && (
                                <div className="text-center mt-6 animate-in fade-in duration-500">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        New to the institute?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                                            className="font-black text-[#656CFF] hover:underline hover:scale-105 transition-all"
                                        >
                                            Register Here
                                        </button>
                                    </p>
                                </div>
                            )}

                            {mode === 'register' && (
                                <div className="text-center mt-6 animate-in fade-in duration-500">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                                            className="font-black text-[#656CFF] hover:underline hover:scale-105 transition-all"
                                        >
                                            Login Here
                                        </button>
                                    </p>
                                </div>
                            )}

                            {mode === 'forgot' && (
                                <div className="text-center mt-6 animate-in fade-in duration-500">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Remember password?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                                            className="font-black text-[#656CFF] hover:underline hover:scale-105 transition-all"
                                        >
                                            Login Here
                                        </button>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
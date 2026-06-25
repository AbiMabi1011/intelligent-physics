import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Eye, EyeOff, Shield, Sparkles, QrCode, Mail, User, BookOpen, Activity, ChevronRight } from 'lucide-react'; 
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';
import QRLogin from '../components/QRLogin';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'qr'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [className, setClassName] = useState('');
    const [batches, setBatches] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (mode === 'register') {
            fetchBatches();
        }
    }, [mode]);

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

        const cleanEmail = email.trim().toLowerCase();

        try {
            if (mode === 'login') {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: cleanEmail, password: password.trim() })
                });
                const data = await response.json();
                if (!response.ok) {
                    setError(data.detail || 'Login failed. Please check credentials.');
                    setIsLoading(false);
                    return;
                }
                login(data);
                navigate(data.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
            }
            else if (mode === 'register') {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: cleanEmail,
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
                    body: JSON.stringify({ email: cleanEmail })
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
        <div className="flex min-h-screen items-center justify-center bg-[#0D0E12] px-4 py-12 relative overflow-hidden font-black">
             {/* Dynamic Flux Background */}
             <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#656CFF]/5 blur-[120px] rounded-full animate-pulse" />
             <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[#656CFF]/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            
            <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-[#15171C] border border-[#23262D] rounded-[3rem] p-10 md:p-14 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#656CFF]/10 blur-[80px] rounded-full -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="mb-12 text-center relative">
                        {mode !== 'login' && (
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                                className="absolute -left-4 -top-4 h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all shadow-xl"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="mx-auto mb-10 h-28 w-28 p-4 bg-[#656CFF]/10 rounded-[2.5rem] border border-[#656CFF]/20 shadow-2xl transition-transform hover:scale-110 duration-700">
                            <img src={logo} alt="IP Logo" className="h-full w-full object-contain" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            {mode === 'login' ? 'Student' : mode === 'register' ? 'Create' : mode === 'forgot' ? 'Reset' : 'Scan'} <span className="text-[#656CFF]">{mode === 'login' ? 'Login' : mode === 'register' ? 'Account' : mode === 'forgot' ? 'Password' : 'QR'}</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.4em] font-black flex items-center justify-center gap-3">
                            <Shield size={10} className="text-[#656CFF]" /> 
                            {mode === 'login' ? 'Intelligent Physics Portal' : mode === 'register' ? 'Join our institute' : mode === 'forgot' ? 'Recover your account' : 'Scan your personal QR'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-[10px] text-red-500 font-black uppercase tracking-widest text-center animate-pulse flex items-center justify-center gap-3">
                            <Activity size={16} /> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-8 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 p-5 text-[10px] text-[#10B981] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3">
                            <Sparkles size={16} /> {successMsg}
                        </div>
                    )}

                    {mode === 'qr' ? (
                        <QRLogin />
                    ) : (
                        <form className="space-y-8" onSubmit={handleLogin}>
                            {mode === 'register' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                                    <div className="space-y-3 group/field">
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Full Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                                            <input
                                                type="text"
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all placeholder:text-slate-800"
                                                placeholder="ENTER NAME"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 group/field">
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Select Batch</label>
                                        <div className="relative">
                                            <BookOpen size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                                            <select
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-[#656CFF]/50 outline-none transition-all appearance-none"
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>SELECT BATCH</option>
                                                {batches.map(b => (
                                                    <option key={b.id} value={b.name}>{b.name.toUpperCase()}</option>
                                                ))}
                                                <option value="N/A">OTHER</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 group/field animate-in slide-in-from-top-4 duration-500 delay-75">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                                    <input
                                        type="text"
                                        name="username"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-5 text-sm font-black text-white focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all placeholder:text-slate-800"
                                        placeholder="ENTER EMAIL"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {mode !== 'forgot' && (
                                <div className="space-y-3 group/field animate-in slide-in-from-top-4 duration-500 delay-150">
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Password</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#656CFF] shadow-[0_0_8px_#656CFF]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-5 text-sm font-black text-white focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all placeholder:text-slate-800 tracking-widest"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-xl h-9 w-9 bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-inner"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {mode === 'login' && (
                                        <div className="flex justify-end pt-2 px-2">
                                            <button
                                                type="button"
                                                onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                                                className="text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-[#656CFF] transition-colors italic"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-4 rounded-2xl bg-[#656CFF] px-8 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                                {isLoading ? 'LOADING...' : mode === 'login' ? 'Login Now' : mode === 'register' ? 'Register Now' : 'Reset Password'}
                            </button>

                            {mode === 'login' && (
                                <div className="text-center mt-10 space-y-8 animate-in fade-in duration-1000">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        Need an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                                            className="font-black text-[#656CFF] hover:underline hover:scale-105 transition-all"
                                        >
                                            Register Here
                                        </button>
                                    </p>
                                    <div className="pt-8 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => { setMode('qr'); setError(''); setSuccessMsg(''); }}
                                            className="w-full h-14 rounded-2xl border border-[#23262D] bg-[#0D0E12] text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl group/qr"
                                        >
                                            <QrCode size={18} className="text-[#656CFF] group-hover:scale-110 transition-transform" /> Login with QR Code
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
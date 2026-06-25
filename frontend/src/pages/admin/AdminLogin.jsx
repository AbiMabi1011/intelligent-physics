import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Key, Loader2, Sparkles, User, Database, Monitor, Activity } from 'lucide-react';
import logo from '../../assets/logo.jpeg';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
        } catch (err) {
            setError('Server error. Failed to connect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0D0E12] relative overflow-hidden font-black">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#656CFF]/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#656CFF]/5 blur-[150px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Login Card */}
            <div className="w-full max-w-lg z-10 p-8 animate-in fade-in zoom-in-95 duration-1000">
                <div className="bg-[#15171C] border border-[#23262D] rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/20 blur-[80px] rounded-full -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mx-auto h-24 w-24 flex items-center justify-center p-3 bg-[#656CFF]/10 rounded-[2.5rem] border border-[#656CFF]/20 shadow-2xl transition-transform hover:scale-110 duration-700">
                            <img src={logo} alt="IP Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="mt-8 text-4xl font-black tracking-tighter text-white uppercase italic">
                            Admin <span className="text-[#656CFF]">Login</span>
                        </h2>
                        <div className="flex items-center justify-center gap-3 mt-3">
                            <span className="h-[1px] w-4 bg-slate-800" />
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black flex items-center gap-2">
                                <Shield size={10} className="text-[#656CFF]" /> Secure Admin Access
                            </p>
                            <span className="h-[1px] w-4 bg-slate-800" />
                        </div>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-[10px] text-red-500 font-black uppercase tracking-widest text-center animate-pulse flex items-center justify-center gap-3">
                                <ShieldAlert size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="relative group/field">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-[#656CFF] transition-colors">Username</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-focus-within/field:text-white transition-all">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-18 pr-6 py-5 text-sm font-black text-white placeholder:text-slate-800 focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="ENTER USERNAME"
                                    />
                                </div>
                            </div>

                            <div className="relative group/field">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-[#656CFF] transition-colors">Password</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-focus-within/field:text-white transition-all">
                                        <Key size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-18 pr-6 py-5 text-sm font-black text-white placeholder:text-slate-800 focus:border-[#656CFF]/50 focus:ring-4 focus:ring-[#656CFF]/10 outline-none transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-4 rounded-2xl bg-[#656CFF] px-8 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? 'Logging in...' : 'Login Now'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Server Online</span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-800">
                             <Database size={14} />
                             <Monitor size={14} />
                             <Activity size={14} />
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] italic opacity-50">
                        &copy; 2026 Intelligent Physics. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

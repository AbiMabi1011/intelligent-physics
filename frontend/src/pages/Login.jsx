import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'

    // Form fields
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 md:p-10 shadow-xl border border-gray-100">
                <div className="mb-8 text-center relative">
                    {mode !== 'login' && (
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                            className="absolute left-0 top-0 p-2 text-gray-500 hover:text-gray-900 transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                        <img src={logo} alt="Intelligent Physics Logo" className="h-full w-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {mode === 'login'
                            ? 'Sign in to Intelligent Physics'
                            : mode === 'register'
                                ? 'Join Intelligent Physics as a student'
                                : 'Enter your email to receive a reset link'}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-red-600 text-sm font-medium border border-red-100 text-center animate-shake">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="rounded-lg bg-green-50 p-3 text-green-700 text-sm font-medium border border-green-100 text-center">
                            {successMsg}
                        </div>
                    )}

                    {mode === 'register' && (
                        <>
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">Class / Batch</label>
                                <select
                                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select your batch</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                    <option value="N/A">Other</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Email or Username</label>
                        <input
                            type="text"
                            className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Email Address or Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {mode !== 'forgot' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {mode === 'login' && (
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
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
                        className="group relative w-full flex justify-center rounded-xl bg-blue-600 px-4 py-3.5 mt-2 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register' : 'Send Reset Link'}</span>}
                    </button>

                    {mode === 'login' && (
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                                    className="font-bold text-blue-600 hover:underline"
                                >
                                    Register here
                                </button>
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => { setEmail('raakul'); setPassword('12345'); }}
                                    className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                                >
                                    Fill Default Admin Access
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-10 11-10 11 10 11 10-4 10-11 10-11-10-11-10z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-10-11-10a19.14 19.14 0 0 1 3.25-4.52M9.9 4.24A9.12 9.12 0 0 1 12 2c7 0 11 10 11 10a19.4 19.4 0 0 1-2.07 3.39M1 1l22 22" /><circle cx="12" cy="12" r="3" /></svg>
);

export default Login;

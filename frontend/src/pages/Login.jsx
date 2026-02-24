import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const cleanUsername = username.trim().toLowerCase();
        const cleanPassword = password.trim();

        if (cleanUsername === 'raakul' && cleanPassword === '12345') {
            navigate('/admin/dashboard');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || 'Login failed. Please check credentials.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify(data));
            localStorage.setItem('userEmail', cleanUsername);
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            setError('Server connection error. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 md:p-10 shadow-xl border border-gray-100">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xl">
                        IP
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Log in to access your academy</p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 text-red-600 text-sm font-medium border border-red-100 text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700" htmlFor="username">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="username"
                            className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="student@email.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck="false"
                                autoComplete="current-password"
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
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] disabled:bg-blue-400"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>

                    <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
                        <p className="font-bold text-gray-700 mb-1 text-center">Admin Access:</p>
                        <p className="text-center">raakul / 12345</p>
                    </div>
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

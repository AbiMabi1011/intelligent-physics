import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const cleanUsername = username.trim().toLowerCase();
        const cleanPassword = password.trim();

        // --- 0. Admin Login Bypass (For Legacy/Admin) ---
        if (cleanUsername === 'raakul' && cleanPassword === '12345') {
            navigate('/admin/dashboard');
            return;
        }

        try {
            // --- CALL BACKEND API to Login ---
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                // Check specific backend errors
                if (data.detail) {
                    setError(data.detail); // "Incorrect email" or "Active"
                } else {
                    setError('Login failed. Please check credentials.');
                }
                setIsLoading(false);
                return;
            }

            // Success
            localStorage.setItem('currentUser', JSON.stringify(data)); // Save session
            localStorage.setItem('userEmail', username); // Save email explicitly for Dashboard
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            setError('Server connection error. Is backend running?');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Login</h1>
                <form className="space-y-4" onSubmit={handleLogin}>
                    {error && <div className="rounded bg-red-50 p-3 text-red-500 text-sm text-center">{error}</div>}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="username">Email Address</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="student@example.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-400"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>
                    <div className="text-center text-sm text-gray-500 mt-4">
                        <p className="font-semibold text-gray-700">Available Logins:</p>
                        <p>Admin: raakul / 12345</p>
                        <p>Student: (Use invited email)</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

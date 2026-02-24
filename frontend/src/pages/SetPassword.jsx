import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { API_URL } from '../config';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');

    // Form States
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            setError('Invalid activation link (No email provided).');
        }
    }, [email]);

    const handleActivate = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            console.log("Activating Account for:", email);
            const response = await fetch(`${API_URL}/auth/set-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });

            console.log("Response Status:", response.status);
            const data = await response.json();
            console.log("Response Data:", data);

            if (!response.ok) {
                // If 404, user not found (maybe deleted?)
                if (response.status === 404) {
                    setError("Account not found. Ask admin to invite you again.");
                } else {
                    setError(data.detail || `Server Error (${response.status})`);
                }
                setIsLoading(false);
                return;
            }

            // Success
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error("Network Error:", err);
            setError(`Network Error: Is backend running on port 8000? Details: ${err.message}`);
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md text-center">
                    <div className="mb-4 flex justify-center text-red-500">
                        <AlertCircle size={48} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Activation Issue</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => navigate('/login')} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md text-center">
                    <div className="mb-4 flex justify-center text-green-500"><CheckCircle size={48} /></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Account Activated!</h2>
                    <p className="text-gray-600 mb-6">Password set successfully. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User size={32} />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Activate Account</h2>
                    <p className="mt-2 text-sm text-gray-500">Create a password for your new account.</p>
                </div>

                <div className="mb-6 rounded-lg bg-blue-50 p-4 text-center border border-blue-100">
                    <p className="text-xs uppercase tracking-wide text-blue-500 font-bold mb-1">Your Login Username</p>
                    <p className="text-lg font-semibold text-blue-800 break-all">{email}</p>
                </div>

                <form className="space-y-6" onSubmit={handleActivate}>

                    {/* Password Fields Only */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Create Password</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors disabled:bg-blue-400"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Set Password & Activate"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;

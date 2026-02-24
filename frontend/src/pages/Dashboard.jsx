import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    CheckCircle,
    Award,
    Clock,
    User,
    LogOut,
    Play
} from 'lucide-react';

import { API_URL } from '../config';

const Dashboard = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail');

    // Tabs: 'overview', 'quizzes'
    const [activeTab, setActiveTab] = useState('overview');

    // Quiz State
    const [quizzes, setQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);

    // Active Quiz Taking State
    const [currentQuiz, setCurrentQuiz] = useState(null); // Full quiz object
    const [answers, setAnswers] = useState({}); // { qId: "A", qId: "B" }
    const [quizResult, setQuizResult] = useState(null); // { score, total, percentage }

    useEffect(() => {
        if (!userEmail) {
            navigate('/login');
        }
    }, [userEmail, navigate]);

    useEffect(() => {
        if (activeTab === 'quizzes') {
            fetchQuizzes();
        }
    }, [activeTab]);

    const fetchQuizzes = async () => {
        setLoadingQuizzes(true);
        try {
            const res = await fetch(`${API_URL}/quizzes`);
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error("Failed to load quizzes", err);
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const handleStartQuiz = async (quizId) => {
        // Fetch full quiz details (with questions)
        try {
            const res = await fetch(`${API_URL}/quizzes/${quizId}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentQuiz(data);
                setAnswers({});
                setQuizResult(null);
            } else {
                alert("Failed to load quiz details");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAnswerSelect = (questionId, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!currentQuiz) return;

        // Count unanswered
        const total = currentQuiz.questions.length;
        const answered = Object.keys(answers).length;
        if (answered < total) {
            if (!window.confirm(`You have answered ${answered} out of ${total} questions. Submit anyway?`)) return;
        }

        try {
            const payload = {
                quiz_id: currentQuiz.id,
                student_email: userEmail,
                answers: answers
            };

            const res = await fetch(`${API_URL}/quizzes/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const result = await res.json();
                setQuizResult(result);
                // Don't close quiz, show result overlay
            } else {
                alert("Submission failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting quiz");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    // --- RENDER HELPERS ---

    if (currentQuiz) {
        // Quiz Taking Interface
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{currentQuiz.title}</h2>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-500 flex items-center">
                                <Clock size={16} className="mr-1" /> Time: Unlimited
                            </span>
                            <button onClick={() => setCurrentQuiz(null)} className="text-gray-500 hover:text-red-500">Exit</button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
                    {quizResult ? (
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center animate-scale-in">
                            <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-4">
                                <Award size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                            <div className="text-5xl font-black text-blue-600 mb-4">
                                {quizResult.percentage.toFixed(0)}%
                            </div>
                            <p className="text-lg text-gray-600 mb-8">
                                You scored <strong>{quizResult.score}</strong> out of <strong>{quizResult.total}</strong>
                            </p>
                            <button
                                onClick={() => { setCurrentQuiz(null); setQuizResult(null); fetchQuizzes(); }}
                                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    ) : (
                        <>
                            {currentQuiz.questions.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-start mb-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 text-sm">
                                            {idx + 1}
                                        </span>
                                        <p className="text-lg font-medium text-gray-800 pt-1">{q.text}</p>
                                    </div>

                                    <div className="space-y-3 ml-11">
                                        {['A', 'B', 'C', 'D'].map((optKey) => {
                                            const optText = q[`option_${optKey.toLowerCase()}`];
                                            if (!optText) return null; // Skip empty options
                                            const isSelected = answers[q.id] === optKey;

                                            return (
                                                <label
                                                    key={optKey}
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${q.id}`}
                                                        className="hidden"
                                                        checked={isSelected}
                                                        onChange={() => handleAnswerSelect(q.id, optKey)}
                                                    />
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                    </div>
                                                    <span className="text-gray-700">{optText}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-4 pb-12">
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-1"
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">IP</span>
                    </div>
                    <span className="font-bold text-lg text-gray-800">Intelligent Physics</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <LayoutDashboard size={18} className="mr-3" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quizzes' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <BookOpen size={18} className="mr-3" /> Quizzes & Tests
                    </button>
                    <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
                        <Award size={18} className="mr-3" /> My Results (Soon)
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Student</p>
                            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                        <LogOut size={16} className="mr-2" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 px-8 py-4 border-b border-gray-200 md:hidden">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">Intelligent Physics</span>
                        <button onClick={handleLogout}><LogOut size={20} /></button>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back!</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                    <h3 className="text-lg font-semibold opacity-90">Active Course</h3>
                                    <p className="text-3xl font-bold mt-2">Physics 101</p>
                                    <div className="mt-4 inline-flex items-center text-sm bg-white/20 px-3 py-1 rounded-full">
                                        <Clock size={14} className="mr-1" /> Ongoing
                                    </div>
                                </div>

                                <button onClick={() => setActiveTab('quizzes')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-left group">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                        <BookOpen size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Take a Quiz</h3>
                                    <p className="text-sm text-gray-500 mt-1">Test your knowledge now</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quizzes' && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>

                            {loadingQuizzes ? (
                                <div className="p-12 text-center text-gray-500">Loading quizzes...</div>
                            ) : quizzes.length === 0 ? (
                                <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">No quizzes available yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {quizzes.map(quiz => (
                                        <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                            <div className="h-2 bg-blue-500"></div>
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quiz.description || "No description"}</p>

                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {quiz.questions?.length || '?'} Questions
                                                    </span>
                                                    <button
                                                        onClick={() => handleStartQuiz(quiz.id)}
                                                        className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800"
                                                    >
                                                        Start <Play size={14} className="ml-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

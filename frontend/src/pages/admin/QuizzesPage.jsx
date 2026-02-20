import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle,
    Save,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const API_URL = ""; // Relative path -> Proxy

const QuizzesPage = () => {
    // Mode: 'list' or 'create'
    const [mode, setMode] = useState('list');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Quiz State
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([
        { text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Quizzes
    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/quizzes`);
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Form Handlers
    const addQuestion = () => {
        setQuestions([...questions, { text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }]);
    };

    const removeQuestion = (index) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const handleSaveQuiz = async () => {
        if (!quizTitle) return alert("Title is required");
        if (questions.length === 0) return alert("Add at least one question");

        setIsSubmitting(true);
        const payload = {
            title: quizTitle,
            description: "Generated Quiz",
            questions: questions
        };

        try {
            const res = await fetch(`${API_URL}/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Quiz Created Successfully!");
                setMode('list');
                setQuizTitle('');
                setQuestions([{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }]);
                fetchQuizzes();
            } else {
                alert("Failed to create quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (mode === 'create') {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Create New Quiz</h1>
                    <button onClick={() => setMode('list')} className="text-gray-500 hover:text-gray-700">Cancel</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Thermodynamics Test 1"
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Questions</h2>
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                            <div className="absolute top-4 right-4">
                                <button onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 mb-3">Question {idx + 1}</h3>

                            <div className="space-y-3">
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Question Text"
                                    rows="2"
                                    value={q.text}
                                    onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                ></textarea>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Option A" className="p-2 border rounded" value={q.option_a} onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)} />
                                    <input type="text" placeholder="Option B" className="p-2 border rounded" value={q.option_b} onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)} />
                                    <input type="text" placeholder="Option C" className="p-2 border rounded" value={q.option_c} onChange={(e) => updateQuestion(idx, 'option_c', e.target.value)} />
                                    <input type="text" placeholder="Option D" className="p-2 border rounded" value={q.option_d} onChange={(e) => updateQuestion(idx, 'option_d', e.target.value)} />
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm font-medium">Correct Answer:</span>
                                    <select
                                        className="p-2 border rounded bg-green-50 text-green-700 font-bold"
                                        value={q.correct_option}
                                        onChange={(e) => updateQuestion(idx, 'correct_option', e.target.value)}
                                    >
                                        <option value="A">Option A</option>
                                        <option value="B">Option B</option>
                                        <option value="C">Option C</option>
                                        <option value="D">Option D</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex justify-center items-center"
                    >
                        <Plus size={20} className="mr-2" /> Add Next Question
                    </button>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSaveQuiz}
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg flex items-center"
                    >
                        <Save size={20} className="mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save & Publish Quiz'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
                <button
                    onClick={() => setMode('create')}
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all"
                >
                    <Plus size={16} className="mr-2" /> Create Quiz
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p>Loading...</p> : quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {quiz.questions ? quiz.questions.length : '?'} Questions
                            </span>
                            <span className="text-gray-400">ID: {quiz.id}</span>
                        </div>
                    </div>
                ))}
                {!loading && quizzes.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        No quizzes found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizzesPage;

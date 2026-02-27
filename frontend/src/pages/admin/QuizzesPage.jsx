import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    Pencil,
    Eye
} from 'lucide-react';
import { API_URL } from '../../config';

const QuizzesPage = () => {
    // Mode: 'list' or 'create'
    const [mode, setMode] = useState('list');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState([]);

    // New Quiz State
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [currentQuizStatus, setCurrentQuizStatus] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [scheduledTime, setScheduledTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [questions, setQuestions] = useState([
        { text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Quizzes & Batches
    useEffect(() => {
        fetchQuizzes();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

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
        setQuestions([...questions, { text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }]);
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

    const resetForm = () => {
        setMode('list');
        setEditingQuizId(null);
        setCurrentQuizStatus(false);
        setQuizTitle('');
        setSelectedBatches([]);
        setScheduledTime('');
        setDurationMinutes(30);
        setQuestions([{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }]);
    };

    const handleEditQuiz = (quiz) => {
        setMode('create');
        setEditingQuizId(quiz.id);
        setCurrentQuizStatus(quiz.is_published);
        setQuizTitle(quiz.title || '');
        setSelectedBatches(quiz.class_name ? quiz.class_name.split(', ') : []);
        setScheduledTime(quiz.scheduled_time || '');
        setDurationMinutes(quiz.duration_minutes || 30);
        setQuestions(quiz.questions && quiz.questions.length > 0 ? quiz.questions : [{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' }]);
    };

    const handleViewQuiz = (quiz) => {
        setMode('view');
        setQuizTitle(quiz.title || '');
        setSelectedBatches(quiz.class_name ? quiz.class_name.split(', ') : []);
        setScheduledTime(quiz.scheduled_time || '');
        setDurationMinutes(quiz.duration_minutes || 30);
        setQuestions(quiz.questions || []);
    };

    const handleSaveQuiz = async () => {
        if (!quizTitle) return alert("Title is required");
        if (selectedBatches.length === 0) return alert("Please select at least one batch");
        if (questions.length === 0) return alert("Add at least one question");

        setIsSubmitting(true);
        const payload = {
            title: quizTitle,
            description: "Generated Quiz",
            class_name: selectedBatches.join(', '),
            is_published: editingQuizId ? currentQuizStatus : false,
            scheduled_time: scheduledTime || null,
            duration_minutes: durationMinutes,
            questions: questions
        };

        try {
            const endpoint = editingQuizId ? `${API_URL}/quizzes/${editingQuizId}` : `${API_URL}/quizzes`;
            const method = editingQuizId ? 'PUT' : 'POST';
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingQuizId ? "Quiz Updated Successfully!" : "Quiz Saved Successfully!");
                resetForm();
                fetchQuizzes();
            } else {
                alert("Failed to save quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const publishQuiz = async (quizId) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${quizId}/publish`, { method: 'PUT' });
            if (res.ok) {
                alert("Quiz Published!");
                fetchQuizzes();
            } else {
                alert("Failed to publish quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error publishing quiz");
        }
    };

    if (mode === 'create') {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">{editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}</h1>
                    <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 font-semibold">Cancel</button>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Scheduled Start Time (Optional)</label>
                            <input
                                type="datetime-local"
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">If set, quiz will automatically activate at this time.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                            <input
                                type="number"
                                min="1"
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500 mt-1">Time limit before auto-submit.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Select Batches</label>
                        <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 space-y-2">
                            {batches.length === 0 ? (
                                <p className="text-xs text-gray-500">No batches available.</p>
                            ) : batches.map(b => (
                                <label key={b.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedBatches.includes(b.name)}
                                        onChange={e => {
                                            const arr = selectedBatches;
                                            if (e.target.checked) setSelectedBatches([...arr, b.name]);
                                            else setSelectedBatches(arr.filter(x => x !== b.name));
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">{b.name}</span>
                                </label>
                            ))}
                        </div>
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

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <input type="text" placeholder="Option A" className="p-2 border rounded" value={q.option_a} onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)} />
                                    <input type="text" placeholder="Option B" className="p-2 border rounded" value={q.option_b} onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)} />
                                    <input type="text" placeholder="Option C" className="p-2 border rounded" value={q.option_c} onChange={(e) => updateQuestion(idx, 'option_c', e.target.value)} />
                                    <input type="text" placeholder="Option D" className="p-2 border rounded" value={q.option_d} onChange={(e) => updateQuestion(idx, 'option_d', e.target.value)} />
                                    <input type="text" placeholder="Option E" className="p-2 border rounded" value={q.option_e} onChange={(e) => updateQuestion(idx, 'option_e', e.target.value)} />
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
                                        <option value="E">Option E</option>
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
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg flex items-center"
                    >
                        <Save size={20} className="mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'view') {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Preview: {quizTitle}</h1>
                    <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 font-semibold px-4 py-2 border rounded-lg bg-white">Back to List</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex gap-4 mb-6">
                        <div className="bg-gray-50 px-4 py-2 rounded-lg border">
                            <span className="text-sm text-gray-500 font-bold block">Batches</span>
                            <span className="font-semibold">{selectedBatches.join(', ') || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-lg border">
                            <span className="text-sm text-gray-500 font-bold block">Duration</span>
                            <span className="font-semibold">{durationMinutes} Mins</span>
                        </div>
                        {scheduledTime && (
                            <div className="bg-gray-50 px-4 py-2 rounded-lg border">
                                <span className="text-sm text-gray-500 font-bold block">Scheduled For</span>
                                <span className="font-semibold">{new Date(scheduledTime).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-lg font-bold text-gray-800 mb-4">Questions Preview</h2>
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50 relative">
                                <h3 className="font-bold text-gray-900 mb-2">{idx + 1}. {q.text}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 ml-4">
                                    {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                        const val = q[`option_${opt.toLowerCase()}`];
                                        if (!val) return null;
                                        return (
                                            <div key={opt} className={`p-2 border rounded-md font-medium text-sm flex items-center gap-2 
                                                ${q.correct_option === opt ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-200'}`}>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${q.correct_option === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{opt}</span>
                                                {val}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
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
                {loading ? <p>Loading...</p> : quizzes.map(quiz => {
                    const isScheduledForFuture = quiz.scheduled_time && new Date(quiz.scheduled_time) > new Date();
                    return (
                        <div key={quiz.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative pb-16">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 pr-4">{quiz.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${!quiz.is_published ? 'bg-gray-100 text-gray-600' : isScheduledForFuture ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {!quiz.is_published ? 'Draft' : isScheduledForFuture ? 'Scheduled' : 'Published'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1 truncate">{quiz.class_name}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-sm mb-4">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {quiz.questions ? quiz.questions.length : '?'} Questions
                                </span>
                                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">
                                    {quiz.duration_minutes || 30} Mins
                                </span>
                                {quiz.scheduled_time && (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                        {new Date(quiz.scheduled_time).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-4 left-6 right-6 flex gap-2">
                                <button
                                    onClick={() => handleViewQuiz(quiz)}
                                    className={`text-sm font-semibold bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center ${quiz.is_published ? 'w-1/2' : 'w-1/3'}`}
                                >
                                    <Eye size={14} className="mr-1" /> View
                                </button>
                                <button
                                    onClick={() => handleEditQuiz(quiz)}
                                    className={`text-sm font-semibold bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center ${quiz.is_published ? 'w-1/2' : 'w-1/3'}`}
                                >
                                    <Pencil size={14} className="mr-1" /> Edit
                                </button>
                                {!quiz.is_published && (
                                    <button
                                        onClick={() => publishQuiz(quiz.id)}
                                        className="w-1/3 text-sm font-semibold bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition flex items-center justify-center"
                                    >
                                        <CheckCircle size={14} className="mr-1" /> {isScheduledForFuture ? 'Schedule' : 'Publish'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
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

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    PieChart,
    Download,
    Search,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { API_URL } from '../../config';

const ResultsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/results`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r =>
        r.student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const averageScore = results.length > 0
        ? (results.reduce((acc, r) => acc + (r.score / r.total_questions), 0) / results.length * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Quiz Results & Analytics</h1>
                <button onClick={fetchResults} className="text-sm text-blue-600 hover:underline flex items-center">
                    Refresh Data
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or quiz..."
                        className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-md">
                    <h3 className="text-sm font-medium opacity-80">Average Score</h3>
                    <p className="mt-2 text-3xl font-bold">{averageScore}%</p>
                    <div className="mt-4 h-1 w-full bg-blue-400 rounded-full overflow-hidden">
                        <div className="h-full bg-white opacity-50" style={{ width: `${averageScore}%` }}></div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{results.length}</p>
                </div>
            </div>

            {/* Results Table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quiz Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Submitted At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading results...</td></tr>
                        ) : filteredResults.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                                            {r.student.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{r.student.full_name || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{r.student.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 font-semibold">{r.quiz.title}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(r.score / r.total_questions) >= 0.8 ? 'bg-green-100 text-green-800' :
                                            (r.score / r.total_questions) >= 0.5 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {((r.score / r.total_questions) * 100).toFixed(0)}% ({r.score}/{r.total_questions})
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredResults.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No results found.</div>
                )}
            </div>
        </div>
    );
};

export default ResultsPage;

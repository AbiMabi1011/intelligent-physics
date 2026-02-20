import React, { useState } from 'react';
import {
    BarChart,
    PieChart,
    Download,
    Search,
    ChevronDown
} from 'lucide-react';

const ResultsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([
        { id: 'R001', studentId: 'S001', name: 'Alice Smith', quiz: 'Kinematics Basics', score: 85, total: 100, attempted: '2026-02-18', time: '28m' },
        { id: 'R002', studentId: 'S002', name: 'Bob Jones', quiz: 'Kinematics Basics', score: 92, total: 100, attempted: '2026-02-18', time: '25m' },
    ]);

    const filteredResults = results.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentId.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Quiz Results & Analytics</h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or ID..."
                        className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select className="appearance-none rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm focus:border-blue-500 hover:border-blue-300 transition-colors">
                        <option>All Quizzes</option>
                        <option>Kinematics Basics</option>
                        <option>Thermodynamics Advanced</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16} />
                </div>
                <div className="relative">
                    <select className="appearance-none rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm focus:border-blue-500 hover:border-blue-300 transition-colors">
                        <option>All Classes</option>
                        <option>11-A</option>
                        <option>12-B</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16} />
                </div>
                <button
                    className="ml-auto flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition"
                >
                    <Download size={16} className="mr-2" /> Export CSV
                </button>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-md">
                    <h3 className="text-sm font-medium opacity-80">Average Score</h3>
                    <p className="mt-2 text-3xl font-bold">88.5%</p>
                    <div className="mt-4 h-1 w-full bg-blue-400 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[88.5%] opacity-50"></div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Participation Rate</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-800">92%</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3 text-green-600">
                            <UsersIcon size={24} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Top Performer</h3>
                            <p className="mt-2 text-lg font-bold text-gray-800">Alice Smith</p>
                            <p className="text-xs text-green-600 font-medium">Class 11-A (98%)</p>
                        </div>
                        <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                            <TrophyIcon size={24} />
                        </div>
                    </div>
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time Taken</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Submitted At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredResults.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                                            {r.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{r.name}</div>
                                            <div className="text-xs text-gray-500">{r.studentId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.quiz}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.score >= 90 ? 'bg-green-100 text-green-800' :
                                            r.score >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {r.score}% ({r.score}/{r.total})
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.time}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.attempted}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600 font-medium">Completed</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Icons not imported from Lucide to avoid clutter in import
const UsersIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const TrophyIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>;

export default ResultsPage;

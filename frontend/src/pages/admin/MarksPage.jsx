import React, { useState } from 'react';
import { ClipboardList, Edit, Search } from 'lucide-react';

const MarksPage = () => {
    // Mock Data
    const [marks, setMarks] = useState([
        { id: 'M001', studentId: 'S001', name: 'Alice Smith', subject: 'Physics', term: 'Mid-Term', score: 85, max: 100 },
        { id: 'M002', studentId: 'S002', name: 'Bob Jones', subject: 'Physics', term: 'Mid-Term', score: 92, max: 100 },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newMark, setNewMark] = useState({ studentId: '', subject: 'Physics', term: 'Final', score: '', max: 100 });

    const filteredMarks = marks.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.studentId.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Marks Management</h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student..."
                        className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 bg-white">
                    <option>All Classes</option>
                    <option>Physics 101</option>
                    <option>Physics 102</option>
                </select>
                <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 bg-white">
                    <option>All Users</option>
                    <option>Mid-Term</option>
                    <option>Final</option>
                </select>
                <button
                    onClick={() => setShowModal(true)}
                    className="ml-auto flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition"
                >
                    <ClipboardList size={16} className="mr-2" /> Add Marks
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Term</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredMarks.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{m.studentId}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.subject}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.term}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-800">{m.score} / {m.max}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                    <button className="text-blue-600 hover:text-blue-900"><Edit size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-scale-in">
                        <h2 className="text-xl font-bold mb-4">Record Student Marks</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                                <input type="text" className="input-field mt-1 w-full rounded-md border p-2" placeholder="S00..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Score</label>
                                <input type="number" className="input-field mt-1 w-full rounded-md border p-2" placeholder="0-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Score</label>
                                <input type="number" className="input-field mt-1 w-full rounded-md border p-2" defaultValue={100} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setShowModal(false)} className="btn-secondary px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button className="btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksPage;

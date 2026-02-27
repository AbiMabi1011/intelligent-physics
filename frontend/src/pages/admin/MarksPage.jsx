import React, { useState, useEffect } from 'react';
import { ClipboardList, Edit, Search, Loader2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

const MarksPage = () => {
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Form State
    const [newMark, setNewMark] = useState({
        studentId: '',
        subject: 'Physics',
        term: 'Mid-Term',
        score: '',
        max: 100
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const handleBulkImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        try {
            if (file.name.endsWith('.pdf')) {
                // In a production app, this would be specialized PDF extraction.
                // For now, we inform users they should use Excel for predictable bulk data.
                alert("For reliable bulk import of marks, please use an Excel or CSV file. PDFs are currently saved as raw attachments (feature coming soon).");
                setIsImporting(false);
                return;
            }

            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const validMarks = jsonData.map(row => ({
                email: (row.email || row.Email || '').trim(),
                subject: row.subject || row.Subject || 'Physics',
                term: row.term || row.Term || 'Mid-Term',
                score: parseInt(row.score || row.Score),
                max_score: parseInt(row.max_score || row.MaxScore || row.max || row.Max || 100)
            })).filter(m => m.email && !isNaN(m.score));

            if (validMarks.length === 0) {
                alert("No valid marks data found. Ensure 'email' and 'score' columns exist.");
                setIsImporting(false);
                return;
            }

            const response = await fetch(`${API_URL}/marks/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marks: validMarks })
            });

            if (response.ok) {
                alert(`Import Complete!`);
                fetchData();
            } else {
                const resData = await response.json();
                alert(`Error: ${resData.detail || 'Failed to import'}`);
            }
        } catch (error) {
            console.error("Import Error:", error);
            alert("Error reading file or uploading.");
        } finally {
            setIsImporting(false);
            e.target.value = null; // reset input
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [marksRes, studentsRes] = await Promise.all([
                fetch(`${API_URL}/marks`),
                fetch(`${API_URL}/users`)
            ]);

            if (marksRes.ok) setMarks(await marksRes.json());
            if (studentsRes.ok) setStudents(await studentsRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newMark.studentId || !newMark.score) return alert("Select student and enter score");

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: parseInt(newMark.studentId),
                    subject: newMark.subject,
                    term: newMark.term,
                    score: parseInt(newMark.score),
                    max_score: parseInt(newMark.max)
                })
            });

            if (res.ok) {
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredMarks = marks.filter(m =>
        m.student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.student.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="ml-auto flex gap-2">
                    <label className={`flex cursor-pointer items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition ${isImporting ? 'opacity-70 pointer-events-none' : ''}`}>
                        {isImporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                        Bulk Import (Excel/PDF)
                        <input type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" onChange={handleBulkImport} disabled={isImporting} />
                    </label>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
                    >
                        <ClipboardList size={16} className="mr-2" /> Add Marks
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Term</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading marks...</td></tr>
                        ) : filteredMarks.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{m.student.full_name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.student.email}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.subject}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.term}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-800">{m.score} / {m.max_score}</td>
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
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                <select
                                    className="mt-1 w-full rounded-md border p-2 text-sm"
                                    value={newMark.studentId}
                                    onChange={e => setNewMark({ ...newMark, studentId: e.target.value })}
                                >
                                    <option value="">-- Choose Student --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Term</label>
                                    <select
                                        className="mt-1 w-full rounded-md border p-2 text-sm"
                                        value={newMark.term}
                                        onChange={e => setNewMark({ ...newMark, term: e.target.value })}
                                    >
                                        <option value="Mid-Term">Mid-Term</option>
                                        <option value="Final">Final</option>
                                        <option value="Unit Test">Unit Test</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Score</label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full rounded-md border p-2 text-sm"
                                        value={newMark.score}
                                        onChange={e => setNewMark({ ...newMark, score: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                            >
                                {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
                                Save Marks
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksPage;

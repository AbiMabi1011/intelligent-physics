import React, { useState, useEffect } from 'react';
import {
    Users,
    Trash2,
    Edit,
    Plus,
    Search,
    Mail,
    CheckCircle,
    Copy,
    X,
    Loader2
} from 'lucide-react';

const API_URL = "";

const StudentsPage = () => {
    // State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [lastAddedEmail, setLastAddedEmail] = useState('');

    // Form State
    const [newStudent, setNewStudent] = useState({ name: '', email: '', class: '', status: 'Active' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FETCH STUDENTS FROM BACKEND ---
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users`);
            if (response.ok) {
                const data = await response.json();
                // Map backend data to frontend structure
                const formatted = data.map(u => ({
                    id: `S${String(u.id).padStart(3, '0')}`,
                    db_id: u.id,
                    // Use real DB fields now
                    name: u.full_name || u.email.split('@')[0],
                    email: u.email,
                    class: u.class_name || 'N/A',
                    status: u.is_active ? 'Active' : 'Pending',
                    created: '2026-02-19'
                }));
                setStudents(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // --- ADD STUDENT ---
    const handleAddStudent = async () => {
        if (!newStudent.email || !newStudent.name || !newStudent.class) {
            alert("All fields (Name, Email, Class) are required");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                email: newStudent.email,
                full_name: newStudent.name,
                class_name: newStudent.class
            };

            const response = await fetch(`${API_URL}/users/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Error: ${data.detail || 'Failed to add student'}`);
                setIsSubmitting(false);
                return;
            }

            // Success
            setShowModal(false);

            // Generate Link for UI
            const inviteLink = `${window.location.origin}/set-password?email=${encodeURIComponent(newStudent.email)}`;
            setGeneratedLink(inviteLink);
            setLastAddedEmail(newStudent.email);
            setShowSuccessModal(true);

            // Refresh List
            fetchStudents();
            setNewStudent({ name: '', email: '', class: '', status: 'Active' });

        } catch (error) {
            console.error("API Error:", error);
            alert("Backend Connection Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DELETE STUDENT ---
    const handleRemoveStudent = async (email) => {
        if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

        try {
            const response = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from UI immediately
                setStudents(students.filter(s => s.email !== email));
            } else {
                alert("Failed to delete user from database.");
            }
        } catch (error) {
            console.error("Delete Error:", error);
        }
    }

    // Resend Invite
    const handleResendInvite = (email) => {
        const inviteLink = `${window.location.origin}/set-password?email=${encodeURIComponent(email)}`;
        setGeneratedLink(inviteLink);
        setLastAddedEmail(email);
        setShowSuccessModal(true);
    }

    const filteredStudents = students.filter(s =>
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
                >
                    <Plus size={16} className="mr-2" /> Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name & Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading students...</td></tr>
                        ) : filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{student.id}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-bold text-xs">
                                            {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{student.name}</div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{student.class}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button onClick={() => handleResendInvite(student.email)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Mail size={16} />
                                    </button>
                                    <button onClick={() => handleRemoveStudent(student.email)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredStudents.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">No students found.</div>
                )}
            </div>

            {/* Add Student Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-scale-in">
                        <h2 className="text-xl font-bold mb-4">Add New Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (Username)</label>
                                <input
                                    type="email"
                                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={newStudent.email}
                                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class / Batch</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={newStudent.class}
                                    onChange={e => setNewStudent({ ...newStudent, class: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStudent}
                                    disabled={isSubmitting}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                                    Send Invite & Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-center mb-4 text-green-500">
                            <CheckCircle size={64} />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Invitation Sent!</h2>
                        <p className="text-center text-gray-500 mb-6">
                            User invited successfully via Backend API.<br />
                            <strong>{lastAddedEmail}</strong>
                        </p>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Manual Link (Simulation)</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedLink}
                                    className="w-full bg-white border border-blue-200 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;

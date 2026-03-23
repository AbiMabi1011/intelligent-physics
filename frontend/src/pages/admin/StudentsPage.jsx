import React, { useState, useEffect } from 'react';
import {
    Users,
    Trash2,
    Edit,
    Plus,
    Search,
    Mail,
    CheckCircle,
    Check,
    Copy,
    X,
    Loader2,
    Upload,
    QrCode,
    Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import * as XLSX from 'xlsx';

import { API_URL } from '../../config';

const StudentsPage = () => {
    // State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [batches, setBatches] = useState([]);

    // Requests State
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [lastAddedEmail, setLastAddedEmail] = useState('');

    const downloadQR = () => {
        const svg = document.getElementById("qr-to-download");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const svgSize = svg.getBoundingClientRect();
        canvas.width = svgSize.width * 2;
        canvas.height = svgSize.height * 2;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${selectedStudent.name.replace(/\s+/g, '_')}_QR_ID.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    // Form State
    const [newStudent, setNewStudent] = useState({ name: '', email: '', class: '', status: 'Active' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // --- BULK IMPORT ---
    const handleBulkImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Expecting columns: name, email, class
            const validUsers = jsonData.map(row => ({
                full_name: row.name || row.Name || row.full_name || '',
                email: (row.email || row.Email || '').trim(),
                class_name: row.class || row.Class || row.class_name || 'N/A'
            })).filter(u => u.email); // Only valid emails

            if (validUsers.length === 0) {
                alert("No valid user data found in the file. Ensure an 'email' column exists.");
                setIsImporting(false);
                return;
            }

            const response = await fetch(`${API_URL}/users/bulk-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: validUsers })
            });

            const resData = await response.json();
            if (response.ok) {
                alert(`Import Complete: ${resData.message}`);
                fetchStudents();
            } else {
                alert(`Error: ${resData.detail || 'Failed to import students'}`);
            }
        } catch (error) {
            console.error("Import Error:", error);
            alert("Error reading file or uploading.");
        } finally {
            setIsImporting(false);
            e.target.value = null; // reset input
        }
    };

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
        fetchBatches();
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const res = await fetch(`${API_URL}/admin/requests`);
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await fetch(`${API_URL}/admin/requests/${id}/${action}`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchRequests();
                fetchStudents();
            } else {
                alert(`Failed to ${action} request`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (err) {
            console.error("Failed to fetch batches:", err);
        }
    };

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
                <div className="flex gap-2">
                    <label className={`flex cursor-pointer items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 hover:shadow-md transition-all ${isImporting ? 'opacity-70 pointer-events-none' : ''}`}>
                        {isImporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                        {isImporting ? 'Importing...' : 'Bulk Import'}
                        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleBulkImport} disabled={isImporting} />
                    </label>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
                    >
                        <Plus size={16} className="mr-2" /> Add Student
                    </button>
                </div>
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

            {/* Pending Requests Section */}
            {requests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Registration Requests</h2>
                    <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-orange-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-orange-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Batch/Class</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {loadingRequests ? (
                                    <tr><td colSpan="4" className="p-8 text-center flex justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></td></tr>
                                ) : requests.map(req => (
                                    <tr key={req.id} className="hover:bg-orange-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.full_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{req.class_name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleAction(req.id, 'approve')}
                                                className="text-white bg-green-500 hover:bg-green-600 p-2 rounded-lg transition inline-flex"
                                                title="Approve"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'reject')}
                                                className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg transition inline-flex"
                                                title="Reject"
                                            >
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Students Table */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">All Students</h2>
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
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
                                        <button onClick={() => { setSelectedStudent(student); setShowQRModal(true); }} className="text-gray-600 hover:text-blue-600 mr-4" title="View QR ID">
                                            <QrCode size={16} />
                                        </button>
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
                                <select
                                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                                    value={newStudent.class}
                                    onChange={e => setNewStudent({ ...newStudent, class: e.target.value })}
                                >
                                    <option value="" disabled>Select a Batch</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                    <option value="N/A">N/A (Other)</option>
                                </select>
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

            {/* QR Modal */}
            {showQRModal && selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-scale-in">
                        <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h3 className="font-black text-2xl text-gray-900 mb-2">Student QR ID</h3>
                        <p className="text-gray-500 text-sm mb-6">Scan this code to log {selectedStudent.name} in.</p>
                        <div className="bg-white p-4 inline-block rounded-2xl border-4 border-indigo-50 shadow-sm mb-4">
                            <QRCodeSVG id="qr-to-download" value={JSON.stringify({ user_id: selectedStudent.db_id })} size={200} />
                        </div>
                        <div className="bg-blue-50 text-blue-800 text-xs font-bold rounded-xl px-4 py-2 mt-2 break-all">
                            ID: {selectedStudent.id} • {selectedStudent.email}
                        </div>
                        <div className="bg-indigo-50 text-indigo-800 text-xs font-bold rounded-xl px-4 py-2 mt-2">
                             Batch: {selectedStudent.class}
                        </div>
                        <div className="mt-6 flex flex-col gap-2">
                            <button 
                                onClick={downloadQR}
                                className="inline-flex items-center gap-2 justify-center bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                            >
                                <Download size={16} /> Download QR ID
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 justify-center bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
                            >
                                <QrCode size={16} /> Print ID
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;

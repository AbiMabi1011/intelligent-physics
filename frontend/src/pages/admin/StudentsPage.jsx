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
    Download,
    MoreVertical,
    FileText,
    Filter,
    Activity,
    Database,
    Shield,
    Globe,
    Sparkles,
    TrendingUp,
    Clock
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
    const [generatedLink, setGeneratedLink] = useState('');

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
            downloadLink.download = `${(selectedStudent.full_name || 'student').replace(/\s+/g, '_')}_QR_ID.png`;
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

            const validUsers = jsonData.map(row => ({
                full_name: row.name || row.Name || row.full_name || '',
                email: (row.email || row.Email || '').trim(),
                class_name: row.class || row.Class || row.class_name || 'N/A'
            })).filter(u => u.email);

            if (validUsers.length === 0) {
                alert("No valid user data found. Ensure an 'email' column exists.");
                setIsImporting(false);
                return;
            }

            const response = await fetch(`${API_URL}/users/bulk-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: validUsers })
            });

            if (response.ok) {
                alert(`Successfully invited ${validUsers.length} students.`);
                fetchStudents();
            } else {
                alert("Bulk invite failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Error during bulk upload.");
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    // --- FETCH DATA ---
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/students`);
            if (response.ok) setStudents(await response.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const res = await fetch(`${API_URL}/admin/requests`);
            if (res.ok) setRequests(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoadingRequests(false); }
    };

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchStudents();
        fetchBatches();
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/requests/${id}/${action}`, { method: 'POST' });
            if (res.ok) {
                fetchRequests();
                fetchStudents();
            } else {
                alert(`Request ${action} failed.`);
            }
        } catch (err) { console.error(err); }
    };

    const handleAddStudent = async () => {
        if (!newStudent.email || !newStudent.name || !newStudent.class) {
            alert("Name, Email, and Batch are required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { email: newStudent.email, full_name: newStudent.name, class_name: newStudent.class };
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
            setShowModal(false);
            const inviteLink = `${window.location.origin}/set-password?email=${encodeURIComponent(newStudent.email)}`;
            setGeneratedLink(inviteLink);
            setLastAddedEmail(newStudent.email);
            setShowSuccessModal(true);
            fetchStudents();
            setNewStudent({ name: '', email: '', class: '', status: 'Active' });
        } catch (error) {
            console.error(error);
            alert("Server connection error.");
        } finally { setIsSubmitting(false); }
    };

    const handleRemoveStudent = async (email) => {
        if (!window.confirm(`Delete student record for ${email}?`)) return;
        try {
            const response = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
            if (response.ok) {
                setStudents(students.filter(s => s.email !== email));
            } else {
                alert("Failed to delete record.");
            }
        } catch (error) { console.error(error); }
    };

    const filteredStudents = students.filter(s =>
        (s.full_name && s.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const copyToClipboard = () => { 
        navigator.clipboard.writeText(generatedLink);
        alert('Link copied to clipboard.');
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <Users size={32} className="text-[#656CFF]" /> Student Management
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 italic flex items-center gap-2">
                         Manage Student Accounts & Enrollments — Status: <span className="text-[#10B981] font-black uppercase">Online</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <label className="flex-1 lg:flex-none h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl px-8 transition-all border border-white/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest cursor-pointer active:scale-95 shadow-xl">
                        <Upload size={18} className="text-[#FEBC2E]" /> {isImporting ? 'Importing...' : 'Bulk Upload'}
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkImport} disabled={isImporting} />
                    </label>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex-1 lg:flex-none h-14 bg-[#656CFF] text-white rounded-2xl px-10 transition-all shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={20} /> Add Student
                    </button>
                </div>
            </div>

            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Registration Requests Box */}
                <div className="md:col-span-8 admin-card p-8 bg-[#15171C] border-[#23262D]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                <Activity size={20} className="text-[#FEBC2E]" /> New Requests
                            </h3>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">Students waiting for approval</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">Queue size: {requests.length}</span>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                        {loadingRequests ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#656CFF] mb-4" size={32} /></div>
                        ) : requests.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                <Shield size={40} className="mx-auto text-slate-800 mb-4" />
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No pending requests.</p>
                            </div>
                        ) : requests.map((req) => (
                            <div key={req.id} className="p-6 bg-[#0D0E12] border border-[#23262D] rounded-2xl flex items-center justify-between group transition-all hover:bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs font-black">
                                        {req.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white tracking-tight group-hover:text-[#FEBC2E] transition-colors">{req.full_name}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{req.email} — {req.class_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleAction(req.id, 'approve')} className="h-10 px-5 bg-[#10B981]/10 text-[#10B981] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-all">Approve</button>
                                    <button onClick={() => handleAction(req.id, 'reject')} className="h-10 px-5 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Info Box */}
                <div className="md:col-span-4 admin-card p-8 bg-gradient-to-br from-[#15171C] to-[#0D0E12] flex flex-col justify-center gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[60px] rounded-full translate-x-12 translate-y-[-12px]" />
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-3xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] shadow-xl">
                            <Users size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Total Students</p>
                            <h4 className="text-4xl font-black text-white tracking-tighter">{students.length}</h4>
                        </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Weekly Growth</p>
                            <span className="text-[10px] font-bold text-[#10B981]">+8%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-[#656CFF] to-[#b0b3ff] w-4/5 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List Section */}
            <div className="admin-card p-10 bg-[#15171C] border-[#23262D]">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <Database size={24} className="text-[#656CFF]" /> Master Student List
                        </h3>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">View and manage all registered student records</p>
                    </div>
                    <div className="relative group/search max-w-sm w-full">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-[#656CFF] transition-all" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-4 pl-16 pr-6 text-xs font-black text-white placeholder:text-slate-700 focus:border-[#656CFF]/50 outline-none transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Student Details</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Batch / Class</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                                <th className="text-right py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#656CFF]" size={32} /></td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="4" className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">No records found matching your search</td></tr>
                            ) : filteredStudents.map((student) => (
                                <tr key={student.email} className="group hover:bg-white/[0.02] transition-all">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] text-xs font-black transition-transform group-hover:scale-110">
                                                {student.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white leading-tight group-hover:text-[#656CFF] transition-colors">{student.full_name}</p>
                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-2 mt-1"><Mail size={10} /> {student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-[10px] font-black text-white px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl uppercase tracking-widest">
                                            {student.class_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                onClick={() => { setSelectedStudent(student); setShowQRModal(true); }}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-[#656CFF]/10 hover:text-[#656CFF] transition-all"
                                                title="View QR Code"
                                            >
                                                <QrCode size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveStudent(student.email)}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                title="Delete Student"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register Student Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-xl rounded-[3rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/10 blur-[80px] rounded-full -translate-y-12 translate-x-12" />
                        
                        <div className="mb-12">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Register <span className="text-[#656CFF]">Student</span></h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">Create new student account</p>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-3 group/field">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                                    <input
                                        type="text"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        placeholder="ENTER FULL NAME"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-3 group/field">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                                    <input
                                        type="email"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-4 text-sm font-black text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        placeholder="ENTER EMAIL ADDRESS"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-3 group/field">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within/field:text-[#656CFF]">Batch / Class</label>
                                <div className="relative">
                                    <BookOpen size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                                    <select
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl pl-16 py-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-[#656CFF]/50 outline-none appearance-none"
                                        value={newStudent.class}
                                        onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                                    >
                                        <option value="" disabled>SELECT BATCH</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.name}>{b.name.toUpperCase()}</option>
                                        ))}
                                        <option value="N/A">OTHER</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 h-14 bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStudent}
                                    disabled={isSubmitting}
                                    className="flex-3 h-14 bg-[#656CFF] text-white rounded-2xl px-12 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmitting ? 'Processing...' : 'Add Student'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowSuccessModal(false)} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-lg rounded-[3.520rem] p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl text-center">
                        <div className="h-24 w-24 bg-[#10B981]/10 rounded-[2.5rem] flex items-center justify-center text-[#10B981] mx-auto mb-10 shadow-xl border border-[#10B981]/20">
                            <Sparkles size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Registry <span className="text-[#10B981]">Success</span></h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-6 bg-black/40 p-5 rounded-2xl border border-white/5 break-all font-black text-center">
                            INVITE SENT TO: <span className="text-white ml-2 italic">{lastAddedEmail}</span>
                        </p>
                        
                        <div className="mt-10 space-y-4">
                            <button
                                onClick={copyToClipboard}
                                className="w-full h-14 bg-[#656CFF]/10 text-[#656CFF] hover:bg-[#656CFF] hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-[#656CFF]/20"
                            >
                                <Copy size={18} /> Copy Invite Link
                            </button>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full h-14 bg-white/5 text-slate-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQRModal && (selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowQRModal(false)} />
                    <div className="bg-[#15171C] border border-[#23262D] w-full max-w-lg rounded-[3.5rem] p-10 relative animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#656CFF] to-transparent shadow-[0_0_20px_#656CFF]" />
                        
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Student <span className="text-[#656CFF]">QR Code</span></h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2 italic">Official ID Access</p>
                        </div>

                        <div className="bg-white p-12 rounded-[2.5rem] shadow-inner mb-10 border-4 border-white/5 flex items-center justify-center relative group">
                            <QRCodeSVG
                                id="qr-to-download"
                                value={selectedStudent.email}
                                size={280}
                                level="H"
                                includeMargin={true}
                                className="transition-transform group-hover:scale-105 duration-700"
                            />
                        </div>

                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 mb-8">
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center mb-1">Student Badge</p>
                             <p className="text-sm font-black text-white text-center uppercase tracking-widest">{selectedStudent.name}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={downloadQR}
                                className="h-14 bg-[#656CFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#545bd9] shadow-2xl shadow-[#656CFF]/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Download size={18} /> Download
                            </button>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="h-14 bg-white/5 text-slate-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentsPage;

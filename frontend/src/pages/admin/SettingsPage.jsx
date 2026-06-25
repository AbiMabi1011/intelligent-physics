import React, { useState } from 'react';
import { Save, Lock, Mail, Bell, Shield, Key, Layers, Plus, Trash2, Loader2, Server, Smartphone, Monitor, Globe, Sparkles } from 'lucide-react';
import { API_URL } from '../../config';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        siteName: 'Intelligent Physics',
        adminEmail: 'admin@physics.com',
        maintenanceMode: false,
        emailNotifications: true,
    });

    const [adminCreds, setAdminCreds] = useState({
        currentEmail: '',
        currentPassword: '',
        newEmail: '',
        newPassword: ''
    });
    const [credStatus, setCredStatus] = useState({ type: '', message: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    // Batches state
    const [batches, setBatches] = useState([]);
    const [newBatchName, setNewBatchName] = useState('');
    const [isAddingBatch, setIsAddingBatch] = useState(false);

    React.useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBatch = async () => {
        if (!newBatchName.trim()) return;
        setIsAddingBatch(true);
        try {
            const res = await fetch(`${API_URL}/batches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newBatchName, description: '' })
            });
            if (res.ok) {
                setNewBatchName('');
                fetchBatches();
            } else {
                alert("Failed to add batch.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAddingBatch(false);
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Delete this batch? This will affect batch filtering for students.")) return;
        try {
            const res = await fetch(`${API_URL}/batches/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBatches();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleCredsChange = (e) => {
        setAdminCreds({
            ...adminCreds,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateCreds = async (e) => {
        e.preventDefault();
        setCredStatus({ type: '', message: '' });

        if (!adminCreds.currentEmail || !adminCreds.currentPassword || !adminCreds.newEmail) {
            setCredStatus({ type: 'error', message: 'Current email, password and new email are required.' });
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch(`${API_URL}/admin/credentials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_email: adminCreds.currentEmail,
                    current_password: adminCreds.currentPassword,
                    new_email: adminCreds.newEmail,
                    new_password: adminCreds.newPassword || null
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setCredStatus({ type: 'error', message: data.detail || 'Operation Failed' });
            } else {
                setCredStatus({ type: 'success', message: 'Admin login updated successfully.' });
                setAdminCreds(prev => ({ ...prev, currentPassword: '', newPassword: '', currentEmail: data.new_email }));
            }
        } catch (error) {
            setCredStatus({ type: 'error', message: 'Network Error. Please try again.' });
        }
        setIsUpdating(false);
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Manage your school settings and batches</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="admin-card p-2 sticky top-24">
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#656CFF]/10 text-[#656CFF] text-sm font-black uppercase tracking-widest border border-[#656CFF]/20 transition-all">
                            <Server size={18} /> General Settings
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-sm font-bold transition-all mt-1">
                            <Key size={18} /> Admin Login
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-sm font-bold transition-all mt-1">
                            <Bell size={18} /> Notifications
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-sm font-bold transition-all mt-1">
                            <Layers size={18} /> Batches
                        </button>
                    </div>
                </div>

                {/* Main Settings Form */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <div className="admin-card p-10 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 translate-y-[-12px]" />
                        
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">General Settings</h3>
                        </div>

                        <div className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Site Name</label>
                                    <input
                                        type="text"
                                        name="siteName"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Admin Email</label>
                                    <input
                                        type="email"
                                        name="adminEmail"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        value={settings.adminEmail}
                                        onChange={handleChange}
                                    />
                                </div>
                             </div>

                             <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                        <Monitor size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Maintenance Mode</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Disable student dashboard temporarily</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                                    className={`h-7 w-12 rounded-full p-1 transition-all ${settings.maintenanceMode ? 'bg-[#10B981]' : 'bg-slate-700'}`}
                                >
                                    <div className={`h-5 w-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <button className="h-14 w-full bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3">
                                <Save size={18} /> Save Settings
                            </button>
                        </div>
                    </div>

                    {/* Batch Management */}
                    <div className="admin-card p-10 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEBC2E]/5 blur-[80px] rounded-full translate-x-12 translate-y-[-12px]" />
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#FEBC2E]/10 flex items-center justify-center text-[#FEBC2E]">
                                <Layers size={21} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Batch Management</h3>
                        </div>

                        <div className="flex gap-4">
                            <input
                                type="text"
                                className="flex-1 bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#FEBC2E]/50 outline-none transition-all placeholder:text-slate-800"
                                placeholder="Enter New Batch Name..."
                                value={newBatchName}
                                onChange={(e) => setNewBatchName(e.target.value)}
                            />
                            <button
                                onClick={handleAddBatch}
                                disabled={isAddingBatch}
                                className="px-8 bg-[#FEBC2E] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#ffc84d] transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95"
                            >
                                {isAddingBatch ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                                Add
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {batches.map((batch) => (
                                <div key={batch.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 font-black text-[10px]">
                                            {batch.id}
                                        </div>
                                        <span className="text-xs font-black text-white uppercase tracking-widest">{batch.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteBatch(batch.id)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admin Credentials */}
                    <div className="admin-card p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                <Key size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Update Admin Login</h3>
                        </div>

                        {credStatus.message && (
                            <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-slide-up ${credStatus.type === 'success' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {credStatus.type === 'success' ? <CheckCircle size={14} /> : <Shield size={14} />}
                                {credStatus.message}
                            </div>
                        )}

                        <form onSubmit={handleUpdateCreds} className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Current Email</label>
                                    <input
                                        type="email"
                                        name="currentEmail"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        value={adminCreds.currentEmail}
                                        onChange={handleCredsChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        value={adminCreds.currentPassword}
                                        onChange={handleCredsChange}
                                        required
                                    />
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">New Email</label>
                                    <input
                                        type="email"
                                        name="newEmail"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        value={adminCreds.newEmail}
                                        onChange={handleCredsChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                        placeholder="Leave blank to keep current"
                                        value={adminCreds.newPassword}
                                        onChange={handleCredsChange}
                                    />
                                </div>
                             </div>

                             <button
                                type="submit"
                                disabled={isUpdating}
                                className="h-14 w-full bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                {isUpdating ? 'Updating...' : 'Update Login Info'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

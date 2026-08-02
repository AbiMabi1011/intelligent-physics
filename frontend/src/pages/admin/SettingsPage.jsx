import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Lock, Mail, Bell, Shield, Key, Layers, Plus, Trash2, Loader2, Server, Smartphone, Monitor, Globe, Sparkles, Check, CheckCircle, Palette, ToggleLeft, Users } from 'lucide-react';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { 
        theme, setTheme, 
        compact, setCompact, 
        sidebarGlass, setSidebarGlass, 
        glowsEnabled, setGlowsEnabled 
    } = useOutletContext();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('general');

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

    useEffect(() => {
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
            console.error("Credential update error:", error);
            setCredStatus({ type: 'error', message: 'Network Error. Please try again.' });
        }
        setIsUpdating(false);
    };

    const themesList = [
        { id: 'dark', name: 'Modern Dark', desc: 'Sleek dark interface with purple neon accents', color: '#656CFF' },
        { id: 'light', name: 'Clean Light', desc: 'Bright, minimalistic layout with bold blue highlights', color: '#3B82F6' },
        { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'High-contrast dark grid with cyan and hot pink glow', color: '#FF007F' },
        { id: 'emerald', name: 'Emerald Forest', desc: 'Calming dark green background with rich emerald buttons', color: '#10B981' },
        { id: 'crimson', name: 'Crimson Ocean', desc: 'Navy background with aggressive crimson accents', color: '#EF4444' }
    ];

    return (
        <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Configure your workspace, preferences, and details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="admin-card p-2 sticky top-24 bg-[#15171C] border border-[#23262D]">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                                activeTab === 'general' 
                                    ? 'bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 shadow-md' 
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Server size={18} /> General
                        </button>
                        <button 
                            onClick={() => setActiveTab('theme')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all mt-1 ${
                                activeTab === 'theme' 
                                    ? 'bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 shadow-md' 
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Palette size={18} /> Themes & UI
                        </button>
                        <button 
                            onClick={() => setActiveTab('credentials')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all mt-1 ${
                                activeTab === 'credentials' 
                                    ? 'bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 shadow-md' 
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Key size={18} /> Credentials
                        </button>
                        <button 
                            onClick={() => setActiveTab('batches')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all mt-1 ${
                                activeTab === 'batches' 
                                    ? 'bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 shadow-md' 
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Layers size={18} /> Batches
                        </button>
                        {user?.role === 'admin' && (
                            <button 
                                onClick={() => setActiveTab('sub-admins')}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all mt-1 ${
                                    activeTab === 'sub-admins' 
                                        ? 'bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 shadow-md' 
                                        : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <Shield size={18} /> Sub-Admins
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Settings Forms */}
                <div className="lg:col-span-3 space-y-8">
                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <div className="admin-card p-10 space-y-10 relative overflow-hidden group bg-[#15171C] border border-[#23262D]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#656CFF]/5 blur-[80px] rounded-full translate-x-12 translate-y-[-12px]" />
                            
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">General System Settings</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global configuration parameters</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Site Title</label>
                                        <input
                                            type="text"
                                            name="siteName"
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                            value={settings.siteName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Contact Administrator Email</label>
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
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Maintenance Lockout</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Disable the student dashboard immediately for audits</p>
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
                                    <Save size={18} /> Save General Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Themes & UI Tab */}
                    {activeTab === 'theme' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Preset Selector */}
                            <div className="admin-card p-10 space-y-8 bg-[#15171C] border border-[#23262D]">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                        <Palette size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Theme presets</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Change the interface color scheme instantly</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {themesList.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group flex justify-between items-center ${
                                                theme === t.id 
                                                    ? 'border-[#656CFF] bg-[#656CFF]/10 shadow-[0_0_15px_rgba(101,108,255,0.1)]' 
                                                    : 'border-[#23262D] bg-[#0D0E12] hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex flex-col pr-4">
                                                <span className="text-sm font-black text-white uppercase tracking-tight">{t.name}</span>
                                                <span className="text-[9px] text-slate-500 font-bold mt-1 leading-normal">{t.desc}</span>
                                            </div>
                                            <span 
                                                className="h-10 w-10 shrink-0 rounded-full border border-white/10 flex items-center justify-center shadow-lg" 
                                                style={{ backgroundColor: t.color }}
                                            >
                                                {theme === t.id && <Check size={18} className="text-white font-black animate-scale-in" />}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* UI Configuration Options */}
                            <div className="admin-card p-10 space-y-8 bg-[#15171C] border border-[#23262D]">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-[#FEBC2E]/10 flex items-center justify-center text-[#FEBC2E]">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Workspace preferences</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Toggle density and premium layout animations</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Compact Layout */}
                                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Comfortable vs Compact Spacing</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tightens up padding for large resolution screens</p>
                                        </div>
                                        <button
                                            onClick={() => setCompact(!compact)}
                                            className={`h-7 w-12 rounded-full p-1 transition-all ${compact ? 'bg-[#656CFF]' : 'bg-slate-700'}`}
                                        >
                                            <div className={`h-5 w-5 bg-white rounded-full transition-all ${compact ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* Glassmorphism */}
                                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Sidebar Backdrop Blur</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Applies high-end glassmorphism filter to menus</p>
                                        </div>
                                        <button
                                            onClick={() => setSidebarGlass(!sidebarGlass)}
                                            className={`h-7 w-12 rounded-full p-1 transition-all ${sidebarGlass ? 'bg-[#656CFF]' : 'bg-slate-700'}`}
                                        >
                                            <div className={`h-5 w-5 bg-white rounded-full transition-all ${sidebarGlass ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* Glowing Hover Borders */}
                                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Gradient Glowing Borders</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Highlight cards with accent-colored neon borders on hover</p>
                                        </div>
                                        <button
                                            onClick={() => setGlowsEnabled(!glowsEnabled)}
                                            className={`h-7 w-12 rounded-full p-1 transition-all ${glowsEnabled ? 'bg-[#656CFF]' : 'bg-slate-700'}`}
                                        >
                                            <div className={`h-5 w-5 bg-white rounded-full transition-all ${glowsEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Credentials Tab */}
                    {activeTab === 'credentials' && (
                        <div className="admin-card p-10 space-y-10 bg-[#15171C] border border-[#23262D]">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                                    <Key size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Credentials</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update admin login email and password</p>
                                </div>
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
                    )}

                    {/* Batches Tab */}
                    {activeTab === 'batches' && (
                        <div className="admin-card p-10 space-y-8 relative overflow-hidden bg-[#15171C] border border-[#23262D]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEBC2E]/5 blur-[80px] rounded-full translate-x-12 translate-y-[-12px]" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#FEBC2E]/10 flex items-center justify-center text-[#FEBC2E]">
                                    <Layers size={21} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Batch Management</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administer student class categories</p>
                                </div>
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
                                    className="px-8 bg-[#FEBC2E] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#ffc84d] transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95 border border-[#FEBC2E]/30"
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
                    )}

                    {/* Sub-Admins Tab */}
                    {activeTab === 'sub-admins' && user?.role === 'admin' && <SubAdminsPanel />}
                </div>
            </div>
        </div>
    );
};

// Sub-Admins Management Sub-component
const SubAdminsPanel = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });

    // Form inputs
    const [editingId, setEditingId] = useState(null); // null means Creating
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const permissionsList = [
        'Students',
        'Settings',
        'Announcements',
        'Class Recordings',
        'Exams & Quizzes',
        'Past Papers',
        'Student Marks',
        'Exam Results',
        'Homepage Ads',
        'Hero Sliders',
        'Learning Hub'
    ];

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const fetchSubAdmins = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/sub-admins`);
            if (res.ok) {
                const data = await res.json();
                setSubAdmins(data);
            }
        } catch (err) {
            console.error('Error fetching sub-admins:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (perm) => {
        setSelectedPermissions(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === permissionsList.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...permissionsList]);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setEmail('');
        setFullName('');
        setPassword('');
        setSelectedPermissions([]);
        setFormStatus({ type: '', message: '' });
    };

    const handleEditClick = (sub) => {
        setEditingId(sub.id);
        setEmail(sub.email);
        setFullName(sub.full_name || '');
        setPassword(''); // Clear password field for security
        const perms = sub.permissions ? sub.permissions.split(',').map(p => p.trim()) : [];
        setSelectedPermissions(perms);
        setFormStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ type: '', message: '' });

        if (!email.trim()) {
            setFormStatus({ type: 'error', message: 'Email is required.' });
            return;
        }

        if (!editingId && !password) {
            setFormStatus({ type: 'error', message: 'Password is required when creating a new sub-admin.' });
            return;
        }

        setIsSaving(true);
        const payload = {
            email: email.trim(),
            full_name: fullName.trim() || null,
            permissions: selectedPermissions.join(','),
            password: password ? password : null
        };

        try {
            let res;
            if (editingId) {
                res = await fetch(`${API_URL}/admin/sub-admins/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_URL}/admin/sub-admins`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (!res.ok) {
                setFormStatus({ type: 'error', message: data.detail || 'An error occurred.' });
            } else {
                setFormStatus({ 
                    type: 'success', 
                    message: editingId ? 'Sub-admin details updated successfully!' : 'Sub-admin created successfully!' 
                });
                resetForm();
                fetchSubAdmins();
            }
        } catch (err) {
            console.error("Sub-admin save error:", err);
            setFormStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this sub-admin account? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/sub-admins/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchSubAdmins();
                if (editingId === id) {
                    resetForm();
                }
            } else {
                alert('Failed to delete sub-admin.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Create/Edit Form */}
            <div className="admin-card p-10 space-y-8 bg-[#15171C] border border-[#23262D]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {editingId ? 'Edit Sub-Admin Account' : 'Create Sub-Admin Account'}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {editingId ? 'Modify profile info and permitted sections' : 'Register a new sub-admin with custom permissions'}
                            </p>
                        </div>
                    </div>
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                {formStatus.message && (
                    <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-slide-up ${formStatus.type === 'success' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {formStatus.type === 'success' ? <CheckCircle size={14} /> : <Shield size={14} />}
                        {formStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                placeholder="e.g. John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Email / Username</label>
                            <input
                                type="email"
                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                placeholder="e.g. sub1@physics.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
                                {editingId ? 'Password (Leave blank to keep unchanged)' : 'Password'}
                            </label>
                            <input
                                type="password"
                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all placeholder:text-slate-800"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!editingId}
                            />
                        </div>
                    </div>

                    {/* Permissions checklist */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Configure Feature Access Permissions</label>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-[9px] font-black text-[#656CFF] hover:text-[#545bd9] uppercase tracking-widest"
                            >
                                {selectedPermissions.length === permissionsList.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {permissionsList.map((perm) => {
                                const isChecked = selectedPermissions.includes(perm);
                                return (
                                    <button
                                        key={perm}
                                        type="button"
                                        onClick={() => handleCheckboxChange(perm)}
                                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                                            isChecked 
                                                ? 'border-[#656CFF] bg-[#656CFF]/5 text-white' 
                                                : 'border-[#23262D] bg-[#0D0E12] text-slate-400 hover:border-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider">{perm}</span>
                                        <span className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                                            isChecked ? 'bg-[#656CFF] border-[#656CFF] text-white' : 'border-slate-700 bg-transparent'
                                        }`}>
                                            {isChecked && <Check size={12} className="stroke-[3]" />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="h-14 w-full bg-[#656CFF] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? 'Saving...' : editingId ? 'Update Sub-Admin' : 'Create Sub-Admin'}
                    </button>
                </form>
            </div>

            {/* List of sub-admins */}
            <div className="admin-card p-10 space-y-6 bg-[#15171C] border border-[#23262D]">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#FEBC2E]/10 flex items-center justify-center text-[#FEBC2E]">
                        <Users size={21} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Sub-Admins</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage current sub-admin credentials & authorizations</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-[#656CFF]" size={32} />
                    </div>
                ) : subAdmins.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-[#23262D] rounded-2xl">
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No sub-admin accounts created yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subAdmins.map((sub) => (
                            <div key={sub.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-white uppercase tracking-widest">{sub.full_name || 'Unnamed Sub-Admin'}</span>
                                        <span className="text-[8px] font-black text-slate-600 bg-white/5 border border-white/5 rounded px-2 py-0.5 uppercase tracking-widest">ID: {sub.id}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold">{sub.email}</p>
                                    
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {sub.permissions ? (
                                            sub.permissions.split(',').map((perm) => (
                                                <span key={perm} className="text-[8px] font-black text-[#656CFF] bg-[#656CFF]/10 border border-[#656CFF]/15 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                    {perm.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[8px] font-black text-red-500 bg-red-500/10 border border-red-500/15 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                No Permissions
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => handleEditClick(sub)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Edit Permissions
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-md"
                                        title="Delete Sub-Admin"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;

import React, { useState } from 'react';
import { Save, Lock, Mail, Bell, Shield, Key, Layers, Plus, Trash2, Loader2 } from 'lucide-react';
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
                alert("Failed to add batch or it already exists.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAddingBatch(false);
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Delete this batch?")) return;
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
            setCredStatus({ type: 'error', message: 'Current email, password, and new email are required.' });
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
                setCredStatus({ type: 'error', message: data.detail || 'Failed to update credentials' });
            } else {
                setCredStatus({ type: 'success', message: 'Credentials updated successfully!' });
                setAdminCreds(prev => ({ ...prev, currentPassword: '', newPassword: '', currentEmail: data.new_email }));
            }
        } catch (error) {
            setCredStatus({ type: 'error', message: 'Network error. Please try again later.' });
        }
        setIsUpdating(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

            {/* General Settings */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 mr-3">
                        <Lock size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">General Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Application Name</label>
                        <input
                            type="text"
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Contact Email</label>
                        <input
                            type="email"
                            name="adminEmail"
                            value={settings.adminEmail}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Admin Credentials */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                    <div className="rounded-lg bg-green-50 p-2 text-green-600 mr-3">
                        <Key size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Admin Credentials</h2>
                </div>

                <form className="space-y-6" onSubmit={handleUpdateCreds}>
                    {credStatus.message && (
                        <div className={`p-3 rounded-md text-sm ${credStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                            {credStatus.message}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Valid Admin Email *</label>
                            <input
                                type="email"
                                name="currentEmail"
                                required
                                value={adminCreds.currentEmail}
                                onChange={handleCredsChange}
                                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Valid Password *</label>
                            <input
                                type="password"
                                name="currentPassword"
                                required
                                value={adminCreds.currentPassword}
                                onChange={handleCredsChange}
                                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Admin Email *</label>
                            <input
                                type="email"
                                name="newEmail"
                                required
                                value={adminCreds.newEmail}
                                onChange={handleCredsChange}
                                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={adminCreds.newPassword}
                                onChange={handleCredsChange}
                                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all disabled:opacity-50"
                        >
                            <Save size={16} className="mr-2" /> {isUpdating ? 'Updating...' : 'Update Credentials'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Notifications */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600 mr-3">
                        <Bell size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Notifications & Alerts</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="emailNotifications"
                                name="emailNotifications"
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email Notifications</label>
                            <p className="text-gray-500">Receive emails when students submit quizzes or upload assignments.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                    <div className="rounded-lg bg-red-50 p-2 text-red-600 mr-3">
                        <Shield size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Security & Maintenance</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                        <p className="text-xs text-gray-500">Disable access for students during updates.</p>
                    </div>
                    <button
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                        role="switch"
                        aria-checked={settings.maintenanceMode}
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Batches / Classes Management */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 mr-3">
                        <Layers size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Class / Batch Management</h2>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Add batches here to make them available when registering students.</p>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newBatchName}
                            onChange={(e) => setNewBatchName(e.target.value)}
                            placeholder="e.g. 2026 Batch A"
                            className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleAddBatch}
                            disabled={isAddingBatch}
                            className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
                        >
                            {isAddingBatch ? <Loader2 size={16} className="animate-spin mr-1" /> : <Plus size={16} className="mr-1" />} Add
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {batches.map(batch => (
                                    <tr key={batch.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{batch.name}</td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteBatch(batch.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {batches.length === 0 && (
                                    <tr><td colSpan="2" className="px-4 py-4 text-center text-sm text-gray-500">No batches created yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
                    <Save size={18} className="mr-2" /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;

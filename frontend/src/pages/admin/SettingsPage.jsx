import React, { useState } from 'react';
import { Save, Lock, Mail, Bell, Shield } from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        siteName: 'Intelligent Physics',
        adminEmail: 'admin@physics.com',
        maintenanceMode: false,
        emailNotifications: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
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

            <div className="flex justify-end pt-4">
                <button className="flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
                    <Save size={18} className="mr-2" /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;

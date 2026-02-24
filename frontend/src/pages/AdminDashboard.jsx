import React from 'react';
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Users
} from 'lucide-react';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Users,
    BookOpen,
    FileText
} from 'lucide-react';
import { API_URL } from '../config';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        quizzes: 0,
        submissions: 0,
        papers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/stats`);
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg animate-fade-in-up">
                <h2 className="text-3xl font-bold">Welcome back, Raakul</h2>
                <p className="mt-2 opacity-90">Here is the overview of your academy's performance today.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                <KPICard title="Total Students" value={stats.students} icon={<Users className="ml-auto opacity-50" />} color="blue" />
                <KPICard title="Total Quizzes" value={stats.quizzes} icon={<BookOpen className="ml-auto opacity-50" />} color="green" />
                <KPICard title="Quiz Submissions" value={stats.submissions} icon={<Activity className="ml-auto opacity-50" />} color="amber" />
                <KPICard title="Study Papers" value={stats.papers} icon={<FileText className="ml-auto opacity-50" />} color="indigo" />
            </div>

            {/* Recent Activity / Content Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">System Monitoring</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="w-full space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Database Health</span>
                                <span className="font-semibold text-green-600">Optimal</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100">
                                <div className="h-2 w-full rounded-full bg-green-500"></div>
                            </div>

                            <div className="flex justify-between text-sm pt-2">
                                <span className="text-gray-600">Server Status</span>
                                <span className="font-semibold text-blue-600">Live</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100">
                                <div className="h-2 w-full rounded-full bg-blue-500"></div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 italic">API Endpoint: {API_URL}</p>
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-indigo-50 p-4 text-indigo-600">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Management Overview</h3>
                    <p className="text-gray-500 max-w-xs mt-2 mb-6">You are controlling {stats.students} student accounts and managing {stats.quizzes} active quizzes.</p>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const KPICard = ({ title, value, color, icon }) => {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-start">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
                </div>
                {icon}
            </div>
            <div className="mt-4 flex items-center">
                <div className={`h-1 w-full rounded-full bg-${color}-100`}>
                    <div className={`h-1 w-2/3 rounded-full bg-${color}-500 opacity-60`}></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

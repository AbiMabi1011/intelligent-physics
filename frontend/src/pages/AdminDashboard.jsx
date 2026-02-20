import React from 'react';
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Users
} from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg animate-fade-in-up">
                <h2 className="text-3xl font-bold">Welcome back, Raakul</h2>
                <p className="mt-2 opacity-90">Here is the overview of your academy's performance today.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <KPICard title="Total Students" value="1,248" change="+12.5%" color="blue" icon={<Users className="ml-auto opacity-50" />} />
                <KPICard title="Active Sessions" value="86" change="+4.2%" color="green" icon={<Activity className="ml-auto opacity-50" />} />
                <KPICard title="Pending Tasks" value="12" change="-2.1%" color="amber" icon={<LayoutDashboard className="ml-auto opacity-50" />} />
            </div>

            {/* Recent Activity / Content Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                        <button className="text-sm text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        <ActivityItem user="Alice Smith" action="completed Physics 101" time="2 hours ago" />
                        <ActivityItem user="Bob Jones" action="uploaded an assignment" time="4 hours ago" />
                        <ActivityItem user="Charlie Day" action="registered for new course" time="5 hours ago" />
                        <ActivityItem user="System" action="Automated backup completed" time="1 day ago" />
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-indigo-50 p-4 text-indigo-600">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">System Overview</h3>
                    <p className="text-gray-500 max-w-xs mt-2 mb-6">All systems are running smoothly. Database latentcy is optimal.</p>

                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Server Load</span>
                            <span className="font-semibold text-green-600">24%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-2 w-1/4 rounded-full bg-green-500"></div>
                        </div>

                        <div className="flex justify-between text-sm pt-2">
                            <span className="text-gray-600">Storage Usage</span>
                            <span className="font-semibold text-blue-600">65%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-2 w-2/3 rounded-full bg-blue-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const KPICard = ({ title, value, change, color, icon }) => {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        amber: 'text-amber-600'
    };

    // Determine arrow direction based on change string (e.g. "+12%")
    const isPositive = change.includes('+');

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
                <span className={`flex items-center text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {change}
                </span>
                <span className="ml-2 text-xs text-gray-400">vs last month</span>
            </div>
        </div>
    );
};

const ActivityItem = ({ user, action, time }) => (
    <div className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0">
        <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {user.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-800">{user} <span className="font-normal text-gray-500">{action}</span></p>
            </div>
        </div>
        <span className="text-xs text-gray-400">{time}</span>
    </div>
);

export default AdminDashboard;

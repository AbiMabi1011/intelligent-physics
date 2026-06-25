import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    TrendingUp,
    MoreVertical,
    Calendar,
    ArrowUpRight,
    Search,
    Activity,
    Database,
    Zap,
    Trophy,
    Target,
    Loader2,
    CheckCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        quizzes: 0,
        submissions: 0,
        papers: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats({
                    students: data.students,
                    quizzes: data.quizzes,
                    submissions: data.submissions,
                    papers: data.papers
                });
                setRecentActivity(data.recent_activity || []);
                setChartData(data.performance_data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="w-full">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                        <LayoutDashboard size={40} className="text-[#656CFF]" /> Admin Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.3em] mt-3 italic flex items-center gap-2">
                         Welcome, <span className="text-[#656CFF]">{user?.full_name || 'Admin'}</span> — System Status: <span className="text-[#10B981] flex items-center gap-1"><Activity size={14} /> ONLINE</span>
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                    title="Total Students" 
                    value={stats.students} 
                    icon={<Users size={24} />} 
                    color="#656CFF" 
                    trend="up"
                    percentage="Registered accounts"
                />
                <StatCard 
                    title="Active Quizzes" 
                    value={stats.quizzes} 
                    icon={<BookOpen size={24} />} 
                    color="#FEBC2E" 
                    trend="up"
                    percentage="Available for students"
                />
                <StatCard 
                    title="Quiz Logins" 
                    value={stats.submissions} 
                    icon={<Activity size={24} />} 
                    color="#10B981" 
                    trend="up"
                    percentage="Total attempts made"
                />
                <StatCard 
                    title="Study Materials" 
                    value={stats.papers} 
                    icon={<Database size={24} />} 
                    color="#EF4444" 
                    trend="stable"
                    percentage="Uploaded documents"
                />
            </div>

            {/* Main Analytics Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Performance Chart */}
                <div className="lg:col-span-8 admin-card p-10 bg-gradient-to-br from-[#15171C] to-[#0D0E12] border-[#23262D] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#656CFF]/5 blur-[100px] rounded-full group-hover:bg-[#656CFF]/10 transition-all duration-700" />
                    
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                <TrendingUp size={24} className="text-[#656CFF]" /> Registration Trend
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Growth of student base over months</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#656CFF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#656CFF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23262D" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#15171C', 
                                        borderColor: '#23262D', 
                                        borderRadius: '1rem',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#656CFF' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#656CFF" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="admin-card p-10 bg-[#15171C] border-[#23262D] h-full">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                             <Zap size={14} className="text-[#FEBC2E]" /> New Activity
                        </h4>
                        <div className="space-y-6">
                            {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                                <ActivityItem 
                                    key={i}
                                    title={act.title} 
                                    desc={act.desc}
                                    time={act.time}
                                    color={act.color}
                                />
                            )) : (
                                <p className="text-[10px] text-slate-500 italic">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

const StatCard = ({ title, value, icon, color, trend, percentage }) => (
    <div className="admin-card p-10 group relative h-full transition-all duration-500 hover:scale-[1.03] hover:border-white/20 bg-gradient-to-br from-[#15171C] to-[#0D0E12] border-[#23262D] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full translate-x-1/2 translate-y-[-1/2] opacity-5 transition-opacity" style={{ background: color }} />
        
        <div className="flex justify-between items-start mb-10">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 duration-500" style={{ background: `${color}15`, color: color }}>
                {icon}
            </div>
            {trend === 'up' ? (
                <div className="flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-xl border border-[#10B981]/20">
                    <ArrowUpRight size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-slate-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <CheckCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Fixed</span>
                </div>
            )}
        </div>
        
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{title}</p>
        <h3 className="text-4xl font-black text-white tracking-tighter mb-4 italic leading-none">{value.toLocaleString()}</h3>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${trend === 'up' ? 'text-slate-600' : 'text-slate-600'}`}>{percentage}</p>
    </div>
);

const ActivityItem = ({ title, desc, time, color }) => (
    <div className="flex gap-5 group/item cursor-pointer">
        <div className="h-10 w-1 pt-1.5 pb-1.5 flex items-center">
            <div className="h-full w-1 rounded-full group-hover/item:h-full transition-all duration-300" style={{ backgroundColor: color }} />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-black text-white uppercase tracking-tighter group-hover/item:text-[#656CFF] transition-colors">{title}</p>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{time}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-wide italic">{desc}</p>
        </div>
    </div>
);

export default AdminDashboard;

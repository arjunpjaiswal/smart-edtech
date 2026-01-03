import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Users, BookOpen, Clock, Award, ArrowUpRight, Plus, Filter, Search, Calendar, FileText, Loader2, Target, TrendingDown, Lightbulb, X, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';

const data = [
    { name: 'Mon', participation: 45, score: 78, students: 40 },
    { name: 'Tue', participation: 52, score: 82, students: 42 },
    { name: 'Wed', participation: 48, score: 85, students: 45 },
    { name: 'Thu', participation: 61, score: 80, students: 52 },
    { name: 'Fri', participation: 55, score: 88, students: 48 },
];

const StatCard = ({ title, value, icon: Icon, trend, color, subValue }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all group overflow-hidden relative">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-125 transition-transform duration-500 ${color}`}></div>
        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-brand-600 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <span className={`flex items-center gap-1 text-success text-sm font-bold bg-success bg-opacity-10 px-2 py-1 rounded-full`}>
                {trend}
                <ArrowUpRight size={14} />
            </span>
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase">{title}</h3>
            <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
                <span className="text-slate-400 text-xs mb-1 font-medium">{subValue}</span>
            </div>
        </div>
    </div>
);

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInsights, setSelectedInsights] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [materialsRes, statsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/class/list-materials`),
                    axios.get(`${API_BASE_URL}/api/evaluation/all-stats`)
                ]);
                setMaterials(materialsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const fetchInsights = async (assignmentId) => {
        setInsightsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/evaluation/stats/${assignmentId}`);
            setSelectedInsights(response.data);
        } catch (err) {
            console.error("Failed to fetch insights", err);
        } finally {
            setInsightsLoading(false);
        }
    };

    const filteredMaterials = materials.filter(item =>
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teacher Console</h1>
                    <p className="text-slate-500 mt-1 font-medium">Monitoring academic excellence across {materials.length} active modules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/live')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Calendar size={18} />
                        Schedule
                    </button>
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 transform active:scale-95"
                    >
                        <Plus size={18} />
                        New Material
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Submissions" value={stats?.totalSubmissions || '0'} subValue="All time" icon={Users} trend="12%" color="bg-brand-500" />
                <StatCard title="Resource Bank" value={materials.length} subValue="AI Generated" icon={BookOpen} trend="08%" color="bg-success" />
                <StatCard title="Class Average" value={stats?.averageScore || '0'} subValue="Out of 10" icon={Award} trend="02%" color="bg-warning" />
                <StatCard title="Concept Gaps" value={Object.keys(stats?.weakPointHeatmap || {}).length} subValue="Unique topics" icon={Target} trend="15%" color="bg-accent-500" />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Trends */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-premium">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Assignment Velocity</h3>
                            <p className="text-slate-400 text-sm font-medium">Average student performance by module</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.assignmentPerformance || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} domain={[0, 10]} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="averageScore" fill="#d946ef" radius={[6, 6, 0, 0]} barSize={40} name="Avg Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heatmap Section */}
                <div className="bg-brand-950 p-8 rounded-[2.5rem] shadow-premium text-white relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-500 rounded-full blur-[80px] opacity-20"></div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Target className="text-brand-400" />
                        Weakness Heatmap
                    </h3>
                    <div className="space-y-4">
                        {stats?.weakPointHeatmap && Object.entries(stats.weakPointHeatmap)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([topic, count], i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-1.5 px-1">
                                        <span className="text-sm font-bold text-slate-200 group-hover:text-brand-400 transition-colors uppercase tracking-wide">{topic}</span>
                                        <span className="text-xs font-black text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded-md">{count} Students</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min((count / stats.totalSubmissions) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        }
                        {!stats?.totalSubmissions && (
                            <div className="text-center py-10 opacity-40 italic">No submission data yet</div>
                        )}
                    </div>
                    <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-2 text-center">AI Recommendation</p>
                        <p className="text-xs text-slate-300 text-center leading-relaxed">
                            Focus your next live session on <span className="text-white font-bold">{Object.keys(stats?.weakPointHeatmap || {})[0] || 'core concepts'}</span>.
                        </p>
                    </div>
                </div>
            </div>


            {/* List Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Resource Repository</h3>
                        <p className="text-slate-400 text-sm font-medium italic">Latest AI-generated assets</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by subject or grade..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 w-64 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-500 transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                            <Loader2 className="animate-spin text-brand-600" size={40} />
                            <p className="font-bold tracking-tight">Accessing Resource Vault...</p>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FileText size={48} className="opacity-20 mb-4" />
                            <p className="font-bold tracking-tight">No assets found matching your criteria</p>
                            <p className="text-sm font-medium">Try a different search or generate new material.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 bg-opacity-50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Name / Subject</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Grade Level</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Published</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Questions Bank</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Difficulty</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMaterials.map((item, i) => (
                                    <tr key={i} className="hover:bg-brand-50 hover:bg-opacity-20 transition-all cursor-pointer group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{item.subject}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Material Engine v1.0</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-brand-600">{item.grade}</td>
                                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                                {(item.questions?.mcqs?.length || 0) + (item.questions?.subjective?.length || 0)} Questions
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.difficulty === 'Easy' ? 'bg-success bg-opacity-10 text-success' : item.difficulty === 'Hard' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                                {item.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fetchInsights(item.id);
                                                }}
                                                className="px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all transform active:scale-95"
                                            >
                                                Insights
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* Insights Modal */}
            {selectedInsights && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200">
                                    <Lightbulb size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Classroom Insights</h2>
                                    <p className="text-slate-500 font-bold text-sm">Deep-dive performance analytics for this assessment</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedInsights(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-12">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-8 bg-blue-50/50 border border-blue-100/50 rounded-[2.5rem] flex flex-col items-center text-center">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Participants</span>
                                    <p className="text-4xl font-black text-blue-600">{selectedInsights.totalSubmissions}</p>
                                    <p className="text-xs font-bold text-blue-400 mt-1 italic">Active Submissions</p>
                                </div>
                                <div className="p-8 bg-purple-50/50 border border-purple-100/50 rounded-[2.5rem] flex flex-col items-center text-center">
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Class Average</span>
                                    <p className="text-4xl font-black text-purple-600">{selectedInsights.averageScore}/10</p>
                                    <p className="text-xs font-bold text-purple-400 mt-1 italic">Overall performance</p>
                                </div>
                                <div className="p-8 bg-red-50/50 border border-red-100/50 rounded-[2.5rem] flex flex-col items-center text-center">
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Critically Hard</span>
                                    <p className="text-4xl font-black text-red-600">
                                        {selectedInsights.questionInsights.filter(q => q.isCriticallyHard).length}
                                    </p>
                                    <p className="text-xs font-bold text-red-400 mt-1 italic">Questions requiring review</p>
                                </div>
                            </div>

                            {/* Detailed Question Breakdown */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-brand-600" size={24} />
                                    <h3 className="text-xl font-bold text-slate-800">Per-Question Performance Breakdown</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {selectedInsights.questionInsights.map((insight, idx) => (
                                        <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all ${insight.isCriticallyHard ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/30 border-slate-100'}`}>
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${insight.isCriticallyHard ? 'bg-red-500 text-white' : 'bg-brand-100 text-brand-600'}`}>
                                                            {insight.isCriticallyHard ? 'Critically Hard' : 'Stable'}
                                                        </span>
                                                        <span className="px-3 py-1 bg-slate-200/50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                            Topic: {insight.topic || 'General'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-800">{insight.question}</h4>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</span>
                                                    <p className={`text-3xl font-black ${insight.isCriticallyHard ? 'text-red-600' : 'text-slate-800'}`}>{insight.averageScore}/10</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-3 bg-slate-200/50 rounded-full mb-8 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${insight.isCriticallyHard ? 'bg-red-500' : 'bg-brand-500'}`}
                                                    style={{ width: `${(insight.averageScore / 10) * 100}%` }}
                                                ></div>
                                            </div>

                                            {/* Top Feedback Clips */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                                    <Target size={14} className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Struggles & Patterns</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {insight.topFeedback.map((fb, fIdx) => (
                                                        <div key={fIdx} className="p-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-500 italic leading-relaxed">
                                                            "{fb}"
                                                        </div>
                                                    ))}
                                                    {insight.topFeedback.length === 0 && (
                                                        <p className="text-xs italic text-slate-400">No collective patterns detected yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-warning" size={20} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Teachers are advised to review <span className="text-white">{selectedInsights.questionInsights.filter(q => q.isCriticallyHard).length} questions</span> in the next live session.
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedInsights(null)}
                                className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;

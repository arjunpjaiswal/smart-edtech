import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { Megaphone, Plus, Clock, User, AlertCircle, Trash2, Send, Loader2, Bookmark, CheckCircle2 } from 'lucide-react';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [posting, setPosting] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        priority: 'normal'
    });

    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/announcements/list`);
            setAnnouncements(response.data);
        } catch (err) {
            console.error("Failed to fetch announcements", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        setPosting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/announcements/create`, {
                ...newAnnouncement,
                author: userName
            });
            setNewAnnouncement({ title: '', content: '', priority: 'normal' });
            setShowForm(false);
            fetchAnnouncements();
        } catch (err) {
            console.error("Failed to post", err);
            alert("Error posting announcement");
        } finally {
            setPosting(false);
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-danger text-white ring-offset-2 ring-2 ring-danger/20';
            case 'important': return 'bg-brand-600 text-white ring-offset-2 ring-2 ring-brand-600/20';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-brand-600 text-white rounded-2xl shadow-premium shadow-brand-100">
                            <Megaphone size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Broadcasting</h1>
                    </div>
                    <p className="text-slate-500 font-medium">The digital notice board for entire class communications.</p>
                </div>

                {role === 'teacher' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-premium ${showForm ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-brand-950 text-white hover:bg-black'}`}
                    >
                        {showForm ? 'Dismiss Form' : <><Plus size={20} /> New Notice</>}
                    </button>
                )}
            </div>

            {/* Post Form (Teacher Only) */}
            {showForm && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium animate-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handlePost} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Headline</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="e.g. Mid-term Exam Schedule Update"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                                <div className="flex gap-2">
                                    {['normal', 'important', 'urgent'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewAnnouncement({ ...newAnnouncement, priority: p })}
                                            className={`flex-1 py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAnnouncement.priority === p ? getPriorityStyles(p) : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full px-6 py-6 bg-slate-50 border-none rounded-[2rem] text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                                placeholder="Type your announcement details here..."
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={posting}
                            className="w-full py-5 bg-brand-600 text-white font-black rounded-[2rem] shadow-xl shadow-brand-100 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em]"
                        >
                            {posting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                            {posting ? 'Broadcasting notice...' : 'Broadcast to Everyone'}
                        </button>
                    </form>
                </div>
            )}

            {/* Announcement List */}
            <div className="space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 opacity-50">
                        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
                        <p className="font-bold text-slate-500">Tuning into Frequency...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    announcements.map((ann, idx) => (
                        <div
                            key={ann.id}
                            className={`relative bg-white overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-premium group animate-in slide-in-from-bottom-6 duration-700`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Decorative side bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${ann.priority === 'urgent' ? 'bg-danger' :
                                ann.priority === 'important' ? 'bg-brand-600' : 'bg-slate-200'
                                }`}></div>

                            <div className="p-8 md:p-10 ml-2">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${ann.priority === 'urgent' ? 'bg-danger/10 text-danger' :
                                                ann.priority === 'important' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                {ann.priority}
                                            </span>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{new Date(ann.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{ann.title}</h3>
                                    </div>

                                    <div className="flex items-center gap-3 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-8 h-8 bg-white text-brand-600 rounded-lg flex items-center justify-center shadow-sm">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted by</p>
                                            <p className="text-xs font-bold text-slate-700 leading-tight">{ann.author}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none">
                                    <p className="text-slate-600 font-medium leading-[1.8] text-lg whitespace-pre-wrap">{ann.content}</p>
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors">
                                        <Bookmark size={14} /> Mark as Read
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast Acknowledged</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                            <Megaphone size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 tracking-tight mb-2">Silent Frequency</h3>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">No global announcements in the system yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;

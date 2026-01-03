import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { MessageSquare, Send, Loader2, User, Bot, Sparkles, Brain, Target, ArrowLeft, Database } from 'lucide-react';

const StudyBuddy = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ weakPoints: [], totalAssignments: 0 });
    const [fetchingSummary, setFetchingSummary] = useState(true);
    const chatEndRef = useRef(null);

    const studentId = localStorage.getItem('userId');
    const studentName = localStorage.getItem('userName');

    useEffect(() => {
        fetchStudentSummary();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchStudentSummary = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/evaluation/student-summary/${studentId}`);
            setSummary(response.data);

            // Initial greeting based on weak points
            if (response.data.weakPoints.length > 0) {
                const topPoint = response.data.weakPoints[0].topic;
                setMessages([
                    {
                        role: 'assistant',
                        content: `Hi ${studentName}! I'm your Study Buddy. I noticed you've been working hard! I've seen that "${topPoint}" has been a bit tricky in your recent assignments. Would you like to dive into that, or is there another topic on your mind?`
                    }
                ]);
            } else {
                setMessages([
                    {
                        role: 'assistant',
                        content: `Hi ${studentName}! I'm your Study Buddy. I don't see any specific weak points yet because you haven't completed many assignments. Is there anything specific you'd like to learn or discuss today?`
                    }
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch summary", err);
        } finally {
            setFetchingSummary(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat/study-buddy`, {
                messages: [...messages, userMessage],
                weakPoints: summary.weakPoints,
                studentName
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.reply,
                sourceDocs: response.data.sourceDocs
            }]);
        } catch (err) {
            console.error("Chat error", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having a bit of trouble connecting to my brain. Can we try again?" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 p-4">
            {/* Sidebar with Weak Points */}
            <div className="w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <Target className="text-brand-600" />
                        Focus Areas
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Based on Assignment History</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {fetchingSummary ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-brand-600" />
                        </div>
                    ) : summary.weakPoints.length > 0 ? (
                        summary.weakPoints.map((wp, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-brand-200 transition-all">
                                <p className="text-sm font-black text-slate-700 uppercase tracking-wide group-hover:text-brand-600 transition-colors">{wp.topic}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flagged {wp.count} times</span>
                                    <div className="w-2 h-2 rounded-full bg-danger opacity-40"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 text-sm italic py-10">No weak points detected yet. Keep practicing!</p>
                    )}
                </div>
                <div className="p-6 bg-brand-50/50 border-t border-brand-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                            <Brain size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-brand-600 uppercase tracking-widest">Stats</p>
                            <p className="text-sm font-bold text-slate-700">{summary.totalAssignments} Assignments Logged</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent-200">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">AI Study Buddy</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active & Learning</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-accent-500 border border-slate-100'}`}>
                                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className={`p-5 rounded-3xl shadow-sm ${m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                    <p className="text-sm font-medium leading-relaxed">{m.content}</p>

                                    {m.sourceDocs && m.sourceDocs.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Database size={10} /> Verified Sources
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {m.sourceDocs.map((doc, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-lg border border-brand-100 italic">
                                                        "{doc}"
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-10 h-10 rounded-xl bg-white text-accent-500 border border-slate-100 flex items-center justify-center">
                                    <Bot size={20} />
                                </div>
                                <div className="p-5 rounded-3xl bg-white border border-slate-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100">
                    <div className="relative flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything, or query the Material Vault..."
                            className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none pl-12"
                        />
                        <MessageSquare className="absolute left-4 text-slate-300" size={20} />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-brand-100 active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudyBuddy;

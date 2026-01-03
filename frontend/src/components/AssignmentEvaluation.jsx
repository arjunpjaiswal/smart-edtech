import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { BookOpen, CheckCircle, AlertCircle, Loader2, Brain, Target, MessageSquare, TrendingUp, Sparkles, Lightbulb, Zap } from 'lucide-react';

const AssignmentEvaluation = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [answers, setAnswers] = useState({});
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [remediation, setRemediation] = useState({});
    const [remediating, setRemediating] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/class/list-materials`);
                setAssignments(response.data);
            } catch (err) {
                console.error("Failed to fetch assignments");
            } finally {
                setFetching(false);
            }
        };
        fetchAssignments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const studentId = localStorage.getItem('userId') || 'anon';
            const studentName = localStorage.getItem('userName') || 'Student';

            const formattedAnswers = Object.keys(answers).map(key => ({
                type: key.startsWith('mcq') ? 'mcq' : 'subjective',
                index: parseInt(key.split('-')[1]),
                answer: answers[key]
            }));

            const response = await axios.post(`${API_BASE_URL}/api/evaluation/submit`, {
                studentAnswers: formattedAnswers,
                assignmentId: selectedAssignment,
                studentId,
                studentName
            });
            setFeedback(response.data);
            setRemediation({});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRemediation = async (topic) => {
        if (remediation[topic]) return;
        setRemediating(topic);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/evaluation/remediate`, {
                topic,
                context: `${currentAssignment.subject} (${currentAssignment.grade})`
            });
            setRemediation(prev => ({ ...prev, [topic]: response.data }));
        } catch (err) {
            console.error("Failed to fetch remediation", err);
        } finally {
            setRemediating(null);
        }
    };

    const currentAssignment = assignments.find(a => a.id === selectedAssignment);

    if (fetching) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-brand-600" size={48} />
        </div>
    );

    return (
        <div className="p-8 space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Brain className="text-brand-600" size={32} />
                        Student Nexus
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Your hub for interactive learning and AI-powered growth.</p>
                </div>
                <div className="w-full md:w-72">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Active Modules</label>
                    <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 transition-all shadow-sm"
                        value={selectedAssignment}
                        onChange={(e) => {
                            setSelectedAssignment(e.target.value);
                            setAnswers({});
                            setFeedback(null);
                        }}
                    >
                        <option value="">Select an assignment...</option>
                        {assignments.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.topic ? `${a.topic} (${a.subject})` : `${a.subject} - ${a.grade}`}
                                {a.isManual ? ' [Teacher Set]' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedAssignment && currentAssignment && !feedback && (
                <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="p-8 lg:p-12">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">{currentAssignment.subject}</h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{currentAssignment.grade} • {currentAssignment.difficulty} Level</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* MCQs Section */}
                            {currentAssignment.questions.mcqs?.length > 0 && (
                                <div className="space-y-10">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-6 bg-brand-600 rounded-full"></div>
                                        Objective Section
                                    </h3>
                                    {currentAssignment.questions.mcqs.map((q, idx) => (
                                        <div key={`mcq-${idx}`} className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-sm shrink-0">
                                                    M{idx + 1}
                                                </div>
                                                <p className="text-lg font-bold text-slate-800 leading-tight pt-1">{q.question}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                                                {q.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setAnswers({ ...answers, [`mcq-${idx}`]: opt })}
                                                        className={`px-6 py-4 rounded-2xl text-sm font-bold border transition-all text-left ${answers[`mcq-${idx}`] === opt ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-white border-slate-100 text-slate-500 hover:border-brand-200'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Subjective Section */}
                            {currentAssignment.questions.subjective?.length > 0 && (
                                <div className="space-y-10 pt-10 border-t border-slate-50">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-6 bg-accent-500 rounded-full"></div>
                                        Subjective Analysis
                                    </h3>
                                    {currentAssignment.questions.subjective.map((q, idx) => (
                                        <div key={`sub-${idx}`} className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-sm shrink-0">
                                                    S{idx + 1}
                                                </div>
                                                <p className="text-lg font-bold text-slate-800 leading-tight pt-1">{q.question}</p>
                                            </div>
                                            <textarea
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-500 transition-all min-h-[160px] placeholder:text-slate-300 ml-0 md:ml-12 w-auto md:w-[calc(100%-48px)]"
                                                placeholder="Type your detailed response here..."
                                                onChange={(e) => setAnswers({ ...answers, [`sub-${idx}`]: e.target.value })}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !Object.keys(answers).length}
                                className="w-full py-5 bg-brand-600 text-white font-black rounded-3xl shadow-xl shadow-brand-100 hover:bg-brand-700 active:scale-[0.98] transition-all disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-widest mt-12"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} />}
                                {loading ? 'Analyzing your understanding...' : 'Submit & Analyze Weak Points'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {feedback && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-brand-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Knowledge Quotient</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4">{feedback.totalScore}<span className="text-2xl opacity-40 ml-1">/10</span></h3>
                            <p className="text-sm font-bold bg-brand-500 bg-opacity-30 inline-block px-3 py-1 rounded-full border border-brand-400/30">Academic Performance</p>
                        </div>

                        <div className="md:col-span-2 bg-red-50 rounded-[2.5rem] p-8 border border-red-100 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-xl font-black text-red-700 tracking-tight">Conceptual Gaps Identified</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(feedback?.weakPoints || []).length > 0 ? (
                                    feedback.weakPoints.map((point, i) => (
                                        <span
                                            key={i}
                                            onClick={() => fetchRemediation(point)}
                                            className={`px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-wider cursor-pointer border transition-all flex items-center gap-2 ${remediation[point] ? 'bg-brand-600 text-white border-brand-600' : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'}`}
                                        >
                                            {remediating === point ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                            {point}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm font-bold text-red-400 italic">No critical gaps identified in this session.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Remediation Nexus */}
                    {Object.keys(remediation).length > 0 && (
                        <div className="bg-brand-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/50">
                                        <Lightbulb size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Remediation Nexus</h3>
                                        <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em]">Personalized Insight Engine</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.values(remediation).map((rem, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Zap size={16} className="text-brand-400" />
                                                <h4 className="text-lg font-black text-brand-100">{rem.topic}</h4>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-6 italic opacity-90">
                                                "{rem.explanation}"
                                            </p>
                                            <div className="space-y-4">
                                                <div className="bg-brand-500/10 rounded-2xl p-4 border border-brand-500/20">
                                                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Mental Model</p>
                                                    <p className="text-xs font-bold text-brand-50 text-opacity-90">{rem.proTip}</p>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 font-medium">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Analogy</p>
                                                    <p className="text-xs text-slate-400 leading-snug">{rem.example}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">

                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <MessageSquare className="text-brand-600" />
                                Detailed Diagnostic Feedback
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            {feedback.evaluations.map((ev, i) => (
                                <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:border-brand-200 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="font-bold text-slate-800 leading-snug max-w-2xl">{ev.question}</p>
                                        <span className="px-3 py-1 bg-white rounded-full text-brand-600 font-extrabold text-xs shadow-sm shadow-brand-100">Score: {ev.score}/10</span>
                                    </div>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">{ev.feedback}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Focus:</span>
                                        <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-xl text-xs font-black uppercase tracking-wide">
                                            {ev.suggestedTopic}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-center">
                            <button
                                onClick={() => setFeedback(null)}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                            >
                                Start New Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentEvaluation;

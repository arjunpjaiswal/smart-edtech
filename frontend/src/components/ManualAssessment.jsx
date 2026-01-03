import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import {
    Plus,
    Trash2,
    Save,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Layout,
    Check,
    X,
    MessageSquare,
    ListTodo
} from 'lucide-react';

const ManualAssessment = () => {
    const [metadata, setMetadata] = useState({
        subject: '',
        grade: '',
        difficulty: 'Medium',
        topic: ''
    });
    const [questions, setQuestions] = useState({
        mcqs: [],
        subjective: [{ question: '', idealAnswer: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleAddSubjective = () => {
        setQuestions({
            ...questions,
            subjective: [...questions.subjective, { question: '', idealAnswer: '' }]
        });
    };

    const handleRemoveSubjective = (index) => {
        const newSubjective = questions.subjective.filter((_, i) => i !== index);
        setQuestions({ ...questions, subjective: newSubjective });
    };

    const handleSubjectiveChange = (index, field, value) => {
        const newSubjective = [...questions.subjective];
        newSubjective[index][field] = value;
        setQuestions({ ...questions, subjective: newSubjective });
    };

    const handleAddMCQ = () => {
        setQuestions({
            ...questions,
            mcqs: [...questions.mcqs, {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: ''
            }]
        });
    };

    const handleRemoveMCQ = (index) => {
        const newMCQs = questions.mcqs.filter((_, i) => i !== index);
        setQuestions({ ...questions, mcqs: newMCQs });
    };

    const handleMCQChange = (index, field, value) => {
        const newMCQs = [...questions.mcqs];
        if (field === 'question' || field === 'correctAnswer') {
            newMCQs[index][field] = value;
        }
        setQuestions({ ...questions, mcqs: newMCQs });
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newMCQs = [...questions.mcqs];
        newMCQs[qIndex].options[optIndex] = value;
        setQuestions({ ...questions, mcqs: newMCQs });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validation
        const hasQuestions = questions.mcqs.length > 0 || questions.subjective.length > 0;
        const validSubjective = questions.subjective.every(q => q.question.trim() && q.idealAnswer.trim());
        const validMCQs = questions.mcqs.every(q => q.question.trim() && q.correctAnswer.trim() && q.options.every(opt => opt.trim()));

        if (!hasQuestions || !validSubjective || !validMCQs) {
            setError("Please fill in all questions and answers correctly.");
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/class/save-material`, {
                questions,
                grade: metadata.grade,
                subject: metadata.subject,
                difficulty: metadata.difficulty,
                topic: metadata.topic,
                isManual: true
            });
            setSuccess(true);
            setQuestions({ mcqs: [], subjective: [{ question: '', idealAnswer: '' }] });
            setMetadata({ subject: '', grade: '', difficulty: 'Medium', topic: '' });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save assessment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <ListTodo className="text-brand-600" size={32} />
                        Assessment Designer
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Create custom question papers and answer keys with manual precision.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-4 bg-brand-950 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:bg-black transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Deploy Assessment
                    </button>
                </div>
            </div>

            {/* Config Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-premium grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Subject</label>
                    <input
                        type="text"
                        placeholder="e.g. Astrophysics"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                        value={metadata.subject}
                        onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    />
                </div>
                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                    <input
                        type="text"
                        placeholder="e.g. Year 12"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                        value={metadata.grade}
                        onChange={(e) => setMetadata({ ...metadata, grade: e.target.value })}
                    />
                </div>
                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Topic</label>
                    <input
                        type="text"
                        placeholder="e.g. Orbital Mechanics"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                        value={metadata.topic}
                        onChange={(e) => setMetadata({ ...metadata, topic: e.target.value })}
                    />
                </div>
                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty Metric</label>
                    <select
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                        value={metadata.difficulty}
                        onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                    >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                        <option>Expert</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-bold flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <AlertCircle size={24} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-6 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-[2rem] text-success font-bold flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <CheckCircle2 size={24} />
                    <div>
                        <p className="text-sm">Assessment successfully deployed!</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-70">Students can now submit their responses for AI valuation.</p>
                    </div>
                </div>
            )}

            {/* Questions Section */}
            <div className="space-y-12">
                {/* Subjective Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center font-black shadow-sm">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Analytical & Subjective</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Graded by AI using your Answer Key as Ground Truth</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddSubjective}
                            className="flex items-center gap-2 px-5 py-3 bg-accent-50 text-accent-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-100 transition-all border border-accent-100"
                        >
                            <Plus size={14} /> Add Clause
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {questions.subjective.map((q, idx) => (
                            <div key={idx} className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <button
                                    onClick={() => handleRemoveSubjective(idx)}
                                    className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-300 border border-slate-50 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-accent-500 uppercase tracking-widest">Question #{idx + 1}</span>
                                        </div>
                                        <textarea
                                            placeholder="Enter your prompt or question here..."
                                            rows="2"
                                            className="w-full px-0 bg-transparent border-none text-lg font-black text-slate-800 placeholder:text-slate-200 resize-none focus:ring-0 outline-none"
                                            value={q.question}
                                            onChange={(e) => handleSubjectiveChange(idx, 'question', e.target.value)}
                                        />
                                    </div>
                                    <div className="p-6 bg-accent-50/50 rounded-[1.8rem] border border-accent-100/50 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-accent-500" />
                                            <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Official Answer Key (Ground Truth)</span>
                                        </div>
                                        <textarea
                                            placeholder="What does a perfect score response look like?"
                                            rows="3"
                                            className="w-full bg-transparent border-none text-sm font-bold text-accent-950 placeholder:text-accent-300 resize-none focus:ring-0 outline-none"
                                            value={q.idealAnswer}
                                            onChange={(e) => handleSubjectiveChange(idx, 'idealAnswer', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MCQ Section */}
                <div className="space-y-8 pt-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black shadow-sm">
                                <Layout size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Multiple Choice (Objective)</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instant Auto-Correction & Feedback</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddMCQ}
                            className="flex items-center gap-2 px-5 py-3 bg-brand-50 text-brand-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-100 transition-all border border-brand-100"
                        >
                            <Plus size={14} /> Add MCQ
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {questions.mcqs.map((q, qIdx) => (
                            <div key={qIdx} className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all animate-in fade-in zoom-in-95 duration-500">
                                <button
                                    onClick={() => handleRemoveMCQ(qIdx)}
                                    className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-300 border border-slate-50 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Question #{qIdx + 1}</span>
                                        <input
                                            type="text"
                                            placeholder="Question content..."
                                            className="w-full bg-transparent border-none text-md font-black text-slate-800 placeholder:text-slate-200 focus:ring-0 outline-none"
                                            value={q.question}
                                            onChange={(e) => handleMCQChange(qIdx, 'question', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3 group/opt">
                                                <button
                                                    onClick={() => handleMCQChange(qIdx, 'correctAnswer', opt)}
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-success border-success text-white' : 'border-slate-100 text-transparent hover:border-brand-300'}`}
                                                >
                                                    <Check size={14} strokeWidth={4} />
                                                </button>
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                    className={`flex-1 px-5 py-3 rounded-2xl text-xs font-bold transition-all outline-none ${q.correctAnswer === opt && opt !== '' ? 'bg-success bg-opacity-10 text-success' : 'bg-slate-50 text-slate-600 focus:bg-white focus:ring-2 focus:ring-brand-500/10'}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {questions.mcqs.length === 0 && questions.subjective.length === 0 && (
                        <div className="text-center py-24 opacity-30 select-none">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Layout size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Blueprint Empty</h3>
                            <p className="text-sm font-bold text-slate-400">Add questions above to begin designing your assessment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualAssessment;

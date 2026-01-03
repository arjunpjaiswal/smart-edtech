import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';

const PDFUpload = () => {
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState({ grade: '', subject: '', difficulty: 'Medium', questionType: 'MCQ' });
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('grade', metadata.grade);
        formData.append('subject', metadata.subject);
        formData.append('difficulty', metadata.difficulty);
        formData.append('questionType', metadata.questionType);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/pdf/generate-questions`, formData);
            setQuestions(response.data.questions);
            if (response.data.modelUsed) {
                console.log(`AI Engine: ${response.data.modelUsed}`);
            }
        } catch (err) {
            const msg = err.response?.data?.details || err.response?.data?.error || 'The AI engine is currently busy. Please wait a minute and try again.';
            setError(msg);
            console.error('Upload Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToDashboard = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/class/save-material`, {
                questions,
                grade: metadata.grade,
                subject: metadata.subject,
                difficulty: metadata.difficulty
            });
            alert('Material saved to dashboard successfully!');
        } catch (err) {
            setError('Failed to save material.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <Wand2 className="text-brand-600" size={32} />
                    AI Resource Engine
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Transform any PDF study material into interactive assessments in seconds.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-600 via-accent-500 to-brand-400"></div>

                <form onSubmit={handleUpload} className="p-8 lg:p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-300"
                                placeholder="e.g. Grade 11"
                                value={metadata.grade}
                                onChange={(e) => setMetadata({ ...metadata, grade: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Academic Subject</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-300"
                                placeholder="e.g. Quantum Physics"
                                value={metadata.subject}
                                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cognitive Difficulty</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                                value={metadata.difficulty}
                                onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                            >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Assessment</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                                value={metadata.questionType}
                                onChange={(e) => setMetadata({ ...metadata, questionType: e.target.value })}
                            >
                                <option value="MCQ">MCQs Core</option>
                                <option value="One-liner">Rapid One-liners</option>
                                <option value="Subjective">Deep Short Answer</option>
                                <option value="Mixed">Integrated Multi-format</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative group/upload">
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            id="pdf-upload"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <label
                            htmlFor="pdf-upload"
                            className={`flex flex-col items-center justify-center border-4 border-dashed rounded-[2.5rem] py-16 px-10 transition-all cursor-pointer ${file ? 'border-success bg-success bg-opacity-5' : 'border-slate-100 bg-slate-50 group-hover/upload:border-brand-500 group-hover/upload:bg-brand-50/50'}`}
                        >
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transition-all ${file ? 'bg-success text-white' : 'bg-white text-slate-400 shadow-premium group-hover/upload:scale-110 group-hover/upload:text-brand-600'}`}>
                                <Upload size={32} />
                            </div>
                            <p className={`text-xl font-bold tracking-tight ${file ? 'text-success' : 'text-slate-600'}`}>
                                {file ? file.name : "Drop study material here"}
                            </p>
                            <p className="text-slate-400 font-medium text-sm mt-2">Maximum file size: 10MB (PDF Only)</p>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full py-5 bg-brand-600 text-white font-black rounded-3xl shadow-xl shadow-brand-100 hover:bg-brand-700 active:scale-[0.98] transition-all disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        {loading ? 'Processing AI Neural Engine...' : 'Initialize AI Generation'}
                    </button>
                </form>

                {error && (
                    <div className="mx-8 mb-8 p-5 bg-danger bg-opacity-5 border border-danger border-opacity-20 text-danger rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-danger text-white rounded-xl shadow-lg shadow-danger/20">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest mb-1">Processing Error</p>
                            <p className="text-sm font-bold opacity-80 leading-relaxed">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {questions && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Output</h2>
                        <button
                            onClick={handleSaveToDashboard}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all shadow-xl shadow-brand-200"
                        >
                            <CheckCircle size={20} className="text-success" />
                            Deploy to Dashboard
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* MCQs */}
                        {questions.mcqs?.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-premium space-y-6">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-6 bg-brand-600 rounded-full"></div>
                                    Objective MCQs
                                </h3>
                                <div className="space-y-6">
                                    {questions.mcqs.map((q, idx) => (
                                        <div key={idx} className="space-y-4">
                                            <p className="font-bold text-slate-800 leading-snug">
                                                <span className="text-brand-600 mr-2 opacity-50">#{idx + 1}</span>
                                                {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${opt === q.correctAnswer ? 'bg-success bg-opacity-10 border-success text-success' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Subjective */}
                        {questions.subjective?.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-premium space-y-6 text-brand-950">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-6 bg-accent-500 rounded-full"></div>
                                    Critical Analysis
                                </h3>
                                <div className="space-y-8">
                                    {questions.subjective.map((q, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <p className="font-bold text-slate-800 leading-snug">
                                                <span className="text-accent-500 mr-2 opacity-50">#{idx + 1}</span>
                                                {q.question}
                                            </p>
                                            <div className="p-4 bg-accent-50 rounded-2xl border border-accent-100 italic">
                                                <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest block mb-2">Ideal Analytical Response</span>
                                                <p className="text-sm text-accent-950 font-medium leading-relaxed opacity-80">{q.idealAnswer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFUpload;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import { User, Lock, Mail, ChevronRight, GraduationCap, School, ShieldCheck, Sparkles } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const cleanEmail = email.trim();
            // The instruction uses 'isLogin' which is not defined. Assuming it means '!isSignup'.
            // Also, the instruction's payload structure is slightly different from the original.
            const response = await axios.post(`${API_BASE_URL}/api/auth/${!isSignup ? 'login' : 'signup'}`, {
                email: cleanEmail,
                password,
                name: !isSignup ? undefined : name, // Only send name for signup
                role // Send role for both, though backend might ignore for login
            });

            // Store session info
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('userId', response.data.id);
            localStorage.setItem('userName', response.data.name);
            onLogin(response.data.role);

            // Navigate based on role
            navigate(response.data.role === 'teacher' ? '/' : '/assignment');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Abstract Background Effects */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500 rounded-full blur-[160px] opacity-10 animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-500 rounded-full blur-[160px] opacity-10 animate-pulse delay-700"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-premium overflow-hidden border border-slate-100 relative z-10 transition-all hover:shadow-premium-hover min-h-[640px]">

                {/* Visual Brand Side */}
                <div className="bg-brand-950 p-12 flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500 rounded-full blur-[80px] opacity-10 -ml-24 -mb-24"></div>

                    <div className="z-10">
                        <div className="w-14 h-14 bg-brand-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-brand-500/20 transform -rotate-6">
                            <BookOpen size={30} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter leading-tight mb-4">
                            {isSignup ? "Join the AI" : "Back to the"} <br />
                            <span className="text-brand-400">Classroom</span>
                        </h1>
                        <p className="text-brand-100/60 font-medium leading-relaxed max-w-xs">
                            {isSignup
                                ? "Create your academic profile and start using our advanced AI material engine."
                                : "Resume your personalized learning experience with AI-powered insights."}
                        </p>
                    </div>

                    <div className="z-10 flex items-center gap-4 py-6 px-1 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                        <div className="flex -space-x-2 ml-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-950 bg-brand-800 flex items-center justify-center text-[10px] font-bold">
                                    +
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-brand-200 uppercase tracking-widest">Global Academic Network</p>
                    </div>
                </div>

                {/* Auth Form Side */}
                <div className="p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-widest">
                            {isSignup ? 'Begin your journey' : 'Secure identification access'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignup && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                            <input
                                required
                                type="email"
                                placeholder="Email Address"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" size={18} />
                            <input
                                required
                                type="password"
                                placeholder="Secure Password"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {isSignup && (
                            <div className="pt-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Account Topology</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('student')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${role === 'student' ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'}`}
                                    >
                                        <GraduationCap size={16} />
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('teacher')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${role === 'teacher' ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'}`}
                                    >
                                        <User size={16} />
                                        Teacher
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-5 bg-brand-950 text-white font-black rounded-3xl shadow-xl shadow-brand-100 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em]"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (isSignup ? 'Initialize Profile' : 'Authorize Session')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm font-bold">
                            {isSignup ? "Already have an account?" : "New to the platform?"}
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="ml-2 text-brand-600 underline hover:text-brand-700 transition-colors"
                            >
                                {isSignup ? "Sign In" : "Register Now"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

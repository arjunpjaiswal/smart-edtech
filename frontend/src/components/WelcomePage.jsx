import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import {
    Calendar,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    BookOpen,
    Users,
    Award,
    Video,
    Plus,
    Sparkles,
    Loader2,
    CalendarDays,
    Target,
    Zap,
    MessageSquare,
    Sun,
    Moon,
    Cloud,
    Quote,
    ChevronLeft,
    Coffee,
    Megaphone,
    ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendance, setAttendance] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false); // Added marking state

    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    // Curated thoughts/quotes
    const thoughts = [
        { text: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
        { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Knowledge is power. Information is liberating. Education is the premise of progress.", author: "Kofi Annan" },
        { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" }
    ];

    const currentThought = thoughts[currentTime.getDate() % thoughts.length];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/attendance/list/${userId}`);
                setAttendance(response.data);
            } catch (err) {
                console.error("Fetch Attendance Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [userId]);

    const handleMarkAttendance = async () => {
        setMarking(true);
        try {
            await axios.post(`${API_BASE_URL}/api/attendance/mark`, {
                studentId: userId,
                studentName: userName
            });
            const response = await axios.get(`${API_BASE_URL}/api/attendance/list/${userId}`);
            setAttendance(response.data);
        } catch (err) {
            console.error("Mark Attendance Error:", err);
        } finally {
            setMarking(false);
        }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return { text: 'Good Morning', icon: <Coffee className="text-amber-500" size={32} /> };
        if (hour < 17) return { text: 'Good Afternoon', icon: <Sun className="text-orange-500" size={32} /> };
        return { text: 'Good Evening', icon: <Moon className="text-indigo-400" size={32} /> };
    };

    const greeting = getGreeting();

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startOffset = firstDayOfMonth(year, month);

        // Fill blanks
        for (let i = 0; i < startOffset; i++) {
            days.push(<div key={`blank-${i}`} className="h-10 w-10 md:h-12 md:w-12"></div>);
        }

        // Fill days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPresent = attendance.some(record => record.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div
                    key={day}
                    className={`h-10 w-10 md:h-12 md:w-12 flex flex-col items-center justify-center rounded-xl text-xs font-bold relative transition-all border ${isToday ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-50 text-slate-500'
                        }`}
                >
                    {day}
                    {isPresent && (
                        <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                    )}
                </div>
            );
        }

        return days;
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
            {/* Top Greeting Section */}
            <div className="relative overflow-hidden bg-brand-950 rounded-[3rem] p-8 md:p-12 text-white shadow-premium min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-20 hidden md:block">
                    <Cloud size={160} strokeWidth={0.5} />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                            {greeting.icon}
                        </div>
                        <span className="text-brand-300 font-bold uppercase tracking-[0.3em] text-xs">Aesthetics & Excellence</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                        {greeting.text}, <span className="text-brand-400">{userName}!</span>
                    </h1>

                    <p className="text-brand-100/70 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                        Ready to make some progress today? Your dashboard is all caught up with your recent activity.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Thought & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Thought of the Day */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:-translate-y-1 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-8 opacity-40">
                            <Quote className="text-brand-600" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Thought of the Day</span>
                        </div>

                        <blockquote className="space-y-6">
                            <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight italic">
                                "{currentThought.text}"
                            </p>
                            <footer className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-brand-600 rounded-full"></div>
                                <span className="font-bold text-slate-500 text-lg">— {currentThought.author}</span>
                            </footer>
                        </blockquote>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            to="/vault"
                            className="bg-brand-50 p-8 rounded-[2rem] border border-brand-100 flex flex-col justify-between group hover:bg-brand-100 transition-all shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-600">
                                    <BookOpen size={24} />
                                </div>
                                <ArrowUpRight className="text-brand-300 group-hover:text-brand-600 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-brand-950 mb-2">Material Vault</h3>
                                <p className="text-brand-600/60 font-medium text-sm">Browse, search and learn from AI-indexed study materials.</p>
                            </div>
                        </Link>

                        <Link
                            to="/announcements"
                            className="bg-accent-50 p-8 rounded-[2rem] border border-accent-100 flex flex-col justify-between group hover:bg-accent-100 transition-all shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-white rounded-2xl shadow-sm text-accent-600">
                                    <Megaphone size={24} />
                                </div>
                                <ArrowUpRight className="text-accent-300 group-hover:text-accent-600 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-accent-950 mb-2">Global Feed</h3>
                                <p className="text-accent-600/60 font-medium text-sm">Stay updated with the latest headlines and class news.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Attendance Calendar */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-premium">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 text-success rounded-xl">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Your Attendance</h3>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={16} /></button>
                                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <span className="text-xs font-black uppercase tracking-widest text-brand-600">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <div key={day} className="text-[10px] font-black text-slate-300 text-center uppercase py-2">
                                    {day}
                                </div>
                            ))}
                            {renderCalendar()}
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marked Present</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">
                                    {attendance.filter(r => r.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`)).length} / {daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())} days
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-950 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[80px] opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl text-brand-400">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-white font-black tracking-tight underline decoration-brand-500 decoration-2 underline-offset-4 cursor-pointer hover:text-brand-300 transition-colors">Today's Streak</p>
                                <p className="text-xs text-brand-300 font-bold uppercase tracking-widest mt-1">Consistency is Key!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none flex justify-center">
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 px-6 py-3 rounded-2xl shadow-premium pointer-events-auto flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Server v2.1 Sync</span>
                    </div>
                    <div className="w-px h-4 bg-slate-100"></div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-brand-600" size={14} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attendance Recorded</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;

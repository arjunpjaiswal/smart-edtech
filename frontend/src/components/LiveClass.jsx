import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { Video, Calendar, Clock, Plus, Users, Chrome, ExternalLink, Loader2, PlayCircle, ShieldCheck } from 'lucide-react';

const LiveClass = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [instructorName, setInstructorName] = useState('');
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const role = localStorage.getItem('userRole');

    const [activeRoom, setActiveRoom] = useState(null);

    useEffect(() => {
        fetchClasses();
        const interval = setInterval(fetchClasses, 10000); // Auto-refresh for students
        return () => clearInterval(interval);
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/class/list`);
            const data = response.data.map(c => ({
                ...c,
                roomId: c.roomId || c.id // Ensure we always have an identifier
            }));
            setClasses(data);
        } catch (err) {
            console.error("Failed to fetch classes");
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            const roomId = `SmartEd_${Math.random().toString(36).substring(7)}`;
            await axios.post(`${API_BASE_URL}/api/class/schedule`, {
                className: newClassName,
                title: newClassName,
                time: scheduleTime,
                instructor: instructorName || 'Faculty Admin',
                roomId,
                grade: '10',
                subject: 'Science',
                meetingUrl: `https://meet.ffmuc.net/${roomId}`
            });
            setNewClassName('');
            setScheduleTime('');
            setInstructorName('');
            localStorage.setItem('userName', instructorName); // Store for sessions
            setShowScheduleForm(false);
            fetchClasses();
        } catch (err) {
            console.error(err);
        }
    };

    const joinRoom = (room) => {
        setActiveRoom(room);
    };

    if (activeRoom) {
        return <LectureView room={activeRoom} onBack={() => setActiveRoom(null)} />;
    }

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-brand-600" size={48} />
        </div>
    );

    return (
        <div className="p-8 space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Video className="text- brand-600" size={32} />
                        Virtual Lecture Hall
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Synchronous learning experiences powered by secure video architecture.</p>
                </div>
                {role === 'teacher' && (
                    <button
                        onClick={() => setShowScheduleForm(!showScheduleForm)}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        {showScheduleForm ? 'Close Form' : 'Broadcast New Session'}
                    </button>
                )}
            </div>

            {/* Schedule Form (Teacher Only) */}
            {showScheduleForm && role === 'teacher' && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16"></div>
                    <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                                placeholder="Quantum Entanglement Basics"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Timeline</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-brand-500 transition-all font-sans"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructor Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                                placeholder="Your Name"
                                value={instructorName}
                                onChange={(e) => setInstructorName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-brand-950 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg"
                            >
                                Confirm Broadcast
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Live Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {classes.length === 0 ? (
                    <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Clock size={40} className="opacity-20" />
                        </div>
                        <p className="text-xl font-bold tracking-tight">No active sessions broadcasting</p>
                        <p className="font-medium text-sm mt-1">Check back later for scheduled lectures.</p>
                    </div>
                ) : (
                    classes.map((c, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all group overflow-hidden">
                            <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 opacity-90 group-hover:scale-110 transition-transform duration-700"></div>
                                <PlayCircle className="text-white relative z-10 opacity-40 group-hover:scale-125 transition-all duration-500" size={48} />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                        Live Session
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-1 block">Room: {c.roomId}</span>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4 group-hover:text-brand-600 transition-colors line-clamp-1">
                                    {c.className || c.title || 'Untitled Session'}
                                </h3>

                                <div className="space-y-4 mb-8 border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Instructor</p>
                                            <p className="text-sm font-bold text-slate-700">{c.instructor || 'Faculty Admin'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Schedule</p>
                                            <p className="text-sm font-bold text-slate-700 font-sans">
                                                {c.time && !isNaN(new Date(c.time).getTime())
                                                    ? new Date(c.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : 'Ready to Join'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => joinRoom(c)}
                                    className="w-full py-4 bg-slate-50 text-slate-800 rounded-2xl font-black group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-brand-300 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                                >
                                    Join Interactive Lecture
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Stats bar */}
            <div className="bg-brand-950 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-around gap-8 relative overflow-hidden" >
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-10 -ml-32 -mt-32"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500 rounded-full blur-[100px] opacity-10 -mr-32 -mb-32"></div>
                <div className="text-center relative z-10">
                    <p className="text-5xl font-black tracking-tighter mb-1">98%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Avg Attendance</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                <div className="text-center relative z-10">
                    <p className="text-5xl font-black tracking-tighter mb-1">4.9/5</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Interaction Score</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                <div className="text-center relative z-10">
                    <p className="text-5xl font-black tracking-tighter mb-1">AES-256</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Security Standard</p>
                </div>
            </div>
        </div>
    );
};

const PollCreator = ({ onPollCreated, onCancel }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isLaunching, setIsLaunching] = useState(false);

    const handleCreate = async () => {
        if (!question.trim() || options.some(opt => !opt.trim())) return;
        setIsLaunching(true);
        try {
            await onPollCreated({ question, options });
        } catch (e) {
            console.error("Poll launch error:", e);
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-xl font-black text-white mb-6 tracking-tight">Broadcast Live Poll</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Polling Question</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-brand-500 transition-all text-white"
                            placeholder="e.g., Do you understand the concept of Entanglement?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Response Options</label>
                        {options.map((opt, idx) => (
                            <input
                                key={idx}
                                type="text"
                                className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-brand-500 transition-all text-white"
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...options];
                                    newOpts[idx] = e.target.value;
                                    setOptions(newOpts);
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!question.trim() || options.some(opt => !opt.trim()) || isLaunching}
                        className="flex-2 py-3 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLaunching ? (
                            <>
                                <Loader2 className="animate-spin" size={14} />
                                Launching...
                            </>
                        ) : 'Launch Broadcast'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LectureView = ({ room, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activePoll, setActivePoll] = useState(null);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const role = localStorage.getItem('userRole');

    // Suggest using a persistent name for the session
    const [userName, setUserName] = useState(localStorage.getItem('userName') || (role === 'teacher' ? room.instructor : ''));

    useEffect(() => {
        if (!userName && role === 'student') {
            const name = prompt("Please enter your name to join the lecture:");
            if (name) {
                setUserName(name);
                localStorage.setItem('userName', name);
            } else {
                setUserName('Student_' + Math.floor(Math.random() * 1000));
            }
        }
    }, []);

    useEffect(() => {
        if (!userName) return; // Wait for name

        const domain = 'meet.ffmuc.net';
        const roomName = room.roomId || 'ClassRoom_' + Date.now();

        console.log("Initializing Jitsi for room:", roomName);

        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: document.querySelector('#jitsi-container'),
            userInfo: {
                displayName: userName
            },
            configOverwrite: {
                startWithAudioMuted: true,
                prejoinPageEnabled: false,
                prejoinConfig: { enabled: false }, // Direct bypass
                enableWelcomePage: false,
                disableDeepLinking: true,
                doNotStoreRoom: true
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            }
        };
        const api = new window.JitsiMeetExternalAPI(domain, options);

        // Discussion Polling
        const chatInterval = setInterval(async () => {
            const id = room.roomId || room.id;
            if (!id) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/api/class/discussion/${id}`);
                setMessages(res.data);
            } catch (e) { console.error("Chat poll error:", e); }
        }, 3000);

        // Poll Polling
        const pollInterval = setInterval(async () => {
            const id = room.roomId || room.id;
            if (!id) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/api/class/poll/${id}`);
                setActivePoll(res.data);
            } catch (e) { console.error("Poll poll error:", e); }
        }, 5000);

        return () => {
            api.dispose();
            clearInterval(chatInterval);
            clearInterval(pollInterval);
        };
    }, [room, userName]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const id = room.roomId || room.id;
        try {
            await axios.post(`${API_BASE_URL}/api/class/discussion`, {
                roomId: id,
                user: role === 'teacher' ? 'Instructor' : 'Guest',
                text: newMessage
            });
            setNewMessage('');
        } catch (e) { console.error(e); }
    };

    const handleCreatePoll = async ({ question, options }) => {
        const id = room.roomId || room.id;
        try {
            const response = await axios.post(`${API_BASE_URL}/api/class/poll`, {
                roomId: id,
                question,
                options
            });
            setShowPollCreator(false);
            // Optimistically set the active poll to the newly created one
            setActivePoll(response.data);
        } catch (e) {
            console.error("Poll creation failed:", e);
            throw e; // Let the creator handle the state
        }
    };

    const handleVote = async (index) => {
        try {
            await axios.post(`${API_BASE_URL}/api/class/poll/vote`, {
                pollId: activePoll.id,
                optionIndex: index
            });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
            {showPollCreator && (
                <PollCreator
                    onPollCreated={handleCreatePoll}
                    onCancel={() => setShowPollCreator(false)}
                />
            )}
            {/* Top Navigation */}
            <div className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <Plus className="rotate-45" size={24} />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-none">{room.className || room.title}</h2>
                        <span className="text-[10px] text-brand-400 font-black uppercase tracking-widest">{room.instructor} • Hosting Live Broadcast</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        Live
                    </span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
                        <Users size={14} /> 24 Joining
                    </button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Main Video Area */}
                <div className="flex-1 relative">
                    <div id="jitsi-container" className="w-full h-full bg-black"></div>
                </div>

                {/* Sidebar: Discussion & Polls */}
                <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900 shrink-0">
                    {/* Polls Component */}
                    <div className="p-4 border-b border-slate-800 min-h-[150px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Polls</h3>
                            {role === 'teacher' && !activePoll && (
                                <button className="p-1 hover:text-brand-400" onClick={() => setShowPollCreator(true)}>
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>

                        {activePoll ? (
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-200">{activePoll.question}</p>
                                <div className="space-y-2">
                                    {activePoll.options.map((opt, idx) => {
                                        const totalVotes = activePoll.options.reduce((sum, o) => sum + o.votes, 0);
                                        const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleVote(idx)}
                                                className="w-full relative group text-left overflow-hidden rounded-lg"
                                            >
                                                <div className="bg-slate-800 p-3 relative z-10 flex justify-between text-xs font-bold">
                                                    <span>{opt.text}</span>
                                                    <span className="opacity-40">{pct}%</span>
                                                </div>
                                                <div className="absolute top-0 left-0 h-full bg-brand-600/20 transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-20 flex items-center justify-center text-slate-600 italic text-xs">
                                No active poll in progress
                            </div>
                        )}
                    </div>

                    {/* Discussion Panel */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-4 border-b border-slate-800">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Class Discussion</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((m, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${m.user === 'Instructor' ? 'text-brand-400' : 'text-slate-500'}`}>
                                            {m.user}
                                        </span>
                                        <span className="text-[8px] text-slate-600 font-bold">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-300 leading-relaxed bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                                        {m.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 pr-10 text-xs font-bold focus:ring-1 focus:ring-brand-500 transition-all"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-500 transition-colors">
                                    <Plus className="rotate-45 scale-75" size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveClass;

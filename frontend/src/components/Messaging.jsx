import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import {
    Send,
    User,
    Search,
    Clock,
    MessageSquare,
    MoreVertical,
    Phone,
    Video,
    Info,
    PlusCircle,
    X,
    CheckCircle2,
    Filter,
    ArrowLeft,
    Zap,
    Loader2,
    Plus,
    ChevronLeft,
    Shield
} from 'lucide-react';

const Messaging = () => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [convSearchQuery, setConvSearchQuery] = useState('');
    const [showUserList, setShowUserList] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false); // Added state for loading users

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchConversationsData = async () => { // Renamed to avoid conflict with function below
            try {
                const response = await axios.get(`${API_BASE_URL}/api/messages/conversations/${userId}`);
                // Map conversations to a simpler format for UI
                const formatted = response.data.map(c => {
                    const otherId = c.participants.find(p => p !== userId);
                    const otherName = c.participantNames[otherId];
                    return { ...c, otherId, otherName };
                });
                setConversations(formatted);
            } catch (err) {
                console.error("Fetch convs error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversationsData();
        fetchAllUsers(); // Keep fetching all users initially

        // Polling for new messages/conversations
        const interval = setInterval(() => {
            fetchConversationsData();
            if (activeConversation) {
                fetchThread(activeConversation.otherId);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeConversation, userId]); // Added userId to dependencies

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => { // Original fetchConversations function
        try {
            const response = await axios.get(`${API_BASE_URL}/api/messages/conversations/${userId}`);
            // Map conversations to a simpler format for UI
            const formatted = response.data.map(c => {
                const otherId = c.participants.find(p => p !== userId);
                const otherName = c.participantNames[otherId];
                return { ...c, otherId, otherName };
            });
            setConversations(formatted);
        } catch (err) {
            console.error("Fetch convs error", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoadingUsers(true); // Set loading state for users
        try {
            const response = await axios.get(`${API_BASE_URL}/api/messages/users/${userId}`);
            setAvailableUsers(response.data);
        } catch (err) {
            console.error("Fetch users error", err);
        } finally {
            setLoadingUsers(false); // Reset loading state
        }
    };

    const fetchThread = async (otherId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/messages/thread/${userId}/${otherId}`);
            setMessages(response.data);
        } catch (err) {
            console.error("Fetch thread error", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeConversation) return;

        setSending(true);
        const content = input.trim();
        setInput('');

        try {
            await axios.post(`${API_BASE_URL}/api/messages/send`, {
                senderId: userId,
                senderName: userName,
                receiverId: activeConversation.otherId,
                receiverName: activeConversation.otherName,
                content
            });
            fetchThread(activeConversation.otherId);
            fetchConversations();
        } catch (err) {
            console.error("Send error", err);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const selectUserForNewChat = (user) => {
        setActiveConversation({
            otherId: user.id,
            otherName: user.name || user.userName || user.email.split('@')[0],
            isNew: true
        });
        setMessages([]);
        setShowUserList(false);
        fetchThread(user.id);
    };

    const filteredUsers = availableUsers.filter(u => {
        const query = searchQuery.toLowerCase();
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        return name.includes(query) || email.includes(query) || role.includes(query);
    });

    const filteredConversations = conversations.filter(c => {
        const query = convSearchQuery.toLowerCase();
        const name = (c.otherName || '').toLowerCase();
        const msg = (c.lastMessage || '').toLowerCase();
        return name.includes(query) || msg.includes(query);
    });

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden m-4 md:m-8">
            {/* Sidebar: Conversations */}
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col bg-slate-50/30">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Messages</h2>
                        <button
                            onClick={() => setShowUserList(true)}
                            className="p-3 bg-brand-600 text-white rounded-2xl shadow-premium hover:bg-brand-700 transition-all hover:scale-105"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={convSearchQuery}
                            onChange={(e) => setConvSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <Loader2 className="animate-spin text-brand-600 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Loading Chats...</p>
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConversation(conv)}
                                className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all group ${activeConversation?.otherId === conv.otherId
                                    ? 'bg-brand-600 text-white shadow-xl shadow-brand-100'
                                    : 'hover:bg-white hover:shadow-md text-slate-600'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${activeConversation?.otherId === conv.otherId ? 'bg-white/20' : 'bg-brand-50 text-brand-600'
                                    }`}>
                                    {conv.otherName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold truncate text-sm tracking-tight">{conv.otherName}</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${activeConversation?.otherId === conv.otherId ? 'text-white/60' : 'text-slate-300'}`}>
                                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${activeConversation?.otherId === conv.otherId ? 'text-white/80' : 'text-slate-400 font-medium'}`}>
                                        {conv.lastSenderId === userId ? 'You: ' : ''}{conv.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-20 px-8">
                            <div className="w-16 h-16 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-200 mx-auto mb-6">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">No Active Conversations</h3>
                            <p className="text-slate-400 text-xs font-medium">Start a new chat to connect with your peers or teachers.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Area: Chat Thread */}
            <div className="flex-1 flex flex-col bg-white">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                                    {activeConversation.otherName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{activeConversation.otherName}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Channel active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 text-slate-300 hover:text-slate-500 transition-colors"><Shield size={20} /></button>
                                <button className="p-3 text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/30">
                            {messages.length > 0 ? (
                                messages.map((m, idx) => (
                                    <div
                                        key={m.id || idx}
                                        className={`flex ${m.senderId === userId ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                        <div className={`max-w-[75%] space-y-2`}>
                                            <div className={`p-6 rounded-[2rem] shadow-sm text-sm font-medium leading-[1.8] ${m.senderId === userId
                                                ? 'bg-brand-600 text-white rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                }`}>
                                                {m.content}
                                            </div>
                                            <div className={`flex items-center gap-2 px-2 ${m.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {m.senderId === userId && <CheckCircle2 size={10} className="text-brand-300" />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-20">
                                    <div className="w-24 h-24 bg-brand-50 rounded-[2.5rem] flex items-center justify-center text-brand-600 mb-6">
                                        <Zap size={40} />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-sm">Send a spark to start the chat</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-slate-50 bg-white">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2.5rem] border border-slate-100 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message, query or doubt..."
                                    className="flex-1 bg-transparent border-none px-6 py-4 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !input.trim()}
                                    className="p-4 bg-brand-600 text-white rounded-[1.8rem] shadow-premium hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-500 blur-[80px] opacity-10 animate-pulse"></div>
                            <div className="w-40 h-40 bg-white border border-slate-100 rounded-[4rem] shadow-premium flex items-center justify-center text-brand-600 relative z-10">
                                <MessageSquare size={80} strokeWidth={1} />
                            </div>
                        </div>
                        <div className="max-w-md space-y-4">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Digital Doubt Solver</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">Select a conversation from the list or start a new message thread with your teachers and peers.</p>
                            <button
                                onClick={() => setShowUserList(true)}
                                className="px-10 py-5 bg-brand-950 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-premium hover:bg-black transition-all"
                            >
                                Start Dialogue
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: User Selection */}
            {showUserList && (
                <div className="fixed inset-0 bg-brand-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Initiate Chat</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academics & Faculty Directory</p>
                            </div>
                            <button
                                onClick={() => setShowUserList(false)}
                                className="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        </div>

                        <div className="p-8 md:p-10 space-y-8">
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    type="text"
                                    placeholder="Find people by name, email or role..."
                                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => selectUserForNewChat(user)}
                                            className="w-full flex items-center gap-5 p-5 rounded-[2rem] border border-slate-50 hover:bg-brand-50 hover:border-brand-100 transition-all group"
                                        >
                                            <div className="w-14 h-14 bg-white text-brand-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 group-hover:border-brand-200">
                                                {(user.name || user.userName || user.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-black text-slate-700 tracking-tight">{user.name || user.userName || user.email.split('@')[0]}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'teacher' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {user.role || 'Student'}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400 truncate">{user.email}</span>
                                                </div>
                                            </div>
                                            <Plus className="text-slate-200 group-hover:text-brand-500" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-10 opacity-30">
                                        <p className="font-black uppercase tracking-widest text-[10px]">No users match your criteria</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messaging;

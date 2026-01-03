import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, Video, FileText, BarChart2, User, LogOut, MessageSquare, Database, Megaphone, Home, Mail, ListTodo } from 'lucide-react'

import PDFUpload from './components/PDFUpload'
import AssignmentEvaluation from './components/AssignmentEvaluation'
import TeacherDashboard from './components/TeacherDashboard'
import LiveClass from './components/LiveClass'
import Login from './components/Login'
import StudyBuddy from './components/StudyBuddy'
import MaterialVault from './components/MaterialVault'
import Announcements from './components/Announcements'
import WelcomePage from './components/WelcomePage'
import Messaging from './components/Messaging'
import ManualAssessment from './components/ManualAssessment'

const Sidebar = ({ role, onLogout }) => {
  const location = useLocation();
  console.log('Sidebar Role Checked:', role, 'at', location.pathname);

  const handleLogout = () => {
    onLogout();
  };

  const navItems = role === 'teacher' ? [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/analytics', icon: BarChart2, label: 'Teacher Console' },
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/messages', icon: Mail, label: 'Messages' },
    { to: '/vault', icon: Database, label: 'Material Vault' },
    { to: '/set-assessment', icon: ListTodo, label: 'Design Paper' },
    { to: '/upload', icon: FileText, label: 'Assessment Gen' },
    { to: '/live', icon: Video, label: 'Live Lecture' },
    { to: '/assignment', icon: User, label: 'Student Nexus' },
  ] : [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/announcements', icon: Megaphone, label: 'Notice Board' },
    { to: '/messages', icon: Mail, label: 'Private DMs' },
    { to: '/vault', icon: Database, label: 'Material Vault' },
    { to: '/live', icon: Video, label: 'Live Class' },
    { to: '/assignment', icon: User, label: 'My Hub' },
    { to: '/study-buddy', icon: MessageSquare, label: 'Study Buddy' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shadow-xl shadow-slate-200/50 z-20">
      <div className="p-8 pb-10">
        <h1 className="text-2xl font-black text-brand-600 flex items-center gap-3 tracking-tighter">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-200 transform rotate-3">
            <BookOpen size={24} />
          </div>
          SmartEd
        </h1>
      </div>

      <div className="px-4 mb-4">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 opacity-70">Main Navigation</p>
        <nav className="space-y-1.5 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 p-4 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-600 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
              <item.icon size={22} className="group-hover:scale-110 transition-transform" />
              <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="bg-brand-950 p-5 rounded-3xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-500 rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Signed in as</p>
          <p className="font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            {role === 'teacher' ? 'Faculty Admin' : 'Active Student'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 text-danger font-bold hover:bg-red-50 rounded-2xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-danger group-hover:text-white transition-all">
            <LogOut size={20} />
          </div>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

const ProtectedRoute = ({ children, role, teacherOnly = false }) => {
  const location = useLocation();
  console.log('ProtectedRoute Check:', { role, teacherOnly, path: location.pathname });
  if (!role) return <Navigate to="/login" />;
  if (teacherOnly && role !== 'teacher') {
    console.log('Access Denied: TeacherOnly route but role is', role);
    return <Navigate to="/assignment" />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('userRole'));

  const handleLogin = (newRole) => {
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    navigate('/login');
  };

  const showSidebar = location.pathname !== '/login' && role;

  if (!role && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {showSidebar && <Sidebar role={role} onLogout={handleLogout} />}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-50/50 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <main className="relative z-10 w-full">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={<ProtectedRoute role={role}><WelcomePage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute role={role} teacherOnly={true}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute role={role}><Announcements /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute role={role}><Messaging /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute role={role}><MaterialVault /></ProtectedRoute>} />
            <Route path="/set-assessment" element={<ProtectedRoute role={role} teacherOnly={true}><ManualAssessment /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute role={role} teacherOnly={true}><PDFUpload /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute role={role}><LiveClass /></ProtectedRoute>} />
            <Route path="/assignment" element={<ProtectedRoute role={role}><AssignmentEvaluation /></ProtectedRoute>} />
            <Route path="/study-buddy" element={<ProtectedRoute role={role}><StudyBuddy /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

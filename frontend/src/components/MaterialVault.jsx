import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { Database, Search, Filter, Download, FileText, Upload, Plus, Loader2, Sparkles, BookOpen, Clock, User, ShieldCheck, AlertCircle, X, ArrowLeft, Tag, Folder, ChevronRight } from 'lucide-react';

const MaterialVault = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [viewMaterial, setViewMaterial] = useState(null);

    const [uploadFile, setUploadFile] = useState(null);
    const [metadata, setMetadata] = useState({
        title: '',
        subject: '',
        grade: '',
        description: ''
    });

    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'Teacher';

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/class/study-materials`);
            setMaterials(response.data);
        } catch (err) {
            console.error("Error fetching materials", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('pdf', uploadFile);
        formData.append('subject', metadata.subject);
        formData.append('grade', metadata.grade);
        formData.append('title', metadata.title);
        formData.append('description', metadata.description);
        formData.append('uploadedBy', userName);

        try {
            await axios.post(`${API_BASE_URL}/api/class/upload-study-material`, formData);
            setUploadFile(null);
            setShowUpload(false);
            setMetadata({ title: '', subject: '', grade: '', description: '' });
            fetchMaterials();
        } catch (err) {
            console.error("Upload Error:", err);
            alert("Failed to upload material");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = (materialId) => {
        window.open(`${API_BASE_URL}/api/class/download-material/${materialId}`);
    };

    const subjects = [...new Set(materials.map(m => m.subject))];
    const filteredMaterials = materials.filter(m =>
        (!selectedSubject || m.subject === selectedSubject) &&
        (m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Database className="text-brand-600" size={32} />
                        Material Vault
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Global repository for verified academic study materials.</p>
                </div>
                {role === 'teacher' && (
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
                    >
                        <Plus size={20} />
                        Publish Material
                    </button>
                )}
            </div>

            {/* Content ... (rest of the component would go here, simplified for brevity but maintaining structure) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Subjects */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Folder size={14} /> Subject Clusters
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedSubject(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!selectedSubject ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                All Materials
                            </button>
                            {subjects.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => setSelectedSubject(sub)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedSubject === sub ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, topic or keyword..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-500 shadow-sm outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-brand-600" size={40} />
                            <p className="text-slate-400 font-bold">Synchronizing Vault Data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredMaterials.map(material => (
                                <div key={material.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <button
                                            onClick={() => handleDownload(material.id)}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-1">{material.title}</h4>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">{material.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{material.subject}</span>
                                        <span className="px-3 py-1 bg-slate-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest">{material.grade}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal ... (simplified) */}
            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Upload className="text-brand-600" /> Publish Study Material
                        </h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <input
                                type="text" placeholder="Material Title"
                                className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                                value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text" placeholder="Subject"
                                    className="px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                                    value={metadata.subject} onChange={e => setMetadata({ ...metadata, subject: e.target.value })}
                                    required
                                />
                                <input
                                    type="text" placeholder="Grade"
                                    className="px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                                    value={metadata.grade} onChange={e => setMetadata({ ...metadata, grade: e.target.value })}
                                    required
                                />
                            </div>
                            <textarea
                                placeholder="Description" rows="3"
                                className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold resize-none"
                                value={metadata.description} onChange={e => setMetadata({ ...metadata, description: e.target.value })}
                            ></textarea>

                            <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-300 transition-colors">
                                <input
                                    type="file" accept=".pdf" className="hidden" id="modal-file-upload"
                                    onChange={e => setUploadFile(e.target.files[0])}
                                />
                                <label htmlFor="modal-file-upload" className="cursor-pointer">
                                    <CloudUpload className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-xs font-bold text-slate-500">{uploadFile ? uploadFile.name : 'Select PDF File'}</p>
                                </label>
                            </div>

                            <button
                                type="submit" disabled={uploading || !uploadFile}
                                className="w-full py-4 bg-brand-600 text-white font-black rounded-2xl shadow-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                {uploading ? 'Uploading to Vault...' : 'Confirm Publication'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CloudUpload = ({ className, size }) => (
    <div className={className}>
        <Upload size={size} />
    </div>
);

export default MaterialVault;

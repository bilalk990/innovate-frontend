import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TfiUser,
    TfiEmail,
    TfiWrite,
    TfiLock,
    TfiLink,
    TfiCheck,
    TfiShield,
    TfiReload,
    TfiBolt,
    TfiTarget,
    TfiPulse,
    TfiCalendar,
    TfiMobile,
    TfiMapAlt,
    TfiBriefcase,
    TfiCup,
    TfiPlus,
    TfiTrash,
    TfiAlert,
    TfiStatsUp
} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';

// Session log built from real user data — no fake locations
function buildSessionLogs(user) {
    const logs = [];
    if (user?.created_at) {
        logs.push({
            id: 'reg',
            type: 'Registration',
            location: user.location || 'Unknown Node',
            time: new Date(user.created_at).toLocaleString(),
            status: 'Secure',
        });
    }
    if (user?.last_login) {
        logs.push({
            id: 'last',
            type: 'Last Session',
            location: user.location || 'Unknown Node',
            time: new Date(user.last_login).toLocaleString(),
            status: 'Secure',
        });
    }
    if (logs.length === 0) {
        logs.push({
            id: 'current',
            type: 'Current Session',
            location: user?.location || 'Unknown Node',
            time: new Date().toLocaleString(),
            status: 'Active',
        });
    }
    return logs;
}

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        location: user?.location || '',
        detailed_skills: user?.detailed_skills || [],
        work_history: user?.work_history || [],
        education_history: user?.education_history || []
    });

    // Synchronize local formData with global user state (e.g. after refreshUser)
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                headline: user.headline || prev.headline,
                bio: user.bio || prev.bio,
                phone: user.phone || prev.phone,
                location: user.location || prev.location,
                detailed_skills: user.detailed_skills || [],
                work_history: user.work_history || [],
                education_history: user.education_history || []
            }));
        }
    }, [user]);

    const [passData, setPassData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    // AI Profile Suggestions
    const [suggestionsData, setSuggestionsData] = useState(null);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const fetchProfileSuggestions = async () => {
        setSuggestionsLoading(true);
        setSuggestionsData(null);
        try {
            const res = await authService.getProfileSuggestions();
            setSuggestionsData(res.data);
        } catch (err) {
            setSuggestionsData({ error: err.response?.data?.error || 'Could not fetch suggestions.' });
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const [tempSkill, setTempSkill] = useState('');
    const [newExp, setNewExp] = useState({ role: '', company: '', duration: '', description: '' });
    const [newEdu, setNewEdu] = useState({ degree: '', institution: '', year: '' });
    const [addingExp, setAddingExp] = useState(false);
    const [addingEdu, setAddingEdu] = useState(false);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            await authService.updateProfile(formData);
            await refreshUser();
            setMsg({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.error || 'Update failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();
        if (passData.new_password !== passData.confirm_password) {
            return setMsg({ type: 'error', text: 'Passwords do not match.' });
        }
        setLoading(true);
        try {
            await authService.changePassword(passData);
            setPassData({ old_password: '', new_password: '', confirm_password: '' });
            setMsg({ type: 'success', text: 'Password changed successfully.' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Password change failed.' });
        } finally {
            setLoading(false);
        }
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && tempSkill.trim()) {
            e.preventDefault();
            if (!formData.detailed_skills.includes(tempSkill.trim())) {
                setFormData({ ...formData, detailed_skills: [...formData.detailed_skills, tempSkill.trim()] });
            }
            setTempSkill('');
        }
    };

    return (
        <div className="animate-fade-in-up pb-20">
            <header className="mb-14 flex justify-between items-end">
                <div>
                    <h1 className="elite-tactical-header">My Profile</h1>
                    <p className="elite-sub-header text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] mt-2 italic">Update your professional identity · Personal Dashboard</p>
                </div>
                <div className="flex gap-4">
                    <div className="p-4 px-6 elite-glass-panel border-white/5 bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        ID: <span className="text-red-600">#{user?.id?.substring(0, 8) || '00000000'}</span>
                    </div>
                </div>
            </header>

            {msg.text && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-12 p-8 rounded-[2rem] border-2 text-[10px] uppercase tracking-[0.3em] font-black flex items-center gap-6 shadow-2xl ${msg.type === 'success' ? 'bg-emerald-600/5 border-emerald-600/20 text-emerald-500' : 'bg-red-600/5 border-red-600/20 text-red-600'}`}
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${msg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {msg.type === 'success' ? <TfiCheck /> : <TfiShield />}
                    </div>
                    {msg.text}
                </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="elite-grid-12 gap-10">
                {/* 1. IDENTITY & PROFESSIONAL CORE (Left) */}
                <div className="col-8 space-y-10">
                    <section className="elite-glass-panel p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.03] blur-[120px] pointer-events-none" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 mb-14 flex items-center gap-4 italic underline underline-offset-[12px] decoration-red-600/20">
                            <TfiUser className="text-red-600 text-xl" /> Personal Information
                        </h3>
                        <div className="space-y-12">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="elite-input-group">
                                    <label className="elite-label">Full Name</label>
                                    <input
                                        className="elite-input h-14 font-black uppercase italic bg-white/[0.02]"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="elite-input-group">
                                    <label className="elite-label text-gray-700">Email Address</label>
                                    <div className="relative opacity-40">
                                        <TfiEmail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input className="elite-input h-14 pl-14 font-black italic bg-black cursor-not-allowed border-none" value={formData.email} disabled />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="elite-input-group">
                                    <label className="elite-label">Professional Headline</label>
                                    <input
                                        className="elite-input h-14 font-black uppercase italic"
                                        placeholder="E.G. SOFTWARE ENGINEER"
                                        value={formData.headline}
                                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                    />
                                </div>
                                <div className="elite-input-group">
                                    <label className="elite-label">Phone Number</label>
                                    <div className="relative">
                                        <TfiMobile className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600" />
                                        <input
                                            className="elite-input h-14 pl-14 font-black italic"
                                            placeholder="+00 000 0000000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="elite-input-group">
                                <label className="elite-label">Professional Summary (Bio)</label>
                                <textarea
                                    className="elite-input min-h-[160px] pt-6 font-black leading-relaxed italic uppercase text-[11px] bg-gray-50 border-gray-100"
                                    placeholder="DESCRIBE YOUR PROFESSIONAL BACKGROUND AND SKILLS..."
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            {/* Expertise Cloud */}
                            <div className="elite-input-group">
                                <label className="elite-label">Key Skills</label>
                                <div className="flex flex-wrap gap-3 p-10 bg-white/[0.01] rounded-[2.5rem] border border-white/5 min-h-[140px]">
                                    {formData.detailed_skills.map((s, i) => (
                                        <span key={i} className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] italic py-2.5 px-5 rounded-xl flex items-center gap-3 group/skill hover:bg-white hover:text-red-600 transition-all cursor-default shadow-lg shadow-red-600/10">
                                            {s}
                                            <TfiTrash
                                                className="cursor-pointer text-white/50 group-hover/skill:text-red-600 animate-pulse"
                                                onClick={() => setFormData({ ...formData, detailed_skills: formData.detailed_skills.filter((_, idx) => idx !== i) })}
                                            />
                                        </span>
                                    ))}
                                    <input
                                        className="bg-transparent border-none outline-none text-[11px] font-black uppercase italic placeholder:text-gray-800 w-full mt-4"
                                        placeholder="Add new skill and press Enter..."
                                        value={tempSkill}
                                        onChange={e => setTempSkill(e.target.value)}
                                        onKeyDown={addSkill}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Work Experience */}
                    <section className="elite-glass-panel p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[120px] pointer-events-none" />
                        <div className="flex justify-between items-center mb-14">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 flex items-center gap-4 italic underline underline-offset-[12px] decoration-red-600/30">
                                <TfiBriefcase className="text-red-600 text-xl" /> Work Experience
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAddingExp(!addingExp)}
                                className="text-[9px] font-black uppercase tracking-widest px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shadow-xl"
                            >
                                <TfiPlus /> {addingExp ? 'CANCEL' : 'ADD EXPERIENCE'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {addingExp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-12 p-10 border border-red-600/20 bg-red-600/[0.02] rounded-[2.5rem] space-y-8"
                                >
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="elite-input-group">
                                            <label className="elite-label text-gray-600">Job Title</label>
                                            <input className="elite-input bg-black/40 h-14" value={newExp.role} onChange={e => setNewExp({ ...newExp, role: e.target.value })} placeholder="E.G. SOFTWARE ENGINEER" />
                                        </div>
                                        <div className="elite-input-group">
                                            <label className="elite-label text-gray-600">Company Name</label>
                                            <input className="elite-input bg-black/40 h-14" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} placeholder="E.G. GOOGLE" />
                                        </div>
                                    </div>
                                    <div className="elite-input-group">
                                        <label className="elite-label text-gray-600">Timeline</label>
                                        <input className="elite-input bg-black/40 h-14" value={newExp.duration} onChange={e => setNewExp({ ...newExp, duration: e.target.value })} placeholder="E.G. 2020 - 2024" />
                                    </div>
                                    <div className="elite-input-group">
                                        <label className="elite-label text-gray-600">Responsibilities & Achievements</label>
                                        <textarea className="elite-input bg-black/40 min-h-[120px] pt-4" value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} placeholder="DESCRIBE YOUR KEY RESPONSIBILITIES..." />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!newExp.role || !newExp.company) return;
                                            setFormData({ ...formData, work_history: [newExp, ...formData.work_history] });
                                            setNewExp({ role: '', company: '', duration: '', description: '' });
                                            setAddingExp(false);
                                        }}
                                        className="w-full py-5 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-red-600/20"
                                    >
                                        ADD EXPERIENCE
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-8">
                            {formData.work_history.map((exp, idx) => (
                                <div key={idx} className="p-10 bg-white/[0.01] border border-white/5 rounded-[2.5rem] flex justify-between items-start group hover:border-red-600/30 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex-1 z-10">
                                        <div className="text-base font-black uppercase italic text-white mb-2 tracking-wide group-hover:text-red-500 transition-colors">{exp.role}</div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-6">{exp.company} · {exp.duration}</div>
                                        <div className="text-[11px] text-gray-500 font-bold italic max-w-lg leading-relaxed uppercase tracking-wider">{exp.description}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, work_history: formData.work_history.filter((_, i) => i !== idx) })}
                                        className="p-4 bg-white/5 text-gray-600 rounded-xl hover:bg-red-600 hover:text-white transition-all flex-shrink-0 z-10"
                                    >
                                        <TfiTrash />
                                    </button>
                                </div>
                            ))}
                            {formData.work_history.length === 0 && (
                                <div className="text-center py-14 opacity-20 text-[10px] font-black uppercase tracking-[1em] italic">No active deployments logs</div>
                            )}
                        </div>
                    </section>

                </div>

                {/* 2. SECURITY & OTHER SETTINGS (Right) */}
                <div className="col-4 space-y-10">
                    <section className="elite-glass-panel bg-black/40 p-12 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/10 blur-[100px] pointer-events-none" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 mb-14 flex items-center gap-4 italic underline underline-offset-[12px] decoration-gray-200">
                            <TfiLock className="text-red-600 text-xl" /> Security Settings
                        </h3>
                        <div className="space-y-10">
                            <div className="elite-input-group">
                                <label className="elite-label text-gray-600">Current Password</label>
                                <input
                                    type="password"
                                    className="elite-input bg-white/[0.02] border-white/5 hover:border-red-600/20"
                                    value={passData.old_password}
                                    onChange={e => setPassData({ ...passData, old_password: e.target.value })}
                                />
                            </div>
                            <div className="elite-input-group">
                                <label className="elite-label text-gray-600">New Password</label>
                                <input
                                    type="password"
                                    className="elite-input bg-white/[0.02] border-white/5 hover:border-red-600/20"
                                    value={passData.new_password}
                                    onChange={e => setPassData({ ...passData, new_password: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-red-600/20 transition-all hover:scale-[1.02]"
                            >
                                CHANGE PASSWORD
                            </button>
                        </div>
                    </section>

                    <section className="elite-glass-panel p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.02] blur-[80px]" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 mb-10 flex items-center gap-3 italic">
                            <TfiCalendar className="text-red-600 text-xl" /> Session History
                        </h3>
                        <div className="space-y-10">
                            {buildSessionLogs(user).map(log => (
                                <div key={log.id} className="flex justify-between items-center group cursor-default">
                                    <div className="flex items-center gap-5">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]" />
                                        <div>
                                            <div className="text-[11px] font-black text-gray-950 uppercase italic leading-none mb-2">{log.type} session</div>
                                            <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{log.location} · {log.time}</div>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-600/5 px-3 py-1.5 rounded-xl border border-red-600/10 transition-colors group-hover:bg-red-600 group-hover:text-white">{log.status}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="p-12 elite-glass-panel text-center group cursor-default border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-600/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <TfiShield className="text-6xl text-red-600 mx-auto mb-8 group-hover:scale-110 transition-transform duration-700 shadow-xl" />
                        <div className="text-[10px] font-black text-gray-950 uppercase tracking-[0.6em] italic mb-4">Profile Integrity</div>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest">Latency: 2ms · Encryption: Secure AES</p>
                    </div>

                    {/* AI Profile Improvement Suggestions */}
                    <section className="elite-glass-panel p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/[0.04] blur-[80px]" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 mb-8 flex items-center gap-3 italic">
                            <TfiStatsUp className="text-purple-600 text-xl" /> AI Profile Coach
                        </h3>

                        {!suggestionsData && !suggestionsLoading && (
                            <button
                                type="button"
                                onClick={fetchProfileSuggestions}
                                className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] italic shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <TfiBolt className="animate-pulse" /> GET AI SUGGESTIONS
                            </button>
                        )}

                        {suggestionsLoading && (
                            <div className="flex flex-col items-center py-10 gap-6">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 border-r-4 border-purple-600 rounded-full animate-spin" />
                                </div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em] animate-pulse italic">Analyzing Profile...</p>
                            </div>
                        )}

                        {suggestionsData && !suggestionsLoading && (
                            <div className="space-y-6">
                                {suggestionsData.error ? (
                                    <div className="p-6 bg-red-50 border border-red-100 rounded-[1.5rem] text-red-600 text-[10px] font-black uppercase italic tracking-widest flex items-center gap-3">
                                        <TfiAlert className="flex-shrink-0" /> {suggestionsData.error}
                                    </div>
                                ) : (
                                    <>
                                        {/* Score */}
                                        <div className="flex items-center gap-6 p-8 bg-purple-50 border border-purple-100 rounded-[2rem]">
                                            <div className="relative w-20 h-20 flex-shrink-0">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(147,51,234,0.1)" strokeWidth="8" />
                                                    <circle cx="50" cy="50" r="44" fill="none" stroke="#9333ea" strokeWidth="8" strokeLinecap="round"
                                                        strokeDasharray={`${((suggestionsData.profile_strength_score || 0) / 100) * 276} 276`}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl font-black text-purple-700 italic">{suggestionsData.profile_strength_score || 0}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black uppercase text-purple-700 tracking-widest italic mb-1">{suggestionsData.profile_strength_label}</div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Profile Strength Score</div>
                                                {suggestionsData.estimated_improvement && (
                                                    <div className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mt-2">↑ {suggestionsData.estimated_improvement}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Priority Improvements */}
                                        {suggestionsData.priority_improvements?.length > 0 && (
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-gray-400 tracking-[0.4em] mb-4 italic">Priority Actions</div>
                                                <div className="space-y-3">
                                                    {suggestionsData.priority_improvements.slice(0, 4).map((item, i) => (
                                                        <div key={i} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-[1.5rem] hover:border-purple-200 transition-colors shadow-sm">
                                                            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 text-[10px] flex items-center justify-center font-black flex-shrink-0 border border-purple-100">{i + 1}</span>
                                                            <div className="flex-1">
                                                                <div className="text-[10px] font-black uppercase text-purple-700 mb-1">{item.title || 'Improvement'}</div>
                                                                <p className="text-[11px] text-gray-600 italic leading-relaxed pt-0.5">{item.description || item}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Wins */}
                                        {suggestionsData.quick_wins?.length > 0 && (
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-emerald-600 tracking-[0.4em] mb-4 italic">Quick Wins</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestionsData.quick_wins.map((win, i) => (
                                                        <span key={i} className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 italic">{win}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => { setSuggestionsData(null); fetchProfileSuggestions(); }}
                                            className="w-full py-4 rounded-[1.5rem] border border-purple-200 text-purple-600 text-[9px] font-black uppercase tracking-[0.4em] italic hover:bg-purple-50 transition-all flex items-center justify-center gap-3"
                                        >
                                            <TfiReload /> RECALCULATE
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="pt-10">
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-emerald-600 text-white py-10 rounded-[2.5rem] font-black uppercase italic tracking-[0.5em] shadow-2xl shadow-red-600/30 flex items-center justify-center gap-6 transition-all hover:scale-[1.02] group"
                        >
                            {loading ? <TfiReload className="animate-spin text-2xl" /> : (
                                <>
                                    SAVE CHANGES
                                    <TfiBolt className="text-xl animate-pulse group-hover:text-white" />
                                </>
                            )}
                        </button>
                        <p className="text-[9px] text-gray-700 text-center mt-8 font-black uppercase tracking-[0.8em] italic animate-pulse">Status: Online</p>
                    </div>
                </div>
            </form>
        </div>
    );
}

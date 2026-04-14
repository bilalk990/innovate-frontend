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
  TfiMedall,
  TfiPlus,
  TfiTrash
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
            setMsg({ type: 'error', text: 'Update failed. Please check your connection.' });
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
                                        onChange={e => setFormData({...formData, name: e.target.value})}
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
                                        onChange={e => setFormData({...formData, headline: e.target.value})}
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
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
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
                                    onChange={e => setFormData({...formData, bio: e.target.value})}
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
                                                onClick={() => setFormData({...formData, detailed_skills: formData.detailed_skills.filter((_, idx) => idx !== i)})}
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
                                            <input className="elite-input bg-black/40 h-14" value={newExp.role} onChange={e => setNewExp({...newExp, role: e.target.value})} placeholder="E.G. SOFTWARE ENGINEER" />
                                        </div>
                                        <div className="elite-input-group">
                                            <label className="elite-label text-gray-600">Company Name</label>
                                            <input className="elite-input bg-black/40 h-14" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} placeholder="E.G. GOOGLE" />
                                        </div>
                                    </div>
                                    <div className="elite-input-group">
                                        <label className="elite-label text-gray-600">Timeline</label>
                                        <input className="elite-input bg-black/40 h-14" value={newExp.duration} onChange={e => setNewExp({...newExp, duration: e.target.value})} placeholder="E.G. 2020 - 2024" />
                                    </div>
                                    <div className="elite-input-group">
                                        <label className="elite-label text-gray-600">Responsibilities & Achievements</label>
                                        <textarea className="elite-input bg-black/40 min-h-[120px] pt-4" value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} placeholder="DESCRIBE YOUR KEY RESPONSIBILITIES..." />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if(!newExp.role || !newExp.company) return;
                                            setFormData({...formData, work_history: [newExp, ...formData.work_history]});
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
                                        onClick={() => setFormData({...formData, work_history: formData.work_history.filter((_, i) => i !== idx)})}
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
                                    onChange={e => setPassData({...passData, old_password: e.target.value})}
                                />
                            </div>
                            <div className="elite-input-group">
                                <label className="elite-label text-gray-600">New Password</label>
                                <input 
                                    type="password"
                                    className="elite-input bg-white/[0.02] border-white/5 hover:border-red-600/20"
                                    value={passData.new_password}
                                    onChange={e => setPassData({...passData, new_password: e.target.value})}
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

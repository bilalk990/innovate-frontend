import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiUser, TfiLayers, TfiCheck, TfiArrowRight, TfiArrowLeft, TfiBolt,
    TfiBriefcase, TfiCup, TfiMapAlt, TfiMobile, TfiPulse, TfiClose,
    TfiShield, TfiWorld, TfiPackage, TfiStar, TfiReload

} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import EliteSelect from '../../components/EliteSelect';
import EliteAutocomplete from '../../components/EliteAutocomplete';
import { SKILLS_LIST, COUNTRIES_LIST } from '../../constants';

const PERSISTENCE_KEY = 'innovai_profile_sync_cache';

export default function ProfileWizard() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Form State with all professional fields
    const [formData, setFormData] = useState(() => {
        const cached = localStorage.getItem(PERSISTENCE_KEY);
        if (cached) {
            try { return JSON.parse(cached); } catch (e) { return {}; }
        }
        return {
            headline: user?.headline || '',
            bio: user?.bio || '',
            phone: user?.phone || '',
            location: user?.location || '',
            detailed_skills: user?.detailed_skills || [],
            projects: user?.projects || [],
            work_history: user?.work_history || [],
            education_history: user?.education_history || [],
            certifications: user?.certifications || [],
            languages: user?.languages || [],
            achievements: user?.achievements || []
        };
    });

    // Auto-sync state to local storage
    useEffect(() => {
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(formData));
    }, [formData]);

    // Temporary states for adding items
    const [tempSkill, setTempSkill] = useState('');
    const [newProject, setNewProject] = useState({ name: '', description: '', technologies: '', link: '' });
    const [newExp, setNewExp] = useState({ company: '', role: '', duration: '', description: '' });
    const [newEdu, setNewEdu] = useState({ level: '', institution: '', year: '', details: '' });
    const [newCert, setNewCert] = useState({ name: '', platform: '', year: '' });
    const [tempLanguage, setTempLanguage] = useState('');
    const [tempAchievement, setTempAchievement] = useState('');

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await authService.updateProfile({ ...formData, is_profile_complete: true });
            await refreshUser();
            setSyncSuccess(true);
            localStorage.removeItem(PERSISTENCE_KEY);
            setTimeout(() => {
                navigate('/candidate/dashboard', { replace: true });
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Profile synchronization failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Add functions
    const addSkill = (e) => {
        if (e.key === 'Enter' && tempSkill.trim()) {
            e.preventDefault();
            if (!formData.detailed_skills.includes(tempSkill.trim())) {
                setFormData({ ...formData, detailed_skills: [...formData.detailed_skills, tempSkill.trim()] });
            }
            setTempSkill('');
        }
    };

    const addProject = () => {
        if (newProject.name && newProject.description) {
            const techArray = newProject.technologies.split(',').map(t => t.trim()).filter(t => t);
            setFormData({
                ...formData,
                projects: [...formData.projects, { ...newProject, technologies: techArray }]
            });
            setNewProject({ name: '', description: '', technologies: '', link: '' });
        }
    };

    const addExp = () => {
        if (newExp.company && newExp.role) {
            setFormData({ ...formData, work_history: [...formData.work_history, newExp] });
            setNewExp({ company: '', role: '', duration: '', description: '' });
        }
    };

    const addEdu = () => {
        if (newEdu.institution && newEdu.level) {
            setFormData({ ...formData, education_history: [...formData.education_history, newEdu] });
            setNewEdu({ level: '', institution: '', year: '', details: '' });
        }
    };

    const addCert = () => {
        if (newCert.name) {
            setFormData({ ...formData, certifications: [...formData.certifications, newCert] });
            setNewCert({ name: '', platform: '', year: '' });
        }
    };

    const addLanguage = () => {
        if (tempLanguage.trim() && !formData.languages.includes(tempLanguage.trim())) {
            setFormData({ ...formData, languages: [...formData.languages, tempLanguage.trim()] });
            setTempLanguage('');
        }
    };

    const addAchievement = () => {
        if (tempAchievement.trim()) {
            setFormData({ ...formData, achievements: [...formData.achievements, tempAchievement.trim()] });
            setTempAchievement('');
        }
    };

    const steps = [
        { id: 1, label: 'Profile', icon: <TfiUser /> },
        { id: 2, label: 'Skills', icon: <TfiBolt /> },
        { id: 3, label: 'Projects', icon: <TfiPackage /> },
        { id: 4, label: 'Experience', icon: <TfiBriefcase /> },
        { id: 5, label: 'Education', icon: <TfiCup /> },
        { id: 6, label: 'Certs', icon: <TfiStar /> },
        { id: 7, label: 'Languages', icon: <TfiWorld /> },
        { id: 8, label: 'Achievements', icon: <TfiCup /> },
        { id: 9, label: 'Review', icon: <TfiCheck /> },
    ];

    const currentYear = new Date().getFullYear();
    const yearRange = Array.from({ length: 40 }, (_, i) => (currentYear + 2) - i);

    const validateStep = (s) => {
        const newErrors = {};
        if (s === 1) {
            if (!formData.headline) newErrors.headline = 'Professional headline required';
            if (!formData.phone) newErrors.phone = 'Phone number required';
            if (!formData.location) newErrors.location = 'Location required';
        }
        if (s === 2 && formData.detailed_skills.length < 3) {
            newErrors.skills = 'Minimum 3 skills required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step) && step < 9) {
            setStep(step + 1);
        }
    };

    const progressPercent = ((step - 1) / (steps.length - 1)) * 100;

    return (
        <div className="animate-fade-in-up pb-20 max-w-7xl mx-auto px-6">
            <header className="mb-14 flex justify-between items-end">
                <div>
                    <h1 className="elite-tactical-header">Profile Setup</h1>
                    <p className="elite-sub-header text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mt-2 italic">Completing Your Professional Identity · Step {step} of {steps.length}</p>
                </div>
                <div className="flex gap-4">
                    <div className="p-4 px-6 elite-glass-panel border-white/5 bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        STATUS: <span className="text-red-600 font-black">{Math.round(progressPercent)}% COMPLETE</span>
                    </div>
                </div>
            </header>

            <div className="elite-glass-panel p-12 md:p-16 relative overflow-hidden min-h-[700px]">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/[0.02] blur-[150px] pointer-events-none" />

                {/* Stepper Header */}
                <div className="flex justify-between relative mb-24 z-10 px-4 group/stepper overflow-x-auto pb-4 scrollbar-hide">
                    {/* Background Progress Track */}
                    <div className="absolute top-7 left-0 w-full h-[3px] bg-white/[0.03] -z-10 rounded-full" />
                    {/* Dynamic Progress Indicator */}
                    <div className="absolute top-7 left-0 h-[3px] bg-red-600 -z-10 transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded-full" style={{ width: `${progressPercent}%` }} />

                    {steps.map(s => (
                        <div key={s.id} className="flex flex-col items-center gap-4 min-w-[85px] relative">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-700 relative z-10 
                                ${step >= s.id ? 'bg-red-600 text-white shadow-[0_15px_30px_-5px_rgba(220,38,38,0.4)]' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                {step > s.id ? <TfiCheck className="font-black" /> : s.icon}
                                {step === s.id && <div className="absolute inset-0 rounded-2xl border-2 border-red-600/20 animate-ping opacity-20 pointer-events-none" />}
                            </div>
                            <span className={`text-[9px] uppercase font-black tracking-[0.3em] italic transition-colors duration-500 ${step >= s.id ? 'text-red-600' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className="py-4"
                    >
                        {/* STEP 1: Profile */}
                        {step === 1 && (
                            <div className="space-y-12 max-w-3xl mx-auto">
                                <div className="elite-input-group">
                                    <label className="elite-label">Professional Headline *</label>
                                    <input
                                        className={`elite-input h-16 font-black uppercase italic bg-white/[0.02] ${errors.headline ? 'border-red-600/50' : ''}`}
                                        placeholder="E.G. SENIOR SOFTWARE ENGINEER | PROJECT MANAGER"
                                        value={formData.headline}
                                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                    />
                                    {errors.headline && <p className="text-[9px] font-black text-red-600 uppercase mt-4 tracking-widest animate-pulse">{errors.headline}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="elite-input-group">
                                        <label className="elite-label text-gray-600">Phone Number *</label>
                                        <div className="relative group/field">
                                            <TfiMobile className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 group-focus-within/field:scale-110 transition-transform z-10" size={18} />
                                            <input
                                                className={`elite-input pl-16 h-14 font-black italic bg-white/[0.02] ${errors.phone ? 'border-red-600/50' : ''}`}
                                                placeholder="+00-XXX-XXXXXXX"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-[9px] font-black text-red-600 uppercase mt-4 tracking-widest">{errors.phone}</p>}
                                    </div>
                                    <EliteSelect
                                        label="Location *"
                                        icon={TfiMapAlt}
                                        value={formData.location}
                                        options={COUNTRIES_LIST}
                                        placeholder="SELECT COUNTRY"
                                        onChange={val => setFormData({ ...formData, location: val })}
                                        error={errors.location}
                                        variant="dark"
                                    />
                                </div>
                                <div className="elite-input-group">
                                    <label className="elite-label text-gray-600">Professional Summary</label>
                                    <textarea
                                        className="elite-input min-h-[220px] pt-6 resize-none italic font-black uppercase tracking-wider text-gray-500 bg-white/[0.01]"
                                        placeholder="DESCRIBE YOUR PROFESSIONAL BACKGROUND AND EXPERIENCE..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                    <p className="text-[9px] text-gray-700 mt-4 italic font-black uppercase tracking-[0.2em]">This information will be used to generate your profile</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Skills */}
                        {step === 2 && (
                            <div className="space-y-12 max-w-4xl mx-auto">
                                <div className="elite-input-group">
                                    <label className="elite-label">Key Skills *</label>
                                    <p className="text-[10px] text-gray-600 mb-8 italic uppercase tracking-[0.3em] font-black underline underline-offset-8 decoration-white/5">Select your core competencies and technical skills</p>

                                    <div className="flex flex-wrap items-start gap-4 mb-10 p-12 elite-glass-panel min-h-[260px] max-h-[450px] overflow-y-auto bg-black border-white/5 shadow-inner">
                                        {formData.detailed_skills.map((s, i) => (
                                            <motion.span
                                                key={s}
                                                initial={{ scale: 0.8, opacity: 0, x: -10 }}
                                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                                className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] italic py-3.5 px-6 rounded-xl flex items-center gap-4 border border-white/10 hover:bg-white hover:text-red-600 transition-all group/node shadow-lg"
                                            >
                                                {s}
                                                <TfiClose
                                                    onClick={() => setFormData({ ...formData, detailed_skills: formData.detailed_skills.filter((_, idx) => idx !== i) })}
                                                    className="cursor-pointer text-white/50 group-hover/node:text-red-600 transition-colors text-xs animate-pulse"
                                                />
                                            </motion.span>
                                        ))}
                                        {formData.detailed_skills.length === 0 && (
                                            <div className="m-auto text-center space-y-6 opacity-20">
                                                <TfiPulse size={48} className="mx-auto text-gray-500 animate-pulse" />
                                                <p className="text-[11px] font-black text-gray-400 uppercase italic tracking-[0.8em]">No signals detected</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative group/search">
                                        <div className="absolute inset-x-0 -bottom-2 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-focus-within/search:opacity-100 transition-opacity blur-xs" />
                                        <EliteAutocomplete
                                            placeholder="ADD SKILL (E.G. REACT, PROJECT MANAGEMENT)..."
                                            suggestions={SKILLS_LIST}
                                            onSelect={s => {
                                                if (!formData.detailed_skills.includes(s)) {
                                                    setFormData({ ...formData, detailed_skills: [...formData.detailed_skills, s] });
                                                    setErrors({ ...errors, skills: null });
                                                }
                                            }}
                                            error={errors.skills}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Projects */}
                        {step === 3 && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
                                <div className="lg:col-span-5">
                                    <div className="elite-glass-panel p-10 bg-black/40 border-white/5 relative overflow-hidden group sticky top-6">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[50px] pointer-events-none" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic mb-12 flex items-center gap-3 underline underline-offset-8 decoration-red-600/20">
                                            <TfiPackage className="text-red-600" /> Add New Project
                                        </h3>
                                        <div className="space-y-8">
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Project Name *</label>
                                                <input
                                                    className="elite-input h-14 bg-white/[0.01] text-gray-950"
                                                    placeholder="E.G. E-COMMERCE PLATFORM"
                                                    value={newProject.name}
                                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Description *</label>
                                                <textarea
                                                    className="elite-input min-h-[140px] pt-4 text-gray-950 resize-none"
                                                    placeholder="DESCRIBE YOUR PROJECT AND ITS IMPACT..."
                                                    value={newProject.description}
                                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                                />
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Technologies Used</label>
                                                <input
                                                    className="elite-input h-14 text-white"
                                                    placeholder="E.G. NEXT.JS, REDIS, AWS"
                                                    value={newProject.technologies}
                                                    onChange={e => setNewProject({ ...newProject, technologies: e.target.value })}
                                                />
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Project Link</label>
                                                <input
                                                    className="elite-input h-14 text-white"
                                                    placeholder="GITHUB / LIVE URL"
                                                    value={newProject.link}
                                                    onChange={e => setNewProject({ ...newProject, link: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                onClick={addProject}
                                                disabled={!newProject.name || !newProject.description}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-red-600/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                ADD PROJECT
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-tactical">
                                    {formData.projects.map((proj, idx) => (
                                        <motion.div
                                            key={idx}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-10 elite-glass-panel border-white/5 relative overflow-hidden group hover:border-red-600/30 transition-all"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex justify-between items-start z-10 relative">
                                                <div className="flex-1">
                                                    <div className="font-black text-gray-950 uppercase italic text-lg tracking-widest mb-4 flex items-center gap-4 group-hover:text-red-500 transition-colors">
                                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                                        {proj.name}
                                                    </div>
                                                    <p className="text-[12px] text-gray-600 mb-8 font-black uppercase italic tracking-wider leading-relaxed pr-10">{proj.description}</p>
                                                    <div className="flex flex-wrap gap-3 mb-8">
                                                        {proj.technologies && proj.technologies.map((tech, i) => (
                                                            <span key={i} className="text-[9px] font-black uppercase italic text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5 group-hover:border-red-600/20 group-hover:text-white transition-all">{tech}</span>
                                                        ))}
                                                    </div>
                                                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] text-red-600 hover:text-white underline underline-offset-4 italic tracking-[0.3em] font-black uppercase transition-all">VIEW PROJECT →</a>}
                                                </div>
                                                <button onClick={() => setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== idx) })} className="p-4 rounded-xl bg-white/5 border border-white/5 text-gray-700 hover:bg-black hover:text-red-600 transition-all group/del">
                                                    <TfiClose size={14} className="group-hover/del:scale-125 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {formData.projects.length === 0 && (
                                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center py-24 elite-glass-panel border-dashed border-white/5 bg-white/[0.01]">
                                            <TfiPackage className="text-7xl text-gray-900 mb-8 opacity-20" />
                                            <p className="text-[11px] font-black uppercase italic text-gray-800 tracking-[0.5em]">No Projects Added</p>
                                            <p className="text-[9px] text-gray-700 mt-4 tracking-[0.3em]">ADD YOUR FIRST PROJECT</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Experience */}
                        {step === 4 && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
                                <div className="lg:col-span-5">
                                    <div className="elite-glass-panel p-10 bg-black/40 border-white/5 relative overflow-hidden sticky top-6">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic mb-12 flex items-center gap-3 underline underline-offset-8 decoration-red-600/20">
                                            <TfiBriefcase className="text-red-600" /> Add Work Experience
                                        </h3>
                                        <div className="space-y-8">
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Company Name *</label>
                                                <input className="elite-input h-14 text-gray-950" placeholder="E.G. MICROSOFT" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} />
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Job Title *</label>
                                                <input className="elite-input h-14 text-gray-950" placeholder="E.G. SOFTWARE ENGINEER" value={newExp.role} onChange={e => setNewExp({ ...newExp, role: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="elite-input-group">
                                                    <label className="elite-label text-gray-600">Start Year</label>
                                                    <select className="elite-input h-14 font-black uppercase italic text-white" value={newExp.duration.split(' - ')[0] || ''} onChange={e => setNewExp({ ...newExp, duration: `${e.target.value} - ${newExp.duration.split(' - ')[1] || 'Present'}` })}>
                                                        <option value="" disabled>SELECT</option>
                                                        {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                                <div className="elite-input-group">
                                                    <label className="elite-label text-gray-600">End Year</label>
                                                    <select className="elite-input h-14 font-black uppercase italic text-white" value={newExp.duration.split(' - ')[1] || ''} onChange={e => setNewExp({ ...newExp, duration: `${newExp.duration.split(' - ')[0] || currentYear} - ${e.target.value}` })}>
                                                        <option value="Present">PRESENT</option>
                                                        {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Responsibilities & Achievements</label>
                                                <textarea className="elite-input min-h-[140px] pt-4 text-gray-400 resize-none" placeholder="DESCRIBE YOUR KEY RESPONSIBILITIES..." value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} />
                                            </div>
                                            <button
                                                onClick={addExp}
                                                disabled={!newExp.company || !newExp.role}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                ADD EXPERIENCE
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-tactical">
                                    {formData.work_history.map((exp, idx) => (
                                        <motion.div key={idx} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 elite-glass-panel border-white/5 relative group hover:border-red-600/30 transition-all">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600/20 group-hover:bg-red-600 transition-all" />
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="flex-1 pr-6">
                                                    <div className="font-black text-gray-950 uppercase italic text-lg tracking-[0.1em] mb-2 group-hover:text-red-500 transition-colors">{exp.role}</div>
                                                    <div className="text-[11px] text-red-600 font-black uppercase tracking-[0.4em] mb-6 italic">{exp.company} <span className="text-gray-300 mx-3">/</span> {exp.duration}</div>
                                                    {exp.description && <p className="text-[12px] text-gray-600 font-black uppercase italic tracking-wider leading-relaxed pr-4">{exp.description}</p>}
                                                </div>
                                                <button onClick={() => setFormData({ ...formData, work_history: formData.work_history.filter((_, i) => i !== idx) })} className="p-4 rounded-xl bg-white/5 hover:bg-black hover:text-red-600 transition-all border border-white/5 text-gray-700 group/del">
                                                    <TfiClose size={12} className="group-hover/del:scale-125 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {formData.work_history.length === 0 && (
                                        <div className="min-h-[500px] flex flex-col items-center justify-center py-24 elite-glass-panel border-dashed border-white/5 bg-white/[0.01]">
                                            <TfiBriefcase className="text-7xl text-gray-900 mb-8 opacity-20" />
                                            <p className="text-[11px] font-black uppercase italic text-gray-800 tracking-[0.5em]">No Experience Added</p>
                                            <p className="text-[9px] text-gray-700 mt-4 tracking-[0.3em]">ADD YOUR WORK HISTORY</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Education */}
                        {step === 5 && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
                                <div className="lg:col-span-5">
                                    <div className="elite-glass-panel p-10 bg-black/40 border-white/5 relative overflow-hidden sticky top-6">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic mb-12 flex items-center gap-3 underline underline-offset-8 decoration-red-600/20">
                                            <TfiCup className="text-red-600" /> Add Education
                                        </h3>
                                        <div className="space-y-8">
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Institution *</label>
                                                <input className="elite-input h-14 text-gray-950" placeholder="E.G. HARVARD UNIVERSITY" value={newEdu.institution} onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })} />
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Degree/Level *</label>
                                                <input className="elite-input h-14 text-gray-950" placeholder="E.G. BACHELORS IN COMPUTER SCIENCE" value={newEdu.level} onChange={e => setNewEdu({ ...newEdu, level: e.target.value })} />
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Graduation Year</label>
                                                <select className="elite-input h-14 font-black uppercase italic text-white" value={newEdu.year} onChange={e => setNewEdu({ ...newEdu, year: e.target.value })}>
                                                    <option value="" disabled>SELECT YEAR</option>
                                                    {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                            <div className="elite-input-group">
                                                <label className="elite-label text-gray-600">Grade/GPA</label>
                                                <input className="elite-input h-14 text-white" placeholder="E.G. 3.9 CGPA / HONORS" value={newEdu.details} onChange={e => setNewEdu({ ...newEdu, details: e.target.value })} />
                                            </div>
                                            <button
                                                onClick={addEdu}
                                                disabled={!newEdu.institution || !newEdu.level}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                ADD EDUCATION
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-tactical">
                                    {formData.education_history.map((edu, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-10 elite-glass-panel border-white/5 group hover:border-red-600/30 transition-all relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex justify-between items-center relative z-10">
                                                <div>
                                                    <div className="font-black text-gray-950 uppercase italic text-lg tracking-[0.1em] mb-2 group-hover:text-red-500 transition-colors">{edu.level}</div>
                                                    <div className="text-[11px] text-red-600 font-black uppercase tracking-[0.4em] mb-4 italic">{edu.institution}</div>
                                                    <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest bg-white/[0.02] px-4 py-2 rounded-xl border border-white/5 inline-block group-hover:border-red-600/20 group-hover:text-gray-950 transition-all">{edu.year} {edu.details && `· ${edu.details}`}</div>
                                                </div>
                                                <button onClick={() => setFormData({ ...formData, education_history: formData.education_history.filter((_, i) => i !== idx) })} className="p-4 rounded-xl bg-white/5 border border-white/5 text-gray-700 hover:bg-black hover:text-red-600 transition-all group/del">
                                                    <TfiClose size={12} className="group-hover/del:scale-125 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {formData.education_history.length === 0 && (
                                        <div className="min-h-[500px] flex flex-col items-center justify-center py-24 elite-glass-panel border-dashed border-white/5 bg-white/[0.01]">
                                            <TfiCup className="text-7xl text-gray-900 mb-8 opacity-20" />
                                            <p className="text-[11px] font-black uppercase italic text-gray-800 tracking-[0.5em]">No Education Added</p>
                                            <p className="text-[9px] text-gray-700 mt-4 tracking-[0.3em]">ADD YOUR ACADEMIC HISTORY</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Certifications */}
                        {step === 6 && (
                            <div className="space-y-12 max-w-4xl mx-auto">
                                <div className="elite-glass-panel bg-black/40 p-12 border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-red-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic mb-12 flex items-center gap-4 underline underline-offset-8 decoration-white/10">
                                        <TfiStar className="text-red-600 text-xl" /> Add Certification
                                    </h3>
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="col-span-2 elite-input-group">
                                            <label className="elite-label text-gray-600">Certification Name</label>
                                            <input className="elite-input h-14 bg-white/[0.01] text-gray-950" placeholder="NAME OF CERTIFICATE" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} />
                                        </div>
                                        <div className="elite-input-group">
                                            <label className="elite-label text-gray-600">Issuer/Platform</label>
                                            <input className="elite-input h-14 bg-white/[0.01] text-gray-950" placeholder="COURSERA / AWS" value={newCert.platform} onChange={e => setNewCert({ ...newCert, platform: e.target.value })} />
                                        </div>
                                        <div className="elite-input-group">
                                            <label className="elite-label text-gray-600">Year Earned</label>
                                            <select className="elite-input h-14 font-black uppercase italic text-gray-950" value={newCert.year} onChange={e => setNewCert({ ...newCert, year: e.target.value })}>
                                                <option value="">SELECT</option>
                                                {yearRange.slice(0, 15).map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2 flex items-end">
                                            <button onClick={addCert} className="w-full h-14 bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform">ADD CERTIFICATION</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-tactical">
                                    {formData.certifications.map((cert, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 elite-glass-panel border-white/5 flex justify-between items-center group hover:border-red-600/40 transition-all shadow-xl">
                                            <div>
                                                <div className="font-black text-gray-950 uppercase italic text-[13px] mb-2 tracking-wide group-hover:text-red-500 transition-colors uppercase">{cert.name}</div>
                                                <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{cert.platform} <span className="text-red-600 mx-2">/</span> {cert.year}</div>
                                            </div>
                                            <button onClick={() => setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== idx) })} className="p-3 rounded-lg bg-white/5 border border-white/5 text-gray-700 hover:text-red-600 transition-all group/del">
                                                <TfiClose size={12} className="group-hover/del:scale-125 transition-transform" />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {formData.certifications.length === 0 && (
                                        <div className="col-span-2 py-16 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20 italic">
                                            <p className="text-[11px] font-black uppercase italic tracking-[0.6em]">No premium credentials detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 7: Languages */}
                        {step === 7 && (
                            <div className="space-y-12 max-w-3xl mx-auto">
                                <div className="elite-input-group">
                                    <label className="elite-label">Languages</label>
                                    <p className="text-[10px] text-gray-600 mb-10 italic uppercase font-black tracking-[0.3em] underline underline-offset-8 decoration-white/5">Specify your language proficiency for communication</p>

                                    <div className="flex flex-wrap items-start gap-4 mb-12 p-12 elite-glass-panel min-h-[200px] bg-black border-white/5 shadow-inner">
                                        {formData.languages.map((lang, i) => (
                                            <motion.span
                                                key={lang}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="bg-white/5 text-white text-[11px] font-black uppercase tracking-[0.2em] italic py-4.5 px-8 rounded-2xl flex items-center gap-5 border border-white/10 shadow-2xl hover:border-red-600/40 transition-all group/lang"
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]" />
                                                {lang}
                                                <TfiClose
                                                    onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_, idx) => idx !== i) })}
                                                    className="cursor-pointer text-gray-700 group-hover/lang:text-red-600 transition-colors text-xs animate-pulse"
                                                />
                                            </motion.span>
                                        ))}
                                        {formData.languages.length === 0 && (
                                            <div className="m-auto text-center space-y-6 opacity-30">
                                                <TfiWorld size={48} className="mx-auto text-gray-700 animate-spin-slow" />
                                                <p className="text-[11px] font-black text-gray-800 uppercase italic tracking-[0.6em] animate-pulse">No languages added</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-6 group/add">
                                        <input
                                            className="elite-input h-16 flex-1 font-black uppercase italic tracking-widest placeholder:text-gray-800 bg-white/[0.01]"
                                            placeholder="ADD LANGUAGE (E.G. ENGLISH - FLUENT)"
                                            value={tempLanguage}
                                            onChange={e => setTempLanguage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                        />
                                        <button onClick={addLanguage} className="h-16 px-14 bg-red-600 text-white font-black italic tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all">ADD</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 8: Achievements */}
                        {step === 8 && (
                            <div className="space-y-12 max-w-3xl mx-auto">
                                <div className="elite-input-group">
                                    <label className="elite-label text-gray-600">Achievements & Awards</label>
                                    <p className="text-[10px] text-gray-600 mb-10 italic uppercase font-black tracking-[0.3em]">List your professional recognitions and awards</p>

                                    <div className="space-y-5 mb-12 p-12 elite-glass-panel min-h-[220px] bg-black border-white/10 shadow-inner max-h-[450px] overflow-y-auto pr-6 scrollbar-tactical">
                                        {formData.achievements.map((ach, i) => (
                                            <motion.div
                                                key={i}
                                                layout
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:border-red-600/50 transition-all shadow-xl"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <TfiCup className="text-red-600 text-2xl group-hover:scale-125 transition-transform duration-500" />
                                                    <span className="text-[12px] text-white font-black uppercase tracking-wider italic leading-relaxed uppercase">{ach}</span>
                                                </div>
                                                <TfiClose
                                                    onClick={() => setFormData({ ...formData, achievements: formData.achievements.filter((_, idx) => idx !== i) })}
                                                    className="cursor-pointer text-gray-800 hover:text-red-600 transition-colors text-sm"
                                                />
                                            </motion.div>
                                        ))}
                                        {formData.achievements.length === 0 && (
                                            <div className="m-auto text-center space-y-6 opacity-30 py-10">
                                                <TfiCup size={56} className="mx-auto text-gray-800" />
                                                <p className="text-[11px] font-black text-gray-800 uppercase italic tracking-[0.8em]">No achievements listed</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-6 group/add">
                                        <input
                                            className="elite-input h-16 flex-1 font-black italic tracking-widest bg-white/[0.01]"
                                            placeholder="GIVE ACHIEVEMENT TITLE (E.G. HACKATHON WINNER)..."
                                            value={tempAchievement}
                                            onChange={e => setTempAchievement(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                                        />
                                        <button onClick={addAchievement} className="h-16 px-14 bg-red-600 text-white font-black uppercase rounded-2xl shadow-2xl hover:bg-emerald-600 transition-colors">ADD</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 9: Review */}
                        {step === 9 && (
                            <div className="text-center py-10 max-w-4xl mx-auto">
                                <AnimatePresence>
                                    {syncSuccess ? (
                                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-14 py-20">
                                            <div className="w-48 h-48 rounded-[5rem] bg-gradient-to-br from-red-600 to-red-900 text-white flex items-center justify-center text-8xl mx-auto shadow-[0_40px_80px_-20px_rgba(220,38,38,0.7)] animate-pulse-slow">
                                                <TfiCheck />
                                            </div>
                                            <div className="space-y-6">
                                                <h3 className="text-6xl font-black uppercase italic tracking-tighter text-white">PROFILE COMPLETED</h3>
                                                <p className="text-gray-600 font-black uppercase text-[14px] tracking-[1em] italic animate-pulse">Saving profile and redirecting to dashboard...</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-16">
                                            <div className="w-32 h-32 rounded-[3rem] bg-white text-emerald-600 flex items-center justify-center text-6xl mx-auto shadow-2xl relative">
                                                <TfiShield />
                                                <div className="absolute inset-0 rounded-[3rem] border-4 border-emerald-500/20 animate-ping opacity-30" />
                                            </div>

                                            <div className="elite-glass-panel p-16 border-white/10 text-left bg-black relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/[0.04] blur-[150px] pointer-events-none" />
                                                <div className="flex items-center gap-10 pb-16 border-b border-white/5 relative z-10">
                                                    <div className="w-28 h-28 rounded-[2.5rem] bg-red-600 text-white flex items-center justify-center text-5xl font-black italic shadow-[0_25px_50px_-10px_rgba(220,38,38,0.5)]">{user?.name?.charAt(0)}</div>
                                                    <div className="flex-1">
                                                        <div className="font-black text-white uppercase italic text-3xl tracking-[0.05em] mb-4 group-hover:text-red-500 transition-colors uppercase leading-tight">{formData.headline}</div>
                                                        <div className="text-[13px] text-red-600 font-black uppercase tracking-[0.4em] italic flex items-center gap-4">
                                                            {user?.name} <span className="text-gray-800">/</span> {formData.location} <span className="text-gray-800">/</span> PROFILE ID: {user?.id?.slice(0, 8)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm mt-16 relative z-10">
                                                    {[
                                                        { label: 'Skills Added', val: formData.detailed_skills.length, icon: <TfiBolt /> },
                                                        { label: 'Projects', val: formData.projects.length, icon: <TfiPackage /> },
                                                        { label: 'Experience', val: formData.work_history.length, icon: <TfiBriefcase /> },
                                                        { label: 'Education', val: formData.education_history.length, icon: <TfiCup /> },
                                                        { label: 'Certifications', val: formData.certifications.length, icon: <TfiStar /> },
                                                        { label: 'Languages', val: formData.languages.length, icon: <TfiWorld /> }
                                                    ].map((stat, i) => (
                                                        <div key={i} className="bg-white/[0.05] p-10 rounded-[3rem] border border-gray-100 group/stat hover:border-red-600/40 transition-all shadow-sm">
                                                            <div className="flex items-center justify-between mb-6">
                                                                <div className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] group-hover/stat:text-red-600 transition-colors">{stat.label}</div>
                                                                <div className="text-red-600 opacity-20 group-hover/stat:opacity-100 transition-all scale-125">{stat.icon}</div>
                                                            </div>
                                                            <div className="text-5xl font-black text-red-600 italic tracking-tighter leading-none group-hover/stat:scale-110 transition-transform origin-left">{stat.val}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-20 p-12 bg-emerald-600/5 border border-emerald-500/10 rounded-[4rem] flex items-center gap-10 relative overflow-hidden group/alert">
                                                    <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover/alert:opacity-100 transition-opacity" />
                                                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-center text-4xl shadow-[0_0_30_rgba(16,185,129,0.3)]"><TfiShield className="animate-pulse" /></div>
                                                    <div className="flex-1">
                                                        <div className="text-[13px] font-black text-white uppercase tracking-[0.3em] mb-3 italic">Profile Verification Complete</div>
                                                        <p className="text-[12px] text-emerald-500 font-black uppercase tracking-[0.5em] italic leading-relaxed">Your professional profile is optimal and ready for applications</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between items-center mt-24 pt-16 border-t border-white/5 mb-8 relative z-10">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || loading || syncSuccess}
                        className={`group flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.6em] italic transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-800 hover:text-white hover:translate-x-[-12px]'}`}
                    >
                        <TfiArrowLeft className="group-hover:animate-pulse" /> PREVIOUS
                    </button>

                    {step < 9 ? (
                        <button
                            onClick={nextStep}
                            className="h-18 px-20 group/btn bg-red-600 text-white font-black uppercase tracking-[0.4em] rounded-2xl shadow-[0_20px_40px_-10px_rgba(220,38,38,0.5)] relative overflow-hidden hover:scale-105 active:scale-95 transition-all italic"
                        >
                            <span className="relative z-10 flex items-center gap-5">
                                NEXT STEP <TfiArrowRight className="text-white/50 group-hover/btn:text-white group-hover/btn:translate-x-3 transition-all" />
                            </span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                    ) : (
                        !syncSuccess && (
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="h-20 px-28 bg-red-600 text-white font-black uppercase tracking-[0.5em] rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(220,38,38,0.7)] scale-110 active:scale-105 transition-all text-base group/final overflow-hidden italic"
                            >
                                <span className="relative z-10 flex items-center gap-6">
                                    {loading ? <TfiReload className="animate-spin text-2xl" /> : (
                                        <>COMPLETE PROFILE <TfiBolt className="animate-pulse" /> FINISH SETUP</>
                                    )}
                                </span>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40 animate-shimmer" />
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="mt-20 text-center animate-pulse py-10">
                <p className="text-[12px] font-black text-gray-800 uppercase tracking-[1.5em] italic opacity-40">Status: Profile Registration in Progress · Secure Connection Validated · V2.0 System</p>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TfiArrowLeft,
    TfiArrowRight,
    TfiBolt,
    TfiPulse,
    TfiShield,
    TfiTarget,
    TfiBriefcase,
    TfiCheck,
} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { toast } from 'sonner';
import EliteSelect from '../../components/EliteSelect';
import EliteAutocomplete from '../../components/EliteAutocomplete';
import { SKILLS_LIST, COUNTRIES_LIST, CORE_VALUES_LIST } from '../../constants';
import '../../styles/hr.css';

export default function RecruiterProfileWizard() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        company_name: user?.company_name || '',
        headline: user?.headline || '', // Designation
        bio: user?.bio || '', // Company Pitch
        company_values: user?.company_values || [],
        recruitment_focus: user?.recruitment_focus || '',
    });

    const [tempValue, setTempValue] = useState('');

    const validateStep = (s) => {
        const newErrors = {};
        if (s === 1) {
            if (!formData.company_name) newErrors.company_name = 'Organization name required';
            if (!formData.headline) newErrors.headline = 'Leadership title required';
        }
        if (s === 2) {
            if (!formData.bio) newErrors.bio = 'Company description required';
            if (formData.company_values.length < 2) newErrors.values = 'Minimum 2 core values required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validateStep(step)) return;
        setLoading(true);
        try {
            await authService.updateProfile({ ...formData, is_profile_complete: true });
            await refreshUser();
            navigate('/recruiter/dashboard');
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Profile update failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const addValue = (e) => {
        if (e.key === 'Enter' && tempValue.trim()) {
            e.preventDefault();
            if (!formData.company_values.includes(tempValue.trim())) {
                setFormData({ ...formData, company_values: [...formData.company_values, tempValue.trim()] });
            }
            setTempValue('');
        }
    };

    const removeValue = (val) => {
        setFormData({ ...formData, company_values: formData.company_values.filter(v => v !== val) });
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const steps = [
        { id: 1, label: 'Company', icon: <TfiTarget /> },
        { id: 2, label: 'Mission', icon: <TfiBolt /> },
        { id: 3, label: 'Verify', icon: <TfiShield /> },
    ];

    return (
        <div className="elite-content max-w-4xl mx-auto pb-20">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="elite-card md:p-20 relative border-2 border-black shadow-2xl bg-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
                
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-black tracking-tighter uppercase italic">Company Profile Setup</h1>
                    <p className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em] mt-2 italic">Set up your organization's profile to start hiring.</p>
                </div>

                {/* Stepper Header */}
                <div className="flex justify-between relative mb-20 z-10 px-12">
                    <div className="absolute top-6 left-0 w-full h-[2px] bg-black/10 -z-10" />
                    <div className="absolute top-6 left-0 h-[2px] bg-red-600 -z-10 transition-all duration-700 shadow-[0_0_10px_rgba(230,57,70,0.5)]" style={{ width: `${(step-1) * 50}%` }} />
                    
                    {steps.map(s => (
                        <div key={s.id} className="flex flex-col items-center gap-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-700 shadow-xl ${step >= s.id ? 'bg-black text-white scale-110 shadow-lg shadow-black/20 ring-4 ring-black/5' : 'bg-white text-black border-2 border-black'}`}>
                                {step > s.id ? <TfiCheck className="text-red-500" /> : s.icon}
                            </div>
                            <span className={`text-[9px] uppercase font-black tracking-[0.2em] italic transition-colors duration-500 ${step >= s.id ? 'text-black opacity-100' : 'text-gray-900 opacity-80'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="min-h-[400px]"
                    >
                        {step === 1 && (
                            <div className="space-y-10">
                                <div className="space-y-8">
                                    <div className="elite-form-group">
                                        <label className={`elite-label ${errors.company_name ? 'text-red-500' : ''}`}>Organization Name</label>
                                        <input
                                            className={`elite-input h-16 ${errors.company_name ? 'border-red-600 animate-wiggle' : 'border-black'}`}
                                            placeholder="e.g. InnovAIte Technologies"
                                            value={formData.company_name}
                                            onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                        />
                                        {errors.company_name && <p className="text-[9px] font-black text-red-600 uppercase mt-2 italic tracking-widest">{errors.company_name}</p>}
                                    </div>
                                    <div className="elite-form-group">
                                        <label className={`elite-label ${errors.headline ? 'text-red-500' : ''}`}>Professional Job Title</label>
                                        <input
                                            className={`elite-input h-16 ${errors.headline ? 'border-red-600 animate-wiggle' : 'border-black'}`}
                                            placeholder="e.g. Talent Acquisition Lead"
                                            value={formData.headline}
                                            onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                        />
                                        {errors.headline && <p className="text-[9px] font-black text-red-600 uppercase mt-2 italic tracking-widest">{errors.headline}</p>}
                                    </div>
                                    <div className="elite-form-group">
                                        <label className="elite-label">Primary Hiring Focus</label>
                                        <EliteAutocomplete 
                                            placeholder="e.g. Engineering & AI Ops"
                                            suggestions={SKILLS_LIST}
                                            onSelect={s => setFormData({ ...formData, recruitment_focus: s })}
                                            value={formData.recruitment_focus}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10">
                                <div className="space-y-8">
                                    <div className="elite-form-group">
                                        <label className={`elite-label ${errors.bio ? 'text-red-500' : ''}`}>Company Bio</label>
                                        <textarea
                                            className={`elite-textarea h-32 italic ${errors.bio ? 'border-red-600 animate-wiggle' : 'border-black'}`}
                                            placeholder="Define your company mission and organizational goals..."
                                            value={formData.bio}
                                            onChange={e => {
                                                setFormData({ ...formData, bio: e.target.value });
                                                if (errors.bio) setErrors({ ...errors, bio: null });
                                            }}
                                        />
                                        {errors.bio && <p className="text-[9px] font-black text-red-600 uppercase mt-2 italic tracking-widest">{errors.bio}</p>}
                                    </div>
                                    <div className="elite-form-group">
                                        <label className={`elite-label ${errors.values ? 'text-red-500' : ''}`}>Core Values (Press Enter to add)</label>
                                        <div className="relative">
                                            <EliteAutocomplete 
                                                placeholder="e.g. Innovation"
                                                suggestions={CORE_VALUES_LIST}
                                                onSelect={v => {
                                                    if (!formData.company_values.includes(v)) {
                                                        setFormData({ ...formData, company_values: [...formData.company_values, v] });
                                                    }
                                                    setTempValue('');
                                                    if (errors.values) setErrors({ ...errors, values: null });
                                                }}
                                                value={tempValue}
                                                error={errors.values}
                                                onChange={v => setTempValue(v)}
                                            />
                                            <div className="flex flex-wrap items-start gap-4 p-8 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30 min-h-[120px]">
                                                {formData.company_values.map((v, i) => (
                                                    <span key={i} className="bg-black text-white text-[11px] font-black uppercase tracking-widest italic py-3 px-6 rounded-xl flex items-center gap-3 shadow-lg hover:scale-105 transition-transform border border-red-600/20">
                                                        {v.toUpperCase()}
                                                        <button onClick={() => removeValue(v)} className="hover:text-red-500 ml-2 text-lg">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center py-10 space-y-12">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-32 h-32 rounded-full bg-black text-red-600 flex items-center justify-center text-5xl mx-auto shadow-2xl border-2 border-red-600/20"
                                >
                                    <TfiShield />
                                </motion.div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Profile Verified</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2 italic">Company profile verified and ready for use.</p>
                                </div>

                                <div className="elite-card p-12 bg-gray-50/50 border-dashed border-2 max-w-lg mx-auto relative group overflow-hidden rounded-[3rem]">
                                     <div className="flex items-center gap-8 mb-8">
                                        <div className="w-20 h-20 rounded-2xl bg-black text-white flex items-center justify-center text-3xl font-black italic shadow-xl">
                                            {formData.company_name?.charAt(0) || 'E'}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-gray-900 uppercase italic text-xl">{formData.company_name}</div>
                                            <div className="text-[10px] text-red-600 font-black uppercase tracking-[0.2em] mt-1">{formData.recruitment_focus || 'GENERAL'}</div>
                                        </div>
                                     </div>
                                     <div className="flex flex-wrap gap-2 text-left">
                                        {formData.company_values.map(v => (
                                            <span key={v} className="text-[9px] font-black uppercase text-gray-400 border border-gray-200 px-3 py-1 rounded-lg">#{v.toUpperCase()}</span>
                                        ))}
                                     </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-24 pt-16 border-t-2 border-dashed border-gray-50 mb-4">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] italic transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <TfiArrowLeft /> BACK
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="bg-black hover:bg-gray-900 text-white px-16 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-6 transition-all shadow-2xl scale-105 hover:scale-110"
                        >
                            Next Step <TfiArrowRight className="text-red-600" />
                        </button>
                    ) : (
                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-20 py-7 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.5em] italic flex items-center gap-8 transition-all shadow-2xl shadow-red-500/30 scale-110 hover:scale-120 hover:shadow-red-500/50"
                        >
                            {loading ? <TfiPulse className="animate-pulse" /> : <TfiBolt />} {loading ? 'SAVING...' : 'COMPLETE SETUP'}
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="mt-20 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.6em] italic opacity-40">PROFILE SETUP · STEP {step}/3 · STATUS: READY</p>
            </div>
        </div>
    );
}

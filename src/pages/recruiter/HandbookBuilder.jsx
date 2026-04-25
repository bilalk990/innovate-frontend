import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiAgenda, TfiFile, TfiCheck, TfiLayoutGrid2 } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const ALL_SECTIONS = [
    { id: 'welcome', label: '👋 Welcome & Company Overview', desc: 'Mission, vision, culture intro' },
    { id: 'code_of_conduct', label: '⚖️ Code of Conduct', desc: 'Professional behavior standards' },
    { id: 'working_hours', label: '🕐 Working Hours & Attendance', desc: 'Schedule, punctuality, overtime' },
    { id: 'leave_policy', label: '🏖️ Leave Policy', desc: 'Annual, sick, casual, maternity/paternity' },
    { id: 'remote_work', label: '🏠 Remote Work Policy', desc: 'WFH rules, availability, equipment' },
    { id: 'performance_reviews', label: '📊 Performance Reviews', desc: 'Appraisal cycle, KPIs, ratings' },
    { id: 'compensation', label: '💰 Compensation & Benefits', desc: 'Salary, bonuses, perks, increments' },
    { id: 'disciplinary', label: '🔴 Disciplinary Procedure', desc: 'Warning steps, termination process' },
    { id: 'anti_harassment', label: '🛡️ Anti-Harassment Policy', desc: 'Zero tolerance, reporting, investigation' },
    { id: 'it_security', label: '💻 IT & Data Security', desc: 'Device use, data handling, confidentiality' },
    { id: 'grievance', label: '📣 Grievance Procedure', desc: 'Complaint process, escalation path' },
    { id: 'exit_process', label: '🚪 Exit & Offboarding Process', desc: 'Notice period, handover, clearance' },
    { id: 'health_safety', label: '🏥 Health & Safety', desc: 'Workplace safety, emergency procedures' },
    { id: 'training', label: '📚 Training & Development', desc: 'L&D budget, courses, career growth' },
];

const CULTURE_TYPES = ['Corporate / Enterprise', 'Startup / Agile', 'Creative / Agency', 'Professional Services', 'Manufacturing / Industrial', 'Government / Public Sector'];
const WORK_MODELS = ['On-site (Full Time)', 'Remote (Full Time)', 'Hybrid (Mix)'];
const COMPANY_SIZES = ['1-20 employees', '21-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];
const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States', 'India', 'Saudi Arabia', 'Canada', 'Australia', 'Other'];
const INDUSTRIES = ['Technology / Software', 'Finance / Banking', 'Healthcare / Pharma', 'Retail / E-commerce', 'Manufacturing', 'Education', 'Consulting / Services', 'Media / Marketing', 'Logistics / Supply Chain', 'Real Estate', 'Hospitality / Tourism', 'Other'];

export default function HandbookBuilder() {
    const [form, setForm] = useState({
        company_name: '',
        industry: '',
        company_size: '51-200 employees',
        country: 'Pakistan',
        culture_type: 'Corporate / Enterprise',
        work_model: 'Hybrid (Mix)',
        additional_notes: '',
    });
    const [selectedSections, setSelectedSections] = useState(ALL_SECTIONS.map(s => s.id));
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeSection, setActiveSection] = useState(0);
    const [copiedAll, setCopiedAll] = useState(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const toggleSection = (id) => {
        setSelectedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!form.company_name.trim()) return toast.error('Enter your company name.');
        if (!form.industry) return toast.error('Select your industry.');
        if (selectedSections.length === 0) return toast.error('Select at least one section.');
        setLoading(true); setResult(null);
        try {
            const sectionLabels = selectedSections.map(id => ALL_SECTIONS.find(s => s.id === id)?.label || id);
            const r = await hrService.buildHandbook({ ...form, selected_sections: sectionLabels });
            setResult(r.data);
            setActiveSection(0);
            toast.success(`Handbook generated with ${r.data?.sections?.length || 0} sections!`);
        } catch { toast.error('Handbook generation failed. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleCopyAll = () => {
        if (!result) return;
        const fullText = [
            result.handbook_title,
            result.company_tagline ? `"${result.company_tagline}"` : '',
            '',
            '═══ WELCOME MESSAGE ═══',
            result.welcome_message,
            '',
            ...(result.sections || []).flatMap(s => [
                `═══ ${s.title.toUpperCase()} ═══`,
                s.content,
                '',
            ]),
            '═══ ACKNOWLEDGMENT ═══',
            result.acknowledgment_page,
            '',
            result.revision_history,
        ].join('\n');

        navigator.clipboard.writeText(fullText)
            .then(() => { setCopiedAll(true); toast.success('Full handbook copied!'); setTimeout(() => setCopiedAll(false), 2500); })
            .catch(() => toast.error('Copy failed.'));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Employee Handbook <span className="text-red-600">Builder</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI generates a complete, professional, legally-aware employee handbook — tailored to your company</p>
                </div>

                {/* How It Works */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        ['⚙️', 'Configure', 'Set your company details, culture, and country'],
                        ['📋', 'Select Sections', 'Choose which policies to include in your handbook'],
                        ['📚', 'Get Full Handbook', 'AI writes every section — ready to print and distribute'],
                    ].map(([icon, title, desc]) => (
                        <div key={title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</div>
                            <div className="text-[11px] text-gray-500">{desc}</div>
                        </div>
                    ))}
                </div>

                {/* Company Setup */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-3">Company Configuration</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Company Name *</label>
                            <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
                                placeholder="e.g. NovaTech Solutions"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Industry *</label>
                            <select value={form.industry} onChange={e => set('industry', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                <option value="">Select Industry...</option>
                                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Company Size</label>
                            <select value={form.company_size} onChange={e => set('company_size', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Country / Jurisdiction</label>
                            <select value={form.country} onChange={e => set('country', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Company Culture</label>
                            <select value={form.culture_type} onChange={e => set('culture_type', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {CULTURE_TYPES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Work Model</label>
                            <select value={form.work_model} onChange={e => set('work_model', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {WORK_MODELS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Special Notes / Requirements (optional)</label>
                        <textarea value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} rows={3}
                            placeholder="E.g. 'We are a fintech startup — emphasize data security. We offer unlimited leave. Mention SECP compliance.'"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                    </div>
                </div>

                {/* Section Picker */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Select Handbook Sections</div>
                        <div className="flex gap-2">
                            <button onClick={() => setSelectedSections(ALL_SECTIONS.map(s => s.id))}
                                className="text-[10px] font-black uppercase px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all">Select All</button>
                            <button onClick={() => setSelectedSections([])}
                                className="text-[10px] font-black uppercase px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all">Clear All</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_SECTIONS.map(section => {
                            const selected = selectedSections.includes(section.id);
                            return (
                                <button key={section.id} onClick={() => toggleSection(section.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected ? 'bg-red-600/10 border-red-600/40' : 'bg-white/[0.01] border-white/5 hover:border-white/15'}`}>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-red-600 border-red-600' : 'border-gray-600'}`}>
                                        {selected && <TfiCheck className="text-white text-[10px]" />}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-black ${selected ? 'text-white' : 'text-gray-400'}`}>{section.label}</div>
                                        <div className="text-[10px] text-gray-600">{section.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="text-[10px] text-gray-500">{selectedSections.length} of {ALL_SECTIONS.length} sections selected</div>
                </div>

                <button onClick={handleGenerate} disabled={loading}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                    {loading
                        ? <><TfiReload className="animate-spin" /> AI is writing your handbook — this may take 30-60 seconds...</>
                        : <><TfiAgenda /> Generate Complete Employee Handbook</>}
                </button>

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Handbook Hero */}
                            <div className="bg-gradient-to-br from-red-600/10 to-gray-900/20 border border-red-600/20 rounded-2xl p-8 text-center space-y-3">
                                <div className="text-xs font-black uppercase tracking-widest text-red-400">📚 Your Employee Handbook is Ready</div>
                                <h2 className="text-2xl font-black uppercase text-white">{result.handbook_title}</h2>
                                {result.company_tagline && (
                                    <p className="text-gray-400 italic text-sm">"{result.company_tagline}"</p>
                                )}
                                <div className="flex items-center justify-center gap-6 text-[11px] text-gray-500">
                                    <span>📄 {result.total_pages_estimate}</span>
                                    <span>📋 {result.sections?.length || 0} Sections</span>
                                    <span>🗂️ {result.revision_history}</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <button onClick={handleCopyAll}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${copiedAll ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                        {copiedAll ? <><TfiCheck /> Copied!</> : <><TfiFile /> Copy Full Handbook</>}
                                    </button>
                                </div>
                                <p className="text-gray-400 text-xs max-w-2xl mx-auto leading-relaxed mt-2">{result.handbook_summary}</p>
                            </div>

                            {/* Company Values */}
                            {result.company_values?.length > 0 && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">🌟 Company Values</div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.company_values.map((v, i) => (
                                            <span key={i} className="text-xs font-black uppercase px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-red-300">{v}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Welcome Message */}
                            {result.welcome_message && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">👋 Welcome Message</div>
                                    <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{result.welcome_message}</div>
                                </div>
                            )}

                            {/* Section Navigator */}
                            <div className="flex gap-2 flex-wrap">
                                {(result.sections || []).map((s, i) => (
                                    <button key={i} onClick={() => setActiveSection(i)}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeSection === i ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {s.icon} {s.title}
                                    </button>
                                ))}
                                <button onClick={() => setActiveSection(-1)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeSection === -1 ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    ✍️ Acknowledgment
                                </button>
                            </div>

                            {/* Section Content */}
                            {activeSection >= 0 && result.sections?.[activeSection] && (
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                            <span className="text-2xl">{result.sections[activeSection].icon}</span>
                                            <div>
                                                <div className="text-lg font-black uppercase text-white">{result.sections[activeSection].title}</div>
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                    {(result.sections[activeSection].key_points || []).map((kp, i) => (
                                                        <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg">{kp}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{result.sections[activeSection].content}</div>
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(result.sections[activeSection].content)
                                                .then(() => toast.success('Section copied!'))
                                                .catch(() => toast.error('Copy failed'));
                                        }} className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all">
                                            Copy This Section
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            {/* Acknowledgment Page */}
                            {activeSection === -1 && result.acknowledgment_page && (
                                <motion.div key="ack" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-3">✍️ Employee Acknowledgment Page</div>
                                    <div className="bg-white text-gray-900 rounded-xl p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {result.acknowledgment_page}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(result.acknowledgment_page)
                                                .then(() => toast.success('Acknowledgment copied!'))
                                                .catch(() => toast.error('Copy failed'));
                                        }} className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all">
                                            Copy Acknowledgment
                                        </button>
                                        <span className="text-[10px] text-gray-500">{result.hr_contact_note}</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

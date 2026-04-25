import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiWrite, TfiFile, TfiShield, TfiCheck } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const DOCUMENT_TYPES = [
    { value: 'Warning Letter', label: '⚠️ Warning Letter', desc: 'First/Second/Final warning for misconduct or performance' },
    { value: 'Show Cause Notice', label: '📋 Show Cause Notice', desc: 'Require employee to explain conduct before action' },
    { value: 'Termination Letter', label: '🔴 Termination Letter', desc: 'End employment with or without cause' },
    { value: 'Experience Certificate', label: '🏅 Experience Certificate', desc: 'Confirm employment duration and role' },
    { value: 'Promotion Letter', label: '🚀 Promotion Letter', desc: 'Official promotion with new title and responsibilities' },
    { value: 'NOC (No Objection Certificate)', label: '✅ NOC Certificate', desc: 'Company has no objection to employee\'s activity' },
    { value: 'Appointment / Offer Letter', label: '📩 Appointment Letter', desc: 'Official job offer with terms and conditions' },
    { value: 'Increment / Salary Revision Letter', label: '💰 Increment Letter', desc: 'Announce salary increase with revised amount' },
    { value: 'Annual Appraisal Letter', label: '📊 Appraisal Letter', desc: 'Performance review outcome and rating communication' },
    { value: 'Transfer Letter', label: '🔄 Transfer Letter', desc: 'Transfer employee to another location or department' },
    { value: 'Relieving Letter', label: '👋 Relieving Letter', desc: 'Confirm employee has been relieved from duties' },
    { value: 'Disciplinary Action Notice', label: '⚖️ Disciplinary Notice', desc: 'Formal disciplinary action for serious violation' },
];

const RISK_STYLE = {
    Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    High: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States', 'India', 'Saudi Arabia', 'Canada', 'Australia', 'Other'];

export default function HRDocumentGenerator() {
    const [form, setForm] = useState({
        document_type: '',
        company_name: '',
        employee_name: '',
        employee_designation: '',
        employee_department: '',
        employee_id: '',
        additional_details: '',
        hr_name: '',
        hr_designation: 'HR Manager',
        country: 'Pakistan',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('document');
    const [copied, setCopied] = useState(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleGenerate = async () => {
        if (!form.document_type) return toast.error('Select a document type.');
        if (!form.company_name.trim()) return toast.error('Enter company name.');
        if (!form.employee_name.trim()) return toast.error('Enter employee name.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.generateHRDocument(form);
            setResult(r.data);
            setActiveTab('document');
            toast.success('Document generated successfully!');
        } catch { toast.error('Document generation failed. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleCopy = () => {
        if (!result?.document_content) return;
        navigator.clipboard.writeText(result.document_content)
            .then(() => { setCopied(true); toast.success('Document copied to clipboard!'); setTimeout(() => setCopied(false), 2000); })
            .catch(() => toast.error('Copy failed.'));
    };

    const selectedDoc = DOCUMENT_TYPES.find(d => d.value === form.document_type);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        HR Document <span className="text-red-600">Generator</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI drafts any professional HR letter or certificate — ready to sign in seconds</p>
                </div>

                {/* Document Type Grid */}
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Select Document Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {DOCUMENT_TYPES.map(doc => (
                            <button key={doc.value} onClick={() => set('document_type', doc.value)}
                                className={`text-left p-4 rounded-2xl border transition-all ${form.document_type === doc.value ? 'bg-red-600/10 border-red-600/50 text-white' : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                                <div className="text-sm font-black">{doc.label}</div>
                                <div className="text-[10px] text-gray-500 mt-1">{doc.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-3">Company & Employee Details</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Company Name *</label>
                            <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
                                placeholder="e.g. TechCorp Solutions Pvt Ltd"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Country / Jurisdiction</label>
                            <select value={form.country} onChange={e => set('country', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Employee Full Name *</label>
                            <input value={form.employee_name} onChange={e => set('employee_name', e.target.value)}
                                placeholder="e.g. Muhammad Ali Khan"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Employee ID (optional)</label>
                            <input value={form.employee_id} onChange={e => set('employee_id', e.target.value)}
                                placeholder="e.g. EMP-00142"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Designation</label>
                            <input value={form.employee_designation} onChange={e => set('employee_designation', e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Department</label>
                            <input value={form.employee_department} onChange={e => set('employee_department', e.target.value)}
                                placeholder="e.g. Engineering"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">HR Manager Name</label>
                            <input value={form.hr_name} onChange={e => set('hr_name', e.target.value)}
                                placeholder="e.g. Sara Ahmed"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">HR Designation</label>
                            <input value={form.hr_designation} onChange={e => set('hr_designation', e.target.value)}
                                placeholder="e.g. HR Manager"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                            Situation / Context <span className="text-gray-600">(more detail = better document)</span>
                        </label>
                        <textarea value={form.additional_details} onChange={e => set('additional_details', e.target.value)} rows={4}
                            placeholder="Describe the specific situation, reason, dates, amounts, or any other relevant details. E.g. 'Employee was absent without notice on 15th April 2025. This is their second offense. Previous verbal warning was given on 1st March 2025.'"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                    </div>

                    <button onClick={handleGenerate} disabled={loading || !form.document_type}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Drafting Document...</> : <><TfiWrite /> Generate Professional Document</>}
                    </button>
                </div>

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                            {/* Meta Row */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
                                <div>
                                    <div className="text-lg font-black uppercase text-white">{result.document_title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{result.tone_used} Tone</div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${RISK_STYLE[result.legal_risk_level] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>
                                        {result.legal_risk_level} Legal Risk
                                    </div>
                                    <button onClick={handleCopy}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                                        {copied ? <><TfiCheck /> Copied!</> : <><TfiFile /> Copy Document</>}
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['document', 'legal', 'actions', 'checklist'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'document' ? '📄 Document' : t === 'legal' ? '⚖️ Legal Notes' : t === 'actions' ? '✅ Follow-up' : '🗂️ Checklist'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'document' && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                                    <div className="bg-white text-gray-900 rounded-xl p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-2xl">
                                        {result.document_content}
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <button onClick={handleCopy}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                            {copied ? <TfiCheck /> : <TfiFile />} {copied ? 'Copied!' : 'Copy to Clipboard'}
                                        </button>
                                        <div className="text-[10px] text-gray-500 flex items-center">
                                            💡 Copy → paste into Word or Google Docs for final formatting
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'legal' && (
                                <div className="space-y-4">
                                    <div className={`border rounded-2xl p-5 ${RISK_STYLE[result.legal_risk_level]?.replace('text-', 'border-').split(' ')[0] || ''} bg-white/[0.02]`}>
                                        <div className="text-xs font-black uppercase tracking-widest mb-2">⚖️ Legal Risk Assessment — {result.legal_risk_level}</div>
                                        <p className="text-sm text-gray-300">{result.legal_risk_reason}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Key Legal Clauses</div>
                                        {(result.key_clauses || []).map((c, i) => (
                                            <div key={i} className="flex items-start gap-2 mb-2 text-sm text-gray-200"><span className="text-red-500 flex-shrink-0">§</span>{c}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">✓ DO</div>
                                            {(result.dos || []).map((d, i) => <div key={i} className="text-xs text-emerald-300 mb-2 flex items-start gap-1"><span>•</span>{d}</div>)}
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">✗ DON'T</div>
                                            {(result.donts || []).map((d, i) => <div key={i} className="text-xs text-red-300 mb-2 flex items-start gap-1"><span>•</span>{d}</div>)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                            <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Employee Rights</div>
                                            <div className="text-xs text-blue-200">{result.employee_rights}</div>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                            <div className="text-[10px] text-gray-400 font-black uppercase mb-1">Recommended Witnesses</div>
                                            <div className="text-xs text-gray-200">{result.recommended_witnesses}</div>
                                        </div>
                                    </div>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                        <div className="text-[10px] text-amber-400 font-black uppercase mb-1">💡 Alternative Version</div>
                                        <div className="text-xs text-amber-200">{result.alternative_version_note}</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'actions' && (
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Post-Issuance Follow-up Steps</div>
                                    {(result.follow_up_actions || []).map((a, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-sm font-black flex-shrink-0">{a.step || i + 1}</div>
                                            <div>
                                                <div className="text-sm font-black text-white">{a.action}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">⏱ {a.timeline}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'checklist' && (
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Documentation to Keep on File</div>
                                    {(result.documentation_checklist || []).map((item, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                                                <TfiCheck className="text-emerald-400 text-xs" />
                                            </div>
                                            <span className="text-sm text-gray-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

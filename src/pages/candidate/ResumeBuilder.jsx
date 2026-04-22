import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiBolt, TfiReload, TfiCheck, TfiClose,
    TfiTarget, TfiUser, TfiBriefcase, TfiLayoutGrid2,
    TfiDownload, TfiFile, TfiPulse, TfiLayers,
    TfiAngleRight, TfiAngleLeft,
    TfiPrinter,
} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import resumeService from '../../services/resumeService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ── 3 Professional Resume Templates ──────────────────────────────────────────

function TemplateElite({ data }) {
    return (
        <div className="bg-white text-gray-900 font-sans p-10 min-h-[1100px]" id="resume-print">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b-4 border-black">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{data.name}</h1>
                    <p className="text-red-600 font-black uppercase tracking-widest text-sm mt-1">{data.headline}</p>
                </div>
                <div className="text-right text-xs space-y-1 text-gray-500 font-medium whitespace-nowrap">
                    {data.contact?.email && <div>{data.contact.email}</div>}
                    {data.contact?.phone && <div>{data.contact.phone}</div>}
                    {data.contact?.location && <div>{data.contact.location}</div>}
                </div>
            </div>

            {/* Summary */}
            {data.summary && (
                <div className="mb-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.12em] text-red-600 mb-3">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
                </div>
            )}

            <div className="grid grid-cols-12 gap-8">
                {/* LEFT */}
                <div className="col-span-12 md:col-span-5 space-y-6 pr-4 border-r border-gray-50">
                    {/* Skills */}
                    {(data.skills?.technical?.length > 0 || data.skills?.soft?.length > 0) && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-red-600 mb-3">Technical Skills</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {(data.skills?.technical || []).map((s, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase px-2 py-1 bg-black text-white rounded">{s}</span>
                                ))}
                            </div>
                            {data.skills?.soft?.length > 0 && (
                                <>
                                    <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-4 mb-2">Soft Skills</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(data.skills.soft || []).map((s, i) => (
                                            <span key={i} className="text-[9px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-600 rounded">{s}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Education */}
                    {data.education?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-red-600 mb-3">Education</h2>
                            <div className="space-y-4">
                                {data.education.map((edu, i) => (
                                    <div key={i}>
                                        <div className="font-black text-xs uppercase">{edu.degree}</div>
                                        <div className="text-[10px] text-red-600 font-bold">{edu.institution}</div>
                                        <div className="text-[9px] text-gray-400">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {data.languages?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-red-600 mb-3">Languages</h2>
                            {data.languages.map((l, i) => <div key={i} className="text-xs font-bold text-gray-700">{l}</div>)}
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="col-span-12 md:col-span-7 space-y-6">
                    {data.experience?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-red-600 mb-4">Work Experience</h2>
                            <div className="space-y-6">
                                {data.experience.map((exp, i) => (
                                    <div key={i} className="border-l-2 border-black pl-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-black text-sm uppercase">{exp.title}</div>
                                                <div className="text-red-600 text-xs font-black">{exp.company}</div>
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold text-right">{exp.duration}</div>
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {(exp.bullets || []).filter(b => b).map((b, j) => (
                                                <li key={j} className="text-[10px] text-gray-600 flex items-start gap-2">
                                                    <span className="text-red-500 mt-1 flex-shrink-0">▸</span>{b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.certifications?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-red-600 mb-3">Certifications</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.certifications.map((c, i) => (
                                    <span key={i} className="text-[9px] px-2 py-1 border border-red-200 text-red-600 font-black rounded uppercase">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TemplateModern({ data }) {
    return (
        <div className="bg-white text-gray-900 font-sans min-h-[1100px]" id="resume-print">
            {/* Top bar */}
            <div className="bg-gray-900 text-white px-10 py-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{data.name}</h1>
                <p className="text-gray-400 text-sm mt-1 font-medium">{data.headline}</p>
                <div className="flex gap-6 mt-3 text-xs text-gray-400 flex-wrap">
                    {data.contact?.email && <span>✉ {data.contact.email}</span>}
                    {data.contact?.phone && <span>📞 {data.contact.phone}</span>}
                    {data.contact?.location && <span>📍 {data.contact.location}</span>}
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50 p-8 space-y-6 min-h-full border-r border-gray-100 flex-shrink-0">
                    {data.skills?.technical?.length > 0 && (
                        <div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Technical</h3>
                            <div className="space-y-1.5">
                                {data.skills.technical.map((s, i) => (
                                    <div key={i} className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0" />{s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.education?.length > 0 && (
                        <div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Education</h3>
                            {data.education.map((edu, i) => (
                                <div key={i} className="mb-3">
                                    <div className="text-xs font-black text-gray-800">{edu.degree}</div>
                                    <div className="text-[10px] text-gray-500">{edu.institution}</div>
                                    <div className="text-[9px] text-gray-400">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {data.languages?.length > 0 && (
                        <div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Languages</h3>
                            {data.languages.map((l, i) => <div key={i} className="text-xs text-gray-700 font-bold">{l}</div>)}
                        </div>
                    )}
                </div>

                {/* Main */}
                <div className="flex-1 p-10 space-y-8">
                    {data.summary && (
                        <div>
                            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 border-b border-gray-100 pb-2">About Me</h2>
                            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                        </div>
                    )}
                    {data.experience?.length > 0 && (
                        <div>
                            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 border-b border-gray-100 pb-2">Experience</h2>
                            <div className="space-y-6">
                                {data.experience.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-black text-sm">{exp.title}</div>
                                                <div className="text-gray-500 text-xs font-medium">{exp.company}</div>
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold">{exp.duration}</div>
                                        </div>
                                        <ul className="mt-2 space-y-1 ml-3">
                                            {(exp.bullets || []).filter(b => b).map((b, j) => (
                                                <li key={j} className="text-xs text-gray-600 list-disc">{b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TemplateMinimal({ data }) {
    return (
        <div className="bg-white text-gray-900 font-sans p-12 min-h-[1100px]" id="resume-print">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10 pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-black uppercase tracking-tight">{data.name}</h1>
                    <p className="text-gray-500 text-sm mt-1">{data.headline}</p>
                    <div className="flex justify-center gap-6 mt-3 text-xs text-gray-400">
                        {data.contact?.email && <span>{data.contact.email}</span>}
                        {data.contact?.phone && <span>{data.contact.phone}</span>}
                        {data.contact?.location && <span>{data.contact.location}</span>}
                    </div>
                </div>

                {data.summary && (
                    <div className="mb-8">
                        <p className="text-sm text-gray-700 leading-relaxed italic text-center">{data.summary}</p>
                    </div>
                )}

                {data.experience?.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Experience</h2>
                        <div className="space-y-5">
                            {data.experience.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-black text-sm">{exp.title} — <span className="text-gray-500 font-medium">{exp.company}</span></span>
                                        <span className="text-[10px] text-gray-400">{exp.duration}</span>
                                    </div>
                                    <ul className="mt-1 ml-4 space-y-0.5">
                                        {(exp.bullets || []).filter(b => b).map((b, j) => (
                                            <li key={j} className="text-xs text-gray-600 list-disc">{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.education?.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Education</h2>
                        {data.education.map((edu, i) => (
                            <div key={i} className="flex justify-between">
                                <span className="font-bold text-sm">{edu.degree} — <span className="text-gray-500">{edu.institution}</span></span>
                                <span className="text-xs text-gray-400">{edu.year}</span>
                            </div>
                        ))}
                    </div>
                )}

                {(data.skills?.technical?.length > 0) && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Skills</h2>
                        <p className="text-sm text-gray-700">{[...(data.skills?.technical || []), ...(data.skills?.soft || [])].join(' · ')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const TEMPLATES = [
    { id: 'elite', label: 'Elite', desc: 'Bold red accents, 2-column layout', component: TemplateElite },
    { id: 'modern', label: 'Modern', desc: 'Dark header, sidebar layout', component: TemplateModern },
    { id: 'minimal', label: 'Minimal', desc: 'Clean, centered, ATS-friendly', component: TemplateMinimal },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResumeBuilder() {
    const { user } = useAuth();
    const [jobTarget, setJobTarget] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatingAdvanced, setGeneratingAdvanced] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('elite');
    const printRef = useRef(null);

    const hasProfile = (user?.detailed_skills?.length || 0) > 0 || (user?.work_history?.length || 0) > 0 || user?.bio;

    const handleGenerate = async () => {
        if (!hasProfile) {
            toast.error('Profile Incomplete. Please add your skills and experience first.');
            return;
        }
        setGenerating(true);
        try {
            const { data } = await resumeService.generateResume({ job_target: jobTarget });

            // Normalize backend flat response → nested structure expected by templates
            const normalized = {
                ...data,
                // contact: backend returns top-level email/phone/location
                contact: data.contact || {
                    email: data.email || '',
                    phone: data.phone || '',
                    location: data.location || '',
                },
                // skills: backend returns flat array → split into technical/soft
                skills: data.skills && !Array.isArray(data.skills)
                    ? data.skills // already nested (future-proof)
                    : {
                        technical: Array.isArray(data.skills) ? data.skills : [],
                        soft: [],
                    },
            };

            setResumeData(normalized);
            toast.success('Resume Generated Successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Resume generation failed.');
        } finally {
            setGenerating(false);
        }
    };

    const handleAdvancedGenerate = async () => {
        if (!hasProfile) {
            toast.error('Profile Incomplete. Please add your skills and experience first.');
            return;
        }
        setGeneratingAdvanced(true);
        try {
            const profileData = {
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                bio: user?.bio || '',
                skills: user?.detailed_skills || [],
                experience: user?.work_history || [],
                education: user?.education || [],
                job_target: jobTarget
            };
            
            const { data } = await resumeService.generateAdvancedResume(profileData);

            // Normalize backend response
            const normalized = {
                ...data,
                contact: data.contact || {
                    email: data.email || user?.email || '',
                    phone: data.phone || user?.phone || '',
                    location: data.location || '',
                },
                skills: data.skills && !Array.isArray(data.skills)
                    ? data.skills
                    : {
                        technical: Array.isArray(data.skills) ? data.skills : (user?.detailed_skills || []),
                        soft: data.soft_skills || [],
                    },
            };

            setResumeData(normalized);
            toast.success('Advanced Resume Generated with ATS Optimization!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Advanced generation failed.');
        } finally {
            setGeneratingAdvanced(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!resumeData) return;

        const toastId = toast.loading('Generating high-quality PDF...');
        try {
            const resumeElement = document.getElementById('resume-print');
            if (!resumeElement) throw new Error('Element not found');

            // Clone the element to avoid modifying the original
            const clonedElement = resumeElement.cloneNode(true);
            clonedElement.style.position = 'absolute';
            clonedElement.style.left = '-9999px';
            document.body.appendChild(clonedElement);

            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                foreignObjectRendering: false,
                // Ignore CSS properties that cause issues
                ignoreElements: (element) => {
                    // Skip elements with problematic styles
                    const style = window.getComputedStyle(element);
                    return style.color?.includes('oklch') || 
                           style.backgroundColor?.includes('oklch') ||
                           style.borderColor?.includes('oklch');
                },
                onclone: (clonedDoc) => {
                    // Replace oklch colors with fallback colors
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach(el => {
                        const computedStyle = window.getComputedStyle(el);
                        
                        // Replace oklch colors with RGB equivalents
                        if (computedStyle.color?.includes('oklch')) {
                            el.style.color = 'rgb(0, 0, 0)'; // fallback to black
                        }
                        if (computedStyle.backgroundColor?.includes('oklch')) {
                            el.style.backgroundColor = 'rgb(255, 255, 255)'; // fallback to white
                        }
                        if (computedStyle.borderColor?.includes('oklch')) {
                            el.style.borderColor = 'rgb(0, 0, 0)'; // fallback to black
                        }
                    });
                }
            });

            // Remove cloned element
            document.body.removeChild(clonedElement);

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
            pdf.save(`${resumeData.name.replace(/\s+/g, '_')}_Professional_Resume.pdf`);
            toast.success('PDF Exported successfully!', { id: toastId });
        } catch (error) {
            console.error("PDF Generation Error: ", error);
            toast.error(`PDF export failed: ${error.message || 'Unknown error'}`, { id: toastId });
        }
    };

    const TemplateComponent = TEMPLATES.find(t => t.id === selectedTemplate)?.component || TemplateElite;

    return (
        <div className="animate-fade-in pb-24 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h1 className="elite-tactical-header">Resume Builder</h1>
                    <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Professional Document Generation · Engine 4.0</p>
                </div>
                {resumeData && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleDownloadPDF}
                            className="btn-elite btn-elite-primary px-8 flex items-center gap-4 py-4 text-[10px] font-black uppercase tracking-widest shadow-2xl"
                        >
                            <TfiDownload className="animate-pulse" /> Export PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Warning Alert */}
            {!hasProfile && (
                <div className="mb-12 p-8 elite-glass-panel border-amber-500/20 bg-amber-500/5 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl animate-pulse border border-amber-500/10">
                        <TfiTarget />
                    </div>
                    <div>
                        <p className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500">Profile Data Missing</p>
                        <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-1 italic">Populate your skills and bio in the Profile Section to enable resume builder.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Configuration */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="elite-glass-panel p-10 bg-black/40 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 blur-[80px]" />
                        <h3 className="text-[11px] font-black uppercase text-gray-600 tracking-[0.6em] mb-12 italic">Resume Details</h3>
                        
                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="text-[9px] font-black text-gray-700 uppercase mb-3 block tracking-[0.2em] italic">Target Job Title</label>
                                <input
                                    type="text"
                                    value={jobTarget}
                                    onChange={e => setJobTarget(e.target.value)}
                                    placeholder="e.g. Lead Dev-Ops / Architect"
                                    className="elite-input w-full bg-white/[0.02] border-white/5 text-white"
                                />
                            </div>
                            
                            <div className="p-6 bg-white/[0.01] rounded-[1.5rem] border border-white/5 group/node">
                                <div className="text-[9px] font-black text-gray-800 uppercase mb-6 tracking-widest italic group-hover/node:text-red-700 transition-colors">Profile Data Status</div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Skills', ok: (user?.detailed_skills?.length || 0) > 0 },
                                        { label: 'Experience', ok: (user?.work_history?.length || 0) > 0 },
                                        { label: 'Bio', ok: !!user?.bio }
                                    ].map(n => (
                                        <div key={n.label} className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-gray-600 italic tracking-widest">{n.label} Data</span>
                                            <div className={`w-2 h-2 rounded-full ${n.ok ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-800 shadow-[0_0_8px_#991b1b]'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || !hasProfile}
                                className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic shadow-2xl ${generating ? 'bg-gray-900 text-gray-700 animate-pulse' : 'bg-red-600 text-white hover:bg-black active:scale-[0.98]'}`}
                            >
                                {generating ? <TfiReload className="animate-spin" /> : <TfiBolt className={hasProfile ? 'animate-pulse' : ''} />}
                                {generating ? 'Generating...' : 'Generate Resume'}
                            </button>

                            <button
                                onClick={handleAdvancedGenerate}
                                disabled={generatingAdvanced || !hasProfile}
                                className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic shadow-2xl ${generatingAdvanced ? 'bg-gray-900 text-gray-700 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 active:scale-[0.98]'}`}
                            >
                                {generatingAdvanced ? <TfiReload className="animate-spin" /> : <TfiLayers className={hasProfile ? 'animate-pulse' : ''} />}
                                {generatingAdvanced ? 'Generating Advanced...' : '✨ Advanced Generate (ATS)'}
                            </button>
                        </div>
                    </div>

                    {/* Template Selector Terminal */}
                    <div className="elite-glass-panel p-10 bg-black/40">
                        <h3 className="text-[11px] font-black uppercase text-gray-700 tracking-[0.6em] mb-12 italic">Resume Templates</h3>
                        <div className="space-y-3">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={`w-full p-6 text-left rounded-2xl border transition-all flex items-center justify-between group/t ${selectedTemplate === t.id ? 'bg-red-600/10 border-red-600 shadow-2xl shadow-red-600/20' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}
                                >
                                    <div>
                                        <div className={`text-[12px] font-black uppercase italic tracking-tighter ${selectedTemplate === t.id ? 'text-white' : 'text-gray-500 group-hover/t:text-gray-300'}`}>{t.label} Template</div>
                                        <div className="text-[9px] font-black text-gray-700 tracking-widest uppercase mt-1 italic group-hover/t:text-gray-500 transition-colors">{t.desc}</div>
                                    </div>
                                    {selectedTemplate === t.id && <TfiCheck className="text-red-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Preview Terminal */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {!resumeData && !generating && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full min-h-[600px] elite-glass-panel flex flex-col items-center justify-center p-20 text-center border-dashed border-2 border-white/5 relative overflow-hidden"
                            >
                                 <div className="absolute inset-0 bg-white/[0.01] animate-pulse pointer-events-none" />
                                 <TfiPulse size={80} className="text-gray-900 mb-12 animate-pulse opacity-30" />
                                 <h2 className="text-4xl font-black uppercase italic text-gray-800 tracking-tighter mb-4">Awaiting Input</h2>
                                 <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.8em] max-w-xs leading-loose italic">
                                    Generate your resume to preview your professional profile.
                                 </p>
                            </motion.div>
                        )}

                        {generating && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[600px] elite-glass-panel flex flex-col items-center justify-center p-20 text-center"
                            >
                                <div className="relative w-40 h-40 mb-16">
                                    <div className="absolute inset-0 border-4 border-red-900/20 rounded-[3rem] animate-spin duration-[3000ms]" />
                                    <div className="absolute inset-4 border-4 border-red-600/40 rounded-[2.5rem] animate-spin-reverse duration-[2000ms]" />
                                    <div className="flex items-center justify-center h-full text-5xl text-red-600 drop-shadow-[0_0_20px_#dc2626]">
                                        <TfiReload className="animate-spin" />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter mb-4">Generating Resume...</h3>
                                <p className="text-[12px] font-black text-red-600 uppercase tracking-[1em] animate-pulse italic">AI Processing In Progress</p>
                            </motion.div>
                        )}

                        {resumeData && !generating && (
                             <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="elite-glass-panel p-0 overflow-hidden bg-white/[0.02] shadow-[0_60px_100px_rgba(0,0,0,0.8)] border-white/10"
                             >
                                <div className="bg-black/80 px-12 py-10 flex items-center justify-between border-b border-white/10">
                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_10px_#dc2626] animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">LIVE PREVIEW</span>
                                        </div>
                                        <div className="h-4 w-[1px] bg-white/10" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 italic">{selectedTemplate.toUpperCase()} TEMPLATE</span>
                                    </div>
                                    <button onClick={() => window.print()} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all">
                                        <TfiPrinter size={18} />
                                    </button>
                                </div>
                                
                                <div className="p-12 overflow-auto max-h-[800px] panel-scrollbar flex justify-center bg-gray-950/50">
                                    <div className="w-full max-w-[800px] origin-top transform shadow-2xl">
                                        <TemplateComponent data={resumeData} />
                                    </div>
                                </div>
                                
                                <div className="p-10 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-10">
                                     <div className="flex gap-4">
                                         {resumeData.ats_keywords?.slice(0, 4).map((kw, idx) => (
                                             <span key={idx} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-gray-600 uppercase italic tracking-widest">#{kw}</span>
                                         ))}
                                     </div>
                                     <button
                                        onClick={handleDownloadPDF}
                                        className="btn-elite btn-elite-primary px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl"
                                     >
                                        DOWNLOAD PDF
                                     </button>
                                </div>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            <div className="mt-32 text-center">
                <p className="text-[11px] font-black text-gray-950 uppercase tracking-[2em] italic opacity-20">InnovAIte Platform · Resume Engine V2.0</p>
            </div>
        </div>
    );
}

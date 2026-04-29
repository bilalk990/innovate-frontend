import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiWrite, TfiReload, TfiCheck, TfiTarget,
  TfiLightBulb, TfiStar, TfiLayoutGrid2, TfiAngleRight,
} from 'react-icons/tfi';
import { FiCopy } from 'react-icons/fi';
import authService from '../../services/authService';

const TONES = ['Professional', 'Enthusiastic', 'Confident', 'Conversational', 'Formal'];

const TABS = ['Cover Letter', 'Keywords Used', 'JD Addressed', 'Tips'];

export default function CoverLetterGenerator() {
  const [form, setForm] = useState({
    job_title: '', company_name: '', jd_text: '', tone: 'Professional',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!form.job_title.trim()) return toast.error('Enter the job title.');
    if (!form.company_name.trim()) return toast.error('Enter the company name.');
    if (!form.jd_text.trim() || form.jd_text.length < 30)
      return toast.error('Paste the full job description (at least 30 chars).');
    setLoading(true);
    setResult(null);
    try {
      const res = await authService.generateCoverLetter(form);
      setResult(res.data);
      setActiveTab(0);
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLetter = () => {
    if (!result?.cover_letter) return;
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 text-xl shadow-sm">
            <TfiWrite />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic text-gray-950">Cover Letter AI</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Tactical Content Generation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="w-1 h-6 bg-red-600" />
               <h2 className="text-xs font-black uppercase tracking-widest text-gray-950 italic">Deployment Parameters</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="elite-input-group">
                <label className="elite-label">Job Title *</label>
                <input
                  value={form.job_title}
                  onChange={e => set('job_title', e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="elite-input"
                />
              </div>
              <div className="elite-input-group">
                <label className="elite-label">Company Name *</label>
                <input
                  value={form.company_name}
                  onChange={e => set('company_name', e.target.value)}
                  placeholder="e.g. Google"
                  className="elite-input"
                />
              </div>
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Writing Tone</label>
              <div className="flex flex-wrap gap-3">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => set('tone', t)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${form.tone === t
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-red-600/40 hover:text-gray-900'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Job Description * (paste full JD)</label>
              <textarea
                value={form.jd_text}
                onChange={e => set('jd_text', e.target.value)}
                rows={10}
                placeholder="Paste the complete job description here..."
                className="elite-input min-h-[200px]"
              />
              <p className="text-[9px] text-gray-400 mt-2 italic font-black uppercase tracking-widest opacity-60">AI uses your saved resume skills + this JD to personalise every line.</p>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="elite-button btn-elite-primary w-full py-6 group"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiWrite className="text-lg group-hover:scale-110 transition-transform" />}
              {loading ? 'GENERATING SYSTEM...' : 'EXECUTE GENERATION'}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Subject line hero */}
              {result.subject_line && (
                <div className="bg-red-600/5 border border-red-600/10 rounded-2xl p-6 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 italic">Intelligence Subject Line</p>
                  <p className="text-gray-950 font-black italic text-sm">{result.subject_line}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex border-b border-gray-50 overflow-x-auto bg-gray-50/30">
                  {TABS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 min-w-max px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${activeTab === i ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {/* Cover Letter */}
                  {activeTab === 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <button
                          onClick={copyLetter}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-950 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-red-600 transition-all shadow-xl active:scale-95"
                        >
                          {copied ? <TfiCheck className="text-emerald-400" /> : <FiCopy />}
                          {copied ? 'SECURED!' : 'COPY LOG'}
                        </button>
                      </div>
                      <div className="bg-gray-50 text-gray-950 rounded-2xl p-10 text-[14px] leading-relaxed whitespace-pre-wrap font-serif border border-gray-100 shadow-inner">
                        {result.cover_letter || '—'}
                      </div>
                    </div>
                  )}

                  {/* Keywords Used */}
                  {activeTab === 1 && (
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Keywords from the JD that were naturally embedded in your letter:</p>
                      <div className="flex flex-wrap gap-3">
                        {(result.keywords_used || []).map((kw, i) => (
                          <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-wider italic">
                            {kw}
                          </span>
                        ))}
                      </div>
                      {result.ats_tip && (
                        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">ATS Optimization Strategy</p>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">{result.ats_tip}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* JD Requirements Addressed */}
                  {activeTab === 2 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">How your letter addresses specific JD requirements:</p>
                      {(result.jd_requirements_addressed || []).map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 mt-0.5">
                             <TfiCheck size={12} />
                          </div>
                          <p className="text-sm text-gray-800 font-medium">{typeof item === 'object' ? `${item.requirement}: ${item.how_addressed}` : item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips */}
                  {activeTab === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-950 italic">Tactical Customization Tips</h3>
                      {(result.customization_tips || []).map((tip, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 mt-0.5">
                             <TfiLightBulb size={12} />
                          </div>
                          <p className="text-sm text-gray-800 font-medium">{tip}</p>
                        </div>
                      ))}
                      {result.follow_up_tip && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mt-8">
                          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 italic">Post-Submission Protocol</p>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">{result.follow_up_tip}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !loading && (
          <div className="hidden xl:flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-gray-100 rounded-3xl text-center gap-6 bg-gray-50/30">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-200 text-3xl animate-pulse">
              <TfiWrite />
            </div>
            <div>
              <p className="text-gray-950 font-black uppercase tracking-[0.4em] text-[10px] italic">Awaiting Parameters</p>
              <p className="text-gray-400 text-[11px] mt-2 font-medium italic">Execute generation to visualize output stream</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

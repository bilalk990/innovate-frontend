import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiWrite, TfiReload, TfiCheck, TfiCopy, TfiTarget,
  TfiLightBulb, TfiStar, TfiLayoutGrid2, TfiAngleRight,
} from 'react-icons/tfi';
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
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 text-xl">
            <TfiWrite />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic">Cover Letter AI</h1>
            <p className="text-gray-500 text-sm mt-0.5">Paste any job description — get a tailored, ready-to-send cover letter</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Job Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Job Title *</label>
                <input
                  value={form.job_title}
                  onChange={e => set('job_title', e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Company Name *</label>
                <input
                  value={form.company_name}
                  onChange={e => set('company_name', e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Writing Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => set('tone', t)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider italic transition-all ${
                      form.tone === t
                        ? 'bg-red-600 text-white border border-red-500'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-red-600/40 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Job Description * (paste full JD)</label>
              <textarea
                value={form.jd_text}
                onChange={e => set('jd_text', e.target.value)}
                rows={10}
                placeholder="Paste the complete job description here — responsibilities, requirements, nice-to-haves..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 resize-none"
              />
              <p className="text-[10px] text-gray-600 mt-1 italic">AI uses your saved resume skills + this JD to personalise every line.</p>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm italic transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiWrite className="text-lg" />}
              {loading ? 'Generating Letter...' : 'Generate Cover Letter'}
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
              className="space-y-4"
            >
              {/* Subject line hero */}
              {result.subject_line && (
                <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 italic">Email Subject Line</p>
                  <p className="text-white font-bold text-sm">{result.subject_line}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="flex border-b border-white/8 overflow-x-auto">
                  {TABS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 min-w-max px-4 py-3 text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap ${
                        activeTab === i ? 'bg-red-600/15 text-red-400 border-b-2 border-red-600' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Cover Letter */}
                  {activeTab === 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button
                          onClick={copyLetter}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider italic text-gray-400 hover:text-white hover:border-red-600/40 transition-all"
                        >
                          {copied ? <TfiCheck className="text-emerald-400" /> : <TfiCopy />}
                          {copied ? 'Copied!' : 'Copy Letter'}
                        </button>
                      </div>
                      <div className="bg-white text-gray-900 rounded-xl p-6 text-sm leading-relaxed whitespace-pre-wrap font-serif shadow-lg">
                        {result.cover_letter || '—'}
                      </div>
                    </div>
                  )}

                  {/* Keywords Used */}
                  {activeTab === 1 && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 italic">Keywords from the JD that were naturally embedded in your letter:</p>
                      <div className="flex flex-wrap gap-2">
                        {(result.keywords_used || []).map((kw, i) => (
                          <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-black text-emerald-400 uppercase tracking-wider italic">
                            {kw}
                          </span>
                        ))}
                      </div>
                      {result.ats_tip && (
                        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">ATS Tip</p>
                          <p className="text-sm text-gray-300">{result.ats_tip}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* JD Requirements Addressed */}
                  {activeTab === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 italic">How your letter addresses specific JD requirements:</p>
                      {(result.jd_requirements_addressed || []).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                          <TfiCheck className="text-emerald-400 text-sm mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{typeof item === 'object' ? `${item.requirement}: ${item.how_addressed}` : item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips */}
                  {activeTab === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Customization Tips</h3>
                      {(result.customization_tips || []).map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                          <TfiLightBulb className="text-yellow-400 text-sm mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{tip}</p>
                        </div>
                      ))}
                      {result.follow_up_tip && (
                        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-4 mt-4">
                          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 italic">Follow-up Strategy</p>
                          <p className="text-sm text-gray-300">{result.follow_up_tip}</p>
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
          <div className="hidden xl:flex flex-col items-center justify-center h-80 border border-dashed border-white/10 rounded-2xl text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 text-3xl">
              <TfiWrite />
            </div>
            <div>
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs italic">Your letter appears here</p>
              <p className="text-gray-700 text-xs mt-1">Fill in job details and paste the JD to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

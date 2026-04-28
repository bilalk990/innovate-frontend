import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiMicrophone, TfiReload, TfiCheck,
  TfiLightBulb, TfiWrite, TfiTarget, TfiStar, TfiBolt,
} from 'react-icons/tfi';
import { FiCopy } from 'react-icons/fi';
import authService from '../../services/authService';

const VERSIONS = [
  { key: 'short_version',    label: '30-Second Pitch',   icon: '⚡', desc: 'Elevator pitch — networking events, quick intros' },
  { key: 'medium_version',   label: '60-Second Story',   icon: '🎯', desc: 'Phone screens, LinkedIn voice notes, virtual calls' },
  { key: 'detailed_version', label: '2-Minute Narrative', icon: '🎤', desc: 'In-person interviews, conference introductions' },
];

const TIP_TABS = ['Delivery Tips', 'Power Words', 'Common Mistakes', 'Body Language', 'Practice Plan'];

export default function SelfIntroCoach() {
  const [form, setForm] = useState({
    target_role: '',
    current_role: '',
    experience_years: '',
    key_skills: '',
    key_achievement: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeVersion, setActiveVersion] = useState(0);
  const [activeTipTab, setActiveTipTab] = useState(0);
  const [copied, setCopied] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!form.target_role.trim()) return toast.error('Enter your target role.');
    setLoading(true);
    setResult(null);
    try {
      const res = await authService.generateSelfIntro(form);
      setResult(res.data);
      setActiveVersion(0);
      setActiveTipTab(0);
      toast.success('Your intros are ready!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2500);
  };

  const activeVer  = VERSIONS[activeVersion];
  const activeData = result?.[activeVer?.key] || {};

  return (
    <div className="elite-content pb-24">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-950">
            Tell Me About Yourself — <span className="text-red-600">AI Coach</span>
          </h1>
          <p className="text-gray-400 text-[11px] mt-2 uppercase tracking-[0.4em] font-black italic">
            Get 3 polished versions: 30s, 60s, and 2-minute intros tailored to your career
          </p>
        </div>

        {!result ? (
          /* ── INPUT FORM ── */
          <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.03] blur-[120px] pointer-events-none" />

            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-[1.2rem] bg-red-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-red-500/20">
                <TfiMicrophone />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-950">Your Profile</h2>
                <p className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] italic">AI builds your perfect intro</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">Target Role *</label>
                  <input
                    value={form.target_role}
                    onChange={e => set('target_role', e.target.value)}
                    placeholder="e.g. Product Manager"
                    className="elite-input h-14 font-black italic"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">Current Role (optional)</label>
                  <input
                    value={form.current_role}
                    onChange={e => set('current_role', e.target.value)}
                    placeholder="e.g. Junior Developer"
                    className="elite-input h-14 font-black italic"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">Years of Experience</label>
                <input
                  type="number" min="0" max="40"
                  value={form.experience_years}
                  onChange={e => set('experience_years', e.target.value)}
                  placeholder="e.g. 3"
                  className="elite-input h-14 font-black italic"
                />
                <p className="text-[10px] text-gray-400 mt-2 italic">AI reads your resume automatically — fill in to override.</p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">Key Skills (comma-separated, optional override)</label>
                <input
                  value={form.key_skills}
                  onChange={e => set('key_skills', e.target.value)}
                  placeholder="React, Leadership, Data Analysis, Python..."
                  className="elite-input h-14 font-black italic"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">Your Proudest Achievement (optional but powerful)</label>
                <textarea
                  value={form.key_achievement}
                  onChange={e => set('key_achievement', e.target.value)}
                  rows={3}
                  placeholder="e.g. Led a team of 5 to deliver a product that increased revenue by 40% in Q2..."
                  className="elite-input pt-4 resize-none font-medium italic text-gray-700 leading-relaxed"
                />
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className={`w-full py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-3 shadow-xl transition-all ${
                  loading ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 hover:bg-gray-950 text-white active:scale-[0.98]'
                }`}
              >
                {loading ? <><TfiReload className="animate-spin" /> Crafting Your Intros...</> : <><TfiMicrophone /> Generate My Intros</>}
              </button>
            </div>
          </div>

        ) : (
          /* ── RESULTS ── */
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Version Selector */}
              <div className="grid grid-cols-3 gap-4">
                {VERSIONS.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVersion(i)}
                    className={`p-6 rounded-[2rem] border text-left transition-all ${
                      activeVersion === i
                        ? 'bg-red-50 border-red-300 shadow-lg'
                        : 'bg-white border-gray-100 shadow-sm hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-3">{v.icon}</div>
                    <p className={`font-black text-[12px] uppercase tracking-wider italic ${activeVersion === i ? 'text-red-600' : 'text-gray-950'}`}>{v.label}</p>
                    <p className="text-[10px] text-gray-400 mt-1 italic">{v.desc}</p>
                    {result?.[v.key]?.delivery_time && (
                      <p className={`text-[10px] font-black mt-2 italic ${activeVersion === i ? 'text-red-500' : 'text-gray-400'}`}>
                        ~{result[v.key].delivery_time}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {/* Script Panel */}
              <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-black text-gray-950 uppercase tracking-widest text-sm italic">{activeVer.label}</p>
                    {activeData.best_for && (
                      <p className="text-[11px] text-gray-400 italic mt-1">Best for: {activeData.best_for}</p>
                    )}
                  </div>
                  <button
                    onClick={() => copyText(activeVer.key, activeData.text || '')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider italic transition-all ${
                      copied === activeVer.key
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    {copied === activeVer.key ? <TfiCheck /> : <FiCopy />}
                    {copied === activeVer.key ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>

                {/* Script Text */}
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2rem] text-[15px] text-gray-800 leading-relaxed font-serif italic">
                  {activeData.text || '—'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 italic mt-4">
                  <span>{activeData.word_count ? `${activeData.word_count} words` : ''}</span>
                  <span>{activeData.delivery_time ? `Delivery: ~${activeData.delivery_time}` : ''}</span>
                </div>
              </div>

              {/* Tips Panel */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex border-b border-gray-100 overflow-x-auto">
                  {TIP_TABS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTipTab(i)}
                      className={`flex-1 min-w-max px-5 py-4 text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap ${
                        activeTipTab === i
                          ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {activeTipTab === 0 && (
                    <div className="space-y-3">
                      {(result.delivery_tips || []).map((tip, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-[1.5rem]">
                          <TfiLightBulb className="text-amber-500 text-base mt-0.5 flex-shrink-0" />
                          <p className="text-[13px] text-gray-700 italic">{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTipTab === 1 && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-gray-400 italic mb-4">High-impact words used in your scripts:</p>
                      <div className="flex flex-wrap gap-3">
                        {(result.power_words_used || []).map((w, i) => (
                          <span key={i} className="px-5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] font-black text-red-600 uppercase tracking-wider italic">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTipTab === 2 && (
                    <div className="space-y-3">
                      {(result.common_mistakes_to_avoid || []).map((m, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-[1.5rem]">
                          <span className="text-red-500 font-black text-base flex-shrink-0">✗</span>
                          <p className="text-[13px] text-gray-700 italic">{m}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTipTab === 3 && (
                    <div className="space-y-3">
                      {(result.body_language_tips || []).map((tip, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-[1.5rem]">
                          <TfiStar className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
                          <p className="text-[13px] text-gray-700 italic">{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTipTab === 4 && result.practice_advice && (
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem]">
                      <p className="text-[13px] text-gray-700 italic leading-relaxed">{result.practice_advice}</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="text-[11px] text-gray-400 hover:text-red-600 font-black uppercase tracking-widest italic transition-colors"
              >
                ← Generate New Intros
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

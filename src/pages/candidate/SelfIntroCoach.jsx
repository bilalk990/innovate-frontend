import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiMicrophone, TfiReload, TfiCheck,
  TfiLightBulb, TfiWrite, TfiTarget, TfiStar,
} from 'react-icons/tfi';
import { FiCopy } from 'react-icons/fi';
import authService from '../../services/authService';

const VERSIONS = [
  { key: 'short_version', label: '30-Second Pitch', icon: '⚡', color: 'emerald', desc: 'Elevator pitch — networking events, quick intros' },
  { key: 'medium_version', label: '60-Second Story', icon: '🎯', color: 'blue', desc: 'Phone screens, LinkedIn voice notes, virtual calls' },
  { key: 'detailed_version', label: '2-Minute Narrative', icon: '🎤', color: 'red', desc: 'In-person interviews, conference introductions' },
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

  const activeVer = VERSIONS[activeVersion];
  const activeData = result?.[activeVer?.key] || {};

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 text-xl">
            <TfiMicrophone />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic">Tell Me About Yourself — AI Coach</h1>
            <p className="text-gray-500 text-sm mt-0.5">Get 3 polished versions: 30s, 60s, and 2-minute intros tailored to your career</p>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Your Profile</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Target Role *</label>
                <input
                  value={form.target_role}
                  onChange={e => set('target_role', e.target.value)}
                  placeholder="e.g. Product Manager"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Current Role (optional)</label>
                <input
                  value={form.current_role}
                  onChange={e => set('current_role', e.target.value)}
                  placeholder="e.g. Junior Developer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Years of Experience</label>
              <input
                type="number"
                min="0" max="40"
                value={form.experience_years}
                onChange={e => set('experience_years', e.target.value)}
                placeholder="e.g. 3"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
              <p className="text-[10px] text-gray-600 mt-1 italic">AI reads your resume automatically — fill in to override.</p>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Key Skills (comma-separated, optional override)</label>
              <input
                value={form.key_skills}
                onChange={e => set('key_skills', e.target.value)}
                placeholder="React, Leadership, Data Analysis, Python..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Your Proudest Achievement (optional but powerful)</label>
              <textarea
                value={form.key_achievement}
                onChange={e => set('key_achievement', e.target.value)}
                rows={3}
                placeholder="e.g. Led a team of 5 to deliver a product that increased revenue by 40% in Q2..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 resize-none"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm italic transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiMicrophone className="text-lg" />}
              {loading ? 'Crafting Your Intros...' : 'Generate My Intros'}
            </button>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Version selector */}
            <div className="grid grid-cols-3 gap-4">
              {VERSIONS.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setActiveVersion(i)}
                  className={`p-4 rounded-2xl border transition-all text-left ${activeVersion === i
                      ? 'bg-red-600/15 border-red-600/50 text-white'
                      : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                >
                  <div className="text-2xl mb-2">{v.icon}</div>
                  <p className="font-black text-sm uppercase tracking-wider italic">{v.label}</p>
                  <p className="text-[10px] text-gray-500 mt-1 italic">{v.desc}</p>
                  {result?.[v.key]?.delivery_time && (
                    <p className={`text-[10px] font-black mt-2 italic ${activeVersion === i ? 'text-red-400' : 'text-gray-600'}`}>
                      ~{result[v.key].delivery_time}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Script panel */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-white uppercase tracking-widest text-sm italic">{activeVer.label}</p>
                  {activeData.best_for && (
                    <p className="text-xs text-gray-500 italic mt-0.5">Best for: {activeData.best_for}</p>
                  )}
                </div>
                <button
                  onClick={() => copyText(activeVer.key, activeData.text || '')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider italic text-gray-400 hover:text-white hover:border-red-600/40 transition-all"
                >
                  {copied === activeVer.key ? <TfiCheck className="text-emerald-400" /> : <FiCopy />}
                  {copied === activeVer.key ? 'Copied!' : 'Copy Script'}
                </button>
              </div>

              <div className="bg-white text-gray-900 rounded-xl p-6 text-sm leading-relaxed font-serif shadow-lg">
                {activeData.text || '—'}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 italic">
                <span>{activeData.word_count ? `${activeData.word_count} words` : ''}</span>
                <span>{activeData.delivery_time ? `Delivery: ~${activeData.delivery_time}` : ''}</span>
              </div>
            </div>

            {/* Tips section */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/8 overflow-x-auto">
                {TIP_TABS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTipTab(i)}
                    className={`flex-1 min-w-max px-4 py-3 text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap ${activeTipTab === i ? 'bg-red-600/15 text-red-400 border-b-2 border-red-600' : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTipTab === 0 && (
                  <div className="space-y-3">
                    {(result.delivery_tips || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                        <TfiLightBulb className="text-yellow-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTipTab === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 italic mb-3">High-impact words used in your scripts:</p>
                    <div className="flex flex-wrap gap-2">
                      {(result.power_words_used || []).map((w, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-600/10 border border-red-600/30 rounded-lg text-xs font-black text-red-400 uppercase tracking-wider italic">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTipTab === 2 && (
                  <div className="space-y-3">
                    {(result.common_mistakes_to_avoid || []).map((m, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <span className="text-red-400 font-black text-sm flex-shrink-0">✗</span>
                        <p className="text-sm text-gray-300">{m}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTipTab === 3 && (
                  <div className="space-y-3">
                    {(result.body_language_tips || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                        <TfiStar className="text-blue-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTipTab === 4 && result.practice_advice && (
                  <div className="bg-white/3 rounded-xl p-4">
                    <p className="text-sm text-gray-300 leading-relaxed">{result.practice_advice}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-xs text-gray-500 hover:text-red-400 font-black uppercase tracking-widest italic transition-colors"
            >
              ← Generate New Intros
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

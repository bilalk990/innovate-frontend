import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiLock, TfiEmail, TfiUser, TfiBriefcase, TfiShield } from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaToken, setMfaToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleRole, setGoogleRole] = useState('candidate'); // role selector for Google OAuth

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = mfaRequired 
                ? { email: form.email, password: form.password, mfa_token: mfaToken } 
                : form;
            const { data } = await authService.login(payload);
            
            if (data.mfa_required) {
                setMfaRequired(true);
                setLoading(false);
                return;
            }
            
            login(data.user, data.token);
            const role = data.user.role;
            
            if (!data.user.is_profile_complete && role !== 'admin') {
                navigate(`/${role}/profile-setup`);
            } else {
                navigate(
                    role === 'admin' ? '/admin/dashboard' : 
                    role === 'recruiter' ? '/recruiter/dashboard' : 
                    '/candidate/dashboard'
                );
            }
        } catch (err) {
            if (!err.response) {
                setError('Backend Service Offline. Please contact administration.');
            } else {
                setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            const { data } = await authService.googleLogin(
                credentialResponse.credential,
                googleRole  // use selected role, not hardcoded 'candidate'
            );
            login(data.user, data.token);
            const role = data.user.role;
            
            if (!data.user.is_profile_complete && role !== 'admin') {
                navigate(`/${role}/profile-setup`);
            } else {
                navigate(
                    role === 'admin' ? '/admin/dashboard' : 
                    role === 'recruiter' ? '/recruiter/dashboard' : 
                    '/candidate/dashboard'
                );
            }
        } catch (err) {
            if (!err.response) {
                setError('Backend Service Offline. Google Authentication cannot be verified.');
                return;
            }
            const errorMsg = err.response?.data?.error || 'Google Authentication Failed. Please try again.';
            const errorDetails = err.response?.data?.details || '';
            
            // Check for clock sync issues
            if (errorMsg.toLowerCase().includes('clock') || errorDetails.toLowerCase().includes('clock')) {
                setError('Clock sync issue. Please sync your system time and try again.');
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-layout">
            {/* Left Column: Auth Form */}
            <div className="form-side">
                {/* Brand Logo - Fixed Top Left */}
                <div className="absolute top-12 left-12">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 text-red-600 font-extrabold text-xl flex items-center justify-center rounded-lg shadow-2xl transition-all group-hover:bg-red-600/10 group-hover:border-red-600/30">
                            <TfiShield size={20} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Innov<span className="text-[#dc2626]">AI</span>te</span>
                    </Link>
                </div>

                <div className="max-w-[440px] w-full mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-6xl font-black tracking-tighter text-white mb-6">Login</h1>
                        <p className="ref-subtext mb-12">
                            Enter your credentials to access the <br className="hidden md:block" />
                            InnovAIte Intelligence platform.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {!mfaRequired ? (
                                <>
                                    <div className="ref-input-group">
                                        <label className="ref-label text-[10px]">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="ref-input"
                                            placeholder="identifier@innovai.te"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="ref-input-group">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <label className="ref-label text-[10px]">Password</label>
                                            <Link to="#" className="text-[9px] text-[#E63946] font-black uppercase tracking-widest hover:text-white transition-colors">Forgot?</Link>
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            className="ref-input"
                                            placeholder="••••••••••••"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="ref-input-group">
                                    <label className="ref-label text-center">MFA TOKEN</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        className="ref-input text-center text-2xl tracking-[1rem]"
                                        placeholder="000000"
                                        value={mfaToken}
                                        onChange={(e) => setMfaToken(e.target.value)}
                                    />
                                </div>
                            )}

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-red-950/20 border-l border-[#E63946] text-[10px] font-black uppercase tracking-widest text-[#E63946]"
                                    >
                                        System Denial: {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="ref-btn-red"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{mfaRequired ? 'Verify Entry' : 'Sign In Now'}</span>
                                        <span className="text-xl">→</span>
                                    </>
                                )}
                            </button>

                            <div className="relative py-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#111]"></div></div>
                                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black text-gray-700">
                                    <span className="px-3 bg-[#030303]">Enterprise Auth</span>
                                </div>
                            </div>

                            {/* Role selector for Google OAuth — fixes access denied for recruiters */}
                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setGoogleRole('candidate')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                                        googleRole === 'candidate'
                                            ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                                            : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    <TfiUser className="text-sm" /> Candidate
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGoogleRole('recruiter')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                                        googleRole === 'recruiter'
                                            ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                                            : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    <TfiBriefcase className="text-sm" /> Recruiter
                                </button>
                            </div>
                            <p className="text-center text-[9px] text-gray-700 font-bold uppercase tracking-widest mb-3">
                                Signing in as: <span className="text-red-500">{googleRole}</span>
                            </p>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Failed')}
                                    theme="filled_black"
                                    shape="square"
                                    width="100%"
                                />
                            </div>

                            <p className="mt-12 text-center text-[10px] text-gray-800 font-extrabold uppercase tracking-[0.4em]">
                                Don't have an account? <Link to="/register" className="text-[#E63946] hover:text-white transition-colors">Sign up here</Link>
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Visual/Brand */}
            <div className="brand-side">
                <div className="max-w-[500px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="ref-heading text-white">
                            Innovate your <br />
                            <span className="text-[#E63946]">hiring vectors.</span>
                        </h2>
                        <p className="ref-subtext mb-16 text-lg">
                            Harness the collective power of real-time behavioral diagnostics and AI neural networks to build your elite team.
                        </p>

                        <div className="ref-testimonial">
                            <div className="flex gap-1 text-[#E63946] mb-4">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-xl">★</span>)}
                            </div>
                            <p className="text-xl italic font-medium leading-relaxed mb-8 text-gray-300">
                                "The behavioral analysis was instantaneous. InnovAIte unified our entire recruitment pipeline perfectly."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#111] rounded-full border border-white/5 flex items-center justify-center font-black">M</div>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-widest">Michael R.</div>
                                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Chief of Talent, TechCorp</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

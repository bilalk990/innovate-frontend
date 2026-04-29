import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiUser, TfiEmail, TfiLock, TfiBriefcase, TfiShield } from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'candidate',
        company: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);

    const updateForm = (key, value) => {
        setForm((prev) => {
            const updated = { ...prev, [key]: value };
            
            if (key === 'password' || key === 'confirmPassword') {
                const pw = key === 'password' ? value : prev.password;
                const cpw = key === 'confirmPassword' ? value : prev.confirmPassword;
                setPasswordMatch(cpw === '' || pw === cpw);
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        
        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }
        
        setLoading(true);
        try {
            const { data } = await authService.register({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                company: form.company
            });
            
            login(data.user, data.token);
            
            if (!data.user.is_profile_complete) {
                navigate(`/${form.role}/profile-setup`);
            } else {
                navigate(`/${form.role}/dashboard`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            console.log('[Register] Google login attempt:', { role: form.role });
            
            const { data } = await authService.googleLogin(
                credentialResponse.credential,
                form.role
            );
            
            console.log('[Register] Google login response:', {
                hasUser: !!data.user,
                hasToken: !!data.token,
                userRole: data.user?.role,
                userName: data.user?.name,
                userEmail: data.user?.email
            });
            
            login(data.user, data.token);
            
            if (!data.user.is_profile_complete) {
                navigate(`/${form.role}/profile-setup`);
            } else {
                navigate(`/${form.role}/dashboard`);
            }
        } catch (err) {
            console.error('[Register] Google login error:', err);
            setError(err.response?.data?.error || 'Google sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-layout">
            {/* Left Column: Register Form */}
            <div className="form-side">
                {/* Brand Logo - Fixed Top Left */}
                <div className="absolute top-12 left-12">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="InnovAIte" className="h-10 w-auto" />
                        <span className="text-2xl font-black tracking-tighter text-white">Innov<span className="text-[#E63946]">AI</span>te</span>
                    </Link>
                </div>

                <div className="max-w-[560px] w-full mx-auto pt-40 pb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-6xl font-black tracking-tighter text-white mb-6">Register</h1>
                        <p className="ref-subtext mb-12">
                            Create your professional account and join <br />
                            the recruitment revolution.
                        </p>

                        {/* Role Toggle - Reference Style */}
                        <div className="flex gap-2 p-1 bg-[#0A0A0A] border border-[#111] rounded mb-10">
                            {[
                                { value: 'candidate', label: 'Candidate' },
                                { value: 'recruiter', label: 'Recruiter' }
                            ].map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => updateForm('role', role.value)}
                                    className={`flex-1 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                                        form.role === role.value
                                            ? 'bg-[#E63946] text-white'
                                            : 'text-gray-700 hover:text-white'
                                    }`}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="ref-input-group">
                                    <label className="ref-label text-[10px]">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="ref-input"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={(e) => updateForm('name', e.target.value)}
                                    />
                                </div>

                                <div className="ref-input-group">
                                    <label className="ref-label text-[10px]">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="ref-input"
                                        placeholder="name@domain.com"
                                        value={form.email}
                                        onChange={(e) => updateForm('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {form.role === 'recruiter' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="ref-input-group overflow-hidden"
                                    >
                                        <label className="ref-label text-[10px]">Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="ref-input"
                                            placeholder="Company Inc."
                                            value={form.company}
                                            onChange={(e) => updateForm('company', e.target.value)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="ref-input-group">
                                    <label className="ref-label text-[10px]">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="ref-input"
                                        placeholder="••••••••••••"
                                        value={form.password}
                                        onChange={(e) => updateForm('password', e.target.value)}
                                    />
                                </div>

                                <div className="ref-input-group">
                                    <label className="ref-label text-[10px]">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="ref-input"
                                        placeholder="••••••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) => updateForm('confirmPassword', e.target.value)}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 bg-red-950/20 border-l border-[#E63946] text-[10px] font-black uppercase tracking-widest text-[#E63946]"
                                    >
                                        System Denial: {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading || !passwordMatch}
                                className="ref-btn-red"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <span className="text-xl">→</span>
                                    </>
                                )}
                            </button>

                            <div className="pt-8 border-t border-[#111]">
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google Failed')}
                                        theme="filled_black"
                                        shape="square"
                                        width="100%"
                                        text="signup_with"
                                    />
                                </div>
                            </div>

                            <p className="mt-8 text-center text-[10px] text-gray-800 font-extrabold uppercase tracking-[0.4em]">
                                Already registered? <Link to="/login" className="text-[#E63946] hover:text-white transition-colors">Login here</Link>
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
                            Build your own <br />
                            <span className="text-[#E63946]">elite cohort.</span>
                        </h2>
                        <p className="ref-subtext mb-16 text-lg">
                            Join over 500+ enterprises who have revolutionized their hiring pipeline through our behavioral intelligence engine.
                        </p>

                        <div className="ref-testimonial">
                            <div className="flex gap-1 text-[#E63946] mb-4">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-xl">★</span>) }
                            </div>
                            <p className="text-xl italic font-medium leading-relaxed mb-8 text-gray-300">
                                "The transition was instantaneous. InnovAIte unified our global inventory vectors perfectly."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#111] rounded-full border border-white/5 flex items-center justify-center font-black">S</div>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-widest">Sarah K.</div>
                                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Director of Growth, NextGen</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}



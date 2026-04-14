/**
 * RecruiterProfile.jsx
 * Recruiter settings + Google Calendar sync management.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TfiUser,
    TfiEmail,
    TfiBriefcase,
    TfiCheck,
    TfiReload,
    TfiBolt,
    TfiShield,
    TfiLink,
    TfiClose,
    TfiLock,
    TfiWrite,
} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import '../../styles/hr.css';

export default function RecruiterProfile() {
    const { user, refreshUser } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || '',
        company_name: user?.company_name || '',
        designation: user?.designation || '',
        company_values: (user?.company_values || []).join(', '),
        bio: user?.bio || '',
    });

    const [passForm, setPassForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [saving, setSaving] = useState(false);
    const [savingPass, setSavingPass] = useState(false);
    const [syncingGoogle, setSyncingGoogle] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const hasGoogleSync = user?.has_google_sync;

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await authService.updateProfile({
                name: form.name,
                company_name: form.company_name,
                designation: form.designation,
                company_values: form.company_values.split(',').map(v => v.trim()).filter(Boolean),
                bio: form.bio,
            });
            await refreshUser();
            showMsg('success', 'Profile synchronized with core node.');
        } catch {
            showMsg('error', 'Sync failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passForm.new_password !== passForm.confirm_password) {
            return showMsg('error', 'Password fields do not match.');
        }
        setSavingPass(true);
        try {
            await authService.changePassword(passForm);
            setPassForm({ old_password: '', new_password: '', confirm_password: '' });
            showMsg('success', 'Access keys rotated successfully.');
        } catch (err) {
            showMsg('error', err.response?.data?.error || 'Password change failed.');
        } finally {
            setSavingPass(false);
        }
    };

    const handleGoogleSync = async () => {
        setSyncingGoogle(true);
        try {
            const res = await authService.getGoogleAuthUrl();
            const url = res.data?.url;
            if (url) {
                // Redirect the full browser window — Google OAuth requires a full redirect
                window.location.href = url;
            } else {
                showMsg('error', 'Google integration is not configured. Please contact support.');
                setSyncingGoogle(false);
            }
        } catch (err) {
            showMsg('error', err.response?.data?.error || 'Google sync failed. Please check configuration.');
            setSyncingGoogle(false);
        }
    };

    return (
        <div className="hr-content max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12">
                <h1 className="hr-heading">Recruiter Profile</h1>
                <p className="hr-subheading mt-2">Node Identity · Integration Management · Security</p>
            </div>

            {/* Status Banner */}
            {msg.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-10 p-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-4 ${msg.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'}`}
                >
                    {msg.type === 'success' ? <TfiCheck /> : <TfiClose />}
                    {msg.text}
                </motion.div>
            )}

            <div className="space-y-10">
                {/* 1. Profile Info */}
                <div className="hr-card p-10">
                    <h3 className="hr-subheading flex items-center gap-3 mb-10 border-l-4 border-hr-red pl-4">
                        <TfiUser className="text-hr-red" /> Identity Configuration
                    </h3>
                    <form onSubmit={handleSaveProfile} className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="hr-label">Full Name</label>
                                <input
                                    className="hr-input"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label className="hr-label">Email (read-only)</label>
                                <input
                                    className="hr-input opacity-50 cursor-not-allowed"
                                    value={user?.email || ''}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="hr-label">Company / Organization</label>
                                <input
                                    className="hr-input"
                                    value={form.company_name}
                                    onChange={e => setForm({ ...form, company_name: e.target.value })}
                                    placeholder="e.g. InnovAIte Corp"
                                />
                            </div>
                            <div>
                                <label className="hr-label">Designation / Role</label>
                                <input
                                    className="hr-input"
                                    value={form.designation}
                                    onChange={e => setForm({ ...form, designation: e.target.value })}
                                    placeholder="e.g. Head of Talent Acquisition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="hr-label">Company Values (comma-separated)</label>
                            <input
                                className="hr-input"
                                value={form.company_values}
                                onChange={e => setForm({ ...form, company_values: e.target.value })}
                                placeholder="e.g. Integrity, Innovation, Precision"
                            />
                        </div>

                        <div>
                            <label className="hr-label">Bio / About</label>
                            <textarea
                                className="hr-input h-28"
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                placeholder="Brief description of your recruitment focus..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-hr-primary w-full py-4"
                        >
                            {saving ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                            {saving ? 'SYNCHRONIZING...' : 'SAVE PROFILE'}
                        </button>
                    </form>
                </div>

                {/* 2. Google Calendar Sync */}
                <div className="hr-card p-10">
                    <h3 className="hr-subheading flex items-center gap-3 mb-2 border-l-4 border-hr-red pl-4">
                        <TfiLink className="text-hr-red" /> Google Calendar Integration
                    </h3>
                    <p className="text-[10px] font-black uppercase text-hr-text-muted tracking-widest mb-10 pl-5">
                        Connect your Google account to auto-generate Meet links when scheduling interviews.
                    </p>

                    {/* Status Card */}
                    <div className={`rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-2 transition-all ${hasGoogleSync
                        ? 'bg-green-50 border-green-200'
                        : 'bg-hr-bg border-hr-border'}`}
                    >
                        <div className="flex items-center gap-6">
                            {/* Google "G" Icon */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${hasGoogleSync ? 'bg-green-600 text-white' : 'bg-white border-2 border-hr-border text-gray-400'}`}>
                                G
                            </div>
                            <div>
                                <div className={`text-sm font-black uppercase italic tracking-tight mb-1 ${hasGoogleSync ? 'text-green-700' : 'text-hr-text-main'}`}>
                                    {hasGoogleSync ? 'Google Calendar Connected' : 'Google Calendar Not Synced'}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-hr-text-muted">
                                    {hasGoogleSync
                                        ? 'Auto Meet link generation is active · Click to re-sync'
                                        : 'Click below to authorize Google Calendar access'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            {hasGoogleSync && (
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-green-600 tracking-widest bg-green-100 px-4 py-2 rounded-xl border border-green-200">
                                    <TfiCheck /> Synced & Active
                                </div>
                            )}
                            <button
                                onClick={handleGoogleSync}
                                disabled={syncingGoogle}
                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg ${hasGoogleSync
                                    ? 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600'
                                    : 'bg-black text-white hover:bg-red-600'}`}
                            >
                                {syncingGoogle
                                    ? <><TfiReload className="animate-spin" /> Connecting...</>
                                    : <><TfiLink /> {hasGoogleSync ? 'Re-sync Google' : 'Connect Google Calendar'}</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="mt-8 grid grid-cols-3 gap-6">
                        {[
                            { step: '01', text: 'Click "Connect Google Calendar" above' },
                            { step: '02', text: 'Approve Calendar access in Google consent screen' },
                            { step: '03', text: 'Schedule interviews with auto-generated Meet links' },
                        ].map(s => (
                            <div key={s.step} className="p-6 bg-hr-bg rounded-2xl border border-hr-border">
                                <div className="text-3xl font-black text-hr-border italic mb-3">{s.step}</div>
                                <div className="text-[10px] font-black uppercase text-hr-text-muted tracking-wide leading-relaxed">{s.text}</div>
                            </div>
                        ))}
                    </div>

                    {/* Credential warning if not configured */}
                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <div className="mt-6 p-5 bg-yellow-50 border border-yellow-200 rounded-2xl text-[10px] font-black uppercase text-yellow-700 tracking-widest flex items-center gap-3">
                            <TfiShield /> Google Calendar integration is not fully configured. Please contact your system administrator.
                        </div>
                    )}
                </div>

                {/* 3. Security — Change Password */}
                <div className="hr-card p-10">
                    <h3 className="hr-subheading flex items-center gap-3 mb-10 border-l-4 border-hr-red pl-4">
                        <TfiLock className="text-hr-red" /> Security Node
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-8">
                        <div>
                            <label className="hr-label">Current Password</label>
                            <input
                                type="password"
                                className="hr-input"
                                value={passForm.old_password}
                                onChange={e => setPassForm({ ...passForm, old_password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="hr-label">New Password</label>
                                <input
                                    type="password"
                                    className="hr-input"
                                    value={passForm.new_password}
                                    onChange={e => setPassForm({ ...passForm, new_password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="hr-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="hr-input"
                                    value={passForm.confirm_password}
                                    onChange={e => setPassForm({ ...passForm, confirm_password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={savingPass}
                            className="btn-hr-primary w-full py-4"
                        >
                            {savingPass ? <TfiReload className="animate-spin" /> : <TfiShield />}
                            {savingPass ? 'ROTATING KEYS...' : 'ROTATE ACCESS KEYS'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

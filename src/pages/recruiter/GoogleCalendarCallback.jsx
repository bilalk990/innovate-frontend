/**
 * GoogleCalendarCallback.jsx
 * Google redirects here after recruiter approves Calendar access.
 * URL: /recruiter/google-callback?code=...&state=...
 * This page reads the code, sends it to backend, then redirects.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TfiCheck, TfiAlert, TfiReload } from 'react-icons/tfi';
import authService from '../../services/authService';

export default function GoogleCalendarCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            setErrorMsg('Google access was denied. You can try syncing again from your profile.');
            setStatus('error');
            return;
        }

        if (!code) {
            setErrorMsg('No authorization code received from Google.');
            setStatus('error');
            return;
        }

        const exchangeCode = async () => {
            try {
                await authService.syncGoogleCallback(code);
                setStatus('success');
                // Redirect to recruiter profile after 2.5s
                setTimeout(() => navigate('/recruiter/profile'), 2500);
            } catch (err) {
                const msg = err.response?.data?.error || 'Failed to sync Google account. Please try again.';
                setErrorMsg(msg);
                setStatus('error');
            }
        };

        exchangeCode();
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] max-w-lg w-full p-16 text-center shadow-2xl"
            >
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <TfiReload className="text-red-600 text-3xl animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">
                            Syncing Google Calendar
                        </h2>
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest italic">
                            Exchanging authorization tokens...
                        </p>
                        <div className="mt-8 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: '80%' }}
                                transition={{ duration: 2, ease: 'easeOut' }}
                                className="h-full bg-red-600"
                            />
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="w-20 h-20 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/30"
                        >
                            <TfiCheck className="text-white text-3xl" />
                        </motion.div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-gray-900">
                            Google Calendar Synced!
                        </h2>
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest italic mb-8">
                            Google Meet links will now auto-generate when scheduling interviews.
                        </p>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-[10px] font-black uppercase text-green-600 tracking-widest">
                            Redirecting to profile...
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/30">
                            <TfiAlert className="text-white text-3xl" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-gray-900">
                            Sync Failed
                        </h2>
                        <p className="text-[11px] font-medium text-gray-500 mb-10 leading-relaxed">
                            {errorMsg}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/recruiter/profile')}
                                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-gray-400 transition-colors"
                            >
                                Back to Profile
                            </button>
                            <button
                                onClick={() => navigate('/recruiter/dashboard')}
                                className="flex-1 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                            >
                                Dashboard
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

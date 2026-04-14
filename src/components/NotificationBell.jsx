import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiBell, TfiClose, TfiCheck, TfiPulse, TfiTarget, TfiAngleRight } from 'react-icons/tfi';
import { useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await reportService.getUnreadCount();
            setUnreadCount(res.data?.unread_count ?? 0);
        } catch { /* silent */ }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await reportService.getNotifications();
            setNotifications(res.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        intervalRef.current = setInterval(fetchUnreadCount, 30000);
        
        // Handle clicks outside to close dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(intervalRef.current);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [fetchUnreadCount]);

    const handleToggleOpen = () => {
        const nextState = !open;
        setOpen(nextState);
        if (nextState) fetchNotifications();
    };

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        try {
            await reportService.markAllRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch { /* silent */ }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await reportService.markRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            } catch { /* silent */ }
        }
        setOpen(false);
        if (notification.link) navigate(notification.link);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleOpen}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center relative transition-all duration-500 border overflow-hidden ${open ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-red-600 hover:border-white/10'}`}
            >
                <TfiBell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                {unreadCount > 0 && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"
                    />
                )}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute right-0 top-16 w-[400px] bg-black rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 z-[100] overflow-hidden backdrop-blur-3xl"
                    >
                        {/* Dropdown Header */}
                        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">
                                    Signal Intel
                                </h3>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-2 italic">
                                    Sector Alpha-7 Alerts
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-white transition-colors"
                                    >
                                        Neutralize All
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <TfiClose size={14} />
                                </button>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="max-h-[480px] overflow-y-auto panel-scrollbar bg-transparent">
                            {loading && (
                                <div className="p-20 text-center flex flex-col items-center gap-6">
                                    <div className="w-10 h-10 rounded-xl border border-red-600/30 flex items-center justify-center">
                                        <TfiPulse className="text-red-600 animate-pulse text-xl" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-gray-700 tracking-[0.4em] italic animate-pulse">
                                        Syncing neural links...
                                    </p>
                                </div>
                            )}
                            
                            {!loading && notifications.length === 0 && (
                                <div className="p-24 text-center group">
                                    <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-8 transition-transform duration-700 group-hover:scale-110">
                                        <TfiTarget size={24} className="text-gray-800 group-hover:text-red-600/30 transition-colors" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase text-gray-500 tracking-[0.6em] italic leading-none mb-3">
                                        Terminal Silent
                                    </p>
                                    <p className="text-[8px] font-black uppercase text-gray-800 tracking-widest italic opacity-50">
                                        No external signals detected in sector.
                                    </p>
                                </div>
                            )}

                            {!loading && notifications.map((n, i) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`px-8 py-6 border-b border-white/5 cursor-pointer hover:bg-white/[0.03] transition-all flex gap-6 relative group ${!n.is_read ? 'bg-red-600/[0.02]' : ''}`}
                                >
                                    {!n.is_read && <div className="absolute left-0 top-6 bottom-6 w-1 bg-red-600 shadow-[2px_0_10px_rgba(220,38,38,0.5)] rounded-r-full" />}
                                    
                                    <div className={`shrink-0 w-2 h-2 rounded-full mt-2 transition-all duration-500 ${!n.is_read ? 'bg-red-600 scale-125 shadow-[0_0_8px_#dc2626]' : 'bg-white/10'}`} />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className={`text-[12px] font-black uppercase italic tracking-widest leading-none ${!n.is_read ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                                {n.title || 'ARCHIVED SIGNAL'}
                                            </p>
                                            <span className="text-[8px] font-black uppercase text-gray-800 tracking-widest italic group-hover:text-red-500 transition-colors shrink-0">
                                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 font-medium italic opacity-60 group-hover:opacity-100 transition-opacity leading-relaxed pr-8">
                                            {n.message || 'Encrypted biological signal received from remote sector.'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-red-600 italic">Decrypt Signal</div>
                                            <TfiAngleRight className="text-red-600" size={10} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Archive Footer */}
                        {!loading && notifications.length > 0 && (
                            <div className="p-6 bg-white/[0.01] border-t border-white/5">
                                <button className="w-full py-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 hover:text-white transition-all text-center italic hover:bg-white/5 rounded-2xl">
                                    Enter Archives Log
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TfiUser, 
  TfiEmail, 
  TfiShield, 
  TfiTrash, 
  TfiSearch, 
  TfiPulse, 
  TfiTarget,
  TfiReload,
  TfiLock,
  TfiPowerOff,
  TfiAngleRight,
  TfiHarddrives,
  TfiMedall
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import authService from '../../services/authService';
import Loader from '../../components/Loader';
import { toast } from 'sonner';

export default function Users() {
    const { data: users, loading, error, refetch } = useFetch(authService.getUsers);
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return <Loader fullScreen text="Synchronizing Users..." />;
    if (error) return (
        <div className="flex flex-col items-center justify-center py-48 elite-glass-panel border-red-600/20 bg-red-600/5 mx-10">
            <TfiLock className="text-7xl text-red-600 mb-8 animate-bounce transition-transform" />
            <h2 className="text-2xl font-black uppercase italic tracking-widest text-white">ACCESS DENIED</h2>
            <p className="text-[10px] font-black uppercase text-red-600/60 mt-4 tracking-[0.4em] italic">Unable to verify administrator permissions for platform access.</p>
        </div>
    );

    const usersArray = Array.isArray(users) ? users : (users?.results || []);
    const filteredUsers = usersArray.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = async (user) => {
        try {
            await authService.toggleStatus(user.id);
            toast.success(`USER STATUS UPDATED: ${user.name.toUpperCase()}`);
            refetch();
        } catch (err) {
            toast.error('ERROR: Unable to update user status.');
        }
    };

    return (
        <div className="animate-fade-in pb-20 px-6 max-w-7xl mx-auto">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
                <div>
                    <h1 className="elite-tactical-header">User Directory</h1>
                    <p className="elite-sub-header mt-2 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] italic">User Management · Global Region</p>
                </div>
                
                <div className="header-search md:max-w-xl w-full relative group">
                    <TfiSearch className="text-red-700 z-10 absolute left-6 top-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
                    <input 
                        type="text" 
                        placeholder="SEARCH USERS BY NAME OR EMAIL..." 
                        className="w-full h-16 bg-gray-50 border border-gray-200 rounded-[1.5rem] pl-16 pr-8 text-[11px] font-black uppercase italic tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-red-600/40 focus:bg-white transition-all focus:shadow-[0_0_20px_#dc262611]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* User Data Table */}
            <div className="elite-glass-panel p-0 overflow-hidden bg-white border-gray-100 relative group shadow-2xl">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/[0.01] blur-[150px] pointer-events-none" />
                
                <div className="overflow-x-auto scrollbar-tactical">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">User Identity</th>
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Role</th>
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Status</th>
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((u, idx) => (
                                    <motion.tr 
                                        key={u.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-all group/row"
                                    >
                                        <td className="py-8 px-12 border-l-4 border-transparent group-hover/row:border-red-600 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-red-600 flex items-center justify-center text-xl font-black italic shadow-xl group-hover/row:bg-red-600 group-hover/row:text-white transition-all duration-700">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-[14px] font-black text-gray-950 uppercase italic tracking-widest leading-none mb-2">{u.name || 'ANONYMOUS USER'}</div>
                                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-tighter flex items-center gap-2 group-hover/row:text-red-500 transition-colors">
                                                        <TfiEmail className="text-red-700 opacity-40" /> {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-12">
                                            <div className={`text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-xl border italic shadow-xl transition-all ${u.role === 'admin' ? 'bg-red-600 text-white border-white/20' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                <TfiShield className={`inline mr-3 ${u.role === 'admin' ? 'text-white' : 'text-red-600 opacity-60'}`} />
                                                {u.role}
                                            </div>
                                        </td>
                                        <td className="py-8 px-12">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2.5 h-2.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-600 shadow-[0_0_10px_#dc2626] animate-pulse'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest italic ${u.is_active ? 'text-emerald-500' : 'text-red-600'}`}>
                                                    {u.is_active ? 'Operational' : 'Suspended'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-12 text-right">
                                            <div className="flex justify-end gap-5">
                                                <button 
                                                    onClick={() => toggleStatus(u)}
                                                    className={`w-12 h-12 rounded-2xl border transition-all shadow-xl flex items-center justify-center text-xl group/btn ${u.is_active ? 'bg-red-600/5 border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-600/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'}`}
                                                >
                                                    <TfiPowerOff className="group-hover/btn:rotate-180 transition-transform duration-700" />
                                                </button>
                                                <button className="w-12 h-12 rounded-2xl bg-white/[0.01] border border-white/5 text-gray-800 hover:text-white hover:border-red-600/30 transition-all flex items-center justify-center text-xl shadow-inner">
                                                    <TfiTarget />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-48 text-center bg-white/[0.01]">
                        <TfiHarddrives className="text-8xl text-gray-900 mx-auto mb-10 opacity-10 animate-pulse" />
                        <h3 className="text-xl font-black uppercase italic text-gray-800 tracking-[0.5em]">User Directory Empty</h3>
                        <p className="text-[10px] font-black uppercase text-gray-950 tracking-[0.3em] mt-6 italic opacity-20">NO USERS MATCHING CURRENT SEARCH</p>
                    </div>
                )}
            </div>

            {/* System Status Log */}
            <div className="mt-12 text-center overflow-hidden">
                <p className="text-[11px] font-black text-gray-950 uppercase tracking-[2.5em] italic opacity-20 whitespace-nowrap"> Registry Global · Displaying {filteredUsers.length} Users </p>
            </div>
        </div>
    );
}

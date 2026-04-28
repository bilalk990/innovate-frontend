import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import NotificationBell from './NotificationBell';
import { TfiSearch, TfiLayoutGrid2, TfiSettings } from 'react-icons/tfi';

export default function Navbar() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            const role = user?.role || 'candidate';
            const path = role === 'recruiter' ? `/${role}/candidates` : `/${role}/jobs`;
            navigate(`${path}?search=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    };

    return (
    <header 
      className="fixed top-0 right-0 z-40 px-10 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl transition-all duration-700"
      style={{ left: 'var(--sidebar-width)', height: '80px', width: 'calc(100% - var(--sidebar-width))' }}
    >
            {/* Search Terminal */}
            <div className="flex items-center gap-6">
                <div className="relative group w-[400px]">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-red-600 transition-transform group-hover:scale-110 duration-500">
                        <TfiSearch size={16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full pl-14 pr-20 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black text-gray-900 placeholder-gray-400 uppercase tracking-[0.2em] italic focus:outline-none focus:border-red-600/50 focus:bg-white transition-all shadow-sm"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-40">
                        <span className="px-1.5 py-0.5 rounded border border-gray-200 text-[8px] font-black text-gray-400">CMD</span>
                        <span className="text-[8px] font-black text-gray-400">K</span>
                    </div>
                </div>
            </div>

            {/* Tactical Actions */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 border-r border-gray-100 pr-8">
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-all">
                        <TfiLayoutGrid2 size={18} />
                    </button>
                    <NotificationBell />
                    <button 
                      onClick={() => navigate('/candidate/settings')}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-all"
                    >
                        <TfiSettings size={18} />
                    </button>
                </div>
                
                {/* User Terminal */}
                <div 
                    className="flex items-center gap-5 group cursor-pointer active:scale-95 transition-all" 
                    onClick={() => navigate(user?.role === 'recruiter' ? '/recruiter/profile' : '/candidate/profile')}
                >
                    <div className="text-right hidden sm:block">
                        <div className="text-[12px] font-black text-gray-900 uppercase italic tracking-widest group-hover:text-red-600 transition-colors leading-none mb-1">
                            {user?.name || 'User'}
                        </div>
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] italic font-medium">
                            {user?.role?.toUpperCase() || 'USER'} PANEL
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black italic shadow-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-500 text-xl border border-white/10">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
}

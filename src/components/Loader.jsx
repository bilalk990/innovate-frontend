import { motion } from 'framer-motion';
import { TfiPulse, TfiShield, TfiBolt, TfiReload } from 'react-icons/tfi';
import { useMemo } from 'react';

const STATUS_MESSAGES = [
    'Preparing your dashboard...',
    'Loading account data...',
    'Optimizing profile settings...',
    'Verifying credentials...',
    'Analyzing candidate data...',
    'Connecting to secure server...',
    'Updating local registry...',
];

export default function Loader({ text, fullScreen = false }) {
  // Use useMemo to ensure random message is only calculated once per mount
  const randomMsg = useMemo(() => 
    STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)],
    []
  );
  const displayMsg = text || randomMsg;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-2xl border-2 border-red-600/20"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center text-red-600 text-3xl"
        >
          <TfiPulse className="animate-pulse" />
        </motion.div>
        
        {/* Glow rings */}
        <div className="absolute inset-[-20px] rounded-full border border-red-600/5 animate-pulse" />
        <div className="absolute inset-[-40px] rounded-full border border-red-600/2 animate-[ping_3s_infinite]" />
      </div>

      <div className="text-center space-y-2">
        <h4 className="text-[10px] font-black uppercase text-red-500 tracking-[0.4em] animate-pulse">Secure Loading</h4>
        <p className="text-xs font-black uppercase italic text-gray-400 tracking-widest">{displayMsg}</p>
      </div>

      <div className="flex gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[9999] flex items-center justify-center overflow-hidden">
        {/* Modern high-contrast scan effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.03)_0%,_transparent_80%)]" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent animate-[shimmer_2s_infinite]" />
        <div className="relative z-10">
            {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
}

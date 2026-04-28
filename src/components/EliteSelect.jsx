import React from 'react';

export default function EliteSelect({ label, value, onChange, options, placeholder, icon: Icon, error }) {
    return (
        <div className="elite-form-group">
            {label && <label className={`elite-label ${error ? 'text-red-600' : ''}`}>{label}</label>}
            <div className={`relative group ${error ? 'animate-wiggle' : ''}`}>
                {Icon && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 z-20 flex items-center justify-center pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`elite-input cursor-pointer appearance-none ${Icon ? '!pl-[70px]' : ''} ${error ? 'border-red-600' : 'border-black'} hover:border-red-600 transition-all focus:ring-0`}
                >
                    <option value="" disabled>{placeholder || 'Select Option'}</option>
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt.value || opt}>{opt.label || opt}</option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-black opacity-30 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-[9px] font-black text-red-600 uppercase mt-2 italic tracking-widest">{error}</p>}
        </div>
    );
}

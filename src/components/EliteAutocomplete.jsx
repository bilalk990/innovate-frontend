import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EliteAutocomplete({ label, value, onChange, suggestions, onSelect, placeholder, error }) {
    const [inputValue, setInputValue] = useState(value || '');
    const [filtered, setFiltered] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const containerRef = useRef(null);

    // Sync inputValue with external value prop
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        if (inputValue.trim()) {
            const matches = suggestions.filter(s => 
                s.toLowerCase().includes(inputValue.toLowerCase())
            ).slice(0, 8);
            setFiltered(matches);
            setShowOptions(true);
        } else {
            setFiltered([]);
            setShowOptions(false);
        }
    }, [inputValue, suggestions]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (s) => {
        onSelect(s);
        setInputValue(s);
        setShowOptions(false);
    };

    return (
        <div className="elite-form-group relative" ref={containerRef}>
            {label && <label className={`elite-label ${error ? 'text-red-600' : ''}`}>{label}</label>}
            <div className={`relative ${error ? 'animate-wiggle' : ''}`}>
                <input
                    type="text"
                    className={`elite-input ${error ? 'border-red-600' : 'border-gray-100'} focus:border-red-600 transition-all font-bold placeholder:italic`}
                    placeholder={placeholder || "Type to search..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filtered.length > 0) handleSelect(filtered[0]);
                            else if (inputValue.trim()) handleSelect(inputValue.trim());
                        }
                    }}
                />
            </div>

            <AnimatePresence>
                {showOptions && filtered.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {filtered.map((s, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelect(s)}
                                className="px-6 py-4 hover:bg-red-600 hover:text-white cursor-pointer transition-all font-black text-[11px] uppercase italic tracking-widest border-b border-gray-50 last:border-none"
                            >
                                {s}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {error && <p className="text-[9px] font-black text-red-600 uppercase mt-2 italic tracking-widest">{error}</p>}
        </div>
    );
}

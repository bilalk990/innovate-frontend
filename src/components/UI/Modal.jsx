import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div>
                    <h3>{title}</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
    },
    modal: {
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-light)',
    },
    title: { fontWeight: 700, fontSize: '1.05rem' },
    closeBtn: {
        background: 'none', border: 'none', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem',
        borderRadius: 6, transition: 'var(--transition)',
    },
    body: { padding: '1.5rem' },
};

import { Component } from 'react';

/**
 * Error Boundary to catch React errors and prevent white screen of death
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary:', error, errorInfo);
        
        // Auto-recovery for Chunk/Asset loading errors (Vite specific)
        const isChunkError = error.name === 'ChunkLoadError' || 
                           error.message?.includes('preload') || 
                           error.message?.includes('import') ||
                           error.message?.includes('dynamically imported') ||
                           error.message?.includes('module script');
                           
        if (isChunkError) {
            console.warn('Vite Chunk Error detected. Attempting auto-recovery...');
            const hasReloaded = sessionStorage.getItem('last_chunk_error_reload');
            const now = Date.now();
            
            // Only auto-reload once every 10 seconds to avoid loops
            if (!hasReloaded || now - parseInt(hasReloaded) > 10000) {
                sessionStorage.setItem('last_chunk_error_reload', now.toString());
                window.location.reload();
                return;
            }
        }
    }

    handleReload = () => {
        sessionStorage.removeItem('last_chunk_error_reload');
        window.location.href = window.location.origin + window.location.pathname + '?r=' + Date.now();
    }

    handleHardReset = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = window.location.origin + window.location.pathname;
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.iconContainer}>
                            <div style={styles.icon}>!</div>
                        </div>
                        <h1 style={styles.title}>System Recovery</h1>
                        <p style={styles.message}>
                            An unexpected interface error occurred. Our self-healing system is ready to restore your session.
                        </p>
                        
                        <div style={styles.buttonGroup}>
                            <button 
                                onClick={this.handleReload}
                                style={styles.primaryButton}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Restore Interface
                            </button>
                            <button 
                                onClick={this.handleHardReset}
                                style={styles.secondaryButton}
                            >
                                Reset System State
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: 'white',
        padding: '20px',
    },
    card: {
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '32px',
        padding: '4rem 3rem',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    },
    iconContainer: {
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        color: '#dc2626',
        fontSize: '32px',
        fontWeight: '900',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '900',
        marginBottom: '1rem',
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        fontStyle: 'italic',
    },
    message: {
        color: '#999999',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        marginBottom: '2.5rem',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    primaryButton: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        padding: '16px',
        fontSize: '0.85rem',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    },
    secondaryButton: {
        background: 'transparent',
        color: '#666666',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '14px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    pre: {
        background: '#000',
        color: '#6b7280',
        padding: '1.25rem',
        borderRadius: '12px',
        overflow: 'auto',
        marginTop: '0.75rem',
        border: '1px solid rgba(255,255,255,0.05)',
        fontSize: '11px',
        lineHeight: '1.4',
    },
};

export default ErrorBoundary;

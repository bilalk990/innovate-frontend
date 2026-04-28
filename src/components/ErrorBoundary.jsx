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

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.icon}>⚠️</div>
                        <h1 style={styles.title}>Something went wrong</h1>
                        <p style={styles.message}>
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('last_chunk_error_reload');
                                window.location.href = window.location.origin + window.location.pathname + '?r=' + Date.now();
                            }}
                            style={styles.button}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Refresh Page
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <details style={styles.details}>
                                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#667eea' }}>Error Details (Dev Only)</summary>
                                <pre style={styles.pre}>{this.state.error.toString()}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif',
    },
    card: {
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '3.5rem',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    icon: {
        fontSize: '3rem',
        marginBottom: '1.5rem',
        filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.3))',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 900,
        marginBottom: '1rem',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '-0.025em',
        fontStyle: 'italic',
    },
    message: {
        fontSize: '0.95rem',
        color: '#9ca3af',
        marginBottom: '2.5rem',
        lineHeight: 1.6,
    },
    button: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '1rem 2.5rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: 900,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
    details: {
        marginTop: '2.5rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '1.5rem',
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

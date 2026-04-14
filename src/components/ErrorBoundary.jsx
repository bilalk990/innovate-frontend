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
        // Log to error reporting service in production
        if (import.meta.env.PROD) {
            // TODO: Send to error tracking service (Sentry, etc.)
            console.error('React Error:', error, errorInfo);
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
                            onClick={() => window.location.reload()}
                            style={styles.button}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🔄 Refresh Page
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    icon: {
        fontSize: '4rem',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: '#1a202c',
    },
    message: {
        fontSize: '1rem',
        color: '#4a5568',
        marginBottom: '2rem',
        lineHeight: 1.6,
    },
    button: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    details: {
        marginTop: '2rem',
        textAlign: 'left',
        fontSize: '0.875rem',
    },
    pre: {
        background: '#f7fafc',
        padding: '1rem',
        borderRadius: '8px',
        overflow: 'auto',
        marginTop: '0.5rem',
    },
};

export default ErrorBoundary;

import { Link } from 'react-router-dom';
import { TfiShield } from 'react-icons/tfi';

export default function PublicNavbar() {
    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: '24px 80px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
            {/* Logo with gradient background */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                <img src="/logo.png" alt="InnovAIte" style={{ height: '60px', width: 'auto' }} />
                <span style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    letterSpacing: '-0.8px',
                    color: '#0a0a0a'
                }}>
                    Innov<span style={{ color: '#dc2626' }}>AI</span>te
                </span>
            </Link>

            {/* Navigation Links Removed as Requested */}
            <div style={{ flex: 1 }} />

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Link to="/login" style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0a0a0a',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'color 0.3s ease'
                }}>
                    Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                    Get Started
                </Link>
            </div>
        </nav>
    );
}

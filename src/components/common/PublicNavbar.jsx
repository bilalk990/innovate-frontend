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
            background: 'rgba(5, 5, 5, 0.8)',
            backdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            {/* Logo with gradient background */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <TfiShield size={24} color="#dc2626" />
                </div>
                <span style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    letterSpacing: '-0.8px',
                    color: '#FFFFFF'
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
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
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

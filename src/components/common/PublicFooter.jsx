import { TfiShield } from 'react-icons/tfi';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6';

export default function PublicFooter() {
    return (
        <footer style={{
            background: '#0a0a0a',
            padding: '100px 80px 40px',
            color: '#fff',
            borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: '60px',
                marginBottom: '80px'
            }}>
                {/* Brand Column */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #262626 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}>
                            <TfiShield size={20} color="#dc2626" />
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                            Innov<span style={{ color: '#dc2626' }}>AI</span>te
                        </span>
                    </div>
                    <p style={{
                        fontSize: '14px',
                        color: '#a3a3a3',
                        lineHeight: 1.6,
                        marginBottom: '32px',
                        maxWidth: '280px'
                    }}>
                        Empowering the next generation of recruitment with behavioral intelligence and neural-grade analytics.
                    </p>

                    {/* Social Icons */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {[
                            { name: 'Twitter', icon: <FaTwitter size={18} /> },
                            { name: 'Github', icon: <FaGithub size={18} /> },
                            { name: 'Linkedin', icon: <FaLinkedin size={18} /> }
                        ].map((social) => (
                            <button
                                key={social.name}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: '0.3s',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.borderColor = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                {social.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Links Columns */}
                {[
                    { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Enterprise'] },
                    { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
                    { title: 'Resources', links: ['Documentation', 'Help Center', 'Security', 'Privacy'] }
                ].map((category) => (
                    <div key={category.title}>
                        <h4 style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            marginBottom: '24px',
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {category.title}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {category.links.map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    style={{
                                        fontSize: '14px',
                                        color: '#a3a3a3',
                                        textDecoration: 'none',
                                        transition: '0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <p style={{ fontSize: '14px', color: '#737373', margin: 0 }}>
                    © 2026 InnovAIte. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#059669',
                        boxShadow: '0 0 10px #059669'
                    }} />
                    <span style={{ fontSize: '13px', color: '#a3a3a3', fontWeight: 600 }}>
                        All Systems Operational
                    </span>
                </div>
            </div>
        </footer>
    );
}

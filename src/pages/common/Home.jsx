import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    TfiShield, 
    TfiBolt, 
    TfiStatsUp, 
    TfiStar, 
    TfiAngleRight,
    TfiPulse,
    TfiTarget,
    TfiLayoutGrid4,
    TfiUser,
    TfiWorld,
    TfiTimer,
    TfiLock,
    TfiHeadphoneAlt,
    TfiPencilAlt,
    TfiLineDouble,
    TfiEye,
    TfiCommentAlt,
    TfiControlForward,
    TfiBriefcase,
    TfiInfinite
} from 'react-icons/tfi';
import { FaBrain, FaLayerGroup, FaMicrochip, FaShieldHalved, FaScaleUnbalanced, FaLanguage, FaRobot } from 'react-icons/fa6';

export default function Home() {
    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            {/* Hero Section */}
            <section id="hero" style={{
                padding: '120px 80px 100px',
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'flex',
                gap: '80px',
                alignItems: 'center',
                position: 'relative'
            }}>
                {/* Background Glows */}
                <div className="glow-bg" style={{ top: '-100px', left: '-100px' }} />
                
                {/* Left Content */}
                <div style={{ flex: '1 1 50%', maxWidth: '640px' }} className="animate-fade-in-up">
                    {/* Animated Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 20px',
                        borderRadius: '30px',
                        background: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        marginBottom: '32px'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#dc2626',
                            animation: 'pulse-glow 2s infinite'
                        }} />
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#0a0a0a',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                        }}>
                            AI-Powered Interview Intelligence
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 style={{
                        fontSize: '72px',
                        fontWeight: 900,
                        lineHeight: 1.05,
                        letterSpacing: '-2.5px',
                        margin: '0 0 28px',
                        color: '#0a0a0a'
                    }}>
                        Master the Art of <br />
                        <span style={{ position: 'relative', display: 'inline-block' }}>
                            <span style={{ position: 'relative', zIndex: 2, color: '#dc2626' }}>
                                Elite Hiring
                            </span>
                            <div style={{
                                position: 'absolute',
                                bottom: '6px',
                                left: '-2px',
                                right: '-8px',
                                height: '24px',
                                background: 'rgba(220,38,38,0.15)',
                                zIndex: 1,
                                transform: 'rotate(-2deg)'
                            }} />
                        </span>
                        <br />
                        Decisions.
                    </h1>

                    {/* Subheadline */}
                    <p style={{
                        fontSize: '20px',
                        color: '#525252',
                        lineHeight: 1.6,
                        margin: '0 0 48px',
                        maxWidth: '540px',
                        fontWeight: 400
                    }}>
                        Break through recruitment barriers with AI-driven behavioral diagnostics, real-time proctoring, and predictive performance analytics.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Link to="/register" className="btn-primary" style={{
                            padding: '16px 36px',
                            fontSize: '16px',
                            borderRadius: '14px'
                        }}>
                            Get Started
                        </Link>
                        <Link to="/features" className="btn-outline" style={{
                            padding: '16px 36px',
                            fontSize: '16px',
                            borderRadius: '14px'
                        }}>
                            Learn More
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '48px',
                        padding: '20px',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ display: 'flex' }}>
                            {[1,2,3,4].map((i) => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                    alt="user"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '2px solid #fff',
                                        marginLeft: i > 1 ? '-12px' : 0,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                        <div>
                            <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                                {[1,2,3,4,5].map((s) => (
                                    <TfiStar key={s} size={14} fill="#dc2626" color="#dc2626" />
                                ))}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#525252' }}>
                                Trusted by 10,000+ recruiters
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side - 3D Image/Asset */}
                <div style={{ flex: '1 1 50%', position: 'relative' }} className="animate-fade-in-up delay-200">
                    <div className="image-3d-wrapper animate-float-slow">
                        <img
                            src="/hero-asset.png"
                            alt="InnovAIte Platform"
                            style={{
                                width: '100%',
                                filter: 'drop-shadow(0 40px 80px rgba(220,38,38,0.15))'
                            }}
                        />
                    </div>

                    {/* Floating Stats Card 1 */}
                    <div className="luxury-card animate-float" style={{
                        position: 'absolute',
                        top: '10%',
                        right: '-40px',
                        padding: '16px 24px',
                        zIndex: 3,
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(5,150,105,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <TfiStatsUp size={20} color="#059669" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#737373', fontWeight: 600 }}>
                                Hiring Accuracy
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 800 }}>
                                +94.2%
                            </div>
                        </div>
                    </div>

                    {/* Floating Stats Card 2 */}
                    <div className="luxury-card animate-float delay-200" style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '-60px',
                        padding: '16px 24px',
                        zIndex: 3
                    }}>
                        <div style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '8px' }}>
                            Interviews Protected
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#dc2626' }}>
                            254,890
                        </div>
                        <div style={{
                            height: '4px',
                            width: '100%',
                            background: 'rgba(220,38,38,0.1)',
                            borderRadius: '2px',
                            marginTop: '12px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: '85%',
                                height: '100%',
                                background: '#dc2626',
                                borderRadius: '2px'
                            }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section (Dark Background) */}
            <section id="features" style={{
                padding: '120px 80px',
                background: '#0a0a0a',
                position: 'relative',
                marginTop: '60px'
            }}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{
                        maxWidth: '1440px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '100px'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <h2 style={{
                            fontSize: '48px',
                            fontWeight: 900,
                            color: '#fff',
                            letterSpacing: '-1.5px',
                            margin: '0 0 24px',
                            lineHeight: 1.1
                        }}>
                            Behavioral <span style={{ color: '#dc2626' }}>Intelligence</span><br />
                            Diagnostics.
                        </h2>
                        <p style={{
                            fontSize: '18px',
                            color: '#a3a3a3',
                            lineHeight: 1.6,
                            marginBottom: '40px'
                        }}>
                            Deep neural analysis of candidate tonality, facial expressions, and confidence markers during live interviews.
                        </p>

                        {/* Feature List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { icon: <TfiShield size={16} />, text: 'Real-time Proctoring' },
                                { icon: <TfiBolt size={16} />, text: 'Sentiment Analysis' },
                                { icon: <TfiPulse size={16} />, text: 'Neural Confidence Scoring' }
                            ].map((f, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '8px',
                                        background: 'rgba(220,38,38,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#dc2626'
                                    }}>
                                        {f.icon}
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                                        {f.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Right */}
                    <div style={{ flex: 1 }} className="image-3d-wrapper animate-float-slow">
                        <img
                            src="/feature-asset.png"
                            alt="Feature Analysis"
                            style={{
                                width: '100%',
                                filter: 'drop-shadow(0 0 60px rgba(220,38,38,0.2))'
                            }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Feature Section (Light Background - Reversed) */}
            <section id="analytics" style={{
                padding: '160px 80px',
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: '100px'
            }}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '100px' }}
                >
                {/* Image Left */}
                <div style={{ flex: 1 }} className="image-3d-wrapper animate-float-slow delay-200">
                    <img
                        src="/analytics-asset.png"
                        alt="Analytics Dashboard"
                        style={{
                            width: '100%',
                            filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.1))'
                        }}
                    />
                </div>

                {/* Text Right */}
                <div style={{ flex: 1 }}>
                    <h2 style={{
                        fontSize: '48px',
                        fontWeight: 900,
                        color: '#0a0a0a',
                        letterSpacing: '-1.5px',
                        margin: '0 0 24px',
                        lineHeight: 1.1
                    }}>
                        Predictive <span style={{ color: '#dc2626' }}>Analytics</span><br />
                        Dashboard.
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: '#525252',
                        lineHeight: 1.6,
                        marginBottom: '40px'
                    }}>
                        Track everything that matters with real-time insights and data-driven hire probability scores.
                    </p>

                        {/* Feature Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div className="luxury-card" style={{ padding: '24px' }}>
                                <TfiStatsUp size={24} color="#dc2626" />
                                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '16px 0 8px' }}>
                                    Data Visualization
                                </h4>
                                <p style={{ fontSize: '14px', color: '#737373', lineHeight: 1.5 }}>
                                    Interactive charts and graphs for deep assessment insights.
                                </p>
                            </div>
                            <div className="luxury-card" style={{ padding: '24px' }}>
                                <TfiShield size={24} color="#dc2626" />
                                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '16px 0 8px' }}>
                                    Integrity Checks
                                </h4>
                                <p style={{ fontSize: '14px', color: '#737373', lineHeight: 1.5 }}>
                                    Advanced behavioral consistency checks for 100% integrity.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
            
            {/* AI Capabilities Section (15 Features) */}
            <section id="capabilities" style={{
                padding: '120px 80px',
                background: '#f9f9fb',
                position: 'relative'
            }}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '1440px', margin: '0 auto' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>Advanced Capabilities</h2>
                        <h3 style={{ fontSize: '48px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1.5px' }}>Next-Gen AI <span style={{ color: '#dc2626' }}>Interview Shield</span></h3>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '30px'
                    }}>
                        {[
                            { icon: <TfiPulse />, title: 'Sentiment Pulse', desc: 'Real-time candidate vocal tone analysis and confidence tracking.' },
                            { icon: <TfiEye />, title: 'Eye-Track AI', desc: 'Advanced proctoring for orientation and focus monitoring.' },
                            { icon: <FaBrain />, title: 'Neural Scoring', desc: 'Deep learning evaluation of technical responses and logic.' },
                            { icon: <TfiLayoutGrid4 />, title: 'Auto-Rubrics', desc: 'Dynamic generation of role-specific scoring criteria.' },
                            { icon: <FaShieldHalved />, title: 'Plagiarism Guard', desc: 'Real-time code and answer similarity checks across the web.' },
                            { icon: <TfiPencilAlt />, title: 'Ghostwriter Detection', desc: 'AI-pattern matching for pre-written or AI-generated text.' },
                            { icon: <TfiCommentAlt />, title: 'Smart Summaries', desc: '60-second executive summaries of 1-hour interview sessions.' },
                            { icon: <FaScaleUnbalanced />, title: 'Bias Redactor', desc: 'Automated removal of demographic identifiers from hiring reports.' },
                            { icon: <TfiTarget />, title: 'Skill-Graphing', desc: 'Visualizing candidate fit against your team requirement graph.' },
                            { icon: <TfiControlForward />, title: 'Sandbox Replay', desc: 'Event-driven playback of every step in technical assessments.' },
                            { icon: <TfiUser />, title: 'Collaborative Flow', desc: 'Real-time team-based interview moderation and shared scoring.' },
                            { icon: <TfiLineDouble />, title: 'Natural Transcript', desc: '99.9% accurate transcription of complex technical jargon.' },
                            { icon: <FaLanguage />, title: 'Global Link', desc: 'Multilingual real-time translation for borderless hiring teams.' },
                            { icon: <TfiTimer />, title: 'Calendar Sync', desc: 'Intelligent automated booking based on interviewer load metrics.' },
                            { icon: <TfiInfinite />, title: 'Predictive Success', desc: 'Proprietary probability score of long-term candidate retention.' }
                        ].map((feature, i) => (
                            <div key={i} className="luxury-card" style={{
                                padding: '32px',
                                transition: 'transform 0.3s ease',
                                border: '1px solid rgba(0,0,0,0.03)'
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '14px',
                                    background: 'rgba(220,38,38,0.06)',
                                    color: '#dc2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    marginBottom: '24px'
                                }}>
                                    {feature.icon}
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0a0a0a', marginBottom: '12px' }}>{feature.title}</h4>
                                <p style={{ fontSize: '14px', color: '#525252', lineHeight: 1.6 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* About Section */}
            <section id="about" style={{
                padding: '120px 80px',
                background: '#fff',
                position: 'relative'
            }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '80px', alignItems: 'center' }}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{
                            width: '80px',
                            height: '4px',
                            background: '#dc2626',
                            marginBottom: '32px'
                        }} />
                        <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1.5px', marginBottom: '32px' }}>
                            Our Mission: <br />
                            <span style={{ color: '#dc2626' }}>Redefining Integrity.</span>
                        </h2>
                        <p style={{ fontSize: '18px', color: '#525252', lineHeight: 1.8, marginBottom: '24px' }}>
                            InnovAIte was born from a simple yet powerful vision: to bridge the gap between human potential and objective assessment. We believe that hiring should be based on merit, skills, and cultural synergy—not on bias or superficial markers.
                        </p>
                        <p style={{ fontSize: '18px', color: '#525252', lineHeight: 1.8 }}>
                            By merging state-of-the-art behavioral AI with secure proctoring technologies, we empower organizations to build teams that are both highly skilled and fundamentally aligned with their future.
                        </p>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{
                            padding: '40px',
                            background: '#0a0a0a',
                            borderRadius: '24px',
                            color: '#fff',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.2)'
                        }}>
                            <TfiHeadphoneAlt size={48} color="#dc2626" style={{ marginBottom: '24px' }} />
                            <p style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', fontStyle: 'italic', lineHeight: 1.4 }}>
                                "We aren't just building a proctoring tool; we're building the future of human capital intelligence."
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Contact Section */}
            <section id="contact" style={{
                padding: '120px 80px',
                background: '#0a0a0a',
                color: '#fff',
                textAlign: 'center'
            }}>
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>Get in Touch</h2>
                    <h3 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '32px' }}>Ready to Secure Your <span style={{ color: '#dc2626' }}>Pipeline?</span></h3>
                    <p style={{ fontSize: '18px', color: '#a3a3a3', lineHeight: 1.6, marginBottom: '64px' }}>
                        Whether you're a startup looking for your first key hire or an enterprise scaling globally, our team is ready to assist.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#a3a3a3', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Global Headquarters</div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>San Francisco, CA</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#a3a3a3', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Email Us</div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>elite@innovai.te</div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '100px 80px 140px', position: 'relative' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #262626 100%)',
                        borderRadius: '32px',
                        padding: '100px 60px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Glow Effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-200px',
                        right: '-100px',
                        width: '600px',
                        height: '600px',
                        background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, rgba(0,0,0,0) 70%)',
                        borderRadius: '50%'
                    }} />

                    <h2 style={{
                        fontSize: '56px',
                        fontWeight: 900,
                        color: '#fff',
                        letterSpacing: '-2px',
                        margin: '0 0 24px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        Ready to <span style={{ color: '#dc2626' }}>Get Started?</span>
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: '#a3a3a3',
                        maxWidth: '600px',
                        margin: '0 auto 48px',
                        position: 'relative',
                        zIndex: 1,
                        lineHeight: 1.6
                    }}>
                        Join the elite firms using behavioral intelligence to build the future. Start your journey today.
                    </p>
                    <Link to="/register" className="btn-primary" style={{
                        padding: '18px 48px',
                        fontSize: '16px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(220,38,38,0.4)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        Launch Platform <TfiAngleRight size={20} className="ml-2" />
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}



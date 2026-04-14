import { motion } from 'framer-motion';
import { IoFlash } from 'react-icons/io5';
import { GiBrain } from 'react-icons/gi';
import { MdSecurity, MdVerifiedUser } from 'react-icons/md';
import { FaEye, FaLock, FaNetworkWired, FaInfinity, FaChartBar, FaServer } from 'react-icons/fa';
import { BsCpu } from 'react-icons/bs';
import { TbBinaryTree } from 'react-icons/tb';

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const FeatureCard = ({ icon: Icon, title, desc, colSpan = "col-span-1", glow = false }) => (
    <motion.div
        variants={itemVariants} 
        className={`saas-card glass relative group overflow-hidden ${colSpan}`}
    >
        <div className="relative z-10">
            <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand group-hover:text-white transition-all duration-500">
                <Icon className="text-2xl text-brand group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-black mb-4 group-hover:text-brand transition-colors">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-lg">
                {desc}
            </p>
        </div>
        {glow && (
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand/20 blur-[100px] rounded-full group-hover:bg-brand/40 transition-all duration-700" />
        )}
    </motion.div>
);

export default function Features() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="pt-20">
            {/* Header Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand/5 blur-[120px] rounded-full" />
                
                <div className="saas-container relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full text-brand text-xs font-black uppercase tracking-widest mb-10"
                    >
                        <BsCpu className="text-lg" />
                        <span>Advanced Features</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-8"
                    >
                        Built for <br /> <span className="text-brand">Elite</span> Professionals.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="max-w-2xl mx-auto text-xl"
                    >
                        Advanced AI infrastructure designed for high-trust recruitment at scale.
                    </motion.p>
                </div>
            </section>

            {/* Grid Sections */}
            <div className="pb-32 space-y-32">

                {/* 01. Neural Intelligence */}
                <section className="saas-container">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="text-6xl font-black text-white/5 outline-text tracking-tighter">01</div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter m-0">AI Intelligence</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-brand/50 to-transparent" />
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <FeatureCard
                            icon={GiBrain}
                            title="Candidate Matching"
                            desc="Advanced matching of candidate skills to your organization's role requirements."
                            colSpan="md:col-span-2"
                            glow={true}
                        />
                        <FeatureCard
                            icon={TbBinaryTree}
                            title="Smart Analysis"
                            desc="Real-time analysis of verbal and behavioral signals into an easy-to-read report."
                        />
                        <FeatureCard
                            icon={FaInfinity}
                            title="Infinite Learning"
                            desc="Models that evolve with your unique hiring culture and behavioral patterns over thousands of sessions."
                        />
                        <FeatureCard
                            icon={FaNetworkWired}
                            title="Culture Fit"
                            desc="Predicting team dynamics and cultural fit before the first interview."
                            colSpan="md:col-span-2"
                        />
                    </motion.div>
                </section>

                {/* 02. Integrity Shield */}
                <section className="saas-container">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="text-6xl font-black text-white/5 outline-text tracking-tighter">02</div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter m-0">Security & Integrity</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-brand/50 to-transparent" />
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-8"
                    >
                        <FeatureCard
                            icon={FaEye}
                            title="Engagement Tracking"
                            desc="Tracking candidate focus to ensure interview session integrity."
                        />
                        <FeatureCard
                            icon={FaLock}
                            title="Secure Login"
                            desc="Multi-factor verification at every interview session."
                            colSpan="md:col-span-2"
                            glow={true}
                        />
                        <FeatureCard
                            icon={MdSecurity}
                            title="Secure Streams"
                            desc="Fully encrypted interview sessions with high security standards."
                        />
                        <FeatureCard
                            icon={MdVerifiedUser}
                            title="Fraud Defense"
                            desc="Sophisticated detection of AI-assisted cheating and behavioral anomalies in real-time environments."
                            colSpan="md:col-span-4"
                        />
                    </motion.div>
                </section>
            </div>

            {/* Tech Specs Bar */}
            <div className="bg-brand/5 border-y border-brand/10 py-12">
                <div className="saas-container grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-3xl font-black text-white mb-1">50MS</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Latency</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-white mb-1">AES-256</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Encryption</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-white mb-1">99.9%</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-3xl font-black text-white">ACTIVE</span>
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">System Status</div>
                    </div>
                </div>
            </div>
        </div>
    );
}


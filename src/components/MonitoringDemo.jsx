import React from 'react';
import { motion } from 'framer-motion';
import { TfiMobile, TfiBook, TfiUser, TfiEye, TfiAlert, TfiCheck } from 'react-icons/tfi';

/**
 * Demo Component - Shows what the monitoring system detects
 * यह component दिखाता है कि system क्या-क्या detect करता है
 */
export default function MonitoringDemo() {
    const detectionCapabilities = [
        {
            icon: <TfiMobile className="text-4xl" />,
            title: 'Mobile Phone Detection',
            titleHindi: 'मोबाइल फोन डिटेक्शन',
            description: 'Detects if candidate uses phone during interview',
            descriptionHindi: 'अगर candidate interview के दौरान phone use करे',
            severity: 'CRITICAL',
            color: 'red',
            examples: ['Phone in hand', 'Phone on table', 'Smart watch']
        },
        {
            icon: <TfiBook className="text-4xl" />,
            title: 'Study Material Detection',
            titleHindi: 'स्टडी मटेरियल डिटेक्शन',
            description: 'Detects books, notes, or study materials',
            descriptionHindi: 'Books, notes, या study materials detect करता है',
            severity: 'HIGH',
            color: 'orange',
            examples: ['Books', 'Notebooks', 'Printed notes']
        },
        {
            icon: <TfiUser className="text-4xl" />,
            title: 'Multiple Persons Detection',
            titleHindi: 'एकाधिक व्यक्ति डिटेक्शन',
            description: 'Detects if someone else is helping',
            descriptionHindi: 'अगर कोई और person help कर रहा है',
            severity: 'CRITICAL',
            color: 'red',
            examples: ['Another person visible', 'Someone in background']
        },
        {
            icon: <TfiEye className="text-4xl" />,
            title: 'Eye Tracking',
            titleHindi: 'आई ट्रैकिंग',
            description: 'Tracks where candidate is looking',
            descriptionHindi: 'Candidate कहाँ देख रहा है track करता है',
            severity: 'MEDIUM',
            color: 'yellow',
            examples: ['Looking away frequently', 'Reading from side', 'Unusual eye movement']
        }
    ];

    const getSeverityColor = (color) => {
        const colors = {
            red: 'bg-red-50 border-red-500 text-red-700',
            orange: 'bg-orange-50 border-orange-500 text-orange-700',
            yellow: 'bg-yellow-50 border-yellow-500 text-yellow-700'
        };
        return colors[color] || 'bg-gray-50 border-gray-500 text-gray-700';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    🎯 Real-Time Monitoring System
                </h2>
                <p className="text-gray-600">
                    System automatically detects cheating attempts and alerts HR
                </p>
                <p className="text-gray-500 text-sm mt-1">
                    सिस्टम automatically cheating detect करता है और HR को alert करता है
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {detectionCapabilities.map((capability, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-2 rounded-xl p-6 ${getSeverityColor(capability.color)}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                {capability.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">
                                    {capability.title}
                                </h3>
                                <p className="text-sm opacity-75 mb-2">
                                    {capability.titleHindi}
                                </p>
                                <p className="text-sm mb-1">
                                    {capability.description}
                                </p>
                                <p className="text-xs opacity-75 mb-3">
                                    {capability.descriptionHindi}
                                </p>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-bold">
                                        {capability.severity}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold">Examples:</p>
                                    {capability.examples.map((example, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <TfiCheck className="text-sm" />
                                            <span>{example}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TfiAlert className="text-blue-600" />
                    How It Works / कैसे काम करता है
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                        <div>
                            <p className="font-semibold">Camera continuously monitors candidate</p>
                            <p className="text-xs text-gray-600">Camera लगातार candidate को monitor करता है</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                        <div>
                            <p className="font-semibold">AI detects prohibited objects & suspicious behavior</p>
                            <p className="text-xs text-gray-600">AI prohibited objects और suspicious behavior detect करता है</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                        <div>
                            <p className="font-semibold">Instant alert sent to HR/Recruiter</p>
                            <p className="text-xs text-gray-600">HR/Recruiter को instant alert भेजा जाता है</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                        <div>
                            <p className="font-semibold">Violation saved to database with timestamp</p>
                            <p className="text-xs text-gray-600">Violation database में timestamp के साथ save होता है</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                        <div>
                            <p className="font-semibold">Behavior score decreases automatically</p>
                            <p className="text-xs text-gray-600">Behavior score automatically कम होता है</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
                        <div>
                            <p className="font-semibold">Complete report generated at end</p>
                            <p className="text-xs text-gray-600">Interview के end में complete report generate होती है</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <TfiCheck className="text-3xl text-green-600" />
                    <div>
                        <p className="font-bold text-green-800">System is Active & Ready</p>
                        <p className="text-sm text-green-700">
                            सिस्टम active है और interview monitor करने के लिए ready है
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

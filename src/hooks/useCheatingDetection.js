import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export default function useCheatingDetection(videoElement, isActive = false) {
    const [violations, setViolations] = useState([]);
    const [detectionStats, setDetectionStats] = useState({
        objectsDetected: [],
        multiplePersons: false,
        phoneDetected: false,
        bookDetected: false
    });
    
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const lastDetectionRef = useRef({});

    // Load COCO-SSD model
    useEffect(() => {
        let mounted = true;

        const loadModel = async () => {
            try {
                console.log('[CHEATING] Loading object detection model...');
                const model = await cocoSsd.load();
                if (mounted) {
                    modelRef.current = model;
                    console.log('[CHEATING] Model loaded successfully');
                }
            } catch (error) {
                console.error('[CHEATING] Failed to load model:', error);
            }
        };

        loadModel();

        return () => {
            mounted = false;
        };
    }, []);

    // Start detection when active
    useEffect(() => {
        if (!isActive || !modelRef.current || !videoElement) {
            return;
        }

        console.log('[CHEATING] Starting detection...');

        const detectObjects = async () => {
            try {
                if (!videoElement || videoElement.readyState !== 4) {
                    return;
                }

                const predictions = await modelRef.current.detect(videoElement);
                
                // Prohibited objects
                const prohibitedObjects = {
                    'cell phone': 'PHONE_DETECTED',
                    'book': 'BOOK_DETECTED',
                    'laptop': 'LAPTOP_DETECTED',
                    'person': 'MULTIPLE_PERSONS'
                };

                const detectedObjects = [];
                const newViolations = [];

                predictions.forEach(prediction => {
                    const objectClass = prediction.class.toLowerCase();
                    const confidence = prediction.score;

                    // Only process high-confidence detections
                    if (confidence < 0.6) return;

                    detectedObjects.push({
                        class: objectClass,
                        confidence: confidence
                    });

                    // Check for prohibited objects
                    Object.keys(prohibitedObjects).forEach(prohibited => {
                        if (objectClass.includes(prohibited)) {
                            const violationType = prohibitedObjects[prohibited];
                            
                            // Avoid duplicate violations (cooldown: 10 seconds)
                            const now = Date.now();
                            const lastDetection = lastDetectionRef.current[violationType] || 0;
                            
                            if (now - lastDetection > 10000) {
                                lastDetectionRef.current[violationType] = now;
                                
                                const violation = {
                                    type: violationType,
                                    description: `${prohibited.charAt(0).toUpperCase() + prohibited.slice(1)} detected in frame`,
                                    timestamp: new Date().toISOString(),
                                    severity: 'HIGH',
                                    confidence: Math.round(confidence * 100)
                                };

                                newViolations.push(violation);
                                console.log('[CHEATING] Violation detected:', violation);
                            }
                        }
                    });
                });

                // Update stats
                setDetectionStats({
                    objectsDetected: detectedObjects,
                    multiplePersons: predictions.filter(p => p.class === 'person').length > 1,
                    phoneDetected: predictions.some(p => p.class === 'cell phone' && p.score > 0.6),
                    bookDetected: predictions.some(p => p.class === 'book' && p.score > 0.6)
                });

                // Add new violations
                if (newViolations.length > 0) {
                    setViolations(prev => [...prev, ...newViolations]);
                }

            } catch (error) {
                console.error('[CHEATING] Detection error:', error);
            }
        };

        // Run detection every 3 seconds
        detectionIntervalRef.current = setInterval(detectObjects, 3000);

        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, [isActive, videoElement]);

    const addManualViolation = (type, description) => {
        const violation = {
            type,
            description,
            timestamp: new Date().toISOString(),
            severity: 'MEDIUM'
        };
        setViolations(prev => [...prev, violation]);
        console.log('[CHEATING] Manual violation added:', violation);
    };

    const clearViolations = () => {
        setViolations([]);
        lastDetectionRef.current = {};
    };

    return {
        violations,
        detectionStats,
        addManualViolation,
        clearViolations,
        isModelLoaded: !!modelRef.current
    };
}

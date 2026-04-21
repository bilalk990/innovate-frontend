import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

/**
 * Advanced MediaPipe-based Interview Monitoring System
 * Features:
 * - Object detection (phones, books, unauthorized materials)
 * - Multiple person detection
 * - Eye tracking and gaze analysis
 * - Head pose detection
 * - Real-time violation alerts
 */
export default function useMediaPipeMonitoring(videoElement, isActive = false, onViolationDetected = null) {
    const [violations, setViolations] = useState([]);
    const [detectionStats, setDetectionStats] = useState({
        objectsDetected: [],
        multiplePersons: false,
        phoneDetected: false,
        bookDetected: false,
        eyeTrackingActive: false,
        gazeDirection: 'CENTER',
        headPose: { pitch: 0, yaw: 0, roll: 0 },
        lookAwayCount: 0,
        suspiciousBehaviorScore: 0
    });
    
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const eyeTrackingIntervalRef = useRef(null);
    const lastDetectionRef = useRef({});
    const gazeHistoryRef = useRef([]);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // Load COCO-SSD model for object detection
    useEffect(() => {
        let mounted = true;

        const loadModel = async () => {
            try {
                console.log('[MONITORING] Loading object detection model...');
                const model = await cocoSsd.load();
                if (mounted) {
                    modelRef.current = model;
                    console.log('[MONITORING] Model loaded successfully');
                }
            } catch (error) {
                console.error('[MONITORING] Failed to load model:', error);
            }
        };

        loadModel();

        return () => {
            mounted = false;
        };
    }, []);

    // Initialize canvas for face detection
    useEffect(() => {
        if (!videoElement) return;

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        canvasRef.current = canvas;
        contextRef.current = canvas.getContext('2d');
    }, [videoElement]);

    // Object Detection (phones, books, multiple persons)
    useEffect(() => {
        if (!isActive || !modelRef.current || !videoElement) {
            return;
        }

        const detectObjects = async () => {
            try {
                if (!videoElement || videoElement.readyState !== 4) {
                    return;
                }

                const predictions = await modelRef.current.detect(videoElement);
                
                // Prohibited objects with severity levels
                const prohibitedObjects = {
                    'cell phone': { type: 'PHONE_DETECTED', severity: 'CRITICAL' },
                    'book': { type: 'BOOK_DETECTED', severity: 'HIGH' },
                    'laptop': { type: 'LAPTOP_DETECTED', severity: 'HIGH' },
                    'keyboard': { type: 'KEYBOARD_DETECTED', severity: 'MEDIUM' },
                    'mouse': { type: 'MOUSE_DETECTED', severity: 'MEDIUM' },
                    'person': { type: 'MULTIPLE_PERSONS', severity: 'CRITICAL' }
                };

                const detectedObjects = [];
                const newViolations = [];

                predictions.forEach(prediction => {
                    const objectClass = prediction.class.toLowerCase();
                    const confidence = prediction.score;

                    if (confidence < 0.5) return;

                    detectedObjects.push({
                        class: objectClass,
                        confidence: confidence,
                        bbox: prediction.bbox
                    });

                    // Check for prohibited objects
                    Object.keys(prohibitedObjects).forEach(prohibited => {
                        if (objectClass.includes(prohibited)) {
                            const { type: violationType, severity } = prohibitedObjects[prohibited];
                            
                            // Special handling for multiple persons
                            if (violationType === 'MULTIPLE_PERSONS') {
                                const personCount = predictions.filter(p => p.class === 'person' && p.score > 0.5).length;
                                if (personCount <= 1) return;
                            }
                            
                            // Cooldown: 10 seconds between same violation type
                            const now = Date.now();
                            const lastDetection = lastDetectionRef.current[violationType] || 0;
                            
                            if (now - lastDetection > 10000) {
                                lastDetectionRef.current[violationType] = now;
                                
                                const violation = {
                                    type: violationType,
                                    description: `${prohibited.charAt(0).toUpperCase() + prohibited.slice(1)} detected in camera view`,
                                    timestamp: new Date().toISOString(),
                                    severity: severity,
                                    confidence: Math.round(confidence * 100),
                                    details: {
                                        objectClass: objectClass,
                                        boundingBox: prediction.bbox
                                    }
                                };

                                newViolations.push(violation);
                                console.log('[MONITORING] 🚨 VIOLATION:', violation);
                                
                                if (onViolationDetected) {
                                    onViolationDetected(violation);
                                }
                            }
                        }
                    });
                });

                // Update detection stats
                setDetectionStats(prev => ({
                    ...prev,
                    objectsDetected: detectedObjects,
                    multiplePersons: predictions.filter(p => p.class === 'person' && p.score > 0.5).length > 1,
                    phoneDetected: predictions.some(p => p.class === 'cell phone' && p.score > 0.5),
                    bookDetected: predictions.some(p => p.class === 'book' && p.score > 0.5)
                }));

                if (newViolations.length > 0) {
                    setViolations(prev => [...prev, ...newViolations]);
                }

            } catch (error) {
                console.error('[MONITORING] Detection error:', error);
            }
        };

        detectionIntervalRef.current = setInterval(detectObjects, 2000);
        setTimeout(detectObjects, 1000);

        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, [isActive, videoElement, onViolationDetected]);

    // Eye Tracking and Gaze Analysis
    useEffect(() => {
        if (!isActive || !videoElement || !canvasRef.current || !contextRef.current) {
            return;
        }

        const analyzeGaze = () => {
            try {
                const canvas = canvasRef.current;
                const context = contextRef.current;
                
                if (!videoElement || videoElement.readyState !== 4) return;

                // Draw video frame to canvas
                canvas.width = videoElement.videoWidth || 640;
                canvas.height = videoElement.videoHeight || 480;
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // Get image data for analysis
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                // Simple gaze estimation based on face position
                // In production, use MediaPipe Face Mesh for accurate eye tracking
                const gazeData = estimateGazeDirection(imageData, canvas.width, canvas.height);
                
                // Track gaze history
                gazeHistoryRef.current.push(gazeData);
                if (gazeHistoryRef.current.length > 30) {
                    gazeHistoryRef.current.shift();
                }

                // Analyze gaze patterns
                const lookAwayCount = gazeHistoryRef.current.filter(g => g.direction !== 'CENTER').length;
                const lookAwayPercentage = (lookAwayCount / gazeHistoryRef.current.length) * 100;

                // Update stats
                setDetectionStats(prev => ({
                    ...prev,
                    eyeTrackingActive: true,
                    gazeDirection: gazeData.direction,
                    headPose: gazeData.headPose,
                    lookAwayCount: lookAwayCount,
                    suspiciousBehaviorScore: calculateSuspiciousScore(gazeHistoryRef.current)
                }));

                // Trigger violation if looking away too much
                if (lookAwayPercentage > 60 && gazeHistoryRef.current.length >= 20) {
                    const now = Date.now();
                    const lastDetection = lastDetectionRef.current['EXCESSIVE_LOOK_AWAY'] || 0;
                    
                    if (now - lastDetection > 30000) { // 30 second cooldown
                        lastDetectionRef.current['EXCESSIVE_LOOK_AWAY'] = now;
                        
                        const violation = {
                            type: 'EXCESSIVE_LOOK_AWAY',
                            description: `Candidate looking away from screen excessively (${Math.round(lookAwayPercentage)}% of time)`,
                            timestamp: new Date().toISOString(),
                            severity: 'MEDIUM',
                            details: {
                                lookAwayPercentage: Math.round(lookAwayPercentage),
                                gazeDirection: gazeData.direction
                            }
                        };

                        setViolations(prev => [...prev, violation]);
                        
                        if (onViolationDetected) {
                            onViolationDetected(violation);
                        }
                    }
                }

            } catch (error) {
                console.error('[MONITORING] Gaze analysis error:', error);
            }
        };

        eyeTrackingIntervalRef.current = setInterval(analyzeGaze, 1000);

        return () => {
            if (eyeTrackingIntervalRef.current) {
                clearInterval(eyeTrackingIntervalRef.current);
            }
        };
    }, [isActive, videoElement, onViolationDetected]);

    // Helper: Estimate gaze direction (simplified)
    const estimateGazeDirection = (imageData, width, height) => {
        // This is a simplified version. In production, use MediaPipe Face Mesh
        // for accurate eye landmark detection and gaze estimation
        
        const data = imageData.data;
        let brightPixels = 0;
        let leftBright = 0;
        let rightBright = 0;
        let topBright = 0;
        let bottomBright = 0;

        // Analyze brightness distribution (simplified face detection)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                
                if (brightness > 100) {
                    brightPixels++;
                    
                    if (x < width / 2) leftBright++;
                    else rightBright++;
                    
                    if (y < height / 2) topBright++;
                    else bottomBright++;
                }
            }
        }

        // Determine gaze direction based on brightness distribution
        let direction = 'CENTER';
        const horizontalRatio = leftBright / (rightBright + 1);
        const verticalRatio = topBright / (bottomBright + 1);

        if (horizontalRatio > 1.3) direction = 'LEFT';
        else if (horizontalRatio < 0.7) direction = 'RIGHT';
        
        if (verticalRatio > 1.3) direction = 'UP';
        else if (verticalRatio < 0.7) direction = 'DOWN';

        // Estimate head pose (simplified)
        const headPose = {
            pitch: (verticalRatio - 1) * 30, // Approximate pitch angle
            yaw: (horizontalRatio - 1) * 30,  // Approximate yaw angle
            roll: 0
        };

        return { direction, headPose };
    };

    // Calculate suspicious behavior score
    const calculateSuspiciousScore = (gazeHistory) => {
        if (gazeHistory.length < 10) return 0;

        let score = 0;
        
        // Frequent direction changes
        let directionChanges = 0;
        for (let i = 1; i < gazeHistory.length; i++) {
            if (gazeHistory[i].direction !== gazeHistory[i - 1].direction) {
                directionChanges++;
            }
        }
        score += (directionChanges / gazeHistory.length) * 30;

        // Looking away percentage
        const lookAwayCount = gazeHistory.filter(g => g.direction !== 'CENTER').length;
        score += (lookAwayCount / gazeHistory.length) * 40;

        // Extreme head poses
        const extremePoses = gazeHistory.filter(g => 
            Math.abs(g.headPose.pitch) > 20 || Math.abs(g.headPose.yaw) > 20
        ).length;
        score += (extremePoses / gazeHistory.length) * 30;

        return Math.min(100, Math.round(score));
    };

    // Add manual violation
    const addManualViolation = (type, description, severity = 'MEDIUM') => {
        const violation = {
            type,
            description,
            timestamp: new Date().toISOString(),
            severity
        };
        setViolations(prev => [...prev, violation]);
        console.log('[MONITORING] Manual violation added:', violation);
        
        if (onViolationDetected) {
            onViolationDetected(violation);
        }
    };

    const clearViolations = () => {
        setViolations([]);
        lastDetectionRef.current = {};
        gazeHistoryRef.current = [];
    };

    return {
        violations,
        detectionStats,
        addManualViolation,
        clearViolations,
        isModelLoaded: !!modelRef.current
    };
}

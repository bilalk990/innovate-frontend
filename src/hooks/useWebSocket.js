import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for WebSocket with automatic reconnection
 * @param {string} url - WebSocket URL
 * @param {object} options - Configuration options
 * @returns {object} - WebSocket state and methods
 */
export default function useWebSocket(url, options = {}) {
    const {
        onOpen,
        onMessage,
        onError,
        onClose,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        reconnectOnClose = true,
    } = options;

    const [readyState, setReadyState] = useState('CONNECTING');
    const [reconnectCount, setReconnectCount] = useState(0);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const shouldReconnectRef = useRef(true);

    const connect = useCallback(() => {
        if (!url) {
            console.error('[WebSocket] No URL provided');
            return;
        }

        console.log(`[WebSocket] Attempting to connect to: ${url.substring(0, 50)}...`);

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = (event) => {
                console.log('[WebSocket] Connection opened successfully');
                setReadyState('OPEN');
                setReconnectCount(0);
                onOpen?.(event);
            };

            ws.onmessage = (event) => {
                onMessage?.(event);
            };

            ws.onerror = (event) => {
                console.error('[WebSocket] Error occurred:', event);
                setReadyState('ERROR');
                onError?.(event);
            };

            ws.onclose = (event) => {
                setReadyState('CLOSED');
                console.log(`[WebSocket] Connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
                onClose?.(event);

                // CRITICAL FIX: Don't reconnect on authentication failures (4001, 4003, 4004, 4010)
                const authFailureCodes = [4001, 4003, 4004, 4010];
                if (authFailureCodes.includes(event.code)) {
                    console.error(`[WebSocket] Authentication failed (code ${event.code}). Not reconnecting.`);
                    shouldReconnectRef.current = false;
                    return;
                }

                // Don't reconnect on normal closure (1000) or going away (1001)
                if (event.code === 1000 || event.code === 1001) {
                    console.log('[WebSocket] Normal closure. Not reconnecting.');
                    return;
                }

                // Attempt reconnection if enabled and not manually closed
                if (
                    reconnectOnClose &&
                    shouldReconnectRef.current &&
                    reconnectCount < maxReconnectAttempts
                ) {
                    const delay = reconnectInterval * Math.pow(1.5, reconnectCount); // Exponential backoff
                    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectCount + 1}/${maxReconnectAttempts})...`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectCount((prev) => prev + 1);
                        connect();
                    }, delay);
                } else if (reconnectCount >= maxReconnectAttempts) {
                    console.error('[WebSocket] Max reconnection attempts reached. Giving up.');
                }
            };
        } catch (error) {
            setReadyState('ERROR');
            console.error('WebSocket connection error:', error);
        }
    }, [url, onOpen, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts, reconnectOnClose, reconnectCount]);

    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
            return true;
        }
        return false;
    }, []);

    const close = useCallback(() => {
        shouldReconnectRef.current = false;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        wsRef.current?.close();
    }, []);

    useEffect(() => {
        // Use a timeout to avoid synchronous setState during render/effect phase if flagged
        const timeout = setTimeout(() => connect(), 0);

        return () => {
            shouldReconnectRef.current = false;
            if (timeout) {
                clearTimeout(timeout);
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, [connect]);

    // Return ws ref in a getter function to avoid accessing during render
    const getWebSocket = useCallback(() => wsRef.current, []);

    return {
        send,
        close,
        readyState,
        reconnectCount,
        getWebSocket
    };
}

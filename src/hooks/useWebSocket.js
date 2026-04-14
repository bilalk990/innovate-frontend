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
        if (!url) return;

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = (event) => {
                setReadyState('OPEN');
                setReconnectCount(0);
                onOpen?.(event);
            };

            ws.onmessage = (event) => {
                onMessage?.(event);
            };

            ws.onerror = (event) => {
                setReadyState('ERROR');
                onError?.(event);
            };

            ws.onclose = (event) => {
                setReadyState('CLOSED');
                onClose?.(event);

                // Attempt reconnection if enabled and not manually closed
                if (
                    reconnectOnClose &&
                    shouldReconnectRef.current &&
                    reconnectCount < maxReconnectAttempts
                ) {
                    const delay = reconnectInterval * Math.pow(1.5, reconnectCount); // Exponential backoff
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectCount((prev) => prev + 1);
                        connect();
                    }, delay);
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

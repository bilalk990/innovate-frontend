import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFetch — Generic data fetching hook with loading/error state
 * @param {Function} fetchFn - async function that returns axios response
 * @param {boolean} immediate - fetch on mount if true (default: true)
 */
export default function useFetch(fetchFn, immediate = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFnRef = useRef(fetchFn);
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFnRef.current(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'An error occurred';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []); // Stability ensured via ref

    useEffect(() => {
        if (immediate) execute();
    }, [immediate, execute]);

    return { data, loading, error, execute, setData, refetch: execute };
}

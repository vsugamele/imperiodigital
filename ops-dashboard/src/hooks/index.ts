// ========================================
// HOOKS CUSTOMIZADOS - Data Fetching & Utils
// ========================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// --- useFetch: Data fetching with loading & error states ---

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// --- usePolling: Auto-refresh data at interval ---

export function usePolling<T>(
    url: string,
    intervalMs: number = 30000
): FetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro");
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, intervalMs);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchData, intervalMs]);

    return { data, loading, error, refetch: fetchData };
}

// --- useLocalStorage: Persist state to localStorage ---

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error("useLocalStorage error:", error);
        }
    };

    return [storedValue, setValue] as const;
}

// --- useDebounce: Debounce value changes ---

export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// --- useClickOutside: Detect clicks outside element ---

export function useClickOutside(
    ref: React.RefObject<HTMLElement>,
    handler: () => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) return;
            handler();
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

// --- useToggle: Boolean toggle state ---

export function useToggle(initialValue: boolean = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue(v => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return { value, toggle, setTrue, setFalse, setValue };
}

// --- useCopyToClipboard ---

export function useCopyToClipboard() {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch {
            return false;
        }
    }, []);

    return { copy, copied };
}

// --- useMediaQuery: Responsive breakpoints ---

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener("change", listener);

        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}

// Preset breakpoints
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsTablet = () => useMediaQuery("(max-width: 1024px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");

import { useState, useEffect, useRef } from 'react';

/**
 * useDebounce: Debounces a rapidly changing value using useRef + useEffect.
 * - Every setTimeout is strictly paired with a clearTimeout in cleanup.
 * - Cancels pending timer on value/delay change or component unmount.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cancel any existing pending timer before scheduling a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: prevents stale timers from firing after rapid updates or unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

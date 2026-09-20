import { useState, useEffect } from 'react';

/**
 * Custom hook to synchronize state with window.localStorage.
 * - Reads from localStorage on initial render with fallback to initialValue.
 * - Updates localStorage whenever key or value changes.
 * - Handles JSON serialization/deserialization safely with try/catch.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Gracefully handle storage quotas or restricted environments
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

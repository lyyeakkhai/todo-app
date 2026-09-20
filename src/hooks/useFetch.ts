import { useState, useEffect } from 'react';

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [prevUrl, setPrevUrl] = useState<string>(url);
  const [state, setState] = useState<UseFetchResult<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Adjust state during render when the url changes (React recommendation to avoid cascading renders in effects)
  if (url !== prevUrl) {
    setPrevUrl(url);
    setState({
      data: null,
      loading: true,
      error: null,
    });
  }

  useEffect(() => {
    let isMounted = true;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch (Status: ${res.status})`);
        }
        return res.json() as Promise<T>;
      })
      .then((json: T) => {
        if (isMounted) {
          setState({
            data: json,
            loading: false,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'An unexpected error occurred',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
}

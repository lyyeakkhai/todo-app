import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '../hooks/useFetch';

interface User {
  id: number;
  name: string;
  email: string;
}

describe('useFetch<T>', () => {
  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with loading true, data null, and error null', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useFetch<User[]>('/api/users'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('successfully fetches and narrows data to User[]', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    } as Response);

    const { result } = renderHook(() => useFetch<User[]>('/api/users'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockUsers);
    expect(result.current.error).toBe(null);

    // Type narrowing check: data is User[] | null. Guard narrows to User[]:
    if (result.current.data) {
      const names = result.current.data.map((u) => u.name);
      expect(names).toEqual(['Alice', 'Bob']);
    }
  });

  it('handles response errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useFetch<User[]>('/api/users'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Failed to fetch (Status: 404)');
  });

  it('handles network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network offline'));

    const { result } = renderHook(() => useFetch<User[]>('/api/users'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network offline');
  });
});

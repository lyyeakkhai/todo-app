import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('provides null user initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBe(null);
  });

  it('updates user email on signIn', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.signIn('alex@example.com');
    });

    expect(result.current.user).toEqual({ email: 'alex@example.com' });
  });

  it('clears user on signOut', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.signIn('alex@example.com');
    });
    expect(result.current.user).not.toBe(null);

    act(() => {
      result.current.signOut();
    });
    expect(result.current.user).toBe(null);
  });

  it('throws a helpful error if useAuth is consumed outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });
});

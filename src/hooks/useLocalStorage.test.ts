import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('initializes with existing value stored in localStorage', () => {
    window.localStorage.setItem('test-key', JSON.stringify('persisted-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('persisted-value');
  });

  it('updates state and persists to localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(JSON.parse(window.localStorage.getItem('counter') || '')).toBe(42);
  });

  it('supports functional state updates', () => {
    const { result } = renderHook(() => useLocalStorage('items', ['apple']));

    act(() => {
      result.current[1]((prev) => [...prev, 'banana']);
    });

    expect(result.current[0]).toEqual(['apple', 'banana']);
    expect(JSON.parse(window.localStorage.getItem('items') || '')).toEqual(['apple', 'banana']);
  });

  it('falls back to initialValue if localStorage contains corrupted JSON', () => {
    window.localStorage.setItem('bad-json', '{not-json');
    const { result } = renderHook(() => useLocalStorage('bad-json', { safe: true }));
    expect(result.current[0]).toEqual({ safe: true });
  });
});

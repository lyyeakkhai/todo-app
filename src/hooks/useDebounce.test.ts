import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately on first render', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('does not update debounced value before delay has elapsed', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'initial' },
    });

    rerender({ val: 'updated' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial');
  });

  it('updates debounced value once the delay passes', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'initial' },
    });

    rerender({ val: 'updated' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels intermediate timers during rapid typing and only commits the final value', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'a' },
    });

    rerender({ val: 'ab' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ val: 'abc' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ val: 'abcd' });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    // Still 'a' because the latest timer has not finished its 500ms
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    // Now commits 'abcd' directly without emitting 'ab' or 'abc'
    expect(result.current).toBe('abcd');
  });

  it('cleans up timeout on unmount to prevent state updates after unmount', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const { unmount, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'first' },
    });

    rerender({ val: 'second' });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

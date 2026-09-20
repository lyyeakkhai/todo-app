import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox with useDebounce demo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search input with label text and empty initial state', () => {
    render(<SearchBox />);

    const searchInput = screen.getByLabelText(/search catalog/i);
    expect(searchInput).toBeDefined();

    expect(screen.getByText('⚡ Raw Value (immediate):')).toBeDefined();
    expect(screen.getByText('⏳ Debounced Value (500ms):')).toBeDefined();

    // Prove absence: clear button is null when input is empty
    expect(screen.queryByRole('button', { name: /clear search input/i })).toBeNull();
  });

  it('displays raw value immediately and debounced value after delay', () => {
    const onDebouncedChange = vi.fn();
    render(<SearchBox onDebouncedChange={onDebouncedChange} />);

    const searchInput = screen.getByLabelText(/search catalog/i) as HTMLInputElement;

    // Type text using fireEvent
    fireEvent.change(searchInput, { target: { value: 'mechanical' } });

    // Raw value renders immediately
    expect(screen.getByText('"mechanical"')).toBeDefined();

    // Debounced value has not updated yet (delay 500ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onDebouncedChange).not.toHaveBeenCalledWith('mechanical');

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onDebouncedChange).toHaveBeenCalledWith('mechanical');
  });

  it('clears search when clear button is clicked', () => {
    render(<SearchBox />);

    const searchInput = screen.getByLabelText(/search catalog/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'headphones' } });

    // Clear button is now visible
    const clearButton = screen.getByRole('button', { name: /clear search input/i });
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    // Prove absence: clear button is gone once input is cleared
    expect(screen.queryByRole('button', { name: /clear search input/i })).toBeNull();
  });
});

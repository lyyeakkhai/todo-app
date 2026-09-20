import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBoxProps {
  onDebouncedChange?: (debouncedValue: string) => void;
  placeholder?: string;
}

export function SearchBox({
  onDebouncedChange,
  placeholder = 'Search products by name or category...',
}: SearchBoxProps) {
  const [rawSearch, setRawSearch] = useState('');
  const debouncedSearch = useDebounce(rawSearch, 500);

  useEffect(() => {
    if (onDebouncedChange) {
      onDebouncedChange(debouncedSearch);
    }
  }, [debouncedSearch, onDebouncedChange]);

  return (
    <div className="search-box-container">
      <div className="search-input-wrapper">
        <label htmlFor="catalog-search" className="search-label">
          Search Catalog
        </label>
        <input
          id="catalog-search"
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
        />
        {rawSearch && (
          <button
            type="button"
            className="clear-search-btn"
            aria-label="Clear search input"
            onClick={() => setRawSearch('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Side-by-side demo of Raw vs. Debounced value */}
      <div className="debounce-demo-panel">
        <div className="debounce-stat-box">
          <span className="debounce-stat-label">⚡ Raw Value (immediate):</span>
          <span className="debounce-stat-value">"{rawSearch}"</span>
        </div>
        <div className="debounce-stat-box debounced-highlight">
          <span className="debounce-stat-label">⏳ Debounced Value (500ms):</span>
          <span className="debounce-stat-value">"{debouncedSearch}"</span>
        </div>
      </div>
    </div>
  );
}

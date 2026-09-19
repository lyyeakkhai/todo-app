import type { FilterType } from '../../types';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClearCompleted: () => void;
  activeCount: number;
  hasCompleted: boolean;
}

export function FilterBar({
  currentFilter,
  onFilterChange,
  onClearCompleted,
  activeCount,
  hasCompleted,
}: FilterBarProps) {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <footer className="filter-bar">
      <span className="todo-count">
        <strong>{activeCount}</strong> {activeCount === 1 ? 'item' : 'items'} left
      </span>
      <div className="filter-buttons">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={`filter-btn ${currentFilter === value ? 'active' : ''}`}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {hasCompleted ? (
        <button
          type="button"
          className="clear-completed-btn"
          onClick={onClearCompleted}
        >
          Clear completed
        </button>
      ) : (
        <span className="clear-placeholder" />
      )}
    </footer>
  );
}

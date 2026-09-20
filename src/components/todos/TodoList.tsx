import type { Todo } from '../../types';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

export function TodoList({ todos, onToggleTodo, onDeleteTodo }: TodoListProps) {
  if (todos.length === 0) {
    return <div className="todo-empty">No tasks in this view.</div>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
          <label className="todo-label">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggleTodo(todo.id)}
              className="todo-checkbox"
            />
            <span className="todo-text">{todo.text}</span>
          </label>
          <button
            type="button"
            className="delete-btn"
            onClick={() => onDeleteTodo(todo.id)}
            aria-label={`Delete task: ${todo.text}`}
            title="Delete task"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

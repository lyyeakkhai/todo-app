import { useState } from 'react';
import type { Todo, FilterType } from '../types';
import { AddTodo } from '../components/todos/AddTodo';
import { TodoList } from '../components/todos/TodoList';
import { FilterBar } from '../components/todos/FilterBar';

export function TodoApp() {
  // Lifted state: TodoApp owns the array and filter
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React effects and cleanups', completed: true },
    { id: 2, text: 'Practice lifted state architecture', completed: true },
    { id: 3, text: 'Build React Router routes and 404 page', completed: false },
  ]);
  const [filter, setFilter] = useState<FilterType>('all');

  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const hasCompleted = todos.some((todo) => todo.completed);

  return (
    <main className="todo-app-card">
      <div className="card-header">
        <h2>Tasks</h2>
        <p className="card-subtitle">Manage your daily priorities</p>
      </div>

      <AddTodo onAddTodo={handleAddTodo} />

      <TodoList
        todos={filteredTodos}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
      />

      <FilterBar
        currentFilter={filter}
        onFilterChange={handleFilterChange}
        onClearCompleted={handleClearCompleted}
        activeCount={activeCount}
        hasCompleted={hasCompleted}
      />
    </main>
  );
}

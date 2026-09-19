import { useState, type FormEvent } from 'react';

interface AddTodoProps {
  onAddTodo: (text: string) => void;
}

export function AddTodo({ onAddTodo }: AddTodoProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTodo(trimmed);
    setText('');
  };

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <button type="submit" className="add-btn" disabled={!text.trim()}>
        Add
      </button>
    </form>
  );
}

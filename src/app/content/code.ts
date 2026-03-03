import type { ContentItem } from './types';

// ── Level progression for TodoList.tsx ────────────────────────────────
// Level 0: Original clean code
// Level 1: Code + JSDoc docstrings on every function/interface
// Level 2: Docstrings stay, helper function bodies → pseudocode
// Level 3: Just the component shell with a summary docblock
//
// Tones are ignored — the CodeTab always reads from 'normal'.

const level0 = `import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: input.trim(),
      completed: false
    }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  return (
    <div className="todo-container">
      <h1>My Todos</h1>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p className="empty">No todos yet. Add one above!</p>}
    </div>
  );
}`;

const level1 = `import React, { useState } from 'react';

/**
 * Todo — Shape of a single todo item.
 * id: unique numeric ID generated via Date.now().
 * text: the task description entered by the user.
 * completed: boolean flag toggled by checkbox.
 */
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * TodoList — Main component that renders and manages a todo list.
 * Uses local React state (useState) for the todo array and input field.
 * Supports add, toggle, delete, and keyboard shortcut (Enter to add).
 * No external state management, database, or persistence.
 */
export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  /**
   * addTodo — Creates a new todo from the current input value.
   * Guards against empty/whitespace-only input.
   * Generates a unique ID via Date.now().
   * Clears the input field after appending.
   */
  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: input.trim(),
      completed: false
    }]);
    setInput('');
  };

  /**
   * toggleTodo — Flips the completed flag for the todo with the given ID.
   * Uses an immutable update pattern (map returns a new array).
   */
  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  /**
   * deleteTodo — Removes the todo matching the given ID.
   * Uses filter to return a new array excluding the target.
   */
  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  /**
   * handleKeyDown — Keyboard shortcut: pressing Enter adds a todo
   * so the user doesn't have to click the Add button.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  return (
    <div className="todo-container">
      <h1>My Todos</h1>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p className="empty">No todos yet. Add one above!</p>}
    </div>
  );
}`;

const level2 = `import React, { useState } from 'react';

/**
 * Todo — Shape of a single todo item.
 * id: unique numeric ID generated via Date.now().
 * text: the task description entered by the user.
 * completed: boolean flag toggled by checkbox.
 */
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * TodoList — Main component that renders and manages a todo list.
 * Uses local React state (useState) for the todo array and input field.
 * Supports add, toggle, delete, and keyboard shortcut (Enter to add).
 */
export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  /**
   * addTodo — Creates a new todo from the current input value.
   * Guards against empty input. Generates ID via Date.now().
   */
  // IF input is blank THEN return early
  // APPEND { id: now(), text: trimmed, completed: false } to todos
  // CLEAR the input field

  /**
   * toggleTodo — Flips the completed flag for the given todo ID.
   * Immutable update via map.
   */
  // MAP over todos
  //   IF id matches THEN flip completed
  //   ELSE keep unchanged

  /**
   * deleteTodo — Removes the todo matching the given ID.
   */
  // FILTER todos, keeping all where id ≠ target

  /**
   * handleKeyDown — Press Enter to trigger addTodo.
   */
  // IF key is 'Enter' THEN call addTodo()

  // RENDER:
  //   heading "My Todos"
  //   text input bound to state + Add button
  //   list of todos, each with checkbox + text + Delete button
  //   if list empty → show "No todos yet" placeholder
}`;

const level3 = `/**
 * TodoList.tsx
 *
 * React component — manages a list of { id, text, completed } items.
 * Local state only (useState), no persistence.
 *
 * addTodo      → validate input → append new item → clear field
 * toggleTodo   → flip completed flag by id
 * deleteTodo   → remove item by id
 * handleKeyDown → Enter triggers addTodo
 *
 * UI: text input + Add button, todo list with toggle & delete, empty state.
 */`;

// Build the ContentItem — all tones map to the same content
const levels: Record<string, string> = {
  '-1': level1,  // inert / unreachable
  '0': level0,
  '1': level1,
  '2': level2,
  '3': level3,
};

export const codeContent: ContentItem = {
  id: 'react-todo',
  title: 'React Todo List',
  compressions: {
    normal:   levels,
    eli5:     {},
    noJargon: {},
    bullets:  {},
  },
};
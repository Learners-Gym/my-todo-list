import React from 'react';
import { ToDo } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ToDoItemProps {
  todo: ToDo;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const ToDoItem: React.FC<ToDoItemProps> = ({ todo, onToggleTodo, onDeleteTodo }) => {
  return (
    <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3 shadow transition-all duration-300 hover:shadow-md">
      <div className="flex items-center flex-grow mr-4 min-w-0">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleTodo(todo.id)}
          className="h-5 w-5 rounded border-slate-400 text-custom-sky-500 focus:ring-custom-sky-500 focus:ring-offset-gray-50 accent-custom-sky-500 mr-4 flex-shrink-0 cursor-pointer"
          aria-labelledby={`todo-text-${todo.id}`}
        />
        <span
          id={`todo-text-${todo.id}`}
          className={`flex-grow truncate text-slate-700 ${todo.completed ? 'line-through text-slate-400' : ''} transition-colors`}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => onDeleteTodo(todo.id)}
        className="text-slate-500 hover:text-red-500 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
        aria-label={`タスクを削除: ${todo.text}`}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default ToDoItem;
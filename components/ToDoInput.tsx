import React, { useState } from 'react';
import PlusIcon from './icons/PlusIcon';

interface ToDoInputProps {
  onAddTodo: (text: string) => void;
}

const ToDoInput: React.FC<ToDoInputProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-6">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="新しいタスクを追加..."
        className="flex-grow p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-custom-sky-500 focus:border-custom-sky-500 outline-none transition-colors"
      />
      <button
        type="submit"
        className="bg-custom-sky-500 hover:bg-custom-sky-600 text-white font-semibold p-3 rounded-lg transition-colors flex items-center justify-center aspect-square"
        aria-label="タスクを追加"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ToDoInput;
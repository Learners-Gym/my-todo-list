import React from 'react';
import { ToDo, FilterStatus } from '../types';
import ToDoItem from './ToDoItem';

interface ToDoListProps {
  todos: ToDo[];
  filter: FilterStatus;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const ToDoList: React.FC<ToDoListProps> = ({ todos, filter, onToggleTodo, onDeleteTodo }) => {
  if (todos.length === 0) {
    let message = "まだタスクはありません。上から追加してください！";
    if (filter === FilterStatus.ACTIVE) {
      message = "アクティブなタスクはありません。お疲れ様でした！";
    } else if (filter === FilterStatus.COMPLETED) {
      message = "完了したタスクはまだありません。";
    }
    return <p className="text-center text-slate-500 py-8">{message}</p>;
  }

  return (
    <ul className="space-y-3 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
      {todos.map((todo) => (
        <ToDoItem
          key={todo.id}
          todo={todo}
          onToggleTodo={onToggleTodo}
          onDeleteTodo={onDeleteTodo}
        />
      ))}
    </ul>
  );
};

export default ToDoList;
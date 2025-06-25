import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToDo, FilterStatus } from './types';
import { LOCAL_STORAGE_KEY } from './constants';
import ToDoInput from './components/ToDoInput';
import ToDoList from './components/ToDoList';
import FilterTabs from './components/FilterTabs';
import AppFooter from './components/AppFooter';

const App: React.FC = () => {
  const [todos, setTodos] = useState<ToDo[]>(() => {
    try {
      const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
      console.error("ローカルストレージからのToDoの解析に失敗しました:", error);
      return [];
    }
  });

  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.ALL);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error("ローカルストレージへのToDoの保存に失敗しました:", error);
    }
  }, [todos]);

  const handleAddTodo = useCallback((text: string) => {
    const newTodo: ToDo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
  }, []);

  const handleToggleTodo = useCallback((id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }, []);

  const handleSetFilter = useCallback((newFilter: FilterStatus) => {
    setFilter(newFilter);
  }, []);

  const handleClearCompleted = useCallback(() => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  }, []);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filter === FilterStatus.ACTIVE) return !todo.completed;
      if (filter === FilterStatus.COMPLETED) return todo.completed;
      return true; // FilterStatus.ALL
    });
  }, [todos, filter]);

  const activeTodosCount = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  return (
    <div className="min-h-screen text-slate-700 flex flex-col items-center pt-8 sm:pt-12 md:pt-16 px-4 selection:bg-custom-amber-400 selection:text-slate-800">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* slate-300 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; /* slate-400 */
        }
      `}</style>
      <main className="w-full max-w-xl bg-white shadow-2xl rounded-xl p-6 sm:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-custom-sky-500 to-custom-amber-400">
            マイToDoリスト
          </h1>
        </header>

        <ToDoInput onAddTodo={handleAddTodo} />
        
        <FilterTabs currentFilter={filter} onSetFilter={handleSetFilter} />

        <ToDoList
          todos={filteredTodos}
          filter={filter}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
        />

        {todos.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 gap-2">
            <span>残り {activeTodosCount} 件</span>
            <button
              onClick={handleClearCompleted}
              className="hover:text-custom-sky-600 transition-colors px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-custom-sky-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              完了済みをクリア
            </button>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default App;
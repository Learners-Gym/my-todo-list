import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToDo, FilterStatus } from '../types';
import { TodoRecord, databaseService } from './services/database';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import UserHeader from './components/UserHeader';
import StudentManagement from './components/StudentManagement';
import TeacherDashboard from './components/TeacherDashboard';
import DatabaseStatus from './components/DatabaseStatus';
import GoogleSheetsSetup from './components/GoogleSheetsSetup';
import OAuth2Setup from './components/OAuth2Setup';
import ToDoInput from '../components/ToDoInput';
import ToDoList from '../components/ToDoList';
import FilterTabs from '../components/FilterTabs';
import AppFooter from '../components/AppFooter';

const MainApp: React.FC = () => {
  const [todos, setTodos] = useState<TodoRecord[]>([]);
  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.ALL);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userTodos = await databaseService.getTodos(user.id);
      setTodos(userTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = useCallback(async (text: string) => {
    if (!user) return;

    try {
      const newTodo = await databaseService.createTodo(user.id, text);
      if (newTodo) {
        setTodos((prevTodos) => [newTodo, ...prevTodos]);
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }, [user]);

  const handleToggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const success = await databaseService.updateTodo(id, { completed: !todo.completed });
    if (success) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    }
  }, [todos]);

  const handleDeleteTodo = useCallback(async (id: string) => {
    const success = await databaseService.deleteTodo(id);
    if (success) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }
  }, []);

  const handleSetFilter = useCallback((newFilter: FilterStatus) => {
    setFilter(newFilter);
  }, []);

  const handleClearCompleted = useCallback(async () => {
    if (!user) return;

    const success = await databaseService.clearCompletedTodos(user.id);
    if (success) {
      setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
    }
  }, [user]);

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

  // Convert TodoRecord to ToDo for compatibility with existing components
  const convertedTodos: ToDo[] = filteredTodos.map(todo => ({
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    createdAt: new Date(todo.created_at).getTime(),
  }));

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
      
      <div className="w-full max-w-4xl">
        <UserHeader />
        <DatabaseStatus />

        {user?.role === 'teacher' && (
          <>
            <OAuth2Setup onAuthSuccess={loadTodos} />
            <GoogleSheetsSetup />
            <StudentManagement />
            <TeacherDashboard />
          </>
        )}

        <main className="bg-white shadow-2xl rounded-xl p-6 sm:p-8 mb-6">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-custom-sky-500 to-custom-amber-400">
              ラーナーズ・ジム
            </h1>
          </header>

          <ToDoInput onAddTodo={handleAddTodo} />
          
          <FilterTabs currentFilter={filter} onSetFilter={handleSetFilter} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-custom-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-slate-600">読み込み中...</p>
            </div>
          ) : (
            <ToDoList
              todos={convertedTodos}
              filter={filter}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          )}

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
      </div>
      
      <AppFooter />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-custom-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <MainApp />;
};

export default App;
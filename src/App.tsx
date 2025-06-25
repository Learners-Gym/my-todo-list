import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToDo, FilterStatus } from '../types';
import { DatabaseService, TodoRecord, databaseService } from './services/database';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import UserHeader from './components/UserHeader';
import StudentManagement from './components/StudentManagement';
import TeacherDashboard from './components/TeacherDashboard';
import DatabaseStatus from './components/DatabaseStatus';
import GoogleSheetsSetup from './components/GoogleSheetsSetup';
import ToDoInput from '../components/ToDoInput';
import ToDoList from '../components/ToDoList';
import FilterTabs from '../components/FilterTabs';
import AppFooter from '../components/AppFooter';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const loadTodos = useCallback(async () => {
    if (!user) return;
    
    try {
      const todoRecords = await databaseService.getTodos(user.id);
      const todoList = todoRecords.map((record: TodoRecord) => ({
        id: record.id,
        text: record.text,
        completed: record.completed,
        userId: record.user_id
      }));
      setTodos(todoList);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }, [user]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    });
  }, [todos, filter]);

  const addTodo = async (text: string) => {
    if (!user) return;
    
    try {
      const newTodo = await databaseService.createTodo(user.id, text);
      setTodos(prev => [...prev, {
        id: newTodo.id,
        text: newTodo.text,
        completed: newTodo.completed,
        userId: newTodo.user_id
      }]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      await databaseService.updateTodo(id, { completed: !todo.completed });
      setTodos(prev => prev.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await databaseService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Check user role and render appropriate dashboard
  if (user.user_metadata?.role === 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <DatabaseStatus />
        <GoogleSheetsSetup />
        <TeacherDashboard />
        <AppFooter />
      </div>
    );
  }

  // Default student view with todo functionality
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <DatabaseStatus />
      
      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Tasks</h1>
            <ToDoInput onAdd={addTodo} />
          </div>
          
          <div className="p-6">
            <FilterTabs currentFilter={filter} onFilterChange={setFilter} />
            <ToDoList 
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          </div>
        </div>

        {user.user_metadata?.role === 'student' && <StudentManagement />}
      </main>
      
      <AppFooter />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
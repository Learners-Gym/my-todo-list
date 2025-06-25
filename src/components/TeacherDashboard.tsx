import React, { useState, useEffect } from 'react';
import { DatabaseService, TodoRecord } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { FilterStatus } from '../types';

const TeacherDashboard: React.FC = () => {
  const [allTodos, setAllTodos] = useState<TodoRecord[]>([]);
  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.ALL);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const databaseService = new DatabaseService();

  useEffect(() => {
    if (user && user.role === 'teacher') {
      loadAllTodos();
    }
  }, [user]);

  const loadAllTodos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const todos = await databaseService.getAllTodosForTeacher(user.id);
      setAllTodos(todos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTodos = allTodos.filter((todo) => {
    // Filter by completion status
    if (filter === FilterStatus.ACTIVE && todo.completed) return false;
    if (filter === FilterStatus.COMPLETED && !todo.completed) return false;
    
    // Filter by selected user
    if (selectedUser !== 'all' && todo.user_id !== selectedUser) return false;
    
    return true;
  });

  const uniqueUsers = Array.from(
    new Map(
      allTodos.map(todo => [todo.user_id, todo.user])
    ).values()
  ).filter(user => user);

  const getStats = () => {
    const total = allTodos.length;
    const completed = allTodos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    return { total, completed, active };
  };

  const stats = getStats();

  if (user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">全体ダッシュボード</h2>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-700">総タスク数</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.active}</div>
          <div className="text-sm text-yellow-700">進行中</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-green-700">完了済み</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {Object.values(FilterStatus).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-custom-sky-500 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {filterOption === FilterStatus.ALL && 'すべて'}
              {filterOption === FilterStatus.ACTIVE && 'アクティブ'}
              {filterOption === FilterStatus.COMPLETED && '完了済み'}
            </button>
          ))}
        </div>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-custom-sky-500 focus:border-custom-sky-500 outline-none"
        >
          <option value="all">全ユーザー</option>
          {uniqueUsers.map((userData) => (
            <option key={userData?.id} value={userData?.id}>
              {userData?.username} ({userData?.role === 'teacher' ? '教師' : '生徒'})
            </option>
          ))}
        </select>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-custom-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-slate-600">読み込み中...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            該当するタスクはありません
          </p>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-4 rounded-lg border transition-all ${
                todo.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      todo.user?.role === 'teacher' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {todo.user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-700">
                      {todo.user?.username}
                    </span>
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      todo.completed ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                  </div>
                  
                  <p className={`text-slate-700 mb-2 ${
                    todo.completed ? 'line-through text-slate-500' : ''
                  }`}>
                    {todo.text}
                  </p>
                  
                  <div className="text-xs text-slate-500 space-x-4">
                    <span>作成: {new Date(todo.created_at).toLocaleString('ja-JP')}</span>
                    {todo.updated_at !== todo.created_at && (
                      <span>更新: {new Date(todo.updated_at).toLocaleString('ja-JP')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
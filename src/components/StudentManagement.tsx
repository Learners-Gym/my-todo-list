import React, { useState, useEffect } from 'react';
import { User, databaseService } from '../services/database';
import { useAuth } from '../context/AuthContext';
import PlusIcon from '../../components/icons/PlusIcon';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'teacher') {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const studentList = await databaseService.getStudents(user.id);
      setStudents(studentList);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUsername.trim() || !newPassword.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const success = await databaseService.createStudent(
        newUsername.trim(),
        newPassword,
        user.id
      );

      if (success) {
        setNewUsername('');
        setNewPassword('');
        setShowAddForm(false);
        await loadStudents();
      } else {
        setError('生徒の追加に失敗しました。ユーザー名が既に使用されている可能性があります。');
      }
    } catch (error) {
      setError('生徒の追加中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (studentId: string) => {
    setIsLoading(true);
    try {
      const success = await databaseService.toggleStudentStatus(studentId);
      if (success) {
        await loadStudents();
      }
    } catch (error) {
      console.error('Failed to toggle student status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    if (!user) return;

    try {
      const csvContent = await databaseService.exportToCSV(user.id);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `todos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">生徒管理</h2>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            CSV出力
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-custom-sky-500 hover:bg-custom-sky-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            生徒追加
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddStudent} className="bg-slate-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">新しい生徒を追加</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-custom-sky-500 focus:border-custom-sky-500 outline-none"
                placeholder="ユーザー名を入力"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-custom-sky-500 focus:border-custom-sky-500 outline-none"
                placeholder="パスワードを入力"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setError('');
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-custom-sky-500 hover:bg-custom-sky-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700">登録済み生徒 ({students.length}人)</h3>
        
        {students.length === 0 ? (
          <p className="text-slate-500 text-center py-8">まだ生徒が登録されていません</p>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  student.active 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    student.active ? 'bg-green-500' : 'bg-slate-400'
                  }`}></div>
                  <span className={`font-medium ${
                    student.active ? 'text-slate-800' : 'text-slate-500'
                  }`}>
                    {student.username}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({new Date(student.created_at).toLocaleDateString('ja-JP')})
                  </span>
                </div>
                
                <button
                  onClick={() => handleToggleStatus(student.id)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    student.active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {student.active ? '無効化' : '有効化'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
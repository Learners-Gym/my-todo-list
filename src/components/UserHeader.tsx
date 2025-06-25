import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserHeader: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 mb-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
          user.role === 'teacher' ? 'bg-purple-500' : 'bg-blue-500'
        }`}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">{user.username}</h2>
          <p className="text-sm text-slate-600">
            {user.role === 'teacher' ? '教師' : '生徒'}
          </p>
        </div>
      </div>
      
      <button
        onClick={logout}
        className="text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
      >
        ログアウト
      </button>
    </div>
  );
};

export default UserHeader;
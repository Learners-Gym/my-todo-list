import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('ユーザー名またはパスワードが正しくありません');
      }
    } catch (error) {
      setError('ログイン中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            ラーナーズ・ジム
          </h1>
          <p className="text-slate-600">
            ログインしてタスク管理を始めましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-custom-sky-500 focus:border-custom-sky-500 outline-none transition-colors"
              placeholder="ユーザー名を入力"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-custom-sky-500 focus:border-custom-sky-500 outline-none transition-colors"
              placeholder="パスワードを入力"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-custom-sky-500 hover:bg-custom-sky-600 disabled:bg-slate-400 text-white font-semibold p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-700 mb-2">デモアカウント</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <p><strong>教師:</strong> teacher / teacher123</p>
            <p className="text-xs">教師アカウントで生徒を追加できます</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
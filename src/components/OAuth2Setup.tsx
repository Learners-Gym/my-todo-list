import React, { useState, useEffect } from 'react';
import { googleOAuthService } from '../services/googleOAuthService';

interface OAuth2SetupProps {
  onAuthSuccess?: () => void;
}

const OAuth2Setup: React.FC<OAuth2SetupProps> = ({ onAuthSuccess }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(googleOAuthService.isAuthenticated());
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'google_sheets_auth') {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const success = await googleOAuthService.handleAuthCallback(code);
      if (success) {
        setIsAuthenticated(true);
        onAuthSuccess?.();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('OAuth認証に失敗しました');
      }
    } catch (error) {
      console.error('OAuth認証エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuthFlow = () => {
    if (!googleOAuthService.isConfigured()) {
      alert('OAuth2設定が不完全です。環境変数を確認してください。');
      return;
    }
    
    try {
      googleOAuthService.startAuthFlow();
    } catch (error) {
      console.error('OAuth認証開始エラー:', error);
    }
  };

  const handleLogout = () => {
    googleOAuthService.logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">OAuth2認証を処理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Google Sheets OAuth2認証</h2>
        <div className="flex gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                認証済み
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={startOAuthFlow}
              disabled={!googleOAuthService.isConfigured()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Google認証を開始
            </button>
          )}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showInstructions ? '設定手順を隠す' : '設定手順を表示'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isAuthenticated 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isAuthenticated ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Google Sheetsへの完全アクセスが有効
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              OAuth2認証が必要
            </>
          )}
        </div>
      </div>

      {showInstructions && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🔐 OAuth2認証について</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                OAuth2認証により、Google Sheetsへの完全なアクセス（読み取り・書き込み）が可能になります。
              </p>
              <p>
                <strong>利点:</strong> データの作成、更新、削除が可能
              </p>
              <p>
                <strong>セキュリティ:</strong> アプリケーションはあなたの許可した権限のみでアクセスします
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Google Cloud Console設定</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                  <li>
                    <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Google Cloud Platform Console
                    </a> にアクセス
                  </li>
                  <li>プロジェクトを選択または新規作成</li>
                  <li>
                    <a href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Google Sheets API
                    </a> を有効化
                  </li>
                  <li>「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアントID」</li>
                  <li>アプリケーションの種類: 「ウェブアプリケーション」</li>
                  <li>
                    承認済みのリダイレクトURIに追加:
                    <div className="bg-white border rounded p-2 mt-1 text-xs font-mono">
                      {window.location.origin}/oauth/callback
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">2. 環境変数設定</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">
                  プロジェクトルートの <code>.env</code> ファイルに以下を追加：
                </p>
                <div className="bg-white border rounded p-3 text-sm font-mono space-y-1">
                  <div>VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here</div>
                  <div>VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_here</div>
                  <div>VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here</div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  <strong>セキュリティ注意:</strong> 本番環境では、クライアントシークレットをサーバーサイドで管理することを推奨します。
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">3. 認証手順</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                  <li>上記の設定完了後、「Google認証を開始」ボタンをクリック</li>
                  <li>Googleアカウントでログイン</li>
                  <li>アプリケーションの権限を確認・許可</li>
                  <li>自動的にこのページに戻り、認証完了</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 重要な注意事項</h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>
                <strong>開発環境での制限:</strong> 本実装では、セキュリティ上の理由によりクライアントサイドでOAuth2を処理しています。
              </p>
              <p>
                <strong>本番環境:</strong> セキュリティを強化するため、サーバーサイドでの認証処理を推奨します。
              </p>
              <p>
                <strong>権限スコープ:</strong> このアプリはGoogle Sheetsの読み取り・書き込み権限のみを要求します。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuth2Setup;
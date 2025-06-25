import React, { useState } from 'react';

const GoogleSheetsSetup: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const spreadsheetTemplate = `ユーザー名,タスク,完了状態,作成日時,更新日時
teacher,サンプルタスク1,false,2024-01-01T00:00:00.000Z,2024-01-01T00:00:00.000Z
student1,サンプルタスク2,true,2024-01-01T00:00:00.000Z,2024-01-01T00:00:00.000Z`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Google Sheets設定</h2>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showInstructions ? '設定手順を隠す' : '設定手順を表示'}
        </button>
      </div>

      {showInstructions && (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ 重要な制限事項</h3>
            <div className="text-sm text-red-700 space-y-2">
              <p>
                <strong>Google Sheets API キーは読み取り専用です。</strong>
                データの書き込み（作成・更新・削除）には、OAuth2認証またはサービスアカウント認証が必要です。
              </p>
              <p>
                現在の設定では、Google Sheetsからデータを読み込むことはできますが、
                新しいデータの保存はローカルのみとなります。
              </p>
              <p>
                完全なGoogle Sheets連携が必要な場合は、
                <a href="https://developers.google.com/sheets/api/guides/authorizing" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">
                  OAuth2認証の実装
                </a>
                または
                <a href="https://developers.google.com/sheets/api/guides/concepts#service_account" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">
                  サービスアカウント
                </a>
                を検討してください。
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">📝 手順概要</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Google Sheetsで新しいスプレッドシートを作成（読み取り専用）</li>
              <li>必要なシートとヘッダーを設定</li>
              <li>Google Cloud PlatformでAPIキーを取得</li>
              <li>環境変数を設定してアプリを再起動</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Google Sheetsスプレッドシート作成</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-3">
                  新しいGoogle Sheetsスプレッドシートを作成し、以下の2つのシートを作成してください：
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-slate-700">シート1: "Users"</h4>
                    <div className="bg-white border rounded p-2 text-xs font-mono">
                      <div className="grid grid-cols-6 gap-2 mb-1 font-bold">
                        <span>ID</span>
                        <span>ユーザー名</span>
                        <span>役割</span>
                        <span>作成者</span>
                        <span>有効</span>
                        <span>作成日時</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 text-slate-600">
                        <span>teacher_1</span>
                        <span>teacher</span>
                        <span>teacher</span>
                        <span></span>
                        <span>true</span>
                        <span>2024-01-01T00:00:00Z</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-700">シート2: "Todos"</h4>
                    <div className="bg-white border rounded p-2 text-xs font-mono">
                      <div className="grid grid-cols-6 gap-2 mb-1 font-bold">
                        <span>ID</span>
                        <span>ユーザーID</span>
                        <span>タスク</span>
                        <span>完了</span>
                        <span>作成日時</span>
                        <span>更新日時</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 text-slate-600">
                        <span>todo_1</span>
                        <span>teacher_1</span>
                        <span>サンプルタスク</span>
                        <span>false</span>
                        <span>2024-01-01T00:00:00Z</span>
                        <span>2024-01-01T00:00:00Z</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">2. スプレッドシートIDを取得</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">
                  スプレッドシートのURLから以下の部分をコピーしてください：
                </p>
                <div className="bg-white border rounded p-2 text-xs font-mono break-all">
                  https://docs.google.com/spreadsheets/d/<span className="bg-yellow-200">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</span>/edit
                </div>
                <p className="text-xs text-slate-500 mt-1">黄色でハイライトされた部分がスプレッドシートIDです</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">3. Google Cloud Platform設定</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-sm text-blue-700">
                    <strong>注意:</strong> APIキーでは読み取り専用アクセスのみ可能です。
                    書き込み操作には追加の認証設定が必要です。
                  </p>
                </div>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                  <li>
                    <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Google Cloud Platform Console
                    </a> にアクセス
                  </li>
                  <li>新しいプロジェクトを作成（または既存のプロジェクトを選択）</li>
                  <li>
                    <a href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Google Sheets API
                    </a> を有効化
                  </li>
                  <li>認証情報 → APIキーを作成</li>
                  <li>APIキーの制限を設定（Google Sheets APIのみに制限することを推奨）</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">4. 環境変数設定</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">
                  プロジェクトルートに <code>.env</code> ファイルを作成し、以下を追加：
                </p>
                <div className="bg-white border rounded p-3 text-sm font-mono">
                  <div>VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here</div>
                  <div>VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here</div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  設定後、開発サーバーを再起動してください
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">5. スプレッドシートの共有設定</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">
                  スプレッドシートを「リンクを知っている全員が閲覧可」に設定するか、
                  サービスアカウントのメールアドレスに編集権限を付与してください。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ 設定完了後</h3>
            <div className="text-sm text-green-700 space-y-2">
              <p>
              すべての設定が完了すると、アプリケーションが自動的にGoogle Sheetsに接続され、
                <strong>既存のデータを読み込む</strong>ことができます。
              </p>
              <p>
                新しいデータの作成・更新は現在ローカルのみで動作し、
                ページをリロードすると失われます。
              </p>
              <p>
                データの永続化が必要な場合は、Supabaseなどの
                クライアントサイド対応データベースの使用を検討してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsSetup;
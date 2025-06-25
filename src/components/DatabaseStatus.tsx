import React from 'react';
import { getDatabaseServiceInfo } from '../services/database';

const DatabaseStatus: React.FC = () => {
  const dbInfo = getDatabaseServiceInfo();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2">データベース状態</h3>
      <div className="text-sm text-blue-700 space-y-1">
        <p><strong>現在使用中:</strong> {
          dbInfo.type === 'mock' ? 'ローカルデモモード' :
          dbInfo.type === 'google-oauth' ? 'Google Sheets (OAuth2)' :
          dbInfo.type === 'google' ? 'Google Sheets' :
          dbInfo.type === 'supabase' ? 'Supabase' : 'Unknown'
        }</p>
        
        {dbInfo.type === 'mock' && (
          <div className="mt-2 text-xs">
            <p>• データはブラウザのローカルストレージに保存されます</p>
            <p>• Google SheetsまたはSupabaseを設定して本格運用できます</p>
          </div>
        )}

        <div className="mt-3 space-y-1">
          <p className="font-medium">利用可能なサービス:</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className={`px-2 py-1 rounded ${dbInfo.configured.mock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              ローカル: ✓
            </div>
            <div className={`px-2 py-1 rounded ${dbInfo.configured.googleOAuth ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              OAuth2: {dbInfo.configured.googleOAuth ? '✓' : '✗'}
            </div>
            <div className={`px-2 py-1 rounded ${dbInfo.configured.googleSheets ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              Google Sheets: {dbInfo.configured.googleSheets ? '✓' : '✗'}
            </div>
            <div className={`px-2 py-1 rounded ${dbInfo.configured.supabase ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              Supabase: {dbInfo.configured.supabase ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;
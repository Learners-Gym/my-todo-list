import { MockDatabaseService } from './mockDatabase';
import { GoogleSheetsService } from './googleSheetsService';
import { GoogleSheetsOAuthService } from './googleSheetsOAuthService';

// Export types
export type { User, TodoRecord } from './mockDatabase';

// Determine which service to use
const useGoogleSheets = !!(import.meta.env.VITE_GOOGLE_SHEETS_API_KEY && import.meta.env.VITE_GOOGLE_SPREADSHEET_ID);
const useGoogleOAuth = !!(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && import.meta.env.VITE_GOOGLE_SPREADSHEET_ID);
const useSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

let serviceType: 'mock' | 'google' | 'google-oauth' | 'supabase' = 'mock';

if (useGoogleOAuth) {
  serviceType = 'google-oauth';
} else if (useGoogleSheets) {
  serviceType = 'google';
} else if (useSupabase) {
  serviceType = 'supabase';
}

console.log(`Using ${serviceType} database service`);

// Create service instance based on configuration
let databaseServiceInstance: MockDatabaseService | GoogleSheetsService | GoogleSheetsOAuthService;

if (serviceType === 'google-oauth') {
  databaseServiceInstance = new GoogleSheetsOAuthService();
} else if (serviceType === 'google') {
  databaseServiceInstance = new GoogleSheetsService();
} else {
  databaseServiceInstance = new MockDatabaseService();
}

export const databaseService = databaseServiceInstance;

// For backwards compatibility
export class DatabaseService extends MockDatabaseService {}

// Service status
export function getDatabaseServiceInfo() {
  return {
    type: serviceType,
    configured: {
      googleOAuth: useGoogleOAuth,
      googleSheets: useGoogleSheets,
      supabase: useSupabase,
      mock: true
    }
  };
}
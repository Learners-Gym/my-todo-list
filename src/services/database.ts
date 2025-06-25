import { MockDatabaseService } from './mockDatabase';
import { googleSheetsService } from './googleSheetsService';

// Export types
export type { User, TodoRecord } from './mockDatabase';

// Determine which service to use
const useGoogleSheets = !!(import.meta.env.VITE_GOOGLE_SHEETS_API_KEY && import.meta.env.VITE_GOOGLE_SPREADSHEET_ID);
const useSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

let serviceType: 'mock' | 'google' | 'supabase' = 'mock';

if (useGoogleSheets) {
  serviceType = 'google';
} else if (useSupabase) {
  serviceType = 'supabase';
}

console.log(`Using ${serviceType} database service`);

// Create service instance
export const databaseService = new MockDatabaseService();

// For backwards compatibility
export class DatabaseService extends MockDatabaseService {}

// Service status
export function getDatabaseServiceInfo() {
  return {
    type: serviceType,
    configured: {
      googleSheets: useGoogleSheets,
      supabase: useSupabase,
      mock: true
    }
  };
}
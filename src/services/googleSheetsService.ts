// Google Sheets API service
export interface User {
  id: string;
  username: string;
  role: 'teacher' | 'student';
  created_by?: string;
  active: boolean;
  created_at: string;
}

export interface TodoRecord {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '';

class GoogleSheetsService {
  private isConfigured(): boolean {
    return !!(GOOGLE_SHEETS_API_KEY && SPREADSHEET_ID);
  }

  private async makeRequest(range: string, method: 'GET' | 'PUT' | 'POST' = 'GET', data?: any) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets APIが設定されていません');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;
    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${GOOGLE_SHEETS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${url}?key=${GOOGLE_SHEETS_API_KEY}`, config);
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Users sheet operations
  async getUsers(): Promise<User[]> {
    try {
      const response = await this.makeRequest('Users!A:F');
      const rows = response.values || [];
      
      if (rows.length <= 1) return []; // Skip header row
      
      return rows.slice(1).map((row: string[], index: number) => ({
        id: row[0] || `user_${index}`,
        username: row[1] || '',
        role: (row[2] as 'teacher' | 'student') || 'student',
        created_by: row[3] || undefined,
        active: row[4] === 'true',
        created_at: row[5] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to get users from Google Sheets:', error);
      return [];
    }
  }

  async addUser(user: Omit<User, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const id = `user_${Date.now()}`;
      const created_at = new Date().toISOString();
      
      const response = await this.makeRequest('Users!A:F', 'POST', {
        values: [[
          id,
          user.username,
          user.role,
          user.created_by || '',
          user.active.toString(),
          created_at
        ]]
      });

      return !!response;
    } catch (error) {
      console.error('Failed to add user to Google Sheets:', error);
      return false;
    }
  }

  // Todos sheet operations
  async getTodos(): Promise<TodoRecord[]> {
    try {
      const response = await this.makeRequest('Todos!A:F');
      const rows = response.values || [];
      
      if (rows.length <= 1) return []; // Skip header row
      
      return rows.slice(1).map((row: string[], index: number) => ({
        id: row[0] || `todo_${index}`,
        user_id: row[1] || '',
        text: row[2] || '',
        completed: row[3] === 'true',
        created_at: row[4] || new Date().toISOString(),
        updated_at: row[5] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to get todos from Google Sheets:', error);
      return [];
    }
  }

  async addTodo(todo: Omit<TodoRecord, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const id = `todo_${Date.now()}`;
      const now = new Date().toISOString();
      
      const response = await this.makeRequest('Todos!A:F', 'POST', {
        values: [[
          id,
          todo.user_id,
          todo.text,
          todo.completed.toString(),
          now,
          now
        ]]
      });

      return !!response;
    } catch (error) {
      console.error('Failed to add todo to Google Sheets:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
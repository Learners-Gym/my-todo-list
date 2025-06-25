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

export class GoogleSheetsService {
  private users: User[] = [];
  private todos: TodoRecord[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.isInitialized) return;
    
    try {
      // Load existing data from Google Sheets
      await this.loadUsersFromSheets();
      await this.loadTodosFromSheets();
      
      // Create default teacher if not exists
      if (!this.users.find(u => u.username === 'teacher')) {
        await this.createDefaultTeacher();
      }
      
      this.isInitialized = true;
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
      // Fallback to mock data
      this.initializeMockData();
      this.isInitialized = true;
    }
  }

  private initializeMockData() {
    this.users = [{
      id: 'teacher_1',
      username: 'teacher',
      role: 'teacher',
      active: true,
      created_at: new Date().toISOString(),
    }];
    this.todos = [];
  }

  private async createDefaultTeacher() {
    const defaultTeacher: User = {
      id: 'teacher_1',
      username: 'teacher',
      role: 'teacher',
      active: true,
      created_at: new Date().toISOString(),
    };

    try {
      await this.addUserToSheets(defaultTeacher);
      this.users.push(defaultTeacher);
      console.log('Default teacher created in Google Sheets');
    } catch (error) {
      console.error('Failed to create default teacher:', error);
      this.users.push(defaultTeacher);
    }
  }

  private isConfigured(): boolean {
    return !!(GOOGLE_SHEETS_API_KEY && SPREADSHEET_ID);
  }

  private async makeRequest(range: string, method: 'GET' | 'PUT' | 'POST' = 'GET', data?: any) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets APIが設定されていません');
    }

    let url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    if (method === 'POST') {
      url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
    }
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API Error:', response.status, response.statusText, errorText);
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Load data from Google Sheets
  private async loadUsersFromSheets(): Promise<void> {
    try {
      const response = await this.makeRequest('Users!A:F');
      const rows = response.values || [];
      
      if (rows.length <= 1) {
        this.users = [];
        return;
      }
      
      this.users = rows.slice(1).map((row: string[], index: number) => ({
        id: row[0] || `user_${index}`,
        username: row[1] || '',
        role: (row[2] as 'teacher' | 'student') || 'student',
        created_by: row[3] || undefined,
        active: row[4] === 'true',
        created_at: row[5] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to load users from Google Sheets:', error);
      this.users = [];
    }
  }

  private async loadTodosFromSheets(): Promise<void> {
    try {
      const response = await this.makeRequest('Todos!A:F');
      const rows = response.values || [];
      
      if (rows.length <= 1) {
        this.todos = [];
        return;
      }
      
      this.todos = rows.slice(1).map((row: string[], index: number) => ({
        id: row[0] || `todo_${index}`,
        user_id: row[1] || '',
        text: row[2] || '',
        completed: row[3] === 'true',
        created_at: row[4] || new Date().toISOString(),
        updated_at: row[5] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to load todos from Google Sheets:', error);
      this.todos = [];
    }
  }

  private async addUserToSheets(user: User): Promise<void> {
    try {
      await this.makeRequest('Users', 'POST', {
        values: [[
          user.id,
          user.username,
          user.role,
          user.created_by || '',
          user.active.toString(),
          user.created_at
        ]]
      });
    } catch (error) {
      console.error('Failed to add user to Google Sheets:', error);
      throw error;
    }
  }

  private async addTodoToSheets(todo: TodoRecord): Promise<void> {
    try {
      await this.makeRequest('Todos', 'POST', {
        values: [[
          todo.id,
          todo.user_id,
          todo.text,
          todo.completed.toString(),
          todo.created_at,
          todo.updated_at
        ]]
      });
    } catch (error) {
      console.error('Failed to add todo to Google Sheets:', error);
      throw error;
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<User | null> {
    await this.initializeData();
    
    const user = this.users.find(u => u.username === username && u.active);
    
    if (user) {
      if (username === 'teacher' && password === 'teacher123') {
        return user;
      }
      if (password) {
        return user;
      }
    }
    
    return null;
  }

  // User management
  async createStudent(username: string, password: string, teacherId: string): Promise<boolean> {
    await this.initializeData();
    
    const existingUser = this.users.find(u => u.username === username);
    if (existingUser) {
      return false;
    }

    const newStudent: User = {
      id: `student_${Date.now()}`,
      username,
      role: 'student',
      created_by: teacherId,
      active: true,
      created_at: new Date().toISOString(),
    };

    try {
      await this.addUserToSheets(newStudent);
      this.users.push(newStudent);
      console.log('Student added to Google Sheets:', username);
      return true;
    } catch (error) {
      console.error('Failed to create student:', error);
      return false;
    }
  }

  async getStudents(teacherId: string): Promise<User[]> {
    await this.initializeData();
    return this.users.filter(u => u.created_by === teacherId && u.role === 'student');
  }

  async toggleStudentStatus(studentId: string): Promise<boolean> {
    await this.initializeData();
    
    const studentIndex = this.users.findIndex(u => u.id === studentId);
    if (studentIndex === -1) return false;

    this.users[studentIndex].active = !this.users[studentIndex].active;
    
    try {
      // Update in Google Sheets would require a more complex implementation
      // For now, just update local state
      console.log('Student status toggled:', studentId);
      return true;
    } catch (error) {
      console.error('Failed to toggle student status:', error);
      return false;
    }
  }

  // Todo operations
  async getTodos(userId: string): Promise<TodoRecord[]> {
    await this.initializeData();
    return this.todos.filter(t => t.user_id === userId);
  }

  async getAllTodosForTeacher(teacherId: string): Promise<TodoRecord[]> {
    await this.initializeData();
    
    const students = await this.getStudents(teacherId);
    const studentIds = students.filter(s => s.active).map(s => s.id);
    const allUserIds = [teacherId, ...studentIds];

    return this.todos
      .filter(t => allUserIds.includes(t.user_id))
      .map(todo => ({
        ...todo,
        user: this.users.find(u => u.id === todo.user_id)
      }));
  }

  async createTodo(userId: string, text: string): Promise<TodoRecord | null> {
    await this.initializeData();
    
    const newTodo: TodoRecord = {
      id: `todo_${Date.now()}`,
      user_id: userId,
      text,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await this.addTodoToSheets(newTodo);
      this.todos.push(newTodo);
      console.log('Todo added to Google Sheets:', text);
      return newTodo;
    } catch (error) {
      console.error('Failed to create todo:', error);
      return null;
    }
  }

  async updateTodo(todoId: string, updates: Partial<Pick<TodoRecord, 'text' | 'completed'>>): Promise<boolean> {
    await this.initializeData();
    
    const todoIndex = this.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return false;

    this.todos[todoIndex] = {
      ...this.todos[todoIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    try {
      // Update in Google Sheets would require a more complex implementation
      // For now, just update local state
      console.log('Todo updated:', todoId, updates);
      return true;
    } catch (error) {
      console.error('Failed to update todo:', error);
      return false;
    }
  }

  async deleteTodo(todoId: string): Promise<boolean> {
    await this.initializeData();
    
    const todoIndex = this.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return false;

    this.todos.splice(todoIndex, 1);
    
    try {
      // Delete from Google Sheets would require a more complex implementation
      // For now, just update local state
      console.log('Todo deleted:', todoId);
      return true;
    } catch (error) {
      console.error('Failed to delete todo:', error);
      return false;
    }
  }

  async clearCompletedTodos(userId: string): Promise<boolean> {
    await this.initializeData();
    
    this.todos = this.todos.filter(t => !(t.user_id === userId && t.completed));
    
    try {
      console.log('Completed todos cleared for user:', userId);
      return true;
    } catch (error) {
      console.error('Failed to clear completed todos:', error);
      return false;
    }
  }

  // Export to CSV
  async exportToCSV(teacherId: string): Promise<string> {
    const todos = await this.getAllTodosForTeacher(teacherId);
    
    const headers = ['ユーザー名', 'タスク', '完了状態', '作成日時', '更新日時'];
    const rows = todos.map(todo => [
      todo.user?.username || 'Unknown',
      todo.text,
      todo.completed ? '完了' : '未完了',
      new Date(todo.created_at).toLocaleString('ja-JP'),
      new Date(todo.updated_at).toLocaleString('ja-JP'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
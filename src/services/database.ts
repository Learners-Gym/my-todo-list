import { createClient } from '@supabase/supabase-js';

// Supabase configuration - these will be set when user connects to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Simple password hashing (in production, use proper bcrypt)
function simpleHash(password: string): string {
  return `$2a$10$${btoa(password).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50)}`;
}

function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash;
}

export class DatabaseService {
  // Authentication
  async login(username: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('active', true)
        .single();

      if (error || !data) {
        return null;
      }

      if (verifyPassword(password, data.password_hash)) {
        return {
          id: data.id,
          username: data.username,
          role: data.role,
          created_by: data.created_by,
          active: data.active,
          created_at: data.created_at,
        };
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // User management
  async createStudent(username: string, password: string, teacherId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_users')
        .insert({
          username,
          password_hash: simpleHash(password),
          role: 'student',
          created_by: teacherId,
        });

      return !error;
    } catch (error) {
      console.error('Create student error:', error);
      return false;
    }
  }

  async getStudents(teacherId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('created_by', teacherId)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get students error:', error);
        return [];
      }

      return data.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        created_by: user.created_by,
        active: user.active,
        created_at: user.created_at,
      }));
    } catch (error) {
      console.error('Get students error:', error);
      return [];
    }
  }

  async toggleStudentStatus(studentId: string): Promise<boolean> {
    try {
      // First get current status
      const { data: currentData, error: fetchError } = await supabase
        .from('app_users')
        .select('active')
        .eq('id', studentId)
        .single();

      if (fetchError || !currentData) {
        return false;
      }

      const { error } = await supabase
        .from('app_users')
        .update({ active: !currentData.active })
        .eq('id', studentId);

      return !error;
    } catch (error) {
      console.error('Toggle student status error:', error);
      return false;
    }
  }

  // Todo operations
  async getTodos(userId: string): Promise<TodoRecord[]> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get todos error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get todos error:', error);
      return [];
    }
  }

  async getAllTodosForTeacher(teacherId: string): Promise<TodoRecord[]> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select(`
          *,
          user:app_users!todos_user_id_fkey(
            id,
            username,
            role,
            active
          )
        `)
        .in('user_id', [
          teacherId,
          // Also get student todos
          ...await this.getStudentIds(teacherId)
        ])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get all todos error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get all todos error:', error);
      return [];
    }
  }

  private async getStudentIds(teacherId: string): Promise<string[]> {
    const students = await this.getStudents(teacherId);
    return students.filter(s => s.active).map(s => s.id);
  }

  async createTodo(userId: string, text: string): Promise<TodoRecord | null> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: userId,
          text,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Create todo error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Create todo error:', error);
      return null;
    }
  }

  async updateTodo(todoId: string, updates: Partial<Pick<TodoRecord, 'text' | 'completed'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', todoId);

      return !error;
    } catch (error) {
      console.error('Update todo error:', error);
      return false;
    }
  }

  async deleteTodo(todoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      return !error;
    } catch (error) {
      console.error('Delete todo error:', error);
      return false;
    }
  }

  async clearCompletedTodos(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', userId)
        .eq('completed', true);

      return !error;
    } catch (error) {
      console.error('Clear completed todos error:', error);
      return false;
    }
  }

  // Export to Google Sheets format (CSV)
  async exportToCSV(teacherId: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Export CSV error:', error);
      return '';
    }
  }
}
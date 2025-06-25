import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Types for our database
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

export class SupabaseService {
  // Authentication
  async login(username: string, password: string): Promise<User | null> {
    try {
      // Check if user exists in the app_users table
      let { data: users, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('active', true)
        .maybeSingle();

      // If teacher user doesn't exist or has invalid UUID and login credentials are correct, create it
      if ((error || !users || (username === 'teacher' && !isValidUUID(users.id))) && username === 'teacher' && password === 'teacher123') {
        const { data: newUser, error: createError } = await supabase
          .from('app_users')
          .insert([
            {
              id: uuidv4(),
              username: 'teacher',
              password_hash: 'demo_hash',
              role: 'teacher',
              active: true,
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error('Failed to create teacher user:', createError);
          return null;
        }

        users = newUser;
      } else if (error || !users) {
        if (error) {
          console.error('Database error during login:', error);
        } else {
          console.warn(`Login attempt failed: User not found or inactive for username: ${username}`);
        }
        return null;
      }

      // Simple password check for demo (in production, use proper password hashing)
      if (username === 'teacher' && password === 'teacher123') {
        return users;
      }

      // For other users, accept any password for demo
      if (password) {
        return users;
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
        .insert([
          {
            username,
            password_hash: 'demo_hash', // In production, hash the password properly
            role: 'student',
            created_by: teacherId,
            active: true,
          },
        ]);

      return !error;
    } catch (error) {
      console.error('Failed to create student:', error);
      return false;
    }
  }

  async getStudents(teacherId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('created_by', teacherId)
        .eq('role', 'student');

      if (error) {
        console.error('Failed to fetch students:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return [];
    }
  }

  async toggleStudentStatus(studentId: string): Promise<boolean> {
    try {
      // First get current status
      const { data: student } = await supabase
        .from('app_users')
        .select('active')
        .eq('id', studentId)
        .single();

      if (!student) return false;

      const { error } = await supabase
        .from('app_users')
        .update({ active: !student.active })
        .eq('id', studentId);

      return !error;
    } catch (error) {
      console.error('Failed to toggle student status:', error);
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
        console.error('Failed to fetch todos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      return [];
    }
  }

  async getAllTodosForTeacher(teacherId: string): Promise<TodoRecord[]> {
    try {
      // Get all students created by this teacher
      const students = await this.getStudents(teacherId);
      const studentIds = students.filter(s => s.active).map(s => s.id);
      const allUserIds = [teacherId, ...studentIds];

      const { data, error } = await supabase
        .from('todos')
        .select(`
          *,
          app_users!inner(id, username, role)
        `)
        .in('user_id', allUserIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch todos for teacher:', error);
        return [];
      }

      return (data || []).map(todo => ({
        ...todo,
        user: todo.app_users
      }));
    } catch (error) {
      console.error('Failed to fetch todos for teacher:', error);
      return [];
    }
  }

  async createTodo(userId: string, text: string): Promise<TodoRecord | null> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            user_id: userId,
            text,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Failed to create todo:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create todo:', error);
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
      console.error('Failed to update todo:', error);
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
      console.error('Failed to delete todo:', error);
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
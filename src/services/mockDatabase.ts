// Mock database service for demo purposes
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

// Simple password hashing for demo
function simpleHash(password: string): string {
  return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

export class MockDatabaseService {
  private users: User[] = [];
  private todos: TodoRecord[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Load from localStorage if available
    const storedUsers = localStorage.getItem('todo-app-users');
    const storedTodos = localStorage.getItem('todo-app-todos');

    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      // Create default teacher account
      this.users = [{
        id: 'teacher_1',
        username: 'teacher',
        role: 'teacher',
        active: true,
        created_at: new Date().toISOString(),
      }];
      this.saveToStorage();
    }

    if (storedTodos) {
      this.todos = JSON.parse(storedTodos);
    }
  }

  private saveToStorage() {
    localStorage.setItem('todo-app-users', JSON.stringify(this.users));
    localStorage.setItem('todo-app-todos', JSON.stringify(this.todos));
  }

  // Authentication
  async login(username: string, password: string): Promise<User | null> {
    // For demo purposes, accept any password for existing users
    const user = this.users.find(u => u.username === username && u.active);
    
    if (user) {
      // Special case for teacher demo account
      if (username === 'teacher' && password === 'teacher123') {
        return user;
      }
      // For other users, accept any password for demo
      if (password) {
        return user;
      }
    }
    
    return null;
  }

  // User management
  async createStudent(username: string, password: string, teacherId: string): Promise<boolean> {
    const existingUser = this.users.find(u => u.username === username);
    if (existingUser) {
      return false; // User already exists
    }

    const newStudent: User = {
      id: `student_${Date.now()}`,
      username,
      role: 'student',
      created_by: teacherId,
      active: true,
      created_at: new Date().toISOString(),
    };

    this.users.push(newStudent);
    this.saveToStorage();
    return true;
  }

  async getStudents(teacherId: string): Promise<User[]> {
    return this.users.filter(u => u.created_by === teacherId && u.role === 'student');
  }

  async toggleStudentStatus(studentId: string): Promise<boolean> {
    const studentIndex = this.users.findIndex(u => u.id === studentId);
    if (studentIndex === -1) return false;

    this.users[studentIndex].active = !this.users[studentIndex].active;
    this.saveToStorage();
    return true;
  }

  // Todo operations
  async getTodos(userId: string): Promise<TodoRecord[]> {
    return this.todos.filter(t => t.user_id === userId);
  }

  async getAllTodosForTeacher(teacherId: string): Promise<TodoRecord[]> {
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
    const newTodo: TodoRecord = {
      id: uuidv4(),
      user_id: userId,
      text,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.todos.push(newTodo);
    this.saveToStorage();
    return newTodo;
  }

  async updateTodo(todoId: string, updates: Partial<Pick<TodoRecord, 'text' | 'completed'>>): Promise<boolean> {
    const todoIndex = this.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return false;

    this.todos[todoIndex] = {
      ...this.todos[todoIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveToStorage();
    return true;
  }

  async deleteTodo(todoId: string): Promise<boolean> {
    const todoIndex = this.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return false;

    this.todos.splice(todoIndex, 1);
    this.saveToStorage();
    return true;
  }

  async clearCompletedTodos(userId: string): Promise<boolean> {
    this.todos = this.todos.filter(t => !(t.user_id === userId && t.completed));
    this.saveToStorage();
    return true;
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
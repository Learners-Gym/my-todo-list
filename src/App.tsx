@@ .. @@
 import React, { useState, useEffect, useCallback, useMemo } from 'react';
-import { ToDo, FilterStatus } from './types';
-import { DatabaseService, TodoRecord } from './src/services/database';
-import { AuthProvider, useAuth } from './src/context/AuthContext';
-import LoginForm from './src/components/LoginForm';
-import UserHeader from './src/components/UserHeader';
-import StudentManagement from './src/components/StudentManagement';
-import TeacherDashboard from './src/components/TeacherDashboard';
-import ToDoInput from './src/components/ToDoInput';
-import ToDoList from './src/components/ToDoList';
-import FilterTabs from './src/components/FilterTabs';
-import AppFooter from './src/components/AppFooter';
+import { ToDo, FilterStatus } from '../types';
+import { DatabaseService, TodoRecord } from './services/database';
+import { AuthProvider, useAuth } from './context/AuthContext';
+import LoginForm from './components/LoginForm';
+import UserHeader from './components/UserHeader';
+import StudentManagement from './components/StudentManagement';
+import TeacherDashboard from './components/TeacherDashboard';
+import ToDoInput from '../components/ToDoInput';
+import ToDoList from '../components/ToDoList';
+import FilterTabs from '../components/FilterTabs';
+import AppFooter from '../components/AppFooter';

export default AppFooter
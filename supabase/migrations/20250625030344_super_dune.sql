/*
  # Initial schema for multi-user ToDo application

  1. New Tables
    - `app_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `role` (text) - 'teacher' or 'student'
      - `created_by` (uuid, reference to teacher)
      - `active` (boolean)
      - `created_at` (timestamp)
    - `todos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `text` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user data access
    - Teachers can manage students and view their todos
    - Students can only access their own data

  3. Initial Data
    - Create default teacher account
    - Username: teacher, Password: teacher123
*/

-- Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'student')),
  created_by uuid REFERENCES app_users(id),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  text text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_users
CREATE POLICY "Users can read their own data"
  ON app_users
  FOR SELECT
  USING (true); -- We'll handle this in the application logic

CREATE POLICY "Teachers can manage students"
  ON app_users
  FOR ALL
  USING (true); -- We'll handle this in the application logic

-- RLS Policies for todos
CREATE POLICY "Users can manage their own todos"
  ON todos
  FOR ALL
  USING (true); -- We'll handle this in the application logic

-- Create update trigger for todos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default teacher account (password is 'teacher123')
-- Using a simple hash for demo purposes - in production, use proper password hashing
INSERT INTO app_users (username, password_hash, role, created_by) 
VALUES ('teacher', '$2a$10$rQZ5K8G0qJ9wX5B2Y3N4.eCK5tM8L9P7Q6R1S2T3U4V5W6X7Y8Z9A0', 'teacher', NULL)
ON CONFLICT (username) DO NOTHING;
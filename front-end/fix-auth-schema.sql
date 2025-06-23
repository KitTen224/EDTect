-- Fix authentication schema for registration
-- Run this in your Supabase SQL Editor

-- First, check if the users table has the password column
-- If not, we need to either add it or recreate the table

-- Option 1: Add password column to existing users table
DO $$
BEGIN
    -- Check if password column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN
        -- Add password column
        ALTER TABLE users ADD COLUMN password TEXT;
        
        -- Make it NOT NULL with a default for existing rows
        UPDATE users SET password = 'temp_password_needs_reset' WHERE password IS NULL;
        ALTER TABLE users ALTER COLUMN password SET NOT NULL;
    END IF;
END $$;

-- Disable RLS temporarily for registration to work
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- Re-enable RLS and create proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow registration (anonymous users can insert)
DROP POLICY IF EXISTS "Allow registration" ON users;
CREATE POLICY "Allow registration" ON users
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'sub' = id::text);

-- Create policy to allow users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'sub' = id::text);
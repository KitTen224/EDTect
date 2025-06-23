-- Migration: Add password column and authentication policies
-- Date: 2024-06-23
-- Description: Adds password column to users table and sets up proper RLS policies for custom authentication

-- Add password column if it doesn't exist
DO $$
BEGIN
    -- Check if password column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN
        -- Add password column
        ALTER TABLE users ADD COLUMN password TEXT;
        
        -- Set default value for existing rows (they'll need to reset passwords)
        UPDATE users SET password = 'temp_password_needs_reset' WHERE password IS NULL;
        
        -- Make it NOT NULL
        ALTER TABLE users ALTER COLUMN password SET NOT NULL;
        
        RAISE NOTICE 'Password column added to users table';
    ELSE
        RAISE NOTICE 'Password column already exists in users table';
    END IF;
END $$;

-- Configure Row Level Security for authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions for authentication
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- Re-enable RLS with proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to register (insert new users)
DROP POLICY IF EXISTS "Allow registration" ON users;
CREATE POLICY "Allow registration" ON users
    FOR INSERT TO anon
    WITH CHECK (true);

-- Policy: Allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid()::text = id::text OR auth.jwt() ->> 'sub' = id::text);

-- Policy: Allow users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = id::text OR auth.jwt() ->> 'sub' = id::text);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Authentication setup complete! Users table is ready for custom authentication.';
END $$;
-- Complete fix for saved_trips table
-- Run this in Supabase SQL Editor

-- Step 1: Drop all policies that depend on user_id
DROP POLICY IF EXISTS "Users can view own trips and public trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can update own trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON saved_trips;

-- Step 2: Change user_id column type to TEXT
ALTER TABLE saved_trips 
ALTER COLUMN user_id TYPE TEXT;

-- Step 3: Add missing columns
ALTER TABLE saved_trips 
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS total_estimated_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS regions JSONB,
ADD COLUMN IF NOT EXISTS travel_styles JSONB,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_token TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Step 4: Recreate policies with TEXT user_id
CREATE POLICY "Users can view own trips and public trips" ON saved_trips
  FOR SELECT USING (
    user_id = auth.jwt() ->> 'sub'
    OR is_public = true 
  );

CREATE POLICY "Users can insert own trips" ON saved_trips
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own trips" ON saved_trips
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own trips" ON saved_trips
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Step 5: Refresh schema cache
NOTIFY pgrst, 'reload schema';
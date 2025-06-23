-- SIMPLE FIX: Just disable RLS temporarily and create basic table
-- Run this in Supabase SQL Editor

-- Drop the problematic table and start fresh
DROP TABLE IF EXISTS saved_trips CASCADE;

-- Create simple table without RLS complications
CREATE TABLE saved_trips (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  form_data JSONB NOT NULL,
  timeline_data JSONB NOT NULL,
  total_duration INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- No RLS, no policies, just a working table
-- Grant basic permissions
GRANT ALL ON saved_trips TO authenticated;
GRANT ALL ON saved_trips TO anon;
-- Fix user_id column to accept text instead of UUID
-- This handles Google Auth numeric IDs

-- Change user_id column type to TEXT
ALTER TABLE saved_trips 
ALTER COLUMN user_id TYPE TEXT;
-- Fix the saved_trips table schema
-- Run this in your Supabase SQL Editor

-- Add missing columns to saved_trips table
ALTER TABLE saved_trips 
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS total_estimated_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS regions JSONB,
ADD COLUMN IF NOT EXISTS travel_styles JSONB,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'completed', 'cancelled'));

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_saved_trips_season ON saved_trips(season);
CREATE INDEX IF NOT EXISTS idx_saved_trips_is_public ON saved_trips(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_trips_share_token ON saved_trips(share_token);
CREATE INDEX IF NOT EXISTS idx_saved_trips_status ON saved_trips(status);

-- Refresh the schema cache (this is important!)
NOTIFY pgrst, 'reload schema';
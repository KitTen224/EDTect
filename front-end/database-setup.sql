-- Database setup for EDTect/Nihon Journey
-- Run this script in your Supabase SQL editor

-- Create saved_trips table
CREATE TABLE IF NOT EXISTS saved_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Trip data (JSON columns)
  form_data JSONB NOT NULL,
  timeline_data JSONB NOT NULL,
  
  -- Trip metadata
  total_duration INTEGER NOT NULL,
  total_estimated_cost DECIMAL(10,2),
  regions JSONB,
  travel_styles JSONB,
  season TEXT,
  
  -- Sharing and collaboration
  is_public BOOLEAN DEFAULT FALSE,
  share_token UUID UNIQUE,
  
  -- Trip status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_trips_created_at ON saved_trips(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_trips_share_token ON saved_trips(share_token);
CREATE INDEX IF NOT EXISTS idx_saved_trips_status ON saved_trips(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_saved_trips_updated_at ON saved_trips;
CREATE TRIGGER update_saved_trips_updated_at
    BEFORE UPDATE ON saved_trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trip_collaborators table for sharing functionality
CREATE TABLE IF NOT EXISTS trip_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES saved_trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(trip_id, user_id)
);

-- Create indexes for collaborators
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_id ON trip_collaborators(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view own trips and public trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can update own trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON saved_trips;
DROP POLICY IF EXISTS "Users can view collaborations they're part of" ON trip_collaborators;
DROP POLICY IF EXISTS "Trip owners can manage collaborators" ON trip_collaborators;

-- Policy: Users can only see their own trips or public trips
CREATE POLICY "Users can view own trips and public trips" ON saved_trips
  FOR SELECT USING (
    user_id = auth.uid() 
    OR is_public = true 
    OR EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_id = saved_trips.id 
      AND user_id = auth.uid()
    )
  );

-- Policy: Users can only insert their own trips
CREATE POLICY "Users can insert own trips" ON saved_trips
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can only update their own trips or trips they can edit
CREATE POLICY "Users can update own trips" ON saved_trips
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_id = saved_trips.id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'editor')
    )
  );

-- Policy: Users can only delete their own trips
CREATE POLICY "Users can delete own trips" ON saved_trips
  FOR DELETE USING (user_id = auth.uid());

-- Collaborators policies
CREATE POLICY "Users can view collaborations they're part of" ON trip_collaborators
  FOR SELECT USING (
    user_id = auth.uid() 
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM saved_trips 
      WHERE id = trip_collaborators.trip_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip owners can manage collaborators" ON trip_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM saved_trips 
      WHERE id = trip_collaborators.trip_id 
      AND user_id = auth.uid()
    )
  );

-- Create a view for easier querying of trips with collaborator info
CREATE OR REPLACE VIEW trip_details AS
SELECT 
  st.*,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'user_id', tc.user_id,
        'role', tc.role,
        'accepted_at', tc.accepted_at
      )
    ) FILTER (WHERE tc.id IS NOT NULL),
    '[]'::json
  ) as collaborators
FROM saved_trips st
LEFT JOIN trip_collaborators tc ON st.id = tc.trip_id
GROUP BY st.id;

-- Grant permissions
GRANT ALL ON saved_trips TO authenticated;
GRANT ALL ON trip_collaborators TO authenticated;
GRANT SELECT ON trip_details TO authenticated;
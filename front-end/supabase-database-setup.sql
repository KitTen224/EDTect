-- ====================================================================
-- SUPABASE DATABASE SETUP FOR JAPAN TRAVEL PLANNER
-- ====================================================================
-- This script creates all required tables for the EDTect Japan Travel Planner
-- Run this in Supabase SQL Editor to fix "relation public.users does not exist" error
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. USERS TABLE
-- ====================================================================
-- Main users table for authentication (compatible with NextAuth.js)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    email_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ====================================================================
-- 2. USER PROFILES TABLE
-- ====================================================================
-- Extended user information and preferences
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    experience_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, expert
    budget_preference VARCHAR(20) DEFAULT 'moderate', -- budget, moderate, luxury
    notifications_enabled BOOLEAN DEFAULT true,
    preferred_regions JSONB DEFAULT '[]'::jsonb,
    preferred_styles JSONB DEFAULT '[]'::jsonb,
    preferred_seasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ====================================================================
-- 3. SAVED TRIPS TABLE
-- ====================================================================
-- Main table for storing travel itineraries
CREATE TABLE IF NOT EXISTS public.saved_trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Original form data from user input
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Generated timeline/itinerary data
    timeline_data JSONB DEFAULT '{}'::jsonb,
    
    -- Trip metadata
    total_duration INTEGER, -- in days
    total_estimated_cost DECIMAL(10,2),
    
    -- Trip preferences (arrays stored as JSONB)
    regions JSONB DEFAULT '[]'::jsonb,
    travel_styles JSONB DEFAULT '[]'::jsonb,
    seasons JSONB DEFAULT '[]'::jsonb,
    
    -- Sharing and visibility
    is_public BOOLEAN DEFAULT false,
    share_token UUID DEFAULT gen_random_uuid(),
    
    -- Trip status
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON public.saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_trips_share_token ON public.saved_trips(share_token);
CREATE INDEX IF NOT EXISTS idx_saved_trips_status ON public.saved_trips(status);
CREATE INDEX IF NOT EXISTS idx_saved_trips_is_public ON public.saved_trips(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_trips_created_at ON public.saved_trips(created_at DESC);

-- GIN indexes for JSONB columns for better search performance
CREATE INDEX IF NOT EXISTS idx_saved_trips_form_data ON public.saved_trips USING GIN(form_data);
CREATE INDEX IF NOT EXISTS idx_saved_trips_timeline_data ON public.saved_trips USING GIN(timeline_data);
CREATE INDEX IF NOT EXISTS idx_saved_trips_regions ON public.saved_trips USING GIN(regions);

-- ====================================================================
-- 4. AUTOMATIC TIMESTAMP UPDATES
-- ====================================================================
-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_trips_updated_at ON public.saved_trips;
CREATE TRIGGER update_saved_trips_updated_at
    BEFORE UPDATE ON public.saved_trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles table policies
DROP POLICY IF EXISTS "Users can view own user profile" ON public.user_profiles;
CREATE POLICY "Users can view own user profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user profile" ON public.user_profiles;
CREATE POLICY "Users can update own user profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user profile" ON public.user_profiles;
CREATE POLICY "Users can insert own user profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user profile" ON public.user_profiles;
CREATE POLICY "Users can delete own user profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Saved trips table policies
DROP POLICY IF EXISTS "Users can view own trips" ON public.saved_trips;
CREATE POLICY "Users can view own trips" ON public.saved_trips
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public trips" ON public.saved_trips;
CREATE POLICY "Users can view public trips" ON public.saved_trips
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can update own trips" ON public.saved_trips;
CREATE POLICY "Users can update own trips" ON public.saved_trips
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trips" ON public.saved_trips;
CREATE POLICY "Users can insert own trips" ON public.saved_trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trips" ON public.saved_trips;
CREATE POLICY "Users can delete own trips" ON public.saved_trips
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- 6. SAMPLE DATA (OPTIONAL)
-- ====================================================================
-- Insert sample data for testing (commented out by default)
/*
INSERT INTO public.users (id, email, name) VALUES 
    (gen_random_uuid(), 'test@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_profiles (user_id, email, name, preferred_regions, preferred_styles) 
SELECT 
    id, 
    email, 
    name,
    '["kanto", "kansai"]'::jsonb,
    '["traditional", "modern"]'::jsonb
FROM public.users 
WHERE email = 'test@example.com'
ON CONFLICT (user_id) DO NOTHING;
*/

-- ====================================================================
-- 7. VERIFICATION QUERIES
-- ====================================================================
-- Run these queries to verify the setup worked correctly

-- Check if all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_profiles', 'saved_trips')
ORDER BY tablename;

-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_profiles', 'saved_trips')
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_profiles', 'saved_trips')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_profiles', 'saved_trips')
ORDER BY tablename, policyname;

-- ====================================================================
-- SETUP COMPLETE!
-- ====================================================================
-- Your database is now ready for the Japan Travel Planner application.
-- The "relation public.users does not exist" error should be resolved.
-- 
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Test the application's trip saving functionality
-- 3. Run the database connection test script for additional verification
-- ====================================================================

SELECT 'Database setup completed successfully! All tables created with proper RLS policies.' as status;
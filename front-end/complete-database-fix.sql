-- ====================================================================
-- COMPLETE DATABASE DIAGNOSTIC AND FIX
-- ====================================================================
-- This script will diagnose and fix all database issues
-- Run this in Supabase SQL Editor
-- ====================================================================

-- First, let's check what tables actually exist
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if our specific tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
        THEN 'users table EXISTS'
        ELSE 'users table MISSING'
    END as users_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
        THEN 'user_profiles table EXISTS'
        ELSE 'user_profiles table MISSING'
    END as user_profiles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_trips' AND table_schema = 'public')
        THEN 'saved_trips table EXISTS'
        ELSE 'saved_trips table MISSING'
    END as saved_trips_status;

-- ====================================================================
-- RECREATE ALL TABLES (This will fix any missing tables)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they have issues (CASCADE removes dependencies)
DROP TABLE IF EXISTS public.saved_trips CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ====================================================================
-- 1. USERS TABLE
-- ====================================================================
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    email_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_users_email ON public.users(email);

-- ====================================================================
-- 2. USER PROFILES TABLE
-- ====================================================================
CREATE TABLE public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    experience_level VARCHAR(20) DEFAULT 'beginner',
    budget_preference VARCHAR(20) DEFAULT 'moderate',
    notifications_enabled BOOLEAN DEFAULT true,
    preferred_regions JSONB DEFAULT '[]'::jsonb,
    preferred_styles JSONB DEFAULT '[]'::jsonb,
    preferred_seasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- ====================================================================
-- 3. SAVED TRIPS TABLE
-- ====================================================================
CREATE TABLE public.saved_trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    timeline_data JSONB DEFAULT '{}'::jsonb,
    total_duration INTEGER,
    total_estimated_cost DECIMAL(10,2),
    regions JSONB DEFAULT '[]'::jsonb,
    travel_styles JSONB DEFAULT '[]'::jsonb,
    seasons JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    share_token UUID DEFAULT gen_random_uuid(),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_saved_trips_user_id ON public.saved_trips(user_id);
CREATE INDEX idx_saved_trips_share_token ON public.saved_trips(share_token);
CREATE INDEX idx_saved_trips_status ON public.saved_trips(status);
CREATE INDEX idx_saved_trips_is_public ON public.saved_trips(is_public);
CREATE INDEX idx_saved_trips_created_at ON public.saved_trips(created_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX idx_saved_trips_form_data ON public.saved_trips USING GIN(form_data);
CREATE INDEX idx_saved_trips_timeline_data ON public.saved_trips USING GIN(timeline_data);
CREATE INDEX idx_saved_trips_regions ON public.saved_trips USING GIN(regions);

-- ====================================================================
-- 4. AUTOMATIC TIMESTAMP UPDATES
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles table policies
CREATE POLICY "Users can view own user profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Saved trips table policies
CREATE POLICY "Users can view own trips" ON public.saved_trips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public trips" ON public.saved_trips
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update own trips" ON public.saved_trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.saved_trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.saved_trips
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- 6. FINAL VERIFICATION
-- ====================================================================

-- Verify all tables were created successfully
SELECT 
    'SUCCESS: All tables created!' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_profiles', 'saved_trips');

-- Show table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_profiles', 'saved_trips')
ORDER BY table_name, ordinal_position;

-- Show RLS policies
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_profiles', 'saved_trips')
ORDER BY tablename, policyname;

-- Final success message
SELECT 'Database setup completed successfully! All tables and policies created.' as final_status;

-- ====================================================================
-- SETUP COMPLETE!
-- ====================================================================
-- Your database is now ready for the Japan Travel Planner application.
-- The "relation public.users does not exist" error should be resolved.
-- 
-- Next steps:
-- 1. Test the application's trip saving functionality
-- 2. Run: npm run test-db (in your front-end directory)
-- ====================================================================
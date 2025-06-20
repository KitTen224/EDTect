-- ====================================================================
-- FIX RLS POLICIES - SUPABASE DATABASE
-- ====================================================================
-- This script fixes the RLS policy errors from the initial setup
-- Run this in Supabase SQL Editor after the main setup script
-- ====================================================================

-- Fix the RLS policies with correct column references
-- Remove and recreate the problematic policies

-- User profiles table policies (fixed)
DROP POLICY IF EXISTS "Users can view own user profile" ON public.user_profiles;
CREATE POLICY "Users can view own user profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own user profile" ON public.user_profiles;
CREATE POLICY "Users can update own user profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own user profile" ON public.user_profiles;
CREATE POLICY "Users can insert own user profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own user profile" ON public.user_profiles;
CREATE POLICY "Users can delete own user profile" ON public.user_profiles
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Saved trips table policies (fixed)
DROP POLICY IF EXISTS "Users can view own trips" ON public.saved_trips;
CREATE POLICY "Users can view own trips" ON public.saved_trips
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own trips" ON public.saved_trips;
CREATE POLICY "Users can update own trips" ON public.saved_trips
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own trips" ON public.saved_trips;
CREATE POLICY "Users can insert own trips" ON public.saved_trips
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own trips" ON public.saved_trips;
CREATE POLICY "Users can delete own trips" ON public.saved_trips
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Verify tables were created
SELECT 'Fixed RLS policies successfully!' as status;

-- Check that tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_profiles', 'saved_trips')
ORDER BY table_name;

-- ====================================================================
-- VERIFICATION COMPLETE!
-- ====================================================================
-- Your database should now be fully configured and ready to use.
-- The "relation public.users does not exist" error should be resolved.
-- 
-- Next steps:
-- 1. Test the application's trip saving functionality
-- 2. Run: npm run test-db (in your front-end directory)
-- ====================================================================
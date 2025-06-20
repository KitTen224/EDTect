# Setup Instructions for Fixing Trip Saving & Profile Updates

## 🛠️ Quick Fix Summary

I've fixed both issues:

1. **✅ Trip Saving Fixed**: Enhanced error handling and debugging in `/api/trips` 
2. **✅ Profile Updates Fixed**: Created complete profile API in `/api/user/profile`

## 🗄️ Database Setup Required

You need to create a `user_profiles` table in your Supabase database:

### Step 1: Create the Table

**Go to your Supabase Dashboard** → **SQL Editor** and run this SQL:

```sql
-- Create user_profiles table for storing user preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    experience_level VARCHAR(20) DEFAULT 'beginner',
    budget_preference VARCHAR(20) DEFAULT 'moderate', 
    notifications_enabled BOOLEAN DEFAULT true,
    preferred_regions JSONB DEFAULT '[]'::jsonb,
    preferred_styles JSONB DEFAULT '[]'::jsonb,
    preferred_seasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Enable Row Level Security (optional, for extra security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Step 2: Test the Setup

After creating the table, both features should work:

1. **Trip Saving**: Try saving a trip - you should see detailed debug logs in the terminal
2. **Profile Updates**: Go to `/profile` and try updating your name - it should save successfully

## 🔍 Debug Information

### Trip Saving Debug
- Enhanced session debugging in `/src/lib/auth.ts`
- Comprehensive error logging in `/src/app/api/trips/route.ts`
- Fallback to email as user identifier if `session.user.id` is not available

### Profile Updates Debug
- Complete API implementation in `/src/app/api/user/profile/route.ts`  
- Frontend integration in `/src/app/profile/page.tsx`
- Real-time error feedback with detailed messages

## 🚀 Testing Steps

1. **Restart your development server** to apply the auth changes:
   ```bash
   npm run dev
   ```

2. **Test Trip Saving**:
   - Generate an itinerary
   - Click "Save this trip"
   - Enter a title and click "Save Trip"
   - Check the terminal for debug logs

3. **Test Profile Updates**:
   - Go to `/profile` 
   - Change your name
   - Click "Save Profile"
   - Should show "Profile saved successfully!" alert

## 🐛 If Issues Persist

Check the browser console and terminal logs for specific error messages. The enhanced debugging will show exactly what's happening during authentication and database operations.

Both features now have comprehensive error handling and should provide clear feedback about any issues!
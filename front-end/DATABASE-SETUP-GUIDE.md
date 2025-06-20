# 🗄️ Database Setup Guide for Japan Travel Planner

## 🚨 Problem: "relation public.users does not exist" Error

This error occurs because your Next.js frontend expects database tables in Supabase that haven't been created yet. This guide will fix the issue completely.

## 📋 Prerequisites

- [ ] Supabase account with an active project
- [ ] Supabase project URL and anon key configured in your `.env.local`
- [ ] Access to Supabase SQL Editor

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Access Supabase SQL Editor

1. **Go to your Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project for the Japan Travel Planner

2. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New Query"** to create a new SQL script

### Step 2: Run the Database Setup Script

1. **Copy the SQL Script**
   - Open the file `supabase-database-setup.sql` in this directory
   - Copy all the contents (Ctrl+A, then Ctrl+C)

2. **Paste and Execute**
   - Paste the entire script into the SQL Editor
   - Click **"Run"** or press Ctrl+Enter
   - ⏳ Wait for the script to complete (should take 10-30 seconds)

3. **Verify Success**
   - You should see a success message: `"Database setup completed successfully! All tables created with proper RLS policies."`
   - If you see any errors, check the [Troubleshooting](#troubleshooting) section below

### Step 3: Verify Tables Were Created

Run these verification queries in the SQL Editor:

```sql
-- Check if all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_profiles', 'saved_trips')
ORDER BY table_name;
```

**Expected Result**: You should see 3 rows:
- `saved_trips`
- `user_profiles` 
- `users`

### Step 4: Test the Application

1. **Start your development server**
   ```bash
   cd front-end
   npm run dev
   ```

2. **Test Trip Saving**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Fill out the travel form
   - Click "Save Trip"
   - ✅ The error should be gone and the trip should save successfully

## 📊 Database Schema Overview

The setup script creates three main tables:

### 🧑‍💼 `public.users`
- **Purpose**: Main authentication table (NextAuth.js compatible)
- **Key Fields**: `id`, `email`, `name`, `image`
- **Security**: Row Level Security enabled

### 👤 `public.user_profiles`
- **Purpose**: Extended user preferences and settings
- **Key Fields**: `user_id`, `language`, `experience_level`, `preferred_regions`
- **Features**: JSONB fields for flexible preference storage

### 🗾 `public.saved_trips`
- **Purpose**: Travel itineraries and trip data
- **Key Fields**: `user_id`, `title`, `form_data`, `timeline_data`
- **Features**: 
  - JSONB storage for flexible trip data
  - Public sharing with unique tokens
  - Status tracking (draft/published/archived)

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation**: Users can only access their own data
- **Public sharing**: Controlled sharing via unique tokens
- **Authentication integration**: Compatible with NextAuth.js

## 🧪 Testing & Verification

### Option 1: Use the Test Script (Recommended)

```bash
cd front-end
npm run test-db
```

This will run comprehensive tests to verify:
- ✅ All tables exist and are accessible
- ✅ RLS policies work correctly
- ✅ User and trip creation works
- ✅ Data retrieval functions properly

### Option 2: Manual Testing

1. **Test User Creation**
   ```sql
   -- This should work without errors
   INSERT INTO public.users (email, name) 
   VALUES ('test@example.com', 'Test User');
   ```

2. **Test Trip Creation**
   ```sql
   -- This should work without errors
   INSERT INTO public.saved_trips (user_id, title, form_data)
   SELECT id, 'Test Trip', '{"region": "kanto"}'::jsonb
   FROM public.users WHERE email = 'test@example.com';
   ```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Error: "permission denied for table users"
**Cause**: RLS policies are too restrictive
**Solution**: 
```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

#### Error: "relation already exists"
**Cause**: Tables already exist from previous setup attempts
**Solution**: Drop existing tables first:
```sql
DROP TABLE IF EXISTS public.saved_trips CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
-- Then re-run the setup script
```

#### Error: "function gen_random_uuid() does not exist"
**Cause**: Required extensions not installed
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### Application still shows "relation does not exist"
**Possible Causes**:
1. **Wrong Supabase project**: Check your `.env.local` file
2. **Cache issues**: Restart your development server
3. **Environment variables**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Solution**:
```bash
# Stop the dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

### Getting Help

If you're still experiencing issues:

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for any error messages

2. **Verify Environment Variables**
   ```bash
   # In your front-end directory
   cat .env.local
   ```
   Ensure these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Check Network Connection**
   - Ensure you can access your Supabase project
   - Test the connection with: `npm run test-db`

## ✅ Success Checklist

After completing the setup, verify these items:

- [ ] All 3 tables exist in Supabase (`users`, `user_profiles`, `saved_trips`)
- [ ] RLS policies are enabled and working
- [ ] Trip saving works in the application
- [ ] No "relation does not exist" errors
- [ ] Test script passes all checks

## 🚀 Next Steps

Once the database is set up successfully:

1. **Test all application features**
   - User registration/login
   - Trip creation and saving
   - Trip retrieval and editing

2. **Consider adding sample data**
   - Uncomment the sample data section in the SQL script
   - Or create test trips through the application

3. **Monitor performance**
   - Check query performance in Supabase Dashboard
   - Add additional indexes if needed for your specific use cases

## 📞 Support

If you continue to experience issues after following this guide:

1. Check the browser console for detailed error messages
2. Review Supabase logs in the dashboard
3. Ensure your environment variables are correctly configured
4. Run the database test script for automated diagnostics

---

**🎉 Congratulations!** Your Japan Travel Planner database is now properly configured and ready to use!
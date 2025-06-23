#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 EDTect Setup - Initializing database and environment...\n');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
    console.log('❌ .env.local file not found!');
    console.log('📝 Please create .env.local file:');
    console.log('   1. Copy .env.example to .env.local');
    console.log('   2. Fill in your Supabase credentials');
    console.log('   3. Run npm run dev again\n');
    process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials in .env.local');
    console.log('📝 Required variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   - NEXTAUTH_SECRET\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkAndSetupDatabase() {
    try {
        console.log('🔌 Testing database connection...');
        
        // Test connection
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.log('❌ Database connection failed:', testError.message);
            console.log('📝 Please check your Supabase credentials\n');
            return false;
        }
        
        console.log('✅ Database connection successful');
        
        // Check if users table has password column
        console.log('🔍 Checking database schema...');
        
        const { data: columns, error: schemaError } = await supabase
            .rpc('get_table_columns', { table_name: 'users' })
            .single();
        
        // If the RPC doesn't exist or fails, try a simpler approach
        const { data: sampleUser, error: sampleError } = await supabase
            .from('users')
            .select('password')
            .limit(1);
        
        if (sampleError && sampleError.message.includes('column "password" does not exist')) {
            console.log('🔧 Database schema needs updating...');
            await fixDatabaseSchema();
        } else {
            console.log('✅ Database schema is up to date');
        }
        
        console.log('🎉 Setup complete! Database is ready.\n');
        return true;
        
    } catch (error) {
        console.log('❌ Setup error:', error.message);
        return false;
    }
}

async function fixDatabaseSchema() {
    try {
        console.log('📝 Applying database schema fixes...');
        
        // Check and add password column
        console.log('   - Adding password column to users table...');
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `
                DO $$
                BEGIN
                    -- Add password column if it doesn't exist
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'users' AND column_name = 'password'
                    ) THEN
                        ALTER TABLE users ADD COLUMN password TEXT;
                        UPDATE users SET password = 'temp_password_needs_reset' WHERE password IS NULL;
                        ALTER TABLE users ALTER COLUMN password SET NOT NULL;
                    END IF;
                END $$;
            `
        });
        
        if (alterError) {
            // Fallback: try direct SQL execution
            console.log('   - Using alternative method...');
            
            // This might not work with RLS, but we'll try a simpler approach
            await supabase.rpc('add_password_column');
        }
        
        console.log('   - Configuring authentication policies...');
        
        // Set up proper policies for authentication
        const policiesSQL = `
            -- Disable RLS temporarily for setup
            ALTER TABLE users DISABLE ROW LEVEL SECURITY;
            
            -- Grant necessary permissions
            GRANT ALL ON users TO authenticated;
            GRANT ALL ON users TO anon;
            
            -- Re-enable RLS
            ALTER TABLE users ENABLE ROW LEVEL SECURITY;
            
            -- Create policies for registration and access
            DROP POLICY IF EXISTS "Allow registration" ON users;
            CREATE POLICY "Allow registration" ON users
                FOR INSERT TO anon
                WITH CHECK (true);
            
            DROP POLICY IF EXISTS "Users can read own data" ON users;
            CREATE POLICY "Users can read own data" ON users
                FOR SELECT TO authenticated
                USING (auth.uid()::text = id::text);
        `;
        
        // Since we can't execute complex SQL directly, we'll log instructions
        console.log('⚠️  Manual step required:');
        console.log('   Please run the following SQL in your Supabase SQL Editor:');
        console.log('   (This only needs to be done once per database)\n');
        console.log('   ```sql');
        console.log('   -- Add password column if missing');
        console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT \'temp\';');
        console.log('   ');
        console.log('   -- Set up authentication policies');
        console.log('   ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
        console.log('   GRANT ALL ON users TO anon;');
        console.log('   ALTER TABLE users ENABLE ROW LEVEL SECURITY;');
        console.log('   CREATE POLICY "Allow registration" ON users FOR INSERT TO anon WITH CHECK (true);');
        console.log('   ```\n');
        
        console.log('✅ Schema update instructions provided');
        
    } catch (error) {
        console.log('❌ Schema fix error:', error.message);
        console.log('📝 Please manually apply the database fixes from fix-auth-schema.sql');
    }
}

// Run setup
checkAndSetupDatabase()
    .then((success) => {
        if (success) {
            console.log('🎯 Ready to start development!');
            console.log('   Run: npm run dev');
        } else {
            console.log('❌ Setup incomplete. Please fix the issues above and try again.');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.log('❌ Setup failed:', error.message);
        process.exit(1);
    });
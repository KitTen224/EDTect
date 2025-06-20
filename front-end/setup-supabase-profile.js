const { supabaseServer } = require('./src/lib/supabase');

async function setupUserProfiles() {
    console.log('🔧 Setting up user_profiles table...');
    
    try {
        // First, try to create the table
        const createTableQuery = `
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
        `;
        
        console.log('Creating user_profiles table...');
        const { error: createError } = await supabaseServer.rpc('exec_sql', { 
            sql: createTableQuery 
        });
        
        if (createError) {
            console.log('Table might already exist, trying direct approach...');
            // Try a simple insert/select to test if table exists
            const { error: testError } = await supabaseServer
                .from('user_profiles')
                .select('id')
                .limit(1);
                
            if (testError && testError.code === '42P01') {
                console.error('❌ Table does not exist and cannot be created:', createError);
                console.log('\n📋 Please run this SQL in your Supabase SQL editor:');
                console.log(createTableQuery);
                return false;
            }
        }
        
        console.log('✅ user_profiles table is ready');
        
        // Test the table with a simple query
        const { data, error: selectError } = await supabaseServer
            .from('user_profiles')
            .select('*')
            .limit(1);
            
        if (selectError) {
            console.error('❌ Error testing table:', selectError);
            return false;
        }
        
        console.log('✅ Table test successful');
        return true;
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        return false;
    }
}

setupUserProfiles().then(success => {
    if (success) {
        console.log('\n🎉 User profiles setup complete!');
    } else {
        console.log('\n❌ Setup failed. Please check the errors above.');
    }
    process.exit(success ? 0 : 1);
});
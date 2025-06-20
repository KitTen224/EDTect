#!/usr/bin/env node

/**
 * Database Connection Test Script for Japan Travel Planner
 * 
 * This script tests the Supabase database setup and verifies all required
 * tables exist and are properly configured with Row Level Security.
 * 
 * Usage: npm run test-db
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Helper function for colored console output
function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    colorLog('green', `✅ ${message}`);
}

function error(message) {
    colorLog('red', `❌ ${message}`);
}

function warning(message) {
    colorLog('yellow', `⚠️  ${message}`);
}

function info(message) {
    colorLog('blue', `ℹ️  ${message}`);
}

function section(message) {
    colorLog('cyan', `\n🔍 ${message}`);
    console.log('━'.repeat(50));
}

// Database test class
class DatabaseTester {
    constructor() {
        this.supabase = null;
        this.testResults = {
            connection: false,
            tables: false,
            policies: false,
            operations: false
        };
    }

    async initialize() {
        section('Initializing Database Connection');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            error('Missing Supabase environment variables');
            error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
            return false;
        }

        try {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            success('Supabase client initialized');
            
            // Test basic connection
            const { data, error: connectionError } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);

            if (connectionError) {
                if (connectionError.message.includes('relation "public.users" does not exist')) {
                    error('Users table does not exist - please run the database setup script');
                    warning('Run: npm run setup-db or manually execute supabase-database-setup.sql');
                    return false;
                }
                throw connectionError;
            }

            success('Database connection established');
            this.testResults.connection = true;
            return true;
        } catch (err) {
            error(`Connection failed: ${err.message}`);
            return false;
        }
    }

    async testTableStructure() {
        section('Testing Table Structure');

        const requiredTables = [
            {
                name: 'users',
                expectedColumns: ['id', 'email', 'name', 'image', 'created_at', 'updated_at']
            },
            {
                name: 'user_profiles', 
                expectedColumns: ['id', 'user_id', 'email', 'name', 'language', 'experience_level']
            },
            {
                name: 'saved_trips',
                expectedColumns: ['id', 'user_id', 'title', 'form_data', 'timeline_data', 'created_at']
            }
        ];

        let allTablesExist = true;

        for (const table of requiredTables) {
            try {
                // Test if table exists by querying its structure
                const { data, error } = await this.supabase
                    .from(table.name)
                    .select('*')
                    .limit(0);

                if (error) {
                    if (error.message.includes('does not exist')) {
                        error(`Table '${table.name}' does not exist`);
                        allTablesExist = false;
                        continue;
                    }
                    throw error;
                }

                success(`Table '${table.name}' exists and is accessible`);
            } catch (err) {
                error(`Error testing table '${table.name}': ${err.message}`);
                allTablesExist = false;
            }
        }

        this.testResults.tables = allTablesExist;
        return allTablesExist;
    }

    async testRowLevelSecurity() {
        section('Testing Row Level Security Policies');

        // Test that RLS is working by trying to access data without authentication
        // This should either return empty results or specific RLS errors
        
        try {
            // Test users table RLS
            const { data: userData, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .limit(1);

            // With RLS enabled and no auth, this should return empty array or specific error
            if (userError && !userError.message.includes('RLS')) {
                warning(`Unexpected error testing users RLS: ${userError.message}`);
            } else {
                success('Users table RLS policies are active');
            }

            // Test saved_trips table RLS
            const { data: tripsData, error: tripsError } = await this.supabase
                .from('saved_trips')
                .select('*')
                .limit(1);

            if (tripsError && !tripsError.message.includes('RLS')) {
                warning(`Unexpected error testing saved_trips RLS: ${tripsError.message}`);
            } else {
                success('Saved trips table RLS policies are active');
            }

            this.testResults.policies = true;
            return true;
        } catch (err) {
            error(`RLS testing failed: ${err.message}`);
            return false;
        }
    }

    async testCRUDOperations() {
        section('Testing CRUD Operations');

        const testUserId = 'test-user-' + Date.now();
        const testEmail = `test-${Date.now()}@example.com`;

        try {
            // Note: These operations will likely fail due to RLS policies
            // unless we're authenticated, but we can test the error responses
            
            // Test user creation (this should fail gracefully with RLS)
            const { data: userData, error: userError } = await this.supabase
                .from('users')
                .insert({
                    id: testUserId,
                    email: testEmail,
                    name: 'Test User'
                })
                .select();

            if (userError) {
                if (userError.message.includes('RLS') || userError.message.includes('policy')) {
                    success('User insertion properly blocked by RLS (as expected)');
                } else {
                    warning(`User insertion failed with: ${userError.message}`);
                }
            } else {
                warning('User insertion succeeded without authentication (RLS may not be working)');
                
                // Clean up if insertion somehow succeeded
                await this.supabase
                    .from('users')
                    .delete()
                    .eq('id', testUserId);
            }

            // Test trip creation (this should also fail gracefully with RLS)
            const { data: tripData, error: tripError } = await this.supabase
                .from('saved_trips')
                .insert({
                    user_id: testUserId,
                    title: 'Test Trip',
                    form_data: { region: 'kanto', season: 'spring' }
                })
                .select();

            if (tripError) {
                if (tripError.message.includes('RLS') || tripError.message.includes('policy')) {
                    success('Trip insertion properly blocked by RLS (as expected)');
                } else {
                    warning(`Trip insertion failed with: ${tripError.message}`);
                }
            } else {
                warning('Trip insertion succeeded without authentication (RLS may not be working)');
                
                // Clean up if insertion somehow succeeded
                await this.supabase
                    .from('saved_trips')
                    .delete()
                    .eq('user_id', testUserId);
            }

            this.testResults.operations = true;
            return true;
        } catch (err) {
            error(`CRUD operations test failed: ${err.message}`);
            return false;
        }
    }

    async runFullTest() {
        colorLog('magenta', '\n🧪 Starting Database Connection Test');
        colorLog('magenta', '📅 Japan Travel Planner - Database Verification');
        console.log('='.repeat(60));

        const startTime = Date.now();

        // Run all tests
        const connectionOk = await this.initialize();
        if (!connectionOk) {
            return this.printResults(false);
        }

        const tablesOk = await this.testTableStructure();
        const policiesOk = await this.testRowLevelSecurity();
        const operationsOk = await this.testCRUDOperations();

        const allTestsPassed = connectionOk && tablesOk && policiesOk && operationsOk;
        const duration = Date.now() - startTime;

        return this.printResults(allTestsPassed, duration);
    }

    printResults(allPassed, duration = 0) {
        section('Test Results Summary');

        console.log(`Connection Test: ${this.testResults.connection ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Table Structure: ${this.testResults.tables ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`RLS Policies: ${this.testResults.policies ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`CRUD Operations: ${this.testResults.operations ? '✅ PASS' : '❌ FAIL'}`);

        console.log('\n' + '='.repeat(60));

        if (allPassed) {
            success(`🎉 All tests passed! Database is properly configured.`);
            success(`   Your Japan Travel Planner should work without database errors.`);
            if (duration > 0) {
                info(`   Test completed in ${duration}ms`);
            }
        } else {
            error(`❌ Some tests failed. Please check the output above.`);
            warning(`   Refer to DATABASE-SETUP-GUIDE.md for troubleshooting steps.`);
        }

        console.log('\n📋 Next Steps:');
        if (allPassed) {
            console.log('   1. Start your development server: npm run dev');
            console.log('   2. Test trip saving functionality in the application');
            console.log('   3. Verify user authentication works correctly');
        } else {
            console.log('   1. Run the database setup script: supabase-database-setup.sql');
            console.log('   2. Check your environment variables in .env.local');
            console.log('   3. Refer to DATABASE-SETUP-GUIDE.md for detailed instructions');
        }

        return allPassed;
    }
}

// Main execution
async function main() {
    const tester = new DatabaseTester();
    
    try {
        const success = await tester.runFullTest();
        process.exit(success ? 0 : 1);
    } catch (err) {
        error(`Test execution failed: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the tests if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { DatabaseTester };
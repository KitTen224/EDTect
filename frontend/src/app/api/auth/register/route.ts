import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/auth/register called');
    
    // Test database connection first
    console.log('🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabaseServer
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return NextResponse.json(
        { error: 'Database connection failed', details: testError.message },
        { status: 500 }
      );
    }
    console.log('✅ Database connection successful');
    
    const { name, email, password } = await request.json();
    console.log('📝 Registration attempt:', { name, email: email?.toLowerCase(), hasPassword: !!password });

    // Validate input
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    console.log('✅ Input validation passed');

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Database error while checking user', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    console.log('✅ User does not exist, proceeding with registration');

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed');

    // Create user
    console.log('🗄️ Creating user in database...');
    const { data: user, error } = await supabaseServer
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
      })
      .select('id, name, email, created_at')
      .single();

    if (error) {
      console.error('❌ Database error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create account', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    console.log('✅ User created successfully:', user.id);

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
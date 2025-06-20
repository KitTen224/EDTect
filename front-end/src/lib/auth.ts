import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { SupabaseAdapter } from "@auth/supabase-adapter"

// Build providers array conditionally based on available environment variables
const providers = [];

// Always add Google provider if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn('Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Add Email provider only if SMTP server is configured
if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: process.env.EMAIL_SERVER_USER ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        } : undefined,
      },
      from: process.env.EMAIL_FROM,
    })
  );
} else {
  console.warn('Email provider not configured: Missing EMAIL_SERVER_HOST or EMAIL_FROM');
}

// Log configuration status
if (providers.length === 0) {
  console.error('⚠️ NextAuth: No authentication providers configured! Please check your environment variables.');
} else {
  console.log(`✅ NextAuth: Configured with ${providers.length} provider(s): ${providers.map(p => p.name).join(', ')}`);
}

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
} else {
  console.log('✅ All required NextAuth environment variables are set');
}

// Check Supabase configuration
const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
if (supabaseConfigured) {
  console.log('✅ Supabase adapter configured');
} else {
  console.warn('⚠️ Supabase adapter not configured: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.warn('   → User sessions will use JWT tokens only (no database persistence)');
}

export const authOptions: NextAuthOptions = {
  // Temporarily disable Supabase adapter for debugging
  // Will re-enable once basic OAuth is working
  // ...(supabaseConfigured ? {
  //   adapter: SupabaseAdapter({
  //     url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  //   }),
  // } : {}),
  providers,
  session: {
    strategy: "jwt", // Use JWT sessions for now
  },
  callbacks: {
    async session({ session, token }) {
      console.log('📝 Session callback:', { 
        session: !!session, 
        token: !!token, 
        userId: token.sub,
        userEmail: session.user?.email 
      });
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      console.log('🎫 JWT callback:', { 
        token: !!token, 
        user: !!user, 
        account: !!account,
        tokenSub: token.sub,
        userEmail: user?.email 
      });
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  // Add debug options
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('❌ NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', code, metadata);
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
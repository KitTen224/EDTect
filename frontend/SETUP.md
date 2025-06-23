# 🚀 EDTect Team Setup Guide

Welcome to the EDTect Japan Travel Planner project! This guide will get you up and running in minutes.

## ⚡ Quick Start (Automated Setup)

If you already have npm dependencies installed:

```bash
# 1. Get latest code
git pull origin kimhengTest-cleanup

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development (auto-runs setup)
npm run dev
```

That's it! The setup script will automatically check and configure your database.

## 🔧 First Time Setup

If you're setting up from scratch:

```bash
# 1. Clone repository
git clone https://github.com/KitTen224/EDTect.git
cd EDTect/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Edit .env.local with your credentials
# 5. Start development
npm run dev
```

## 📝 Environment Configuration

Create `.env.local` file with these required variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXT_PUBLIC_AUTH_ENABLED=true

# Optional: AI Integration
GEMINI_API_KEY=your-gemini-api-key-here
```

## 🗄️ Database Setup

The setup script automatically handles database configuration, but if you need to do it manually:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Run the migration script: `migrations/001_add_password_column.sql`

## 🎯 What You Get

After setup, you'll have:

### ✅ **Working Features**
- **Custom Authentication System** - JWT-based login/register
- **Beautiful UI** - Japan-themed responsive design
- **Trip Planning** - AI-powered itinerary creation
- **User Profiles** - Personal settings and trip management
- **Real-time Updates** - Live collaboration features

### ✅ **Bug-Free Experience**
- Registration works perfectly
- Profile button clickable everywhere
- User-specific data (no shared names)
- Proper authentication flow
- Responsive navigation

### ✅ **Development Tools**
- Hot reload development server
- TypeScript support
- Tailwind CSS styling
- Framer Motion animations
- Debug components

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start with automated setup
npm run dev:skip-setup  # Start without running setup
npm run setup        # Run setup script only

# Production
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### "Failed to create account"
- ✅ **Fixed!** Run `npm run setup` to apply database fixes

### "Sign In button stuck after login"
- ✅ **Fixed!** Clear browser localStorage and restart dev server

### "Session is not defined" errors
- ✅ **Fixed!** Updated to custom authentication system

### "Trip not found" errors
- ✅ **Fixed!** API authentication now works properly

### "Profile button not clickable"
- ✅ **Fixed!** Z-index conflicts resolved

### Environment Issues
```bash
# If you get environment errors:
1. Check .env.local file exists
2. Verify all required variables are set
3. Restart development server
4. Clear browser cache
```

### Database Connection Issues
```bash
# If setup script fails:
1. Verify Supabase credentials
2. Check internet connection
3. Run: npm run setup
4. If still failing, apply SQL migration manually
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/auth/       # Authentication API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── trips/          # Trip management pages
│   │   └── profile/        # User profile page
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Core UI components
│   │   └── ...            # Feature components
│   ├── contexts/          # React contexts (Auth, Language)
│   ├── types/             # TypeScript type definitions
│   └── lib/               # Utility libraries
├── migrations/            # Database migration scripts
├── setup.js              # Automated setup script
└── package.json          # Dependencies and scripts
```

## 🎉 You're Ready!

Once setup is complete, you can:

1. **Create an account** at `http://localhost:3000/auth`
2. **Plan a Japan trip** using the AI-powered form
3. **Save and manage trips** in your profile
4. **Collaborate** with team members
5. **Start developing** new features

## 🤝 Contributing

- Create feature branches from `kimhengTest-cleanup`
- Make sure tests pass before pushing
- Follow the existing code style
- Add proper TypeScript types
- Update documentation for new features

## 🆘 Need Help?

- Check the troubleshooting section above
- Review the setup script output for specific errors
- Ask team members for Supabase credentials
- Check the main README for additional project information

Happy coding! 🎌
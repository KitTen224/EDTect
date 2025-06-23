# 🇯🇵 EDTect - Japan Travel Planner

An AI-powered travel planning application specifically designed for creating personalized Japan itineraries. Features beautiful UI, real-time collaboration, and intelligent recommendations tailored for Japanese travel experiences.

## 🚀 Quick Start for Team Members

**Already have the repo? Get the latest features:**

```bash
git pull origin kimhengTest-cleanup
cp .env.example .env.local  # Configure your environment
npm run dev                 # Auto-setup + start development
```

**New to the project? See [SETUP.md](./SETUP.md) for complete setup instructions.**

## ✨ Current Features (Latest Update)

### 🔐 **Custom Authentication System**
- JWT-based secure authentication
- Beautiful Japan-themed login/register pages
- User-specific data isolation
- Session persistence across devices

### 🎌 **Japan Travel Planning**
- AI-powered itinerary generation using Gemini
- 6 major Japan regions (Kantō, Kansai, Chūbu, etc.)
- Authentic travel styles (Traditional, Modern, Nature, etc.)
- Seasonal planning with cultural events

### 🎯 **User Experience**
- Minimalist multi-step form design
- Drag-and-drop timeline editing
- Real-time budget calculations
- Mobile-responsive design
- Smooth animations with Framer Motion

### 👥 **Team Collaboration**
- Trip sharing and collaboration
- User profiles and settings
- Multi-language support (English/Japanese)
- Save and manage multiple trips

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Authentication:** Custom JWT with Supabase
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Vercel

## 📱 Development

```bash
# Start development with auto-setup
npm run dev

# Start without setup (if already configured)
npm run dev:skip-setup

# Run setup script only
npm run setup

# Build for production
npm run build
```

## 🎯 Project Status

### ✅ **Completed & Working**
- ✅ Custom authentication system
- ✅ User registration and login
- ✅ Trip planning and AI generation
- ✅ Trip saving and management
- ✅ User profiles and settings
- ✅ Responsive design
- ✅ Error handling and validation

### 🔧 **Recently Fixed**
- ✅ "Failed to create account" registration errors
- ✅ Authentication state persistence
- ✅ Profile button clickability issues
- ✅ User-specific display names
- ✅ API authentication and trip loading
- ✅ UI z-index conflicts

### 🚀 **Planned Features** (12-Week Roadmap)
- **Phase 2:** Advanced personalization engine
- **Phase 3:** Real-time collaboration features
- **Phase 4:** Mobile app and offline support

## 📁 Project Structure

```
frontend/
├── src/app/              # Next.js app router
│   ├── api/auth/        # Authentication endpoints
│   ├── auth/            # Auth pages
│   ├── trips/           # Trip management
│   └── profile/         # User settings
├── src/components/      # React components
├── src/contexts/        # React contexts
├── migrations/          # Database migrations
├── setup.js            # Automated setup
└── SETUP.md            # Team setup guide
```

## 🤝 Contributing

1. **Get Latest:** `git pull origin kimhengTest-cleanup`
2. **Setup:** Follow [SETUP.md](./SETUP.md)
3. **Develop:** Create feature branches
4. **Test:** Ensure everything works
5. **Push:** Submit PRs to `kimhengTest-cleanup`

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide for team members
- **[CLAUDE.md](../CLAUDE.md)** - Project vision and roadmap
- **Environment Variables** - See `.env.example`

## 🆘 Need Help?

- Check [SETUP.md](./SETUP.md) troubleshooting section
- Review setup script output for specific errors
- Ask team members for environment credentials
- Create GitHub issues for bugs

## 📄 License

Private project - EDTect Team

---

**🎌 Ready to plan your Japan journey? Start with `npm run dev`!**
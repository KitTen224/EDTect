# EDTect - Japan Travel Planner

A minimalist, Japan-focused AI travel planning application that creates personalized itineraries for exploring different regions of Japan.

## 🏗️ Project Structure

```
EDTect/
├── frontend/           # Next.js 14 + TypeScript React app
├── backend/           # Laravel PHP API
├── docs/             # Project documentation
├── image/            # Assets and images
└── package.json      # Workspace configuration
```

## 🚀 Quick Start

### Development

```bash
# Install all dependencies
npm run install:all

# Start frontend development server
npm run dev

# Or start both services
npm run dev:frontend    # Next.js on :3000
npm run dev:backend     # Laravel on :8000
```

### Build & Deploy

```bash
# Build frontend for production
npm run build

# Start production server
npm run start
```

### Maintenance

```bash
# Clean cache and temporary files
npm run clean

# Lint frontend code
npm run lint
```

## 🎌 Features

- **Japan Region Selection**: 6 major regions with cultural context
- **Travel Style Personalization**: Traditional, Modern, Nature, Spiritual, Culinary, Ryokan
- **Seasonal Planning**: Season-specific activities and cultural events
- **AI-Powered Recommendations**: Personalized itinerary generation
- **Interactive Timeline**: Drag-and-drop activity planning
- **Budget Management**: Real-time cost tracking and optimization

## 🛠️ Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React DnD for drag-and-drop
- NextAuth.js for authentication
- Supabase for database

### Backend
- Laravel 10 PHP framework
- MySQL database
- RESTful API design
- Authentication with Sanctum

## 📚 Documentation

- [Frontend Documentation](docs/frontend-README.md)
- [Backend Documentation](docs/backend-README.md)
- [Project Vision](../CLAUDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
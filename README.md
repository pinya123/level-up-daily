# Level Up Daily - Gamified Productivity App

A mobile app designed for students and professionals who want to build effective habits, fight procrastination, and stay motivated through gamification and social competition.

## 🎯 Features

### Core Features
- **Task Management**: Create, edit, and delete tasks with difficulty levels
- **Gamification**: Earn points based on task difficulty and completion time
- **Streak Tracking**: Build and maintain daily streaks for motivation
- **Social Competition**: Compete with friends in 1:1 or group competitions (up to 5 users)
- **Peer Review**: Suggest difficulty changes for friends' tasks to keep competitions fair
- **Productivity Insights**: Data-driven suggestions to improve your productivity

### Technical Features
- **Cross-platform**: React Native with Expo for iOS and Android
- **Real-time Updates**: Live leaderboards and competition tracking
- **Push Notifications**: Reminders for tasks, streaks, and competition updates
- **Secure Authentication**: JWT-based authentication with secure token storage
- **Offline Support**: Local caching with auto-resync upon reconnect

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful API with comprehensive validation
- **Real-time**: WebSocket support for live updates

### Frontend (React Native + Expo + TypeScript)
- **State Management**: Zustand for global state
- **Data Fetching**: React Query for server state
- **UI Components**: React Native Paper + custom components
- **Navigation**: React Navigation v6
- **Charts**: React Native Chart Kit for analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Expo CLI (`npm install -g @expo/cli`)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd level-up-daily
npm run install:all
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb level_up_daily

# Copy environment file
cp backend/env.example backend/.env

# Edit backend/.env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/level_up_daily"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

### 5. Mobile App
- Install Expo Go on your phone
- Scan the QR code from the terminal
- Or run on simulator: `npx expo start --ios` or `npx expo start --android`

## 📱 App Structure

### Screens
- **Authentication**: Login/Register with onboarding
- **Dashboard**: Streak display, quick stats, recent tasks
- **Tasks**: Full task management with filtering
- **Competitions**: Create/join competitions, view leaderboards
- **Profile**: User settings, friends, difficulty reviews

### Key Components
- **TaskCard**: Displays task with difficulty and completion status
- **StreakCard**: Shows current streak with progress bar
- **LeaderboardCard**: Competition rankings with real-time updates
- **DifficultyChip**: Visual difficulty indicators with points
- **ReflectionModal**: Mandatory reflection input for task completion

## 🎮 Gamification System

### Point Calculation
```
Points = (Difficulty Points) / max({hours since user's day start}, 1)
```

**Difficulty Points:**
- Easy: 50 points
- Medium: 70 points  
- Hard: 100 points

### Streak System
- Track consecutive days with completed tasks
- Reset streak if no task completed by end of day
- Display current and maximum streaks

### Competition Features
- Create competitions with 1-5 participants
- Set custom duration (days/weeks)
- Real-time leaderboard updates
- Peer difficulty review system
- Fair play monitoring

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npx prisma studio    # Database GUI
```

### Frontend Development
```bash
cd frontend
npm start            # Start Expo development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev    # Create and apply migration
npx prisma db push        # Push schema changes
npx prisma generate       # Generate Prisma client
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/complete` - Complete task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### Competitions
- `GET /api/competitions` - Get user competitions
- `POST /api/competitions` - Create competition
- `GET /api/competitions/:id` - Get competition details
- `POST /api/competitions/:id/join` - Join competition
- `GET /api/competitions/:id/leaderboard` - Get leaderboard

### Users & Social
- `GET /api/users/search` - Search users
- `POST /api/users/friend-request` - Send friend request
- `GET /api/users/friends` - Get friends list
- `POST /api/users/difficulty-review` - Submit difficulty review
- `GET /api/users/suggestions` - Get productivity suggestions

## 🚀 Deployment

### Backend Deployment (Vercel)
```bash
cd backend
npm run build
vercel --prod
```

### Frontend Deployment (Expo)
```bash
cd frontend
eas build --platform all
eas submit --platform all
```

### Database (Supabase)
1. Create Supabase project
2. Update DATABASE_URL in backend/.env
3. Run migrations: `npx prisma db push`

## 📈 Analytics & Monitoring

### Key Metrics
- Daily Active Users (DAU)
- Task completion rate
- Average streak length
- Competition participation
- User retention (D1, D7, D30)

### Monitoring
- API response times
- Error rates
- Database performance
- Push notification delivery

## 🔒 Security

### Authentication
- JWT tokens with 7-day expiration
- Secure token storage using Expo SecureStore
- Password hashing with bcrypt

### Data Protection
- Input validation on all endpoints
- SQL injection prevention with Prisma
- CORS configuration
- Rate limiting

### Privacy
- GDPR-compliant data handling
- User data export/deletion
- End-to-end encryption for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for the excellent framework
- Expo team for the amazing development tools
- Prisma team for the type-safe database ORM
- React Query team for the powerful data fetching library

## 📞 Support

For support, email support@levelupdaily.com or join our Discord community.

---

**Built with ❤️ for productive people everywhere** 
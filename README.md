# Level Up Daily - Gamified Productivity App

A mobile app designed for students and professionals who want to build effective habits, fight procrastination, and stay motivated. Users can log tasks with difficulty levels, earn points for timely completion, maintain streaks, receive personalized suggestions, and engage in friendly competition.

## Features

### Core Features (MVP)
- ✅ **Task Management**: Create, edit, delete tasks with difficulty levels
- ✅ **Gamification**: Points system based on difficulty and completion time
- ✅ **Streak Tracking**: Daily streaks with maximum streak tracking
- ✅ **Reflection System**: Mandatory reflection notes on task completion
- ✅ **User Authentication**: Secure login/registration with JWT
- ✅ **Dashboard**: Real-time stats and progress tracking
- ✅ **Points Calculation**: Formula: `Points = Difficulty Points / max(hours since day start, 1)`

### Planned Features
- 🔄 **Competitions**: 1:1 and group competitions (up to 5 users)
- 🔄 **Social Features**: Friend system and peer difficulty reviews
- 🔄 **Recurring Tasks**: Daily/weekly recurring task support
- 🔄 **Notifications**: Push reminders and streak alerts
- 🔄 **Analytics**: 7-day trends and productivity insights

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with bcrypt
- **Language**: TypeScript

### Frontend
- **Framework**: React Native with Expo
- **UI Library**: React Native Paper
- **Navigation**: Expo Router
- **State Management**: React Context
- **Storage**: AsyncStorage

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Expo CLI (for mobile development)

## Setup Instructions

### 1. Database Setup

First, create a PostgreSQL database:

```sql
CREATE DATABASE level_up_daily;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (or copy from example)
echo "DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=level_up_daily
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development" > .env

# Start the development server
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Expo development server
npm start
```

### 4. Mobile App Setup

1. Install the Expo Go app on your mobile device
2. Scan the QR code from the Expo development server
3. The app will load on your device

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Tasks
- `GET /tasks` - Get user tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Complete task with reflection
- `GET /tasks/stats/daily` - Get daily statistics
- `GET /tasks/stats/weekly` - Get weekly statistics

## Points System

### Difficulty Points
- **Easy**: 50 points
- **Medium**: 70 points  
- **Difficult**: 100 points

### Points Calculation
```
Points = Difficulty Points / max(hours since day start, 1)
```

This encourages early task completion and rewards users for completing tasks closer to their day start time.

## User Experience

### Onboarding
1. User registers with username, email, password, and day start time
2. Guided through first task creation
3. Brief explanation of points system and streaks

### Daily Workflow
1. **Dashboard**: View stats, streaks, and pending tasks
2. **Add Tasks**: Quick task creation with difficulty selection
3. **Complete Tasks**: Mark tasks complete with mandatory reflection
4. **Track Progress**: Real-time points and streak updates

### Gamification Elements
- **Streaks**: Consecutive days with completed tasks
- **Points**: Earned based on difficulty and timing
- **Progress Tracking**: Visual representation of daily/weekly progress
- **Achievements**: Streak milestones and point thresholds

## Development Roadmap

### Phase 1: Core Infrastructure ✅
- Database models and relationships
- Authentication system
- Basic task CRUD operations
- Points calculation engine

### Phase 2: Gamification Engine ✅
- Streak tracking
- Points calculation
- User statistics
- Dashboard implementation

### Phase 3: Social Features (Next)
- User search and friend system
- Competition creation and management
- Peer difficulty reviews
- Leaderboards

### Phase 4: Advanced Features
- Recurring tasks
- Push notifications
- Analytics and insights
- Mobile optimizations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for productivity enthusiasts** 
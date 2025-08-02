# Development Guide

## Hot Reloading Setup

This project is configured with automatic hot reloading for both frontend and backend.

### Quick Start

```bash
# Start both servers with hot reloading
npm run dev

# Start only backend with hot reloading
npm run dev:backend-only

# Start only frontend with hot reloading
npm run dev:frontend-only
```

### How Hot Reloading Works

#### Backend (NestJS)
- Uses `nodemon` to watch for file changes in the `src` directory
- Automatically restarts the server when TypeScript files change
- Ignores test files and build artifacts
- Configuration: `backend/nodemon.json`

#### Frontend (React Native/Expo)
- Uses Expo's built-in hot reloading
- Metro bundler watches for changes and updates the app
- Works on web, iOS simulator, and Android emulator
- Configuration: `frontend/metro.config.js`

### File Watching

The following file types trigger hot reloading:

**Backend:**
- `.ts` files in `src/` directory
- `.js` files in `src/` directory
- `.json` configuration files

**Frontend:**
- All React Native/TypeScript files
- Asset files (images, fonts)
- Configuration files

### Development Tips

1. **Backend Changes**: Any changes to NestJS controllers, services, or entities will automatically restart the server
2. **Frontend Changes**: UI changes will hot reload without losing state
3. **Database Changes**: Entity changes require a server restart (automatic)
4. **Configuration Changes**: Environment variables require manual restart

### Troubleshooting

If hot reloading stops working:

1. **Backend Issues:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Issues:**
   ```bash
   cd frontend
   npm start
   ```

3. **Clear Cache:**
   ```bash
   npm run clean
   ```

4. **Reset Everything:**
   ```bash
   npm run reset
   ```

### Available Scripts

- `npm run dev` - Start both servers with hot reloading
- `npm run dev:backend-only` - Start only backend
- `npm run dev:frontend-only` - Start only frontend
- `npm run build` - Build both projects
- `npm run clean` - Clean build artifacts
- `npm run reset` - Clean and reinstall dependencies 
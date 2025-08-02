# Authentication & Session Management

## Overview

This application implements a robust JWT-based authentication system with automatic token refresh and session management.

## Features

### 🔐 Authentication Features
- **JWT-based authentication** with access and refresh tokens
- **Automatic token refresh** every 14 minutes (before 15-minute expiry)
- **Session persistence** across app restarts
- **Secure password hashing** with bcrypt (12 rounds)
- **Input validation** and error handling
- **Password change functionality**

### 🛡️ Security Features
- **Short-lived access tokens** (15 minutes)
- **Long-lived refresh tokens** (7 days)
- **Automatic logout** on token expiration
- **Secure token storage** in AsyncStorage
- **CORS protection** on backend
- **Input sanitization** and validation

## Backend Implementation

### Auth Service (`backend/src/auth/auth.service.ts`)

```typescript
// Key methods:
- register(username, email, password, dayStartTime)
- login(username, password)
- refreshToken(refreshToken)
- changePassword(userId, currentPassword, newPassword)
- logout(userId)
```

### Auth Controller (`backend/src/auth/auth.controller.ts`)

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `POST /auth/change-password` - Password change

### JWT Configuration

```typescript
// Access Token: 15 minutes
// Refresh Token: 7 days
// Secret: Environment variable or fallback
```

## Frontend Implementation

### Auth Context (`frontend/src/contexts/AuthContext.tsx`)

**State Management:**
- User data persistence
- Authentication status
- Loading states
- Session validation

**Key Methods:**
- `login(username, password)`
- `register(username, email, password, dayStartTime)`
- `logout()`
- `refreshSession()`
- `changePassword(currentPassword, newPassword)`

### Session Manager (`frontend/src/services/sessionManager.ts`)

**Features:**
- Automatic token refresh scheduling
- Session validation
- Token storage management
- Error handling and cleanup

### API Service (`frontend/src/services/api.ts`)

**Interceptors:**
- Request interceptor: Adds access token to headers
- Response interceptor: Handles 401 errors and token refresh

## Token Flow

### 1. Login/Register Flow
```
User Input → Validation → Backend Auth → JWT Tokens → Session Storage → App Access
```

### 2. Token Refresh Flow
```
API Request → 401 Error → Refresh Token → New Access Token → Retry Request
```

### 3. Automatic Refresh Flow
```
Session Manager → Timer (14 min) → Refresh Token → Update Storage → Schedule Next
```

## Security Considerations

### Token Security
- **Access tokens**: Short-lived (15 minutes) for API calls
- **Refresh tokens**: Long-lived (7 days) for session renewal
- **Secure storage**: AsyncStorage with encryption in production
- **Automatic cleanup**: Invalid tokens are cleared immediately

### Password Security
- **Hashing**: bcrypt with 12 rounds
- **Validation**: Minimum 6 characters
- **Change password**: Requires current password verification

### Session Security
- **Automatic logout**: On token expiration
- **Session validation**: On app startup
- **Error handling**: Graceful degradation on auth failures

## Usage Examples

### Login
```typescript
const { login } = useAuth();

try {
  await login('username', 'password');
  // User is now authenticated
} catch (error) {
  // Handle login error
}
```

### Registration
```typescript
const { register } = useAuth();

try {
  await register('username', 'email@example.com', 'password', '09:00');
  // Account created and user logged in
} catch (error) {
  // Handle registration error
}
```

### Logout
```typescript
const { logout } = useAuth();

await logout();
// User is logged out and session cleared
```

### Password Change
```typescript
const { changePassword } = useAuth();

try {
  await changePassword('currentPassword', 'newPassword');
  // Password changed successfully
} catch (error) {
  // Handle password change error
}
```

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or expired token
- **400 Bad Request**: Invalid input data
- **409 Conflict**: Username/email already exists
- **Network errors**: Connection issues

### Error Recovery
- **Token refresh**: Automatic retry with refresh token
- **Session cleanup**: Clear invalid data
- **User feedback**: Clear error messages
- **Graceful degradation**: Fallback to login screen

## Development Notes

### Environment Variables
```bash
# Backend (.env)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### Testing Authentication
1. Start both servers: `npm run dev`
2. Register a new account
3. Test login/logout
4. Test automatic token refresh
5. Test session persistence

### Debugging
- Check browser console for API logs
- Monitor network requests
- Verify token storage in AsyncStorage
- Check backend logs for auth events

## Future Enhancements

### Planned Features
- **Biometric authentication** (fingerprint/face ID)
- **Two-factor authentication** (2FA)
- **Social login** (Google, Apple)
- **Password reset** functionality
- **Account deletion** with data cleanup
- **Session analytics** and monitoring
- **Rate limiting** for auth endpoints
- **Audit logging** for security events 
# CalendarMeet Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- AWS Cognito account
- Google Cloud Console account (for Google OAuth)

## Environment Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd calendarmeet-app
npm install
```

### 2. Configure Environment Variables

#### Backend (.env in root)
Create a `.env` file in the root directory:

```env
PORT=8080
DATABASE_URL=postgresql://username:password@localhost:5432/calendarmeet
```

#### Frontend (calendarmeet-app/.env)
Already configured with AWS Cognito credentials:

```env
# AWS Cognito Configuration
VITE_AWS_REGION=us-east-2
VITE_AWS_USER_POOL_ID=us-east-2_vLnW3Aoza
VITE_AWS_USER_POOL_WEB_CLIENT_ID=7u6gi2bht5uj9vri4m2g126dam

# Cognito Hosted UI / Google federation
VITE_AWS_OAUTH_DOMAIN=us-east-2vlnw3aoza.auth.us-east-2.amazoncognito.com
VITE_AWS_OAUTH_REDIRECT_URL=http://localhost:5173/
VITE_AWS_OAUTH_SIGNOUT_URL=http://localhost:5173/
```

### 3. Setup PostgreSQL Database

```bash
# Start PostgreSQL
# Create database
createdb calendarmeet

# Run database setup
node setup-db.js
```

### 4. AWS Cognito Setup

#### User Pool Configuration
- **User Pool ID**: `us-east-2_vLnW3Aoza`
- **App Client ID**: `7u6gi2bht5uj9vri4m2g126dam`
- **Region**: `us-east-2`
- **Domain**: `us-east-2vlnw3aoza.auth.us-east-2.amazoncognito.com`

#### Required Cognito Settings
1. **Sign-in options**: Email
2. **Required attributes**: Email, Name
3. **Self-registration**: Enabled
4. **Email verification**: Enabled
5. **Password policy**: Min 8 characters with uppercase, lowercase, numbers, and symbols

### 5. Google OAuth Setup

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project "CalendarMeet"
3. Go to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client ID:
   - Type: Web application
   - Authorized redirect URI: `https://us-east-2vlnw3aoza.auth.us-east-2.amazoncognito.com/oauth2/idpresponse`

#### AWS Cognito OAuth Configuration
1. Add Google as identity provider in Cognito
2. Configure app client managed login:
   - Callback URLs: `http://localhost:5173/`
   - Sign-out URLs: `http://localhost:5173/`
   - Identity providers: Cognito user pool, Google
   - OAuth scopes: email, openid, profile

## Running the Application

### Development Mode

```bash
# Terminal 1 - Backend server
node app.js

# Terminal 2 - Frontend dev server
cd calendarmeet-app
npm run dev
```

Access the app at: **http://localhost:5173**

## Authentication Features

- ✅ **Email/Password Signup** with email verification
- ✅ **Email/Password Login**
- ✅ **Forgot Password** with reset code
- ✅ **Google OAuth** sign-in
- ✅ **User profile management**

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Event Attendees
- `GET /api/events/:eventId/attendees` - Get event attendees
- `POST /api/events/:eventId/attendees` - Add attendee
- `DELETE /api/events/:eventId/attendees/:userId` - Remove attendee

## Troubleshooting

### White Screen Issue
- Check browser console for errors
- Ensure Firebase is disabled in `firebaseConfig.js`
- Verify Cognito credentials in `.env`

### Google OAuth Errors
- Verify redirect URI matches exactly in Google Cloud Console
- Check that Google is enabled in Cognito identity providers
- Ensure callback URLs are configured in app client

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in backend `.env`
- Run `node setup-db.js` to initialize tables

## Tech Stack

### Frontend
- React 19.2.0
- Vite 7.1.11
- AWS Amplify 6.15.8
- FullCalendar 6.1.19
- Tailwind CSS
- Zustand (state management)

### Backend
- Express.js 5.1.0
- PostgreSQL with pg driver
- Node.js

### Authentication
- AWS Cognito
- Google OAuth 2.0

## Known Issues

1. **Calendar Feature**: Currently disabled - Firebase Firestore is being migrated to PostgreSQL backend
2. **User Attributes**: Additional profile data (major, year, interests) stored in Cognito custom attributes

## Next Steps

1. Migrate calendar events from Firestore to PostgreSQL
2. Implement real-time event updates via WebSockets
3. Add friend system functionality
4. Deploy to production (AWS or similar)

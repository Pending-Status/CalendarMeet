# CalendarMeet

A web application that makes it easy for CPP students to connect with each other and efficiently schedule meetups.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 20)
   - macOS: `brew install node@20`
   - Windows: Download from [nodejs.org](https://nodejs.org/)
   - Linux: `nvm install 20`

2. **pnpm** (package manager)
   ```bash
   npm install -g pnpm
   ```

3. **PostgreSQL** (required if using database version)
   - macOS: `brew install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
   - Linux: `sudo apt install postgresql`

## First-Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pending-Status/CalendarMeet.git
   cd CalendarMeet
   ```

2. **Install backend dependencies**
   ```bash
   pnpm install
   ```

3. **Install frontend dependencies**
   ```bash
   pnpm --dir calendarmeet-app install
   ```

4. **Build the frontend**
   ```bash
   cd calendarmeet-app
   pnpm run build
   cd ..
   ```

## Database Setup (if using PostgreSQL version)

1. **Start PostgreSQL**
   - macOS: `brew services start postgresql`
   - Windows: PostgreSQL runs as a service by default
   - Linux: `sudo service postgresql start`

2. **Create database**
   ```bash
   createdb calendarmeet
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run database migration**
   ```bash
   psql -d calendarmeet -f db/migrations/001_create_events_table.sql
   ```

## Running the Application

### Production Mode (Integrated Server)
This serves both the API and built frontend:
```bash
node server.js
```
Access at http://localhost:8080

### Development Mode (Separate Servers)
1. **Start the API server**
   ```bash
   # In one terminal
   node server.js
   ```

2. **Start the frontend development server**
   ```bash
   # In another terminal
   cd calendarmeet-app
   pnpm run dev
   ```

The frontend dev server supports hot reloading for development.

## Running Tests
```bash
pnpm test
```

## API Endpoints

- `GET /api/events` - List all events
- `GET /api/events?start=<ISO>&end=<ISO>` - List events in time window
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/move` - Move/resize event

Example API call:
```bash
# Create an event
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Team Meeting","start":"2025-10-20T10:00:00Z"}'
```

## Stopping the Server

- If running in terminal: Press `Ctrl + C`
- If running in background:
  ```bash
  # Find the process
  lsof -i :8080
  # Kill it using the PID
  kill <PID>
  ```

## Common Issues

1. **Port already in use**
   ```bash
   lsof -i :8080  # Find process using port
   kill <PID>     # Stop the process
   ```

2. **Node command not found**
   ```bash
   # Install Node.js first
   brew install node@20  # macOS
   # or download from nodejs.org
   ```

3. **pnpm command not found**
   ```bash
   npm install -g pnpm
   ```

4. **Database connection failed**
   - Check if PostgreSQL is running
   - Verify credentials in .env file
   - Ensure database exists: `createdb calendarmeet`

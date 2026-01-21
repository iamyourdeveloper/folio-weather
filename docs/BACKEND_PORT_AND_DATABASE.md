# Backend Port and Database Modes

This document explains how the backend port is configured (fixed to 8000 in development) and how to run the app either in Demo mode (no database) or with MongoDB for persistence.

## Backend Port (8000)

- The backend listens on `PORT=8000` by default.
- File reference: `backend/server.js` uses `process.env.PORT || 8000`.
- The frontend dev server proxies `/api` to `http://localhost:8000` by default (see `frontend/vite.config.js`).

To change the port (not typically needed during dev):

1. Set in `backend/.env`:

```env
PORT=8000
```

2. If you change the backend port, update the frontend env to point to it:

```env
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:8000/api
```

## Database Modes

You can run the backend without a database (Demo mode) or with MongoDB for real persistence. Both modes keep the server stable on port 8000.

### Demo Mode (No DB connection)

- How it works: `server.js` skips MongoDB connection when `MONGODB_URI` is either unset or set to the default sentinel value `mongodb://localhost:27017/weather-app`.
- Log message: "Running in demo mode without MongoDB connection".
- What’s available:
  - All weather endpoints under `/api/weather/...`
  - Demo user endpoints under `/api/users/.../demo`
- What’s not persisted: users, favorites, preferences, alerts.

Configure Demo Mode in `backend/.env`:

```env
# Leave unset or keep the default to stay in demo mode
MONGODB_URI=mongodb://localhost:27017/weather-app
```

### MongoDB Mode (Persistence enabled)

- Set `MONGODB_URI` to a real database connection string (anything other than the demo sentinel value).
- On success, you’ll see: `MongoDB Connected: <host>` in logs.
- Enables persistence for users, favorites, preferences, and alerts (routes will expand as implemented).

Example local connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/folio-weather
```

Start MongoDB on macOS:

```zsh
# Homebrew
brew services start mongodb-community

# OR Docker
docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:7
```

### Quick Toggle Matrix

- Demo mode: `MONGODB_URI` unset or `mongodb://localhost:27017/weather-app`
- MongoDB mode: `MONGODB_URI` set to any other valid URI (local or Atlas)

## Verify Setup

- Backend health: `GET http://localhost:8000/api/health`
- Weather test: `GET http://localhost:8000/api/weather/test`
- Demo preferences shape: `GET http://localhost:8000/api/users/preferences/demo`

## Related Files

- `backend/server.js` — Port binding and conditional DB connect (demo vs MongoDB)
- `backend/.env.example` — Template with `PORT=8000`, demo `MONGODB_URI`
- `frontend/vite.config.js` — Proxy to backend (default: `http://localhost:8000`)

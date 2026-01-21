# FolioWeather - Modern Weather Application

- ** Live **: https://folio-weather.vercel.app/

A comprehensive weather application built with the MERN stack (MongoDB, Express.js, React 19, Node.js) that provides real-time weather data with a beautiful, responsive interface and advanced features.

> **Name Guarantee:** The application name is permanently set to `FolioWeather` across every environment and distribution of this project.

## ✨ Features

### 🌤️ Weather Data & Forecasting

- **Real-time Weather**: Current conditions by city or coordinates via OpenWeatherMap
- **5-Day Forecasts**: Detailed 3-hour interval forecasts with on-demand toggles
- **Multiple Units**: Metric, imperial, and Kelvin conversions with instant updates
- **Detailed Conditions**: Wind, humidity, pressure, visibility, cloudiness, UV index
- **Sun Times + Icons**: Sunrise/sunset times with condition icons and descriptions

### 🗺️ Location Services

- **Geolocation Support**: Auto-detect with a manual "Use My Location" fallback
- **Advanced City Search**: 15,000+ US cities with state mapping
- **State-Specific Search**: Proper US state display (e.g., "Springfield, IL")
- **Disambiguation**: Coordinate-based resolution for duplicate city names
- **Region & Country Parsing**: Country codes, capitals, and region shortcuts
- **International Cities**: Curated global city coverage with fallback support

### ⭐ Favorites & Navigation

- **Favorite Locations**: Save, remove, and clear favorites
- **Duplicate Prevention**: Avoid duplicate entries with a favorited indicator
- **Drag-and-Drop Reorder**: Reorder favorites on the Favorites page
- **Home Favorites Slider**: Horizontal slider with prev/next controls
- **Auto-Rotate on Load**: Rotate favorites when auto-location is off/unavailable

### ⭐ User Experience

- **Quick Actions**: Search, Favorites, Random City, and Use My Location
- **Header Search**: Real-time autocomplete dropdown with state-aware suggestions
- **Search Suggestions Explorer**: Region tabs, sort modes (Random/Curated/A–Z), and “Show More” pagination
- **Header Weather Badge**: Live temperature + location with smooth scroll to current weather
- **Smooth Anchor Navigation**: Hash links like `#current-weather` and `#top`
- **Connection Status**: Online/offline banner with retry
- **Forecast Toggle Reset**: New searches or favorites reset the forecast toggle

### 🎨 Interface & Design

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Theme Support**: Light, dark, and auto modes with live preview
- **Modern UI**: Clean layout with smooth animations
- **Loading States**: Spinners plus a global top-bar progress indicator
- **Error Handling**: Graceful errors and an app-wide Error Boundary fallback

### ⚙️ Settings & Preferences

- **Temperature Units**: Celsius, Fahrenheit, or Kelvin
- **Theme Preferences**: Persistent theme selection with live preview
- **Auto Location**: Enable/disable automatic location detection
- **Display Options**: Toggle wind, humidity, pressure, UV index, sunrise/sunset
- **Staged Save + Preview**: Apply changes with Save; unit changes show a brief refresh indicator

### 🔧 Technical Features

- **React Query Caching**: Smart data caching with tailored stale/cache times
- **Backend Caching**: Weather + search caches with TTL (5-30 minutes)
- **Search API**: Endpoints for cities, state filters, suggestions, autocomplete, stats
- **Input Validation**: Sanitized query handling and clear error responses
- **API Testing**: Built-in `/test` interface for endpoint diagnostics
- **Favorites Data Integrity**: Validation and recovery for localStorage data
- **Shared Metadata**: Country/capital utilities shared across frontend/backend

Note: PWA install and offline support are planned future enhancements.

## ✅ Deployed Specs & Implementations

### Core Specs

- **Frontend**: React 19 SPA built with Vite, served as static assets from `frontend/dist`
- **Backend**: Express API for weather/search, deployed as serverless functions on Vercel
- **API Base Path**: `/api` on the same origin (configurable via `VITE_API_BASE_URL`)
- **Data Sources**: OpenWeatherMap API + curated city datasets in `backend/data` and `frontend/src/data`
- **State + Persistence**: Context API + React Query caching; favorites/settings stored in `localStorage`

### Implementation Highlights

- **Resilience**: Axios circuit breaker, retries with backoff, and in-flight request de-duplication
- **Caching**: Backend NodeCache for weather + search caches with 5-30 minute TTL windows
- **Search UX**: Autocomplete, regional tabs, sort modes, and disambiguation for duplicate city names
- **Error Handling**: Centralized API error handler + React Error Boundary fallback
- **Shared Utilities**: `shared/` metadata for consistent country/capital handling across frontend/backend

### Hosting (Production)

- **Live URL**: https://folio-weather.vercel.app
- **Platform**: Vercel full-stack deployment from repo root using `vercel.json`
- **Build Output**: `@vercel/static-build` serves `frontend/dist` from `npm run build`
- **Serverless API**: `@vercel/node` functions at `backend/api/index.mjs` and `backend/api/[...path].mjs`
- **Routing**: `/api/*` routed to serverless backend; SPA fallback rewrites to `index.html`
- **Env Vars**: `OPENWEATHER_API_KEY`, `FRONTEND_URL`, `NODE_ENV=production` (optional `VITE_API_BASE_URL`)

## 🛠️ Tech Stack

### Frontend

- **React 19**: Latest React with modern features and improved performance
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing and navigation
- **TanStack Query (React Query)**: Data fetching, caching, and devtools
- **Context API**: Global state management for weather data and preferences
- **Custom Hooks**: Reusable logic for weather data fetching and geolocation
- **Modern CSS**: Flexbox/Grid layouts with CSS custom properties
- **Lucide React**: Beautiful, customizable icons
- **JavaScript ES6+**: Modern JavaScript features and syntax

### Backend

- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, minimalist web framework
- **MongoDB**: Optional persistence (runs in demo mode when not configured)
- **Mongoose**: Optional ODM for future auth/preferences models
- **RESTful APIs**: Clean, standardized API endpoints with comprehensive search functionality
- **Search Database**: 15,000+ US cities with state mapping and coordinate disambiguation
- **Caching Middleware**: Weather/search caching with TTL management
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security middleware for Express
- **Morgan**: HTTP request logging middleware
- **Node Cache**: In-memory cache for API responses

### External Services

- **OpenWeatherMap API**: Real-time weather data and forecasts
- **Geolocation API**: Browser-based location services

### Shared Utilities

- **Country Metadata**: Shared country/capital utilities in `shared/`

### Development Tools

- **Concurrently**: Run frontend and backend simultaneously
- **Nodemon**: Automatic server restart during development
- **ESLint**: Code linting and style enforcement
- **React Query DevTools**: Inspect queries and cache in development
- **Vitest**: Frontend unit testing framework
- **Environment Variables**: Secure configuration management

## 📁 Project Structure

```
folio-weather/
├── backend/                     # Node.js/Express backend
│   ├── api/                     # Vercel serverless entrypoints
│   ├── app.js                   # Express app shared by server + serverless
│   ├── config/                  # Database configuration
│   ├── data/                    # US/international city datasets
│   ├── middleware/              # Error handling and caching
│   ├── models/                  # Mongoose models (future auth/persistence)
│   ├── routes/                  # Weather/search/users APIs
│   ├── utils/                   # API helpers and weather service
│   ├── .env.example             # Backend env template
│   ├── server.js                # Express server
│   └── package.json             # Backend scripts and deps
├── frontend/                    # React 19 + Vite app
│   ├── api/                     # Vercel proxy (frontend-only deploy)
│   ├── src/
│   │   ├── assets/              # Static assets
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # ErrorBoundary
│   │   │   ├── layout/          # Header, Footer, badge
│   │   │   ├── ui/              # Dropdowns, spinners, status, progress
│   │   │   └── weather/         # WeatherCard, ForecastCard
│   │   ├── constants/           # App constants
│   │   ├── context/             # Weather + query providers
│   │   ├── data/                # Cities, country data
│   │   ├── hooks/               # useWeather, useGeolocation
│   │   ├── pages/               # Home, Search, Favorites, Settings, Test
│   │   ├── services/            # API clients
│   │   ├── styles/              # App/component/page CSS
│   │   ├── utils/               # Search/date/performance helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                  # Public assets
│   ├── dist/                    # Production build output
│   ├── .env.example             # Frontend env template
│   ├── vercel.json              # Frontend-only deployment config
│   ├── vite.config.js           # Vite config
│   └── package.json             # Frontend scripts and deps
├── shared/                      # Shared data/utilities
│   ├── data/
│   ├── utils/
│   └── package.json
├── docs/                        # Documentation
│   ├── fixes-and-implementations/
│   ├── API_REFERENCE.md
│   ├── DEVELOPMENT_GUIDE.md
│   └── ...
├── tests/                       # Test and QA scripts
│   ├── api/
│   ├── development/
│   ├── frontend/
│   ├── integration/
│   ├── manual/
│   └── README.md
├── Chat History/                # Development session logs
├── CHANGELOG.md
├── CURRENT_IMPLEMENTATIONS_SUMMARY.md
├── FEATURES_AND_IMPROVEMENTS.md
├── GIT_GUIDE.md
├── GITHUB_CONFIG_TEST.md
├── INTEGRATION_TEST_RESULTS.md
├── NEXT_STEPS.md
├── QUICK_IMPROVEMENTS_CHECKLIST.md
├── SCROLL_TEST_INSTRUCTIONS.md
├── TEXT_EDITING_GUIDE.md
├── TODO.md
├── fix-crashes.sh
├── start-app.sh
├── package.json
├── vercel.json                  # Full-stack deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control system
- **OpenWeatherMap API Key** - [Get free API key](https://openweathermap.org/api)
- **MongoDB** (optional) - For user data persistence

### Quick Start Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd "Folio Weather (Weather API App)"
```

2. **Install all dependencies:**

```bash
npm run install-deps
```

This installs dependencies for both frontend and backend simultaneously.

3. **Set up environment variables:**

**Backend Environment (`backend/.env`):**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your OpenWeatherMap API key:

```env
OPENWEATHER_API_KEY=your_actual_api_key_here
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment (`frontend/.env.development`):**

```bash
cp frontend/.env.example frontend/.env.development
```

The frontend `.env.development` file is pre-configured for development.

4. **Start the development servers:**

```bash
npm run dev
```

This starts both servers concurrently:

- **Backend API**: http://localhost:8000/api
- **Frontend App**: http://localhost:3000

### 🌐 Accessing the Application

Once the servers are running:

- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/api
- **API Testing Interface**: http://localhost:3000/test

### 📋 Available Scripts

**Root Directory Scripts:**

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server (port 8000)
- `npm run client` - Start only the frontend development server (port 3000)
- `npm run build` - Build the frontend for production
- `npm run install-deps` - Install dependencies for all packages

**Backend Scripts (`cd backend`):**

- `npm run dev` - Start backend with nodemon (auto-restart)
- `npm start` - Start backend in production mode
- `npm run test` - Run backend tests (when implemented)

**Frontend Scripts (`cd frontend`):**

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code analysis

## 🔧 Development Workflow

### Daily Development

1. **Start Development Environment:**

   ```bash
   npm run dev
   ```

   This starts both servers with hot-reload enabled.

2. **Backend Development:**

   - Navigate to `backend/` directory
   - Modify Express routes, middleware, or services
   - Server automatically restarts with nodemon

3. **Frontend Development:**

   - Navigate to `frontend/src/` directory
   - Modify React components, pages, or styles
   - Browser automatically refreshes with Vite HMR

4. **API Testing:**
   - Use the built-in test page at http://localhost:3000/test
   - Test API endpoints directly at http://localhost:8000/api

### Code Organization

- **Components**: Reusable UI components in `frontend/src/components/`
- **Pages**: Route-based page components in `frontend/src/pages/`
- **State Management**: Context providers in `frontend/src/context/`
- **API Integration**: Service functions in `frontend/src/services/`
- **Backend Routes**: API endpoints in `backend/routes/`
- **Database Models**: Mongoose schemas in `backend/models/`

## 📚 Learning Resources & Educational Value

This project serves as a comprehensive learning resource for modern web development:

### Frontend Learning Topics

- **React 19 Features**: Latest React patterns and hooks
- **State Management**: Context API and custom hooks
- **Modern CSS**: Flexbox, Grid, and CSS custom properties
- **Responsive Design**: Mobile-first design principles
- **API Integration**: Fetch API and async/await patterns
- **Error Handling**: Error boundaries and graceful degradation

### Backend Learning Topics

- **Express.js**: RESTful API design and middleware
- **MongoDB Integration**: NoSQL database operations
- **API Security**: CORS, Helmet, and environment variables
- **Error Handling**: Centralized error management
- **External API Integration**: Third-party service consumption

### Full-Stack Integration

- **CORS Configuration**: Cross-origin request handling
- **Environment Management**: Development vs production settings
- **Proxy Configuration**: Frontend-backend communication
- **Concurrent Development**: Running multiple servers

### Practical Exercises Included

1. **Fetch API Practice**: Multiple examples in `frontend/src/services/`
2. **Promise Handling**: Async operations throughout the application
3. **Error Recovery**: Comprehensive error handling patterns
4. **State Management**: Complex state flows with Context API
5. **API Design**: RESTful endpoint structure in backend

Check the `docs/` directory for detailed guides and the `Chat History/` folder for development insights.

### Areas for Enhancement & Contribution upon App

- **New Features**: Weather alerts, user authentication, additional weather data
- **UI/UX Improvements**: Enhanced responsive design, accessibility features
- **Performance Optimization**: Code splitting, caching, optimization
- **Testing**: Unit tests, integration tests, E2E testing
- **Documentation**: API docs, tutorials, code comments
- **Bug Fixes**: Issue resolution and stability improvements

### Development Guidelines

- Follow the existing code structure and naming conventions
- Ensure responsive design for all new UI components
- Add appropriate error handling for new features
- Update documentation for any API changes
- Test on multiple devices and browsers

## 📖 Documentation

### Available Documentation

- **[API Reference](docs/API_REFERENCE.md)**: Complete API endpoint documentation
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Setup and development workflow
- **[API Setup Guide](docs/API_SETUP.md)**: OpenWeatherMap API configuration
- **[Backend Port & Database Modes](docs/BACKEND_PORT_AND_DATABASE.md)**: Port 8000 details and Demo vs MongoDB
- **[Changelog](CHANGELOG.md)**: Summary of feature-level changes
- **[Chat History](Chat%20History/)**: Complete development session logs
- **[Integration Tests](INTEGRATION_TEST_RESULTS.md)**: Testing results and validation
- **[Next Steps](NEXT_STEPS.md)**: Future development roadmap

### Quick Links

- **Live Demo (Vercel)**: https://folio-weather.vercel.app/
- **API Endpoints**: http://localhost:8000/api (when running locally)
- **Test Interface**: http://localhost:3000/test (when running locally)

## 📸 Screenshots & GIFs

Add short, focused visuals to showcase key interactions. Place assets in `docs/media/` and reference them here.

### Suggested Demos

- Header Weather Badge – Smooth Scroll: Demonstrates clicking the header badge to jump to Current Weather on Home
  - `![Header Weather Badge – Smooth Scroll](docs/media/header-badge-scroll.gif)`
- Search – Popular Cities Tabs: Shows region tabs (All, North America, Europe, Asia, Middle East, Africa, Oceania), sort modes (Random/Curated/A–Z), and “Show More” pagination
  - `![Search – Popular Cities Tabs](docs/media/search-suggestions-tabs.gif)`
- Header – Real-time Autocomplete: Shows typing, suggestions, and selecting a city from the header search
  - `![Header – Real-time Autocomplete](docs/media/header-autocomplete.gif)`
- Favorites – Reorder + Forecast Reset: Drag-and-drop to reorder, then select a favorite to show forecast toggle reset on Home
  - `![Favorites – Reorder + Forecast Reset](docs/media/favorites-reorder-forecast-reset.gif)`
- Settings – Theme Preview + Staged Save: Live theme preview when selecting, then Save toast and brief refresh indicator on unit change
  - `![Settings – Theme Preview](docs/media/settings-theme-preview.gif)`

### Quick Capture Tips

- Keep each clip under ~8s; target width ~1200px; 15 fps works well.
- Name files descriptively (e.g., `header-badge-scroll.gif`).

#### ffmpeg one-liner (convert screen recording to GIF)

```bash
# Convert a short .mov/.mp4 to an optimized looping GIF
ffmpeg -i input.mov -vf "fps=15,scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
```

### Scripted Steps (for consistency)

- Header Badge – Smooth Scroll
  - Open Home, ensure a location is active; click the header temperature badge; observe smooth scroll and brief highlight.
- Search – Popular Cities
  - Navigate to `/search`; switch among region tabs; toggle Random/Curated/A–Z; click “Show More”; select a city to load results.
- Header – Autocomplete
  - Focus header search; type “Chi”; pick “Chicago, IL”; confirm navigation and header badge updates.
- Favorites – Reorder + Forecast Reset
  - On `/favorites`, drag a card to reorder; go to Home and click a favorite; forecast toggle resets to default state.
- Settings – Theme Preview
  - On `/settings`, toggle theme to preview immediately; click Save to show toast; switch units to trigger brief refresh indicator.

## 🚀 Deployment

### Production Build

```bash
# Build frontend for production
npm run build

# The built files will be in frontend/dist/
# Serve these files with your preferred web server
```

### Environment Variables for Production

Ensure you set the following environment variables in production:

- `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key
- `NODE_ENV`: Set to "production"
- `FRONTEND_URL`: Your production frontend URL
- `PORT`: Server port (default: 8000)

### Deployment Platforms

This application can be deployed on:

- **Vercel** (Frontend) + **Railway/Heroku** (Backend)
- **Netlify** (Frontend) + **Railway/Heroku** (Backend)
- **Docker** containers for full-stack deployment
- **Traditional VPS** with PM2 process management

### Vercel Full-Stack (Repo Root)

1. **Set the Vercel project root to the repo root** so `vercel.json` is used.
2. **Deploy frontend + backend together** (build command `npm run build`, output `frontend/dist`).
3. **Set backend env** on Vercel:
   - `OPENWEATHER_API_KEY=...`
   - `FRONTEND_URL=https://your-vercel-domain.vercel.app`
   - `NODE_ENV=production`
   - `PORT` (only if your host requires a fixed port)

### Vercel Frontend + External Backend

1. **Deploy frontend on Vercel** (repo root or `frontend/` root).
2. **Host backend separately** (Railway/Render/Fly/Heroku) and expose a public HTTPS URL.
3. **If deploying from `frontend/` root**, keep `frontend/vercel.json` so `/api/*` is proxied to the backend.
4. **Set frontend env** on Vercel:
   - `BACKEND_URL=https://your-backend-host.com` (required for the proxy)
   - `VITE_API_BASE_URL=/api` (optional; default)
5. **Set backend env** on your backend host:
   - `OPENWEATHER_API_KEY=...`
   - `FRONTEND_URL=https://your-vercel-domain.vercel.app`
   - `NODE_ENV=production`
   - `PORT` (only if your host requires a fixed port)

### CORS + HTTPS Notes

- Add your Vercel domain to the CORS allowlist in `backend/server.js`.
- Always use HTTPS URLs for `FRONTEND_URL` and `VITE_API_BASE_URL` in production.

### Vercel 404 Fix (React Router)

If you see a 404 on refresh or deep links, keep `vercel.json` at the repo root to rewrite all paths to `index.html`.

### Vercel Build Error: `vite: command not found`

This means the `frontend/` dependencies were not installed.

- Keep the **Root Directory** at the repo root.
- Use **Build Command**: `npm run build`
- Use **Output Directory**: `frontend/dist`
- Leave **Install Command** as default (`npm install`) so `postinstall` can install `frontend/` and `backend/` deps,
  or explicitly set it to `npm run install-deps`.

### Backend Performance Tips

- Keep caching enabled (already in `backend/utils/cache.js`).
- Consider rate limiting at the host level to protect your API key.
- Use a region close to your users to reduce latency.

## 🐛 Troubleshooting

### Common Issues

**API Key Issues:**

- Ensure your OpenWeatherMap API key is valid and active
- Check that the API key is properly set in `backend/.env`
- Verify the API key has the correct permissions

**CORS Errors:**

- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running on the correct ports

**Location Services:**

- Ensure HTTPS is used in production for geolocation
- Check browser permissions for location access
- Verify geolocation is enabled in browser settings

**Build Issues:**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18 or higher
- Check for any missing environment variables

## 📄 License

**ISC License**

Copyright (c) 2025 FolioWeather

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

## 🙏 Acknowledgments

- **OpenWeatherMap** for providing comprehensive weather data API
- **React Team** for React 19 and modern development tools
- **Vite Team** for the fast build tool and development server
- **Lucide** for beautiful, consistent icons
- **Express.js Community** for the robust backend framework

---

**Built with ❤️ using the MERN stack and modern web technologies**

_For questions or insights, please visit the [GitHub repository](https://github.com/iamyourdeveloper/folio-weather) above or check the [Chat History](Chat%20History/) for development insights._

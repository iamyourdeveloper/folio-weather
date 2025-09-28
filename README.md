# FolioWeather - Modern Weather Application

A comprehensive weather application built with the MERN stack (MongoDB, Express.js, React 19, Node.js) that provides real-time weather data with a beautiful, responsive interface and advanced features.

## ✨ Features

### 🌤️ Weather Data & Forecasting

- **Real-time Weather**: Current weather conditions for any city worldwide with live updates
- **5-Day Forecasts**: Detailed weather forecasts with 3-hour intervals and interactive toggles
- **Multiple Data Sources**: Integrated with OpenWeatherMap API with intelligent caching
- **Coordinate-based Weather**: Weather data by GPS coordinates with automatic location detection
- **Multiple Units**: Support for metric, imperial, and Kelvin temperature units with instant conversion
- **Weather Alerts**: Real-time weather condition monitoring and status indicators

### 🗺️ Location Services

- **Geolocation Support**: Automatic current location detection
- **Advanced City Search**: Comprehensive search with 15,000+ US cities and state information
- **Real-time Autocomplete**: Smart search suggestions with US city prioritization
- **State-Specific Search**: Search cities by US state with proper state display
- **Coordinate Input**: Manual latitude/longitude weather lookup
- **US Cities Database**: Complete database with state mapping and coordinate disambiguation
- **International Cities**: Global city search with fallback support

### ⭐ Favorites & Navigation

- **Favorite Locations**: Save and manage favorite weather locations
- **Duplicate Prevention**: Consistent detection to avoid duplicate entries
- **Drag-and-Drop Reorder**: Reorder favorites on the Favorites page
- **Home Favorites Slider**: Horizontal, accessible slider with controls
- **Auto-Rotate Favorite**: Auto-selects the next favorite on app load when geolocation is unavailable

### ⭐ User Experience

- **Quick Access**: Fast switching between saved locations
- **Auto Location**: Automatic weather for current location on app load
- **Enhanced Header Search**: Real-time search with autocomplete suggestions and state information
- **Search Integration**: Header search with instant results and mobile-optimized interface
- **Search Suggestions Explorer**: Curated popular cities on the Search page with region tabs (All, North America, Europe, Asia, Middle East, Africa, Oceania), sort modes (Random/Curated/A–Z), and progressive “Show More” loading
- **Favorited Indicator**: Filled-heart visual when a location is already saved
- **Header Weather Badge**: Live temperature + location badge in the header that mirrors the active location and updates immediately after searches
- **Smooth Anchor Navigation**: Header weather badge and hash links (e.g., `#current-weather`, `#top`) smoothly scroll to key sections
- **Random City**: One-click action on Home to preview weather for a randomly selected city (drawn from a broad, global list to reduce repeats)
- **Connection Status**: Real-time network connectivity monitoring
- **Smart City Display**: US cities automatically show with state information (e.g., "Springfield, IL")
- **Forecast Toggle Reset**: Clicking favorite locations automatically resets forecast toggle to "View Forecast" state

### 🎨 Interface & Design

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Toggle between light and dark modes
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Loading States**: Elegant loading spinners and a global top-bar progress indicator
- **Error Handling**: Graceful error messages and an app-wide Error Boundary fallback

### ⚙️ Settings & Preferences

- **Temperature Units**: Choose between Celsius, Fahrenheit, or Kelvin
- **Theme Preferences**: Persistent dark/light mode selection
- **Auto Location**: Enable/disable automatic location detection
- **Display Options**: Toggle visibility for pressure, UV index, sunrise/sunset, wind, humidity
- **Staged Save + Preview**: Edit settings safely, preview theme instantly, then click Save (with toast) to apply; unit changes trigger a brief refresh indicator

### 🔧 Technical Features

- **React Query Caching**: Smart data caching with refetch-on-focus and retries
- **Search Performance**: Advanced search caching with 15-30 minute TTL for improved response times
- **US Cities Database**: Comprehensive database of 15,000+ US locations with state mapping
- **Search API**: RESTful search endpoints with autocomplete, state filtering, and statistics
- **Real-time Autocomplete**: Debounced search with intelligent US city prioritization
- **Error Boundaries**: Robust error handling and recovery with detailed error reporting
- **API Testing**: Built-in API endpoint testing interface with comprehensive diagnostics
- **Real-time Updates**: Automatic weather data refresh with connection monitoring
- **Connection Monitoring**: Network status awareness and offline state handling
- **Global Loading States**: Top bar progress indicator bound to all API activity
- **Favorites Data Integrity**: Validation and recovery for corrupted favorites in localStorage
- **Performance Optimization**: Code splitting, lazy loading, and optimized bundle sizes
- **Production Ready**: Optimized builds with source maps and performance monitoring

Note: PWA install and offline support are planned future enhancements.

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
- **MongoDB**: NoSQL database for user data and preferences (ready for implementation)
- **Mongoose**: MongoDB object modeling for Node.js
- **RESTful APIs**: Clean, standardized API endpoints with comprehensive search functionality
- **Search Database**: 15,000+ US cities with state mapping and coordinate disambiguation
- **Caching Middleware**: Intelligent search result caching with TTL management
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security middleware for Express
- **Morgan**: HTTP request logging middleware

### External Services

- **OpenWeatherMap API**: Real-time weather data and forecasts
- **Geolocation API**: Browser-based location services

### Development Tools

- **Concurrent**: Run frontend and backend simultaneously
- **Nodemon**: Automatic server restart during development
- **ESLint**: Code linting and style enforcement
- **React Query DevTools**: Inspect queries and cache in development
- **Environment Variables**: Secure configuration management

## 📁 Project Structure

```
folio-weather/
├── frontend/                    # React 19 Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── common/         # Common components (ErrorBoundary)
│   │   │   ├── layout/         # Layout components (Header, HeaderWeatherBadge, Footer)
│   │   │   ├── ui/             # UI components (LoadingSpinner, ErrorMessage, SearchDropdown, HeaderSearchDropdown, ConnectionStatus, TopBarProgress)
│   │   │   └── weather/        # Weather-specific components (WeatherCard, ForecastCard)
│   │   ├── context/            # React Context providers
│   │   │   ├── WeatherContext.jsx    # Weather data and preferences state
│   │   │   └── QueryProvider.jsx     # API query state management
│   │   ├── data/               # Static data and constants
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useWeather.js   # Weather data fetching hooks
│   │   │   └── useGeolocation.js     # Geolocation functionality
│   │   ├── pages/              # Application pages/routes
│   │   │   ├── HomePage.jsx    # Main dashboard with current weather
│   │   │   ├── SearchPage.jsx  # Weather search functionality
│   │   │   ├── FavoritesPage.jsx     # Saved locations management
│   │   │   ├── SettingsPage.jsx      # User preferences and settings
│   │   │   └── TestPage.jsx    # API testing interface
│   │   ├── services/           # API and external service integrations
│   │   │   ├── api.js          # Base API configuration
│   │   │   ├── searchApi.js    # Search API service calls
│   │   │   └── weatherService.js     # Weather API service calls
│   │   ├── styles/             # CSS stylesheets
│   │   │   ├── App.css         # Main application styles
│   │   │   ├── components.css  # Component-specific styles
│   │   │   ├── pages.css       # Page-specific styles
│   │   │   ├── search.css      # Search interface styles
│   │   │   └── index.css       # Global styles and CSS reset
│   │   └── utils/              # Utility functions and helpers
│   │       └── searchUtils.js  # Search parsing and validation utilities
│   ├── public/                 # Static assets
│   ├── .env.example           # Frontend environment variables template
│   ├── vite.config.js         # Vite build configuration
│   └── package.json           # Frontend dependencies and scripts
├── backend/                    # Node.js/Express Backend Server
│   ├── config/                # Configuration files
│   │   └── database.js        # MongoDB connection configuration
│   ├── data/                  # Search databases and city data
│   │   ├── allUSCitiesComplete.js     # Consolidated US cities database
│   │   ├── comprehensiveUSCities.js   # 15,000+ US cities by state
│   │   ├── randomCities.js           # International cities database
│   │   └── usCitiesStateMapping.js   # US cities state mapping & disambiguation
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.js    # Global error handling middleware
│   │   └── searchCache.js     # Search caching middleware
│   ├── models/                # MongoDB/Mongoose data models
│   │   ├── User.js            # User account model
│   │   ├── FavoriteLocation.js # Favorite locations model
│   │   └── WeatherAlert.js    # Weather alerts model
│   ├── routes/                # API route handlers
│   │   ├── search.js          # Search API endpoints
│   │   ├── weather.js         # Weather API endpoints
│   │   └── users.js           # User management endpoints
│   ├── utils/                 # Backend utilities
│   │   ├── cache.js           # Caching utilities
│   │   └── weatherService.js  # OpenWeatherMap API integration
│   ├── .env.example          # Backend environment variables template
│   ├── server.js             # Main Express server file
│   └── package.json          # Backend dependencies and scripts
├── docs/                      # Comprehensive Documentation
│   ├── fixes-and-implementations/     # Fix & Implementation Documentation
│   │   ├── README.md         # Comprehensive fixes index with categories
│   │   ├── CRASH_FIX_SUMMARY.md      # Critical crash fixes
│   │   ├── FINAL_HEADER_SEARCH_FIX.md # Final header search solutions
│   │   ├── FORECAST_TOGGLE_RESET_IMPLEMENTATION.md # Forecast toggle reset feature
│   │   ├── HEADER_DROPDOWN_*.md      # Header dropdown fixes (3 files)
│   │   ├── HEADER_SEARCH_*.md        # Header search fixes (4 files)
│   │   ├── LOCATION_ERROR_FIX_SUMMARY.md # Location service fixes
│   │   ├── MOBILE_SEARCH_ALIGNMENT_FIX.md # Mobile interface fixes
│   │   ├── REALTIME_DROPDOWN_*.md    # Real-time dropdown features
│   │   └── COMPREHENSIVE_*.md        # Complete implementation solutions (4 files)
│   ├── API_REFERENCE.md       # Complete API endpoint documentation
│   ├── API_SETUP.md          # API setup and configuration guide
│   ├── BACKEND_PORT_AND_DATABASE.md # Backend configuration details
│   ├── DEVELOPMENT_GUIDE.md   # Development setup and workflow guide
│   └── TEST_FORECAST_TOGGLE_RESET.md # Forecast toggle reset testing guide
├── tests/                     # Comprehensive Test Suite
│   ├── api/                  # API integration tests (3 files)
│   ├── development/          # Development and feature tests (17 files)
│   │   └── demo-us-cities-solution.mjs # Search system demo
│   ├── frontend/             # Frontend-specific tests
│   │   └── test-favorite-forecast-toggle-reset.js # Forecast toggle reset test
│   ├── integration/          # Integration test suites (16 files)
│   │   ├── test-header-dropdown-*.mjs # Header dropdown tests (3 files)
│   │   ├── test-header-search-*.mjs   # Header search tests (8 files)
│   │   ├── test-mobile-search-alignment.mjs # Mobile search tests
│   │   ├── test-realtime-dropdown.mjs # Real-time dropdown tests
│   │   └── [other integration tests]  # Comprehensive city/state search, location fixes, header refinements
│   └── README.md             # Testing documentation with organized file index
├── Chat History/              # Development Session Documentation
│   ├── README.md             # Chat history organization guide
│   ├── Development-Session-Overview.md  # Complete development timeline
│   └── [Session Files]       # Individual development session logs
├── fix-crashes.sh            # Crash fix utility script
├── start-app.sh              # Application startup script
├── CHANGELOG.md              # Version history and feature changes
├── FEATURES_AND_IMPROVEMENTS.md # Feature analysis and roadmap
├── GIT_GUIDE.md              # Git workflow and repository management
├── GITHUB_CONFIG_TEST.md     # GitHub configuration testing
├── INTEGRATION_TEST_RESULTS.md # Testing results and validation
├── NEXT_STEPS.md             # Future development roadmap
├── QUICK_IMPROVEMENTS_CHECKLIST.md # Quick reference for enhancements
├── SCROLL_TEST_INSTRUCTIONS.md # Scroll testing procedures
├── TODO.md                   # Project requirements and planning
├── package.json              # Root package.json with development scripts
└── README.md                 # This comprehensive project guide
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

**Frontend Environment (`frontend/.env`):**

```bash
cp frontend/.env.example frontend/.env
```

The frontend `.env` file is pre-configured for development.

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

- **Live Demo**: [Add your deployed URL here]
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

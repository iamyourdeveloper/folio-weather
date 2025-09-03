# FolioWeather - Modern Weather Application

A comprehensive weather application built with the MERN stack (MongoDB, Express.js, React 19, Node.js) that provides real-time weather data with a beautiful, responsive interface and advanced features.

## ✨ Features

### 🌤️ Weather Data & Forecasting

- **Real-time Weather**: Current weather conditions for any city worldwide
- **5-Day Forecasts**: Detailed weather forecasts with 3-hour intervals
- **Multiple Data Sources**: Integrated with OpenWeatherMap API
- **Coordinate-based Weather**: Weather data by GPS coordinates
- **Multiple Units**: Support for metric, imperial, and Kelvin temperature units

### 🗺️ Location Services

- **Geolocation Support**: Automatic current location detection
- **City Search**: Search weather for any city globally
- **Coordinate Input**: Manual latitude/longitude weather lookup

### ⭐ Favorites & Navigation

- **Favorite Locations**: Save and manage favorite weather locations
- **Duplicate Prevention**: Consistent detection to avoid duplicate entries
- **Drag-and-Drop Reorder**: Reorder favorites on the Favorites page
- **Home Favorites Slider**: Horizontal, accessible slider with controls
- **Auto-Rotate Favorite**: Auto-selects the next favorite on app load when geolocation is unavailable

### ⭐ User Experience

- **Quick Access**: Fast switching between saved locations
- **Auto Location**: Automatic weather for current location on app load
- **Search Integration**: Header search with instant results
- **Favorited Indicator**: Filled-heart visual when a location is already saved
- **Header Weather Badge**: Live temperature + location badge in the header that mirrors the active location and updates immediately after searches
- **Random City**: One-click action on Home to preview weather for a randomly selected city (drawn from a broad, global list to reduce repeats)

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
- **Error Boundaries**: Robust error handling and recovery
- **API Testing**: Built-in API endpoint testing interface
- **Real-time Updates**: Automatic weather data refresh
- **Favorites Data Integrity**: Validation and recovery for corrupted favorites in localStorage

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
- **RESTful APIs**: Clean, standardized API endpoints
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
│   │   │   ├── layout/         # Layout components (Header, Footer)
│   │   │   ├── ui/             # UI components (LoadingSpinner, ErrorMessage)
│   │   │   └── weather/        # Weather-specific components (WeatherCard, ForecastCard)
│   │   ├── context/            # React Context providers
│   │   │   ├── WeatherContext.jsx    # Weather data and preferences state
│   │   │   └── QueryProvider.jsx     # API query state management
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
│   │   │   └── weatherService.js     # Weather API service calls
│   │   ├── styles/             # CSS stylesheets
│   │   │   ├── App.css         # Main application styles
│   │   │   ├── components.css  # Component-specific styles
│   │   │   ├── pages.css       # Page-specific styles
│   │   │   └── index.css       # Global styles and CSS reset
│   │   └── utils/              # Utility functions and helpers
│   ├── public/                 # Static assets
│   ├── .env.example           # Frontend environment variables template
│   ├── vite.config.js         # Vite build configuration
│   └── package.json           # Frontend dependencies and scripts
├── backend/                    # Node.js/Express Backend Server
│   ├── config/                # Configuration files
│   │   └── database.js        # MongoDB connection configuration
│   ├── middleware/            # Express middleware
│   │   └── errorHandler.js    # Global error handling middleware
│   ├── models/                # MongoDB/Mongoose data models
│   │   ├── User.js            # User account model
│   │   ├── FavoriteLocation.js # Favorite locations model
│   │   └── WeatherAlert.js    # Weather alerts model
│   ├── routes/                # API route handlers
│   │   ├── weather.js         # Weather API endpoints
│   │   └── users.js           # User management endpoints
│   ├── utils/                 # Backend utilities
│   │   └── weatherService.js  # OpenWeatherMap API integration
│   ├── .env.example          # Backend environment variables template
│   ├── server.js             # Main Express server file
│   └── package.json          # Backend dependencies and scripts
├── docs/                      # Comprehensive Documentation
│   ├── API_REFERENCE.md       # Complete API endpoint documentation
│   ├── API_SETUP.md          # API setup and configuration guide
│   └── DEVELOPMENT_GUIDE.md   # Development setup and workflow guide
├── Chat History/              # Development Session Documentation
│   ├── README.md             # Chat history organization guide
│   ├── Development-Session-Overview.md  # Complete development timeline
│   └── [Session Files]       # Individual development session logs
├── INTEGRATION_TEST_RESULTS.md # Testing results and validation
├── NEXT_STEPS.md             # Future development roadmap
├── TODO.md                   # Original project requirements and planning
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

## 🤝 Contributing

We welcome contributions to FolioWeather! Here's how you can help:

### Getting Started with Contributions

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/folio-weather.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following the project structure and coding standards
5. **Test thoroughly** using the built-in test page and manual testing
6. **Commit your changes** with descriptive commit messages
7. **Push to your fork** and submit a pull request

### Areas for Contribution

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

_For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/your-username/folio-weather) or check the [Chat History](Chat%20History/) for development insights._

# Development Guide - FolioWeather

This guide will help you set up and run the FolioWeather for development.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) MongoDB for persistence

## Quick Start

1. **Clone and Navigate**

   ```bash
   git clone <your-repo-url>
   cd weather-api
   ```

2. **Install Dependencies**

   ```bash
   npm run install-deps
   ```

3. **Set Up Environment Variables**

   ```bash
   # Backend environment
   cp backend/.env.example backend/.env

   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

4. **Get OpenWeather API Key**

   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key
   - Replace `demo_key_replace_with_real_key` in `backend/.env`

5. **Start Development Servers**

   ```bash
   npm run dev
   ```

   This starts both backend (port 8000) and frontend (port 3000) simultaneously.

## Individual Server Commands

### Backend Only

```bash
cd backend
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend Only

```bash
cd frontend
npm run dev    # Development server
npm run build  # Production build
```

## Environment Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/weather-app
OPENWEATHER_API_KEY=your_actual_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
JWT_SECRET=your_jwt_secret_here
```

### Frontend (.env)

```env
VITE_APP_NAME=FolioWeather
VITE_DEBUG=true
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Features

### ✅ Implemented

- 🌤️ Current weather by city and coordinates
- 📊 5-day weather forecast
- 📱 Responsive design with mobile support
- 🗺️ Advanced geolocation support for current location
- 🔍 Comprehensive city search with 15,000+ US cities database
- 🏛️ US cities display with proper state information (e.g., "Springfield, IL")
- 🚀 Real-time autocomplete suggestions with smart prioritization
- 🌍 State-specific and international city searches
- ⭐ Favorite locations management (save/remove)
- 💡 Favorites enhancements: duplicate prevention and a clear favorited indicator
- 🔀 Drag-and-drop favorites reordering (Favorites page)
- 🎞️ Favorites slider on Home with prev/next controls
- ⚙️ User preferences and settings with staged changes
- 🌙 Dark/Light theme support with live preview
- 🔄 Enhanced error handling with connection monitoring
- 🚀 Modern React 19 with hooks and context
- 🧪 API testing page at `/test`
- 🧱 Error Boundary fallback UI
- 📶 Global top bar progress indicator bound to query activity
- 🏎️ Advanced search caching for improved performance

### 🔧 Development Features

- 🔍 Comprehensive search API with multiple endpoints
- 📊 Search database statistics and analytics
- 🚀 Real-time autocomplete with caching
- 🏛️ US cities state mapping and coordinate disambiguation
- 📶 Connection status monitoring
- 🎯 Global loading states with progress indicators
- 📊 Search performance caching (15-30 minute TTL)
- 🧪 Extensive test suite for search functionality
- 🛠️ Development tooling with hot reload and debugging

## API Endpoints

### Weather Routes

- `GET /api/weather/current/city/:city` - Current weather by city
- `GET /api/weather/current/coords?lat=&lon=` - Current weather by coordinates
- `GET /api/weather/forecast/city/:city` - 5-day forecast by city
- `GET /api/weather/forecast/coords?lat=&lon=` - 5-day forecast by coordinates
- `GET /api/weather/test` - Test API connection
- `GET /api/weather/units` - Available temperature units

### Health Check

- `GET /api/health` - Server health status

## Project Structure

```
weather-api/
├── backend/                 # Node.js/Express server
│   ├── config/             # Database configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # React 19 application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS stylesheets
│   │   └── utils/          # Utility functions
│   └── vite.config.js      # Vite configuration
├── docs/                   # Documentation
└── package.json            # Root package.json with scripts
```

## Troubleshooting

### Common Issues

1. **Backend won't start**

   - Check if port 8000 is available
   - Verify OpenWeather API key is set
   - Check Node.js version (requires 18+)

2. **Frontend can't connect to backend**

   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify VITE_API_BASE_URL in frontend/.env

3. **Weather data not loading**
   - Verify OpenWeather API key is valid
   - Check internet connection
   - Check browser developer tools for error messages

### Debug Mode

Enable debug logging by setting `VITE_DEBUG=true` in frontend/.env. This will show detailed API request/response information in the browser console.

## Testing

### Manual Testing

1. Start both servers
2. Navigate to http://localhost:3000/
3. Test geolocation (allow location access)
4. Search for different cities
5. Add/remove favorites; drag cards on Favorites page to reorder
6. Change settings and themes (live theme preview; click Save to apply)

### API Testing

Use curl or Postman to test backend endpoints:

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test weather endpoint
curl "http://localhost:8000/api/weather/current/city/London?units=metric"
```

## Production Deployment

### Backend

```bash
cd backend
npm install --production
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ directory with your web server
```

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Update documentation for new features
4. Test on both desktop and mobile
5. Ensure responsive design principles

## Learning Resources

This project demonstrates:

- Modern React 19 patterns and hooks
- Context API for state management
- Custom hooks for data fetching
- Responsive CSS with CSS custom properties
- RESTful API design with Express
- Error handling and user experience
- Modern JavaScript (ES6+) features

## Next Steps

Potential enhancements:

- Weather alerts and notifications
- Historical weather data
- Weather maps integration
- Offline support with service workers
- Push notifications
- User authentication
- Social sharing features

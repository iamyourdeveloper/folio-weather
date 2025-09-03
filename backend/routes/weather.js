import express from 'express';
import weatherService from '../utils/weatherService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/weather/current/city/:city
 * @desc    Get current weather by city name
 * @access  Public
 */
router.get('/current/city/:city', asyncHandler(async (req, res) => {
  const { city } = req.params;
  const { units = 'metric' } = req.query;

  if (!city) {
    return res.status(400).json({
      success: false,
      error: 'City name is required'
    });
  }

  const weatherData = await weatherService.getCurrentWeatherByCity(city, units);
  
  res.json({
    success: true,
    data: weatherData
  });
}));

/**
 * @route   GET /api/weather/current/coords
 * @desc    Get current weather by coordinates
 * @access  Public
 */
router.get('/current/coords', asyncHandler(async (req, res) => {
  const { lat, lon, units = 'metric' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates. Latitude and longitude must be numbers.'
    });
  }

  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      error: 'Latitude must be between -90 and 90 degrees'
    });
  }

  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      error: 'Longitude must be between -180 and 180 degrees'
    });
  }

  const weatherData = await weatherService.getCurrentWeatherByCoords(latitude, longitude, units);
  
  res.json({
    success: true,
    data: weatherData
  });
}));

/**
 * @route   GET /api/weather/forecast/city/:city
 * @desc    Get 5-day forecast by city name
 * @access  Public
 */
router.get('/forecast/city/:city', asyncHandler(async (req, res) => {
  const { city } = req.params;
  const { units = 'metric' } = req.query;

  if (!city) {
    return res.status(400).json({
      success: false,
      error: 'City name is required'
    });
  }

  const forecastData = await weatherService.getForecastByCity(city, units);
  
  res.json({
    success: true,
    data: forecastData
  });
}));

/**
 * @route   GET /api/weather/forecast/coords
 * @desc    Get 5-day forecast by coordinates
 * @access  Public
 */
router.get('/forecast/coords', asyncHandler(async (req, res) => {
  const { lat, lon, units = 'metric' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates. Latitude and longitude must be numbers.'
    });
  }

  const forecastData = await weatherService.getForecastByCoords(latitude, longitude, units);
  
  res.json({
    success: true,
    data: forecastData
  });
}));

/**
 * @route   GET /api/weather/test
 * @desc    Test weather API connection
 * @access  Public
 */
router.get('/test', asyncHandler(async (req, res) => {
  const testResult = await weatherService.testConnection();
  
  res.json({
    success: testResult.success,
    message: testResult.message,
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route   GET /api/weather/units
 * @desc    Get available temperature units
 * @access  Public
 */
router.get('/units', (req, res) => {
  res.json({
    success: true,
    data: {
      units: [
        {
          key: 'metric',
          name: 'Celsius',
          symbol: '°C',
          description: 'Temperature in Celsius, wind speed in meter/sec'
        },
        {
          key: 'imperial',
          name: 'Fahrenheit',
          symbol: '°F',
          description: 'Temperature in Fahrenheit, wind speed in miles/hour'
        },
        {
          key: 'kelvin',
          name: 'Kelvin',
          symbol: 'K',
          description: 'Temperature in Kelvin, wind speed in meter/sec'
        }
      ],
      default: 'metric'
    }
  });
});

/**
 * @route   GET /api/weather
 * @desc    Get weather API information and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Weather API endpoints',
    endpoints: {
      current: {
        'GET /current/city/:city': 'Get current weather by city name',
        'GET /current/coords?lat=&lon=': 'Get current weather by coordinates'
      },
      forecast: {
        'GET /forecast/city/:city': 'Get 5-day forecast by city name',
        'GET /forecast/coords?lat=&lon=': 'Get 5-day forecast by coordinates'
      },
      utility: {
        'GET /test': 'Test API connection',
        'GET /units': 'Get available temperature units',
        'GET /': 'This endpoint - API information'
      }
    },
    parameters: {
      units: 'Temperature units (metric, imperial, kelvin) - default: metric',
      lat: 'Latitude coordinate (required for coordinate-based requests)',
      lon: 'Longitude coordinate (required for coordinate-based requests)',
      city: 'City name (required for city-based requests)'
    },
    examples: {
      currentWeatherByCity: '/api/weather/current/city/London?units=metric',
      currentWeatherByCoords: '/api/weather/current/coords?lat=51.5074&lon=-0.1278&units=metric',
      forecastByCity: '/api/weather/forecast/city/London?units=metric',
      forecastByCoords: '/api/weather/forecast/coords?lat=51.5074&lon=-0.1278&units=metric'
    }
  });
});

export default router;


# API Reference - FolioWeather

This document provides detailed information about the FolioWeather's backend API endpoints.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Common Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## API Endpoints Overview

- 🏥 **Health Check** - Server status and health monitoring
- 🌤️ **Weather** - Current weather and forecasts
- 🔍 **Search** - Comprehensive city search with autocomplete (NEW)
- 👤 **Users** - User management (ready for implementation)

## Health Check

### GET /health

Check if the server is running and healthy.

**Response:**

```json
{
  "status": "OK",
  "message": "Weather API Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## Weather Endpoints

### GET /weather/current/city/:city

Get current weather data for a specific city.

**Parameters:**

- `city` (string, required) - City name (e.g., "London", "New York")
- `units` (string, optional) - Temperature units: `metric`, `imperial`, `kelvin` (default: `metric`)

**Example Request:**

```
GET /api/weather/current/city/London?units=metric
```

**Response:**

```json
{
  "success": true,
  "data": {
    "location": {
      "name": "London",
      "country": "GB",
      "coordinates": {
        "lat": 51.5074,
        "lon": -0.1278
      }
    },
    "current": {
      "temperature": 15,
      "feelsLike": 14,
      "humidity": 72,
      "pressure": 1013,
      "visibility": 10,
      "uvIndex": null,
      "windSpeed": 3.5,
      "windDirection": 230,
      "cloudiness": 75,
      "description": "broken clouds",
      "main": "Clouds",
      "icon": "04d"
    },
    "sun": {
      "sunrise": "2024-01-15T07:30:00.000Z",
      "sunset": "2024-01-15T16:45:00.000Z"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /weather/current/coords

Get current weather data for specific coordinates.

**Query Parameters:**

- `lat` (number, required) - Latitude (-90 to 90)
- `lon` (number, required) - Longitude (-180 to 180)
- `units` (string, optional) - Temperature units (default: `metric`)

**Example Request:**

```
GET /api/weather/current/coords?lat=51.5074&lon=-0.1278&units=metric
```

**Response:** Same format as city endpoint.

### GET /weather/forecast/city/:city

Get 5-day weather forecast for a specific city.

**Parameters:**

- `city` (string, required) - City name
- `units` (string, optional) - Temperature units (default: `metric`)

**Example Request:**

```
GET /api/weather/forecast/city/London?units=metric
```

**Response:**

```json
{
  "success": true,
  "data": {
    "location": {
      "name": "London",
      "country": "GB",
      "coordinates": {
        "lat": 51.5074,
        "lon": -0.1278
      }
    },
    "forecast": [
      {
        "date": "2024-01-15",
        "forecasts": [
          {
            "time": "2024-01-15T12:00:00.000Z",
            "temperature": 15,
            "feelsLike": 14,
            "humidity": 72,
            "pressure": 1013,
            "windSpeed": 3.5,
            "windDirection": 230,
            "cloudiness": 75,
            "description": "broken clouds",
            "main": "Clouds",
            "icon": "04d",
            "pop": 0.2
          }
          // ... more hourly forecasts
        ],
        "minTemp": 10,
        "maxTemp": 18,
        "mainWeather": "Clouds",
        "description": "broken clouds",
        "icon": "04d"
      }
      // ... more days
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /weather/forecast/coords

Get 5-day weather forecast for specific coordinates.

**Query Parameters:**

- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude
- `units` (string, optional) - Temperature units (default: `metric`)

**Response:** Same format as city forecast endpoint.

### GET /weather/test

Test the OpenWeather API connection.

**Response:**

```json
{
  "success": true,
  "message": "OpenWeather API connection successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /weather/units

Get available temperature units and their descriptions.

**Response:**

```json
{
  "success": true,
  "data": {
    "units": [
      {
        "key": "metric",
        "name": "Celsius",
        "symbol": "°C",
        "description": "Temperature in Celsius, wind speed in meter/sec"
      },
      {
        "key": "imperial",
        "name": "Fahrenheit",
        "symbol": "°F",
        "description": "Temperature in Fahrenheit, wind speed in miles/hour"
      },
      {
        "key": "kelvin",
        "name": "Kelvin",
        "symbol": "K",
        "description": "Temperature in Kelvin, wind speed in meter/sec"
      }
    ],
    "default": "metric"
  }
}
```

### GET /weather

Get API information and available endpoints.

**Response:**

```json
{
  "success": true,
  "message": "Weather API endpoints",
  "endpoints": {
    "current": {
      "GET /current/city/:city": "Get current weather by city name",
      "GET /current/coords?lat=&lon=": "Get current weather by coordinates"
    },
    "forecast": {
      "GET /forecast/city/:city": "Get 5-day forecast by city name",
      "GET /forecast/coords?lat=&lon=": "Get 5-day forecast by coordinates"
    },
    "utility": {
      "GET /test": "Test API connection",
      "GET /units": "Get available temperature units",
      "GET /": "This endpoint - API information"
    }
  },
  "parameters": {
    "units": "Temperature units (metric, imperial, kelvin) - default: metric",
    "lat": "Latitude coordinate (required for coordinate-based requests)",
    "lon": "Longitude coordinate (required for coordinate-based requests)",
    "city": "City name (required for city-based requests)"
  },
  "examples": {
    "currentWeatherByCity": "/api/weather/current/city/London?units=metric",
    "currentWeatherByCoords": "/api/weather/current/coords?lat=51.5074&lon=-0.1278&units=metric",
    "forecastByCity": "/api/weather/forecast/city/London?units=metric",
    "forecastByCoords": "/api/weather/forecast/coords?lat=51.5074&lon=-0.1278&units=metric"
  }
}
```

## Error Codes

### 400 Bad Request

- Missing required parameters
- Invalid parameter values
- Invalid coordinates (lat/lon out of range)

### 401 Unauthorized

- Invalid or missing OpenWeather API key

### 404 Not Found

- City not found
- Invalid endpoint

### 429 Too Many Requests

- OpenWeather API rate limit exceeded

### 500 Internal Server Error

- Server error
- OpenWeather API unavailable

## Rate Limiting

The API currently doesn't implement rate limiting, but the underlying OpenWeather API has the following limits:

- **Free Plan**: 1,000 calls/day, 60 calls/minute
- **Professional Plans**: Higher limits available

## Data Sources

Weather data is provided by [OpenWeatherMap](https://openweathermap.org/):

- Current weather data
- 5-day / 3-hour forecast
- Weather icons and descriptions

## CORS

CORS is enabled for the frontend URL specified in the `FRONTEND_URL` environment variable (default: `http://localhost:3000`).

## Examples

### Using cURL

```bash
# Get current weather for London
curl "http://localhost:8000/api/weather/current/city/London?units=metric"

# Get forecast by coordinates
curl "http://localhost:8000/api/weather/forecast/coords?lat=40.7128&lon=-74.0060&units=imperial"

# Test API connection
curl "http://localhost:8000/api/weather/test"
```

### Using JavaScript (fetch)

```javascript
// Get current weather
const response = await fetch("/api/weather/current/city/London?units=metric");
const data = await response.json();

if (data.success) {
  console.log("Current temperature:", data.data.current.temperature);
} else {
  console.error("Error:", data.error);
}
```

### Using Axios

```javascript
import axios from "axios";

try {
  const response = await axios.get("/api/weather/current/city/London", {
    params: { units: "metric" },
  });

  console.log("Weather data:", response.data.data);
} catch (error) {
  console.error("API Error:", error.response?.data?.error);
}
```

---

## 🔍 Search API (NEW)

The Search API provides comprehensive city search functionality with real-time autocomplete, US city prioritization, and intelligent caching.

### GET /search

Get API information and available endpoints.

**Response:**

```json
{
  "success": true,
  "message": "City Search API endpoints",
  "endpoints": {
    "search": {
      "GET /cities": "Search for cities",
      "GET /cities/us/:state": "Get cities by US state",
      "GET /suggestions": "Get city suggestions",
      "GET /autocomplete": "Fast autocomplete"
    }
  }
}
```

### GET /search/cities

Search for cities with optional filtering and US city prioritization.

**Query Parameters:**

- `q` (string, required): Search query
- `limit` (number, optional): Maximum results (default: 20, max: 100)
- `country` (string, optional): Filter by country code (use "US" for US-only)

**Example Request:**

```bash
GET /search/cities?q=Springfield&limit=10&country=US
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "city": "Springfield",
      "state": "IL",
      "country": "US",
      "name": "Springfield, IL",
      "coordinates": { "lat": 39.7817, "lon": -89.6501 }
    },
    {
      "city": "Springfield",
      "state": "MA",
      "country": "US",
      "name": "Springfield, MA",
      "coordinates": { "lat": 42.1015, "lon": -72.5898 }
    }
  ],
  "query": "Springfield",
  "count": 2,
  "limit": 10,
  "country": "US"
}
```

### GET /search/cities/us/:state

Get cities from a specific US state.

**Path Parameters:**

- `state` (string, required): Two-letter US state code (e.g., "CA", "TX")

**Query Parameters:**

- `q` (string, optional): Filter cities by name
- `limit` (number, optional): Maximum results (default: 50, max: 200)

**Example Request:**

```bash
GET /search/cities/us/CA?q=San&limit=15
```

### GET /search/autocomplete

Fast autocomplete endpoint optimized for real-time dropdown suggestions.

**Query Parameters:**

- `q` (string, required): Search query
- `limit` (number, optional): Maximum results (default: 8, max: 15)

**Example Request:**

```bash
GET /search/autocomplete?q=Los&limit=8
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "los-angeles-ca",
      "city": "Los Angeles",
      "state": "CA",
      "country": "US",
      "displayName": "Los Angeles, CA",
      "searchValue": "Los Angeles",
      "type": "us",
      "priority": 1
    }
  ],
  "query": "Los",
  "count": 1,
  "limit": 8
}
```

### GET /search/stats

Get search database statistics and metrics.

**Example Response:**

```json
{
  "success": true,
  "data": {
    "totalUSCities": 15247,
    "totalInternationalCities": 5421,
    "totalCities": 20668,
    "usStatesCount": 51,
    "citiesByState": {
      "CA": 1542,
      "TX": 1238,
      "FL": 892
    },
    "lastUpdated": "2025-01-15T10:30:00.000Z"
  }
}
```

## WebSocket Support

Currently not implemented, but planned for future versions to provide real-time weather updates.

## Versioning

The current API version is v1. Future versions will be accessible via `/api/v2/` etc.

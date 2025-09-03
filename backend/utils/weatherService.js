import axios from 'axios';

class WeatherService {
  constructor() {
    // Ensure environment is loaded
    import('dotenv').then(dotenv => dotenv.config());
    
    this.apiKey = process.env.OPENWEATHER_API_KEY || 'b12265d01881b865932694e3950ffd1f';
    this.baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    
    console.log('🔑 WeatherService initialized with API key:', this.apiKey ? `${this.apiKey.slice(0, 8)}...` : 'MISSING');
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenWeather API key not found. Please set OPENWEATHER_API_KEY in your .env file');
    }
  }

  /**
   * Get current weather by city name
   * @param {string} city - City name
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeatherByCity(city, units = 'metric') {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: units
        }
      });
      
      return this.formatCurrentWeatherData(response.data);
    } catch (error) {
      throw this.handleWeatherApiError(error);
    }
  }

  /**
   * Get current weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Temperature units
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeatherByCoords(lat, lon, units = 'metric') {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: units
        }
      });
      
      return this.formatCurrentWeatherData(response.data);
    } catch (error) {
      throw this.handleWeatherApiError(error);
    }
  }

  /**
   * Get 5-day weather forecast
   * @param {string} city - City name
   * @param {string} units - Temperature units
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByCity(city, units = 'metric') {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: units
        }
      });
      
      return this.formatForecastData(response.data);
    } catch (error) {
      throw this.handleWeatherApiError(error);
    }
  }

  /**
   * Get 5-day weather forecast by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Temperature units
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByCoords(lat, lon, units = 'metric') {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: units
        }
      });
      
      return this.formatForecastData(response.data);
    } catch (error) {
      throw this.handleWeatherApiError(error);
    }
  }

  /**
   * Format current weather data
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted weather data
   */
  formatCurrentWeatherData(data) {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: data.uvi || null,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon
      },
      sun: {
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format forecast data
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted forecast data
   */
  formatForecastData(data) {
    const dailyForecasts = {};
    
    // Group forecasts by day
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          forecasts: [],
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          mainWeather: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      }
      
      dailyForecasts[date].forecasts.push({
        time: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        windDirection: item.wind.deg,
        cloudiness: item.clouds.all,
        description: item.weather[0].description,
        main: item.weather[0].main,
        icon: item.weather[0].icon,
        pop: item.pop // Probability of precipitation
      });
      
      // Update min/max temperatures
      dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, item.main.temp_min);
      dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, item.main.temp_max);
    });

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon
        }
      },
      forecast: Object.values(dailyForecasts).map(day => ({
        ...day,
        minTemp: Math.round(day.minTemp),
        maxTemp: Math.round(day.maxTemp)
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle API errors
   * @param {Object} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleWeatherApiError(error) {
    if (error.response) {
      const { status, data } = error.response;
      let message = 'Weather API error';
      
      switch (status) {
        case 401:
          message = 'Invalid API key. Please check your OpenWeather API key.';
          break;
        case 404:
          message = 'Location not found. Please check the city name or coordinates.';
          break;
        case 429:
          message = 'API rate limit exceeded. Please try again later.';
          break;
        case 500:
          message = 'Weather service temporarily unavailable.';
          break;
        default:
          message = data.message || 'Unknown weather API error';
      }
      
      const customError = new Error(message);
      customError.status = status;
      customError.code = data.cod;
      return customError;
    }
    
    if (error.request) {
      const customError = new Error('Weather service is currently unavailable. Please check your internet connection.');
      customError.status = 503;
      return customError;
    }
    
    return error;
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      await this.getCurrentWeatherByCity('London');
      return { success: true, message: 'OpenWeather API connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new WeatherService();


import api from './api.js';

/**
 * Weather Service - Handles all weather-related API calls
 */
class WeatherService {
  /**
   * Get current weather by city name
   * @param {string} city - City name
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeatherByCity(city, units = 'metric') {
    try {
      const response = await api.get(`/weather/current/city/${encodeURIComponent(city)}`, {
        params: { units }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to get weather for ${city}`);
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
      const response = await api.get('/weather/current/coords', {
        params: { lat, lon, units }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to get weather for coordinates ${lat}, ${lon}`);
    }
  }

  /**
   * Get 5-day weather forecast by city name
   * @param {string} city - City name
   * @param {string} units - Temperature units
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByCity(city, units = 'metric') {
    try {
      const response = await api.get(`/weather/forecast/city/${encodeURIComponent(city)}`, {
        params: { units }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to get forecast for ${city}`);
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
      const response = await api.get('/weather/forecast/coords', {
        params: { lat, lon, units }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to get forecast for coordinates ${lat}, ${lon}`);
    }
  }

  /**
   * Test weather API connection
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      const response = await api.get('/weather/test');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to test weather API connection');
    }
  }

  /**
   * Get available temperature units
   * @returns {Promise<Object>} Units data
   */
  async getUnits() {
    try {
      const response = await api.get('/weather/units');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get temperature units');
    }
  }

  /**
   * Get weather API information
   * @returns {Promise<Object>} API info
   */
  async getApiInfo() {
    try {
      const response = await api.get('/weather');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get weather API information');
    }
  }

  /**
   * Handle and format errors consistently
   * @param {Object} error - Error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    console.log('🔍 WeatherService Error Debug:', {
      error,
      message: error.message,
      status: error.status,
      response: error.response,
      defaultMessage
    });

    const errorMessage = error.message || defaultMessage;
    const errorStatus = error.status || 0;

    const customError = new Error(errorMessage);
    customError.status = errorStatus;
    customError.originalError = error;

    // Add specific error types for UI handling
    if (errorStatus === 404) {
      customError.type = 'NOT_FOUND';
    } else if (errorStatus === 401) {
      customError.type = 'UNAUTHORIZED';
    } else if (errorStatus === 429) {
      customError.type = 'RATE_LIMITED';
    } else if (errorStatus === 0) {
      customError.type = 'NETWORK_ERROR';
    } else if (errorStatus >= 500) {
      customError.type = 'SERVER_ERROR';
    } else {
      customError.type = 'UNKNOWN_ERROR';
    }

    return customError;
  }
}

// Create and export a singleton instance
const weatherService = new WeatherService();
export default weatherService;


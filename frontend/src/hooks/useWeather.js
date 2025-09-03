import { useQuery } from '@tanstack/react-query';
import weatherService from '@services/weatherService.js';

/**
 * Custom hook for fetching current weather by city
 * @param {string} city - City name
 * @param {string} units - Temperature units (metric, imperial, kelvin)
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with weather data, loading state, and error
 */
export const useCurrentWeatherByCity = (city, units = 'metric', options = {}) => {
  return useQuery({
    queryKey: ['weather', 'current', 'city', city, units],
    queryFn: () => weatherService.getCurrentWeatherByCity(city, units),
    enabled: !!city, // Only fetch if city is provided
    ...options,
  });
};

/**
 * Custom hook for fetching current weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with weather data, loading state, and error
 */
export const useCurrentWeatherByCoords = (lat, lon, units = 'metric', options = {}) => {
  return useQuery({
    queryKey: ['weather', 'current', 'coords', lat, lon, units],
    queryFn: () => weatherService.getCurrentWeatherByCoords(lat, lon, units),
    enabled: !!(lat && lon), // Only fetch if coordinates are provided
    ...options,
  });
};

/**
 * Custom hook for fetching weather forecast by city
 * @param {string} city - City name
 * @param {string} units - Temperature units
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with forecast data, loading state, and error
 */
export const useForecastByCity = (city, units = 'metric', options = {}) => {
  return useQuery({
    queryKey: ['weather', 'forecast', 'city', city, units],
    queryFn: () => weatherService.getForecastByCity(city, units),
    enabled: !!city,
    ...options,
  });
};

/**
 * Custom hook for fetching weather forecast by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with forecast data, loading state, and error
 */
export const useForecastByCoords = (lat, lon, units = 'metric', options = {}) => {
  return useQuery({
    queryKey: ['weather', 'forecast', 'coords', lat, lon, units],
    queryFn: () => weatherService.getForecastByCoords(lat, lon, units),
    enabled: !!(lat && lon),
    ...options,
  });
};

/**
 * Custom hook for testing weather API connection
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with connection test data
 */
export const useWeatherApiTest = (options = {}) => {
  return useQuery({
    queryKey: ['weather', 'test'],
    queryFn: () => weatherService.testConnection(),
    // Don't automatically refetch this - it's just for testing
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options,
  });
};

/**
 * Custom hook for fetching available temperature units
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with units data
 */
export const useWeatherUnits = (options = {}) => {
  return useQuery({
    queryKey: ['weather', 'units'],
    queryFn: () => weatherService.getUnits(),
    // This data rarely changes, so cache it for a long time
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    ...options,
  });
};

/**
 * Custom hook that combines current weather and forecast for a city
 * @param {string} city - City name
 * @param {string} units - Temperature units
 * @param {Object} options - Additional query options
 * @returns {Object} Combined weather data with loading states
 */
export const useCompleteWeatherByCity = (city, units = 'metric', options = {}) => {
  const currentWeather = useCurrentWeatherByCity(city, units, options);
  const forecast = useForecastByCity(city, units, options);

  return {
    current: currentWeather,
    forecast: forecast,
    isLoading: currentWeather.isLoading || forecast.isLoading,
    isError: currentWeather.isError || forecast.isError,
    error: currentWeather.error || forecast.error,
    isSuccess: currentWeather.isSuccess && forecast.isSuccess,
    refetch: () => {
      currentWeather.refetch();
      forecast.refetch();
    },
  };
};

/**
 * Custom hook that combines current weather and forecast for coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @param {Object} options - Additional query options
 * @returns {Object} Combined weather data with loading states
 */
export const useCompleteWeatherByCoords = (lat, lon, units = 'metric', options = {}) => {
  const currentWeather = useCurrentWeatherByCoords(lat, lon, units, options);
  const forecast = useForecastByCoords(lat, lon, units, options);

  return {
    current: currentWeather,
    forecast: forecast,
    isLoading: currentWeather.isLoading || forecast.isLoading,
    isError: currentWeather.isError || forecast.isError,
    error: currentWeather.error || forecast.error,
    isSuccess: currentWeather.isSuccess && forecast.isSuccess,
    refetch: () => {
      currentWeather.refetch();
      forecast.refetch();
    },
  };
};


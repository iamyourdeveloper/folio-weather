import { useQuery } from "@tanstack/react-query";
import weatherService from "@services/weatherService.js";

/**
 * Custom hook for fetching current weather by city
 * @param {string} city - City name
 * @param {string} units - Temperature units (metric, imperial, kelvin)
 * @param {string} originalName - Original location name with state/region (optional)
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with weather data, loading state, and error
 */
export const useCurrentWeatherByCity = (
  city,
  units = "metric",
  originalName = null,
  options = {}
) => {
  // Optimized caching strategy for faster loading
  const isPopularCity = originalName && originalName.includes(",");
  
  return useQuery({
    queryKey: ["weather", "current", "city", city, units, originalName],
    queryFn: () =>
      weatherService.getCurrentWeatherByCity(city, units, originalName),
    enabled: !!city, // Only fetch if city is provided
    // Faster initial load with shorter stale times
    staleTime: isPopularCity ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 min for popular, 5 min for others
    cacheTime: isPopularCity ? 10 * 60 * 1000 : 20 * 60 * 1000, // 10 min for popular, 20 min for others
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Only if stale
    // Faster error handling
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors for faster failure
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Reduced retries for faster loading
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(800 * 1.5 ** attemptIndex, 10000),
    // Network optimizations
    networkMode: 'online',
    ...options,
  });
};

/**
 * Custom hook for fetching current weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @param {string} originalName - Original location name with state/region (optional)
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with weather data, loading state, and error
 */
export const useCurrentWeatherByCoords = (
  lat,
  lon,
  units = "metric",
  originalName = null,
  options = {}
) => {
  return useQuery({
    queryKey: ["weather", "current", "coords", lat, lon, units, originalName],
    queryFn: () =>
      weatherService.getCurrentWeatherByCoords(lat, lon, units, originalName),
    enabled: !!(lat && lon), // Only fetch if coordinates are provided
    // Faster loading for coordinate-based weather
    staleTime: 3 * 60 * 1000, // 3 minutes (was 5)
    cacheTime: 15 * 60 * 1000, // 15 minutes (was 10)
    refetchOnMount: true, // Only if stale
    // Faster error handling
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2; // Reduced from 3
    },
    retryDelay: (attemptIndex) => Math.min(800 * 1.5 ** attemptIndex, 10000),
    networkMode: 'online',
    ...options,
  });
};

/**
 * Custom hook for fetching weather forecast by city
 * @param {string} city - City name
 * @param {string} units - Temperature units
 * @param {string} originalName - Original location name with state/region (optional)
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with forecast data, loading state, and error
 */
export const useForecastByCity = (
  city,
  units = "metric",
  originalName = null,
  options = {}
) => {
  return useQuery({
    queryKey: ["weather", "forecast", "city", city, units, originalName],
    queryFn: () => weatherService.getForecastByCity(city, units, originalName),
    enabled: !!city,
    staleTime: 10 * 60 * 1000, // 10 minutes (forecasts change less frequently)
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Custom hook for fetching weather forecast by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @param {string} originalName - Original location name with state/region (optional)
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with forecast data, loading state, and error
 */
export const useForecastByCoords = (
  lat,
  lon,
  units = "metric",
  originalName = null,
  options = {}
) => {
  return useQuery({
    queryKey: ["weather", "forecast", "coords", lat, lon, units, originalName],
    queryFn: () =>
      weatherService.getForecastByCoords(lat, lon, units, originalName),
    enabled: !!(lat && lon),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    queryKey: ["weather", "test"],
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
    queryKey: ["weather", "units"],
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
export const useCompleteWeatherByCity = (
  city,
  units = "metric",
  options = {}
) => {
  const currentWeather = useCurrentWeatherByCity(city, units, null, options);
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
export const useCompleteWeatherByCoords = (
  lat,
  lon,
  units = "metric",
  options = {}
) => {
  const currentWeather = useCurrentWeatherByCoords(
    lat,
    lon,
    units,
    null,
    options
  );
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

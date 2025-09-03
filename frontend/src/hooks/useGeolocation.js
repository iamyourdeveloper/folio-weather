import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling geolocation functionality
 * @param {Object} options - Geolocation options
 * @returns {Object} Geolocation state and functions
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Default options for geolocation
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 10 * 60 * 1000, // 10 minutes
    ...options,
  };

  // Check if geolocation is supported
  useEffect(() => {
    setIsSupported('geolocation' in navigator);
  }, []);

  // Function to get current position
  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          lat: latitude,
          lon: longitude,
          accuracy,
          timestamp: position.timestamp,
        });
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        setIsLoading(false);
        
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        
        setError(new Error(errorMessage));
      },
      defaultOptions
    );
  }, [isSupported, defaultOptions]);

  // Function to watch position changes
  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setError(new Error('Geolocation is not supported by this browser.'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          lat: latitude,
          lon: longitude,
          accuracy,
          timestamp: position.timestamp,
        });
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        setIsLoading(false);
        
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        
        setError(new Error(errorMessage));
      },
      defaultOptions
    );

    return watchId;
  }, [isSupported, defaultOptions]);

  // Function to clear watch
  const clearWatch = useCallback((watchId) => {
    if (watchId && isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  // Function to reset state
  const reset = useCallback(() => {
    setLocation(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    location,
    error,
    isLoading,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    reset,
  };
};

/**
 * Simplified hook that automatically gets current position on mount
 * @param {Object} options - Geolocation options
 * @param {boolean} autoFetch - Whether to automatically fetch location on mount
 * @returns {Object} Geolocation state and refetch function
 */
export const useCurrentLocation = (options = {}, autoFetch = true) => {
  const geolocation = useGeolocation(options);

  useEffect(() => {
    if (autoFetch && geolocation.isSupported) {
      geolocation.getCurrentPosition();
    }
  }, [autoFetch, geolocation.isSupported]);

  return {
    location: geolocation.location,
    error: geolocation.error,
    isLoading: geolocation.isLoading,
    isSupported: geolocation.isSupported,
    refetch: geolocation.getCurrentPosition,
    reset: geolocation.reset,
  };
};

export default useGeolocation;


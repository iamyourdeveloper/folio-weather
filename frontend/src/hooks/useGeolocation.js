import { useState, useEffect, useCallback, useMemo } from 'react';

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

  // Default options for geolocation - memoized to prevent infinite re-renders
  const defaultOptions = useMemo(() => ({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 10 * 60 * 1000, // 10 minutes
    ...options,
  }), [options]);

  // Check if geolocation is supported
  useEffect(() => {
    setIsSupported('geolocation' in navigator);
  }, []);

  // Function to check permission status
  const checkPermissionStatus = useCallback(async () => {
    if (!navigator.permissions) return 'unknown';
    
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', 'prompt'
    } catch (error) {
      console.log('Permission API not available:', error);
      return 'unknown';
    }
  }, []);

  // Function to get current position
  const getCurrentPosition = useCallback(async () => {
    if (!isSupported) {
      setError(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    // Check permission status first
    const permissionStatus = await checkPermissionStatus();
    
    if (permissionStatus === 'denied') {
      setError(new Error('Location access has been blocked. To enable location access:\n\n1. Click the location icon (🔒 or 🌐) in your browser\'s address bar\n2. Select "Allow" for location permissions\n3. Refresh the page\n\nAlternatively, you can search for any city manually.'));
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
            errorMessage = 'Location access has been blocked. To enable location access:\n\n1. Click the location icon (🔒 or 🌐) in your browser\'s address bar\n2. Select "Allow" for location permissions\n3. Refresh the page\n\nAlternatively, you can search for any city manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try searching for your city manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or search for your city manually.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please search for your city manually.';
            break;
        }
        
        setError(new Error(errorMessage));
      },
      defaultOptions
    );
  }, [isSupported, defaultOptions, checkPermissionStatus]);

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
            errorMessage = 'Location access denied. You can enable location access in your browser settings or use the search to find weather for any city.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try searching for your city manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or search for your city manually.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please search for your city manually.';
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
    checkPermissionStatus,
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


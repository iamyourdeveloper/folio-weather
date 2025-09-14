import { useState, useEffect, useCallback, useMemo } from 'react';

// LocalStorage key for last known coordinates so we can hydrate on refresh
const LAST_KNOWN_COORDS_KEY = 'weatherAppLastKnownCoords';

/**
 * Custom hook for handling geolocation functionality
 * @param {Object} options - Geolocation options
 * @returns {Object} Geolocation state and functions
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(() => {
    // Hydrate last known coords to show weather immediately on refresh
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage?.getItem(LAST_KNOWN_COORDS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.lat === 'number' &&
        typeof parsed.lon === 'number'
      ) {
        return parsed;
      }
    } catch (_) {
      // ignore hydration errors
    }
    return null;
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Default options for geolocation - memoized to prevent infinite re-renders
  const defaultOptions = useMemo(() => ({
    enableHighAccuracy: true,
    // Allow more time for GPS (especially on cold start or Safari)
    timeout: 15000,
    maximumAge: 10 * 60 * 1000, // 10 minutes
    ...options,
  }), [options]);

  // Check if geolocation is supported
  useEffect(() => {
    try {
      const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
      setIsSupported(Boolean(supported));
    } catch (_) {
      setIsSupported(false);
    }
  }, []);

  // Proactively react to permission state so we don't surface
  // stale last-known coordinates when access is blocked, and
  // so we clear errors (and optionally refetch) once access
  // is granted without requiring a button click.
  useEffect(() => {
    let permissionRef = null;
    const syncFromPermission = (state) => {
      if (state === 'denied') {
        // Clear any hydrated/stored coordinates if permission is denied
        try {
          window.localStorage?.removeItem(LAST_KNOWN_COORDS_KEY);
        } catch (_) {}
        setLocation(null);
        return;
      }
      if (state === 'granted') {
        // Clear any previous permission error instantly so UI banners hide
        setError(null);
      }
    };

    (async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.permissions) return;
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        permissionRef = perm;
        syncFromPermission(perm.state);
        // Keep in sync if user changes the permission while app is open
        perm.onchange = () => {
          syncFromPermission(perm.state);
          if (perm.state === 'granted') {
            try { getCurrentPosition(); } catch (_) {}
          }
        };
      } catch (_) {
        // Permission API not supported — nothing to proactively clean up
      }
    })();

    return () => {
      if (permissionRef) try { permissionRef.onchange = null; } catch (_) {}
    };
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

    // Geolocation requires a secure context (HTTPS) except on localhost
    try {
      const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|::1)$/i.test(window.location.hostname || '');
      if (typeof window !== 'undefined' && !window.isSecureContext && !isLocalhost) {
        setError(new Error('Location access requires a secure connection (HTTPS). Please use https:// for this site or run locally on http://localhost.'));
        return;
      }
    } catch (_) {
      // ignore environment probing errors
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
        const next = {
          lat: latitude,
          lon: longitude,
          accuracy,
          timestamp: position.timestamp,
        };
        setLocation(next);
        // Persist for next startup
        try {
          window.localStorage?.setItem(
            LAST_KNOWN_COORDS_KEY,
            JSON.stringify(next)
          );
        } catch (_) {
          // non-fatal
        }
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
        const next = {
          lat: latitude,
          lon: longitude,
          accuracy,
          timestamp: position.timestamp,
        };
        setLocation(next);
        // Persist updates to keep last-known fresh
        try {
          window.localStorage?.setItem(
            LAST_KNOWN_COORDS_KEY,
            JSON.stringify(next)
          );
        } catch (_) {
          // non-fatal
        }
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
  // Treat auto-fetch on mount as a loading state until we know
  // whether geolocation is supported and we trigger a request.
  // This prevents other parts of the app from acting as if
  // location loading is finished before we even start.
  const [bootLoading, setBootLoading] = useState(Boolean(autoFetch));

  useEffect(() => {
    // If not auto-fetching, clear bootstrap loading immediately
    if (!autoFetch) {
      setBootLoading(false);
      return;
    }

    // When support status is known, either trigger fetch or clear bootstrap
    if (geolocation.isSupported === true) {
      // Start the real geolocation request; the inner hook will set isLoading=true
      geolocation.getCurrentPosition();
      setBootLoading(false);
    } else if (geolocation.isSupported === false) {
      // No support available; end bootstrap loading so callers can react
      setBootLoading(false);
    }
    // While isSupported is still being determined (initial render), remain in bootLoading
  }, [autoFetch, geolocation.isSupported]);

  return {
    location: geolocation.location,
    error: geolocation.error,
    // Consider bootstrap loading to avoid premature "not loading" state
    isLoading: geolocation.isLoading || bootLoading,
    isSupported: geolocation.isSupported,
    refetch: geolocation.getCurrentPosition,
    reset: geolocation.reset,
  };
};

export default useGeolocation;
  // No extra bootstrap permission probe; initial hydration above is enough

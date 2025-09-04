import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { queryClient } from "@context/QueryProvider";
import { useCurrentLocation } from "@hooks/useGeolocation";
import RANDOM_CITIES from "../data/randomCities.js";
import { resolveFullLocationName } from "../utils/searchUtils.js";

// Function to get a curated set of diverse fallback cities from the full RANDOM_CITIES list
// This creates a smaller, regionally diverse subset as a fallback when the full list isn't available
// The main functionality now uses the complete RANDOM_CITIES array for maximum variety
const getDefaultCities = () => {
  if (!Array.isArray(RANDOM_CITIES) || RANDOM_CITIES.length === 0) {
    // Ultimate fallback if RANDOM_CITIES is unavailable
    return [
      {
        name: "New York, NY",
        city: "New York",
        country: "US",
        coordinates: { lat: 40.7128, lon: -74.006 },
      },
      {
        name: "London, GB",
        city: "London",
        country: "GB",
        coordinates: { lat: 51.5074, lon: -0.1278 },
      },
      {
        name: "Tokyo, JP",
        city: "Tokyo",
        country: "JP",
        coordinates: { lat: 35.6762, lon: 139.6503 },
      },
    ];
  }

  // Create a diverse selection from different regions of the world
  const diverseCities = [];
  const regions = {
    US: [],
    CA: [],
    GB: [],
    FR: [],
    DE: [],
    IT: [],
    ES: [],
    NL: [],
    JP: [],
    CN: [],
    IN: [],
    KR: [],
    AU: [],
    NZ: [],
    BR: [],
    AR: [],
    MX: [],
    EG: [],
    ZA: [],
    NG: [],
    RU: [],
    SE: [],
    NO: [],
    AE: [],
  };

  // Group cities by country
  RANDOM_CITIES.forEach((city) => {
    if (regions[city.country]) {
      regions[city.country].push(city);
    }
  });

  // Select 2-3 cities from major regions to ensure diversity
  Object.entries(regions).forEach(([country, cities]) => {
    if (cities.length > 0) {
      const count = ["US", "CN", "IN", "BR"].includes(country) ? 3 : 2;
      diverseCities.push(...cities.slice(0, count));
    }
  });

  // If we still don't have enough, add more from the full list
  if (diverseCities.length < 20) {
    const remaining = RANDOM_CITIES.filter(
      (city) => !diverseCities.some((dc) => dc.name === city.name)
    );
    diverseCities.push(...remaining.slice(0, 20 - diverseCities.length));
  }

  return diverseCities.length > 0 ? diverseCities : RANDOM_CITIES.slice(0, 50);
};

// Get the dynamic default cities list
const DEFAULT_CITIES = getDefaultCities();

// Random city rotation memory to reduce repeats
const RANDOM_CITY_HISTORY_KEY = "weatherAppRandomCityHistory";
const MAX_RANDOM_HISTORY = 8; // remember a few last picks

const readRandomHistory = () => {
  try {
    const raw = localStorage.getItem(RANDOM_CITY_HISTORY_KEY);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
};

const writeRandomHistory = (history) => {
  try {
    const trimmed = history.slice(-MAX_RANDOM_HISTORY);
    localStorage.setItem(RANDOM_CITY_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (_) {
    // non-fatal
  }
};

// Create Weather Context
const WeatherContext = createContext();

// Custom hook to use Weather Context
export const useWeatherContext = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeatherContext must be used within a WeatherProvider");
  }
  return context;
};

// Default preferences
const DEFAULT_PREFERENCES = {
  units: "imperial", // default to Fahrenheit on reset/first run
  theme: "light", // light, dark, auto
  language: "en",
  autoLocation: true,
  showHourlyForecast: true,
  show5DayForecast: true,
  showWindSpeed: true,
  showHumidity: true,
  showPressure: false,
  showUvIndex: true,
  showSunriseSunset: true,
};

/**
 * WeatherProvider component that manages global weather state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const WeatherProvider = ({ children }) => {
  // User preferences - hydrate from localStorage before first render
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("weatherAppPreferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to load saved preferences, using defaults:", e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Current search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [autoSelectedLocation, setAutoSelectedLocation] = useState(null);

  // Location state
  const {
    location: currentLocation,
    error: locationError,
    isLoading: locationLoading,
  } = useCurrentLocation();

  // Favorite locations: hydrate from localStorage on first render
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("weatherAppFavorites");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Validate minimal shape to avoid corrupt data
          const validFavorites = parsed.filter(
            (fav) => fav && (fav.city || fav.name) && typeof fav.id === "string"
          );
          
          // Migrate existing favorites to use enhanced location resolution
          return validFavorites.map((fav) => {
            // Enhance the favorite's display name using our location resolution
            const enhancedName = resolveFullLocationName({
              city: fav.city,
              name: fav.name,
              country: fav.country
            });
            
            // Update if we got a different name (better resolution, case fixes, etc.)
            if (enhancedName && enhancedName !== fav.name) {
              return {
                ...fav,
                name: enhancedName
              };
            }
            return fav;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load saved favorites, starting empty:", e);
    }
    return [];
  });

  // App state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("weatherAppPreferences", JSON.stringify(preferences));
  }, [preferences]);

  // When temperature units change, refresh any active weather queries
  useEffect(() => {
    // Invalidate all weather-related queries so active views refetch with new units
    queryClient.invalidateQueries({
      queryKey: ["weather"],
      refetchType: "active",
    });
  }, [preferences.units]);

  // Apply theme to document root (prevents flash; matches index.html preloader)
  useEffect(() => {
    const rootEl = document.documentElement;

    // Remove all theme classes
    rootEl.classList.remove("theme-light", "theme-dark");

    if (preferences.theme === "dark") {
      rootEl.classList.add("theme-dark");
    } else if (preferences.theme === "light") {
      rootEl.classList.add("theme-light");
    }
    // 'auto' theme relies on CSS media queries

    // Clear any inline CSS variables set by the preloader so classes can take effect
    const CSS_VARS = [
      "--color-background",
      "--color-background-secondary",
      "--color-background-tertiary",
      "--color-text-primary",
      "--color-text-secondary",
      "--color-text-tertiary",
      "--color-border",
      "--color-border-light",
    ];
    CSS_VARS.forEach((v) => rootEl.style.removeProperty(v));
    rootEl.style.removeProperty("background-color");
    rootEl.style.removeProperty("color");
  }, [preferences.theme]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("weatherAppFavorites", JSON.stringify(favorites));
  }, [favorites]);

  // Auto-select location when app initializes
  useEffect(() => {
    // Wait for location loading to complete and favorites to be loaded
    if (!locationLoading && !hasInitialized) {
      let autoLocation = null;

      // Priority 1: Use geolocation if available and no manual selection exists
      if (currentLocation && preferences.autoLocation && !selectedLocation) {
        autoLocation = {
          type: "coords",
          coordinates: currentLocation,
          name: "Current Location",
        };
      }
      // Priority 2: Rotate through favorites if available and no geolocation
      else if (!currentLocation && favorites.length > 0) {
        const rotationIndexKey = "weatherAppFavoriteRotationIndex";
        const guardProp = "__weatherAppFavoriteRotationConsumed__";

        // Read last stored index (the index used on the previous load)
        let lastIndex = parseInt(
          localStorage.getItem(rotationIndexKey) ?? "-1",
          10
        );
        if (Number.isNaN(lastIndex)) lastIndex = -1;

        // Clamp to range in case the favorites list changed
        lastIndex =
          ((lastIndex % favorites.length) + favorites.length) %
          favorites.length;

        // Advance exactly once per real page load; guard against StrictMode remounts
        let targetIndex = lastIndex;
        if (!window[guardProp]) {
          targetIndex = (lastIndex + 1) % favorites.length;
          localStorage.setItem(rotationIndexKey, String(targetIndex));
          window[guardProp] = true;
        }

        const favorite = favorites[targetIndex] || favorites[0];
        autoLocation = {
          type: "city",
          city: favorite.city || favorite.name,
          name: favorite.name || favorite.city,
          country: favorite.country,
          coordinates: favorite.coordinates,
        };
      }
      // Priority 3: Use random default city if no location and no favorites
      else if (!currentLocation && favorites.length === 0) {
        // Use the full RANDOM_CITIES array for maximum variety
        const citySource =
          Array.isArray(RANDOM_CITIES) && RANDOM_CITIES.length > 0
            ? RANDOM_CITIES
            : DEFAULT_CITIES;
        const randomCity =
          citySource[Math.floor(Math.random() * citySource.length)];
        autoLocation = {
          type: "city",
          city: randomCity.city,
          name: randomCity.name,
          country: randomCity.country,
          coordinates: randomCity.coordinates,
        };
      }

      if (autoLocation) {
        setAutoSelectedLocation(autoLocation);
      }

      setHasInitialized(true);
    }
  }, [
    locationLoading,
    hasInitialized,
    currentLocation,
    preferences.autoLocation,
    selectedLocation,
    favorites,
  ]);

  // Function to update preferences - memoized to prevent unnecessary re-renders
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  }, []);

  // Function to reset preferences to defaults - memoized to prevent unnecessary re-renders
  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES });
  }, []);

  // Function to add favorite location - memoized to prevent unnecessary re-renders
  const addFavorite = useCallback((location) => {
    // Get the city name from either city or name property
    const cityName = location?.city || location?.name;

    // Validate location data
    if (!location || !cityName) {
      console.error(
        "Cannot add favorite: location or city/name is missing",
        location
      );
      return null;
    }

    // Use the enhanced location resolution to get the full display name
    const displayName = resolveFullLocationName(location);

    const newFavorite = {
      id: Date.now().toString(),
      name: displayName,
      city: cityName, // Use cityName for consistency
      country: location.country || "",
      coordinates: location.coordinates || null,
      addedAt: new Date().toISOString(),
    };

    setFavorites((prev) => {
      // Check if location already exists
      const exists = prev.some((fav) => {
        const favCity = fav.city || fav.name;
        return (
          favCity?.toLowerCase() === cityName?.toLowerCase() &&
          fav.country === location.country
        );
      });

      if (exists) {
        console.log("Location already exists in favorites");
        return prev;
      }

      return [...prev, newFavorite];
    });

    return newFavorite;
  }, []);

  // Function to remove favorite location - memoized to prevent unnecessary re-renders
  const removeFavorite = useCallback((favoriteId) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
  }, []);

  // Function to reorder favorites by moving one item before/after another
  // Accepts either indices or ids; supports signature:
  // reorderFavorites({ sourceIndex, destinationIndex }) or reorderFavorites({ sourceId, destinationId })
  const reorderFavorites = ({
    sourceIndex,
    destinationIndex,
    sourceId,
    destinationId,
  }) => {
    setFavorites((prev) => {
      if (!Array.isArray(prev) || prev.length < 2) return prev;

      let from =
        typeof sourceIndex === "number"
          ? sourceIndex
          : prev.findIndex((f) => f.id === sourceId);
      let to =
        typeof destinationIndex === "number"
          ? destinationIndex
          : prev.findIndex((f) => f.id === destinationId);

      if (from === -1 || to === -1 || from === to) return prev;

      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);

      // Optional: adjust rotation index to keep within bounds after reorder
      try {
        const rotationIndexKey = "weatherAppFavoriteRotationIndex";
        let idx = parseInt(localStorage.getItem(rotationIndexKey) ?? "-1", 10);
        if (!Number.isNaN(idx)) {
          const clamped = ((idx % next.length) + next.length) % next.length;
          if (clamped !== idx)
            localStorage.setItem(rotationIndexKey, String(clamped));
        }
      } catch (_) {
        // non-fatal
      }

      return next;
    });
  };

  // Find a favorite entry by a location object
  const findFavorite = (location) => {
    const cityName = location?.city || location?.name;
    if (!location || !cityName) return null;
    return (
      favorites.find((fav) => {
        const favCity = fav.city || fav.name;
        return (
          favCity?.toLowerCase() === cityName?.toLowerCase() &&
          fav.country === (location.country || "")
        );
      }) || null
    );
  };

  // Remove favorite using a location object
  const removeFavoriteByLocation = (location) => {
    const fav = findFavorite(location);
    if (fav) {
      removeFavorite(fav.id);
      return true;
    }
    return false;
  };

  // Function to check if location is favorited
  const isFavorite = (location) => {
    // Get the city name from either city or name property
    const cityName = location?.city || location?.name;

    if (!location || !cityName) {
      return false;
    }

    return favorites.some((fav) => {
      const favCity = fav.city || fav.name;
      return (
        favCity?.toLowerCase() === cityName?.toLowerCase() &&
        fav.country === location.country
      );
    });
  };

  // Function to search for a location - memoized to prevent unnecessary re-renders
  const searchLocation = useCallback((query) => {
    setSearchQuery(query);
    setError(null);
  }, []);

  // Function to select a location - memoized to prevent unnecessary re-renders
  const selectLocation = useCallback((location) => {
    setSelectedLocation(location);
    setError(null);
  }, []);

  // Function to clear selection - memoized to prevent unnecessary re-renders
  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setSearchQuery("");
  }, []);

  // Function to set loading state - memoized to prevent unnecessary re-renders
  const setLoadingState = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  // Function to set error state - memoized to prevent unnecessary re-renders
  const setErrorState = useCallback((error) => {
    setError(error);
  }, []);

  // Function to clear error - memoized to prevent unnecessary re-renders
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Function to get the effective location to use for weather fetching - memoized to prevent unnecessary re-renders
  const getEffectiveLocation = useCallback(() => {
    // Priority: selectedLocation > autoSelectedLocation > null
    return selectedLocation || autoSelectedLocation;
  }, [selectedLocation, autoSelectedLocation]);

  // Pick a random default city (optionally excluding a given city)
  const getRandomDefaultCity = (excludeLocation = null) => {
    try {
      const excludeName = (
        excludeLocation?.city ||
        excludeLocation?.name ||
        ""
      ).toLowerCase();
      const baseList =
        Array.isArray(RANDOM_CITIES) && RANDOM_CITIES.length > 0
          ? RANDOM_CITIES
          : DEFAULT_CITIES;

      const history = readRandomHistory();
      const excludeSet = new Set([excludeName, ...history].filter(Boolean));

      let filtered = baseList.filter(
        (c) => !excludeSet.has((c.city || c.name).toLowerCase())
      );
      if (filtered.length === 0) {
        // If we've excluded everything, reset history and use full list again
        filtered = baseList.slice();
        writeRandomHistory([]);
      }

      const pick = filtered[Math.floor(Math.random() * filtered.length)];

      // Update history to reduce immediate repeats across clicks/sessions
      const pickedName = (pick.city || pick.name || "").toLowerCase();
      writeRandomHistory([...history, pickedName]);

      return {
        type: "city",
        city: pick.city,
        name: pick.name,
        country: pick.country,
        coordinates: pick.coordinates,
      };
    } catch (_) {
      // Fallback to a safe default if something unexpected happens
      const pick = DEFAULT_CITIES[0];
      return {
        type: "city",
        city: pick.city,
        name: pick.name,
        country: pick.country,
        coordinates: pick.coordinates,
      };
    }
  };

  // Select a random default city as the active selection
  const selectRandomDefaultCity = () => {
    const next = getRandomDefaultCity(selectedLocation || autoSelectedLocation);
    setSelectedLocation(next);
    setError(null);
    return next;
  };

  // Memoize utility functions to prevent unnecessary re-renders
  const getTemperatureUnit = useCallback(() => {
    switch (preferences.units) {
      case "imperial":
        return "°F";
      case "kelvin":
        return "K";
      default:
        return "°C";
    }
  }, [preferences.units]);

  const getWindSpeedUnit = useCallback(() => {
    switch (preferences.units) {
      case "imperial":
        return "mph";
      default:
        return "m/s";
    }
  }, [preferences.units]);

  const formatTemperature = useCallback((temp) => {
    const unit = getTemperatureUnit();
    return `${Math.round(temp)}${unit}`;
  }, [getTemperatureUnit]);

  const formatWindSpeed = useCallback((speed) => {
    const unit = getWindSpeedUnit();
    return `${Math.round(speed)} ${unit}`;
  }, [getWindSpeedUnit]);

  // Context value - memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Preferences
    preferences,
    updatePreferences,
    resetPreferences,

    // Location state
    currentLocation,
    locationError,
    locationLoading,

    // Search state
    searchQuery,
    selectedLocation,
    autoSelectedLocation,
    searchLocation,
    selectLocation,
    clearSelection,
    getEffectiveLocation,

    // Favorites
    favorites,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    removeFavoriteByLocation,
    findFavorite,
    isFavorite,

    // App state
    isLoading,
    error,
    setLoadingState,
    setErrorState,
    clearError,
    selectRandomDefaultCity,
    getRandomDefaultCity,

    // Utility functions
    getTemperatureUnit,
    getWindSpeedUnit,
    formatTemperature,
    formatWindSpeed,
  }), [
    preferences,
    updatePreferences,
    resetPreferences,
    currentLocation,
    locationError,
    locationLoading,
    searchQuery,
    selectedLocation,
    autoSelectedLocation,
    searchLocation,
    selectLocation,
    clearSelection,
    getEffectiveLocation,
    favorites,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    removeFavoriteByLocation,
    findFavorite,
    isFavorite,
    isLoading,
    error,
    setLoadingState,
    setErrorState,
    clearError,
    selectRandomDefaultCity,
    getRandomDefaultCity,
    getTemperatureUnit,
    getWindSpeedUnit,
    formatTemperature,
    formatWindSpeed,
  ]);

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
};

export default WeatherProvider;

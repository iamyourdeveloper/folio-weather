import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Search,
  Heart,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from "lucide-react";
import { useWeatherContext } from "@context/WeatherContext";
import {
  useCurrentWeatherByCoords,
  useCurrentWeatherByCity,
  useForecastByCoords,
  useForecastByCity,
} from "@hooks/useWeather";
import WeatherCard from "@components/weather/WeatherCard";
import ForecastCard from "@components/weather/ForecastCard";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import { resolveFullLocationName } from "@utils/searchUtils";

/**
 * HomePage component - Main landing page with current weather and quick actions
 */
const HomePage = () => {
  const location = useLocation();
  const {
    currentLocation,
    locationError,
    locationLoading,
    selectedLocation,
    autoSelectedLocation,
    favorites,
    preferences,
    isLoading,
    error,
    clearError,
    getEffectiveLocation,
    addFavorite,
    removeFavoriteByLocation,
    selectLocation,
    selectRandomDefaultCity,
    setErrorState,
    requestCurrentLocation,
  } = useWeatherContext();

  // Get the effective location to use
  const effectiveLocation = getEffectiveLocation();

  // Determine which weather data to fetch based on effective location
  const hasCoords = !!(
    currentLocation &&
    currentLocation.lat != null &&
    currentLocation.lon != null
  );
  const preferCoords =
    preferences.autoLocation && !locationError && hasCoords;
  
  // When user explicitly selects a location (selectedLocation exists), respect their choice
  // Otherwise, fall back to autoLocation preference
  const userHasExplicitSelection = !!selectedLocation;
  const shouldFetchByCoords = userHasExplicitSelection 
    ? effectiveLocation?.type === "coords"
    : (preferCoords || effectiveLocation?.type === "coords");
  // Only fetch by city when we're not preferring coords and a city is selected
  const shouldFetchByCity = !shouldFetchByCoords && effectiveLocation?.type === "city";

  // Toggle state for revealing the 5-day forecast on Home
  const [showHomeForecast, setShowHomeForecast] = useState(false);
  // Transient highlight when jumping to current weather
  const [highlightWeather, setHighlightWeather] = useState(false);

  // Favorites slider state and helpers
  const sliderRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Weather section ref for scrolling
  const weatherSectionRef = useRef(null);
  // Forecast section ref for scrolling to forecast
  const forecastSectionRef = useRef(null);

  const updateSliderNav = () => {
    const el = sliderRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < maxScroll - 1);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateSliderNav();
    const onScroll = () => updateSliderNav();
    const onResize = () => updateSliderNav();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [favorites.length]);

  // Listen for permission changes so the error banner hides immediately
  // after the user enables location in the browser without needing to click.
  useEffect(() => {
    let permRef = null;
    (async () => {
      try {
        if (typeof navigator === "undefined" || !navigator.permissions) return;
        const perm = await navigator.permissions.query({ name: "geolocation" });
        permRef = perm;
        perm.onchange = () => {
          if (perm.state === "granted") {
            try { requestCurrentLocation?.(); } catch (_) {}
          }
        };
      } catch (_) {
        // Permission API not supported; rely on button flow
      }
    })();
    return () => {
      if (permRef) try { permRef.onchange = null; } catch (_) {}
    };
  }, [requestCurrentLocation]);

  const scrollFavorites = (dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth; // scroll by one viewport width
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // Function to scroll to weather section
  const scrollToWeatherSection = () => {
    const el = weatherSectionRef.current;
    if (el) {
      console.log("✅ Scrolling to weather section");
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } else {
      console.log("❌ Weather section ref not found");
    }
  };

  // When arriving with #current-weather, scroll to the section and highlight
  useEffect(() => {
    if (location.hash === "#current-weather") {
      // slight delay to allow initial layout
      setTimeout(() => scrollToWeatherSection(), 50);
      // trigger subtle highlight for a moment
      setHighlightWeather(true);
      const t = setTimeout(() => setHighlightWeather(false), 1400);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  // Scroll to top when hash is #top
  useEffect(() => {
    if (location.hash === "#top") {
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10);
    }
  }, [location.hash]);

  // Function to scroll to forecast section
  const scrollToForecastSection = () => {
    // Try multiple times in case the element isn't ready immediately
    const attemptScroll = (attempts = 0) => {
      const el = forecastSectionRef.current;
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        console.log("✅ Scrolled to forecast section on HomePage");
      } else if (attempts < 5) {
        console.log(
          `⏳ Forecast section not ready, retrying... (attempt ${attempts + 1})`
        );
        setTimeout(() => attemptScroll(attempts + 1), 100);
      } else {
        console.log(
          "❌ Failed to find forecast section ref on HomePage after 5 attempts"
        );
      }
    };

    // Initial delay to allow React to render the forecast section
    setTimeout(() => attemptScroll(), 50);
  };

  // Fetch weather data based on location
  const coordsWeather = useCurrentWeatherByCoords(
    shouldFetchByCoords
      ? (preferCoords ? currentLocation?.lat : effectiveLocation?.coordinates?.lat)
      : null,
    shouldFetchByCoords
      ? (preferCoords ? currentLocation?.lon : effectiveLocation?.coordinates?.lon)
      : null,
    preferences.units,
    effectiveLocation?.name || selectedLocation?.name // Pass original name when available
  );

  const cityWeather = useCurrentWeatherByCity(
    shouldFetchByCity
      ? effectiveLocation?.city || selectedLocation?.city
      : null,
    preferences.units,
    selectedLocation?.name // Pass original name when available
  );

  // Fetch forecast data (enabled only when toggled open)
  const coordsForecast = useForecastByCoords(
    shouldFetchByCoords
      ? (preferCoords ? currentLocation?.lat : effectiveLocation?.coordinates?.lat)
      : null,
    shouldFetchByCoords
      ? (preferCoords ? currentLocation?.lon : effectiveLocation?.coordinates?.lon)
      : null,
    preferences.units,
    effectiveLocation?.name || selectedLocation?.name, // Pass original name when available
    {
      enabled:
        showHomeForecast &&
        !!(
          shouldFetchByCoords && (
            (preferCoords ? currentLocation?.lat : effectiveLocation?.coordinates?.lat) &&
            (preferCoords ? currentLocation?.lon : effectiveLocation?.coordinates?.lon)
          )
        ),
    }
  );

  const cityForecast = useForecastByCity(
    shouldFetchByCity
      ? effectiveLocation?.city || selectedLocation?.city
      : null,
    preferences.units,
    selectedLocation?.name, // Pass original name when available
    {
      enabled:
        showHomeForecast &&
        !!(
          shouldFetchByCity &&
          (effectiveLocation?.city || selectedLocation?.city)
        ),
    }
  );

  // Determine which weather data to use
  const activeWeather = shouldFetchByCity ? cityWeather : coordsWeather;
  const activeForecast = shouldFetchByCity ? cityForecast : coordsForecast;

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="home-page">
      <div className="home-page__container">
        {/* Anchor for top-of-page jumps */}
        <span id="top" aria-hidden="true" />

        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero__content">
            <h1 className="home-hero__title">
              Welcome to {import.meta.env.VITE_APP_NAME || "Weather App"}
            </h1>
            <p className="home-hero__subtitle">
              Get real-time weather information, forecasts, and manage your
              favorite locations
            </p>

            {/* Quick Action Buttons */}
            <div className="home-hero__actions">
              <Link to="/search" className="btn btn--primary">
                <Search size={20} />
                Search Weather
              </Link>

              <Link to="/favorites" className="btn btn--secondary">
                <Heart size={20} />
                View Favorites
              </Link>
            </div>
          </div>
        </section>

        {/* Current Weather Section */}
        <section
          id="current-weather"
          className="home-weather"
          ref={weatherSectionRef}
        >
          <div className="section__header">
            <h2 className="section__title">Current Weather</h2>
            <div className="section__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  console.log("🎲 Random City button clicked");
                  // Picking a random default city and showing it
                  setShowHomeForecast(false);
                  selectRandomDefaultCity();
                  // Scroll to the weather section after selecting random city
                  setTimeout(() => scrollToWeatherSection(), 50);
                }}
                title="Show a random city's weather"
                aria-label="Show a random city's weather"
              >
                <Shuffle size={18} />
                Random City
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                disabled={locationLoading}
                onClick={() => {
                  console.log("📍 Use My Location button clicked");
                  setShowHomeForecast(false);

                  // Proactively request geolocation again to clear any stale error
                  // and update currentLocation when the user just enabled it.
                  try {
                    requestCurrentLocation?.();
                  } catch (_) {}

                  // If we already have a location from permissions, use it immediately
                  if (currentLocation?.lat && currentLocation?.lon) {
                    selectLocation({
                      type: "coords",
                      coordinates: currentLocation,
                      name: "Current Location",
                    });
                    setTimeout(() => scrollToWeatherSection(), 50);
                    return;
                  }

                  // Otherwise, try to request it directly (fallback)
                  try {
                    if (
                      typeof navigator !== "undefined" &&
                      navigator?.geolocation?.getCurrentPosition
                    ) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const coords = {
                            lat: pos.coords?.latitude,
                            lon: pos.coords?.longitude,
                            accuracy: pos.coords?.accuracy,
                            timestamp: pos.timestamp,
                          };
                          selectLocation({
                            type: "coords",
                            coordinates: coords,
                            name: "Current Location",
                          });
                          setTimeout(() => scrollToWeatherSection(), 50);
                        },
                        () => {
                          setErrorState(
                            new Error(
                              "Unable to retrieve your location. Please allow location access in your browser or use Search."
                            )
                          );
                        },
                        {
                          enableHighAccuracy: true,
                          timeout: 15000,
                          maximumAge: 10 * 60 * 1000,
                        }
                      );
                    } else {
                      setErrorState(
                        new Error(
                          "Geolocation is not supported in this browser. Please search for your city."
                        )
                      );
                    }
                  } catch (_) {
                    setErrorState(
                      new Error(
                        "Failed to access your location. Please try again or search for your city."
                      )
                    );
                  }
                }}
                title={
                  locationLoading
                    ? "Getting your location..."
                    : "Use your current location"
                }
                aria-label="Use your current location"
              >
                <MapPin size={18} />
                Use My Location
              </button>
            </div>
          </div>

          {/* Location Status */}
          <div className="location-status">
            {locationLoading && (
              <div className="location-status__item">
                <LoadingSpinner size="small" />
                <span>Getting your location...</span>
              </div>
            )}

            {locationError && !preferCoords && (
              <div className="location-status__item location-status__item--error">
                <AlertCircle size={16} />
                <span>
                  {locationError?.message ||
                    "Unable to retrieve your location."}{" "}
                  Please search for a city.
                </span>
              </div>
            )}

            {preferCoords && (
              <div className="location-status__item location-status__item--success">
                <MapPin size={16} />
                <span>Using your current location</span>
              </div>
            )}

            {!preferCoords && selectedLocation && (
              <div className="location-status__item location-status__item--info">
                <Search size={16} />
                <span>
                  Showing weather for{" "}
                  {resolveFullLocationName(selectedLocation)}
                </span>
              </div>
            )}

            {!preferCoords && !selectedLocation && autoSelectedLocation && (
              <div className="location-status__item location-status__item--info">
                {autoSelectedLocation.type === "coords" ? (
                  <>
                    <MapPin size={16} />
                    <span>
                      {(() => {
                        // Prefer the resolved name from the latest weather payload if available
                        const payloadLoc = (shouldFetchByCity ? cityWeather : coordsWeather)?.data?.data?.location;
                        const name = payloadLoc?.name || (payloadLoc ? resolveFullLocationName(payloadLoc) : null);
                        const fallback = resolveFullLocationName(autoSelectedLocation);
                        return `Showing weather for ${name || fallback}`;
                      })()}
                    </span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>
                      Showing weather for{" "}
                      {resolveFullLocationName(autoSelectedLocation)}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Weather Content */}
          <div className="home-weather__content">
            {(isLoading || activeWeather.isLoading) && (
              <div className="weather-loading">
                <LoadingSpinner />
                <p>Loading weather data...</p>
              </div>
            )}

            {(error || activeWeather.isError) && (
              <ErrorMessage
                error={error || activeWeather.error}
                onRetry={activeWeather.refetch}
              />
            )}

            {activeWeather.isSuccess && activeWeather.data && (
              <div className="weather-display">
                <div className={`focus-highlight ${highlightWeather ? "is-active" : ""}`}>
                  <WeatherCard
                  weather={activeWeather.data.data}
                  showForecastLink={true}
                  onAddToFavorites={(loc) => addFavorite(loc)}
                  onRemoveFromFavorites={(loc) => removeFavoriteByLocation(loc)}
                  onToggleForecast={() => {
                    const newValue = !showHomeForecast;
                    setShowHomeForecast(newValue);
                    // Scroll to forecast section when showing forecast
                    if (newValue) {
                      scrollToForecastSection();
                    }
                  }}
                  isForecastVisible={showHomeForecast}
                  />
                </div>

                {/* Show 5-day forecast if available */}
                {showHomeForecast &&
                  activeForecast.isSuccess &&
                  activeForecast.data &&
                  activeForecast.data.data &&
                  activeForecast.data.data.forecast && (
                    <div className="forecast-section" ref={forecastSectionRef}>
                      <h3 className="forecast-section__title">
                        5-Day Forecast
                      </h3>
                      <div className="forecast-grid">
                        {activeForecast.data.data.forecast
                          .slice(0, 5)
                          .map((day, index) => (
                            <div key={day.date} className="forecast-item">
                              <div className="forecast-item__date">
                                {index === 0
                                  ? "Today"
                                  : index === 1
                                  ? "Tomorrow"
                                  : new Date(day.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                      }
                                    )}{" "}
                                <span
                                  style={{
                                    color: "var(--color-text-secondary)",
                                  }}
                                >
                                  {new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <img
                                src={`https://openweathermap.org/img/wn/${
                                  day.icon || "01d"
                                }@2x.png`}
                                alt={day.description || "Weather"}
                                className="forecast-item__icon"
                              />
                              <div className="forecast-item__temps">
                                <span className="forecast-item__temp-high">
                                  {Math.round(day.maxTemp)}°
                                </span>
                                <span className="forecast-item__temp-low">
                                  {Math.round(day.minTemp)}°
                                </span>
                              </div>
                              <div className="forecast-item__description">
                                {day.description || day.mainWeather || "N/A"}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {!isLoading &&
              !activeWeather.isLoading &&
              !activeWeather.data &&
              !error &&
              !activeWeather.isError &&
              !effectiveLocation && (
                <div className="weather-empty">
                  <Search size={48} />
                  <h3>No weather data available</h3>
                  <p>
                    {locationError
                      ? "Please search for a city to get weather information."
                      : "Allow location access or search for a city to get started."}
                  </p>
                  <Link to="/search" className="btn btn--primary">
                    Search for Weather
                  </Link>
                </div>
              )}
          </div>
        </section>

        {/* Favorite Locations Section */}
        {favorites.length > 0 && (
          <section className="home-favorites">
            <div className="section__header">
              <h2 className="section__title">Favorite Locations</h2>
              <Link to="/favorites" className="section__link">
                View All
                <TrendingUp size={16} />
              </Link>
            </div>

            <div className="favorites-slider">
              <div
                className="favorites-slider__viewport"
                ref={sliderRef}
                aria-label="Favorite locations slider"
              >
                <div className="favorites-slider__track">
                  {favorites.map((favorite) => {
                    // Resolve the location name for consistent display using all available data
                    const locationForResolution = {
                      ...favorite,
                      city: favorite.city,
                      name: favorite.name,
                      country: favorite.country,
                      state: favorite.state,
                      countryCode: favorite.countryCode,
                    };

                    const resolvedName = resolveFullLocationName(
                      locationForResolution
                    );
                    const enhancedFavorite = {
                      ...favorite,
                      name: resolvedName,
                    };

                    return (
                      <div
                        key={favorite.id}
                        className="favorite-item"
                        role="button"
                        tabIndex={0}
                        title={`Show ${resolvedName} on Home`}
                        onClick={() => {
                          // Reset forecast toggle when selecting a new location
                          setShowHomeForecast(false);
                          selectLocation({
                            type: "city",
                            city: favorite.city || favorite.name,
                            name: resolvedName,
                            country: favorite.country,
                            state: favorite.state,
                            countryCode: favorite.countryCode,
                            coordinates: favorite.coordinates,
                          });
                          scrollToWeatherSection();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            // Reset forecast toggle when selecting a new location
                            setShowHomeForecast(false);
                            selectLocation({
                              type: "city",
                              city: favorite.city || favorite.name,
                              name: resolvedName,
                              country: favorite.country,
                              state: favorite.state,
                              countryCode: favorite.countryCode,
                              coordinates: favorite.coordinates,
                            });
                            scrollToWeatherSection();
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <ForecastCard
                          location={enhancedFavorite}
                          compact={true}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {favorites.length > 3 && (
                <div className="favorites-slider__controls">
                  <button
                    className="favorites-slider__nav favorites-slider__nav--prev"
                    onClick={() => scrollFavorites(-1)}
                    disabled={!canPrev}
                    aria-label="Previous favorites"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="favorites-slider__nav favorites-slider__nav--next"
                    onClick={() => scrollFavorites(1)}
                    disabled={!canNext}
                    aria-label="Next favorites"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="home-features">
          <h2 className="section__title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <MapPin size={24} />
              </div>
              <h3 className="feature-card__title">Current Location</h3>
              <p className="feature-card__description">
                Automatically get weather for your current location with GPS.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <Search size={24} />
              </div>
              <h3 className="feature-card__title">City Search</h3>
              <p className="feature-card__description">
                Search for weather in any city worldwide with detailed
                forecasts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <Heart size={24} />
              </div>
              <h3 className="feature-card__title">Favorites</h3>
              <p className="feature-card__description">
                Save your favorite locations for quick access to their weather.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-card__title">5-Day Forecast</h3>
              <p className="feature-card__description">
                Get detailed weather forecasts up to 5 days in advance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

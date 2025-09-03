import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Plus, X } from "lucide-react";
import "@/styles/search.css";
import { useWeatherContext } from "@context/WeatherContext";
import { useCurrentWeatherByCity, useForecastByCity } from "@hooks/useWeather";
import WeatherCard from "@components/weather/WeatherCard";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import RANDOM_CITIES from "@/data/randomCities.js";
import {
  parseLocationQuery,
  isValidLocationQuery,
} from "@/utils/searchUtils.js";

/**
 * SearchPage component for searching weather by city
 */
const SearchPage = () => {
  const {
    searchQuery,
    selectedLocation,
    preferences,
    addFavorite,
    removeFavoriteByLocation,
    isFavorite,
    searchLocation,
    selectLocation,
  } = useWeatherContext();

  // Keep the Search page input empty by default.
  // Do not hydrate from global search state to avoid lingering text
  // like a previous header search (e.g., "Mumbai").
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [searchedCity, setSearchedCity] = useState(
    selectedLocation?.city || ""
  );

  // Ref for scrolling to current weather section
  const currentWeatherRef = useRef(null);

  // Debounce search to prevent excessive API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // Fetch weather data for searched city
  const currentWeather = useCurrentWeatherByCity(
    searchedCity,
    preferences.units,
    selectedLocation?.name || null, // Pass originalName properly
    { enabled: !!searchedCity }
  );

  const forecast = useForecastByCity(searchedCity, preferences.units, {
    enabled: !!searchedCity,
  });

  // Memoize the navigation handler to prevent infinite re-renders
  const handleCityParamNavigation = useCallback((cityParam) => {
    if (cityParam && cityParam.trim() && cityParam !== searchedCity) {
      const rawQuery = cityParam.trim();

      // Parse the location query to extract city and full name
      const { city, fullName } = parseLocationQuery(rawQuery);

      // Do not keep the typed query in the input; show placeholder instead
      setLocalSearchQuery("");
      setSearchedCity(city);
      searchLocation(fullName); // Use full name for context
      selectLocation({ city, name: fullName }); // city for API, name for display

      // Clear the query string so a browser refresh on the Search page
      // doesn't re-hydrate results. This preserves the immediate view
      // when navigating from Favorites but resets on reload.
      navigate("/search", { replace: true });
    }
  }, [searchedCity, searchLocation, selectLocation, navigate]);

  // If a ?city= parameter is present, hydrate the page and fetch immediately
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const cityParam = params.get("city");
    handleCityParamNavigation(cityParam);
  }, [routerLocation.search, handleCityParamNavigation]);

  // Debounced search handler for input changes
  const debouncedSearch = debounce((query) => {
    if (query && isValidLocationQuery(query)) {
      const { city, fullName } = parseLocationQuery(query);
      setSearchedCity(city);
      searchLocation(fullName);
      selectLocation({ city, name: fullName });

      // Focus on current weather card with highlight effect
      focusOnWeatherCard();
    }
  }, 500); // 500ms delay

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (value.trim()) {
      debouncedSearch(value);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      const rawQuery = localSearchQuery.trim();

      // Validate the query before processing
      if (!isValidLocationQuery(rawQuery)) {
        // Could add user feedback here for invalid queries
        return;
      }

      // Parse the location query to extract city and full name
      const { city, fullName } = parseLocationQuery(rawQuery);

      setSearchedCity(city);
      searchLocation(fullName); // Use full name for context
      selectLocation({ city, name: fullName }); // city for API, name for display
      // Clear input so placeholder returns after submit
      setLocalSearchQuery("");

      // Focus on current weather card with highlight effect
      focusOnWeatherCard();
    }
  };

  // Favorite actions
  const handleAddToFavorites = (location) => addFavorite(location);
  const handleRemoveFromFavorites = (location) =>
    removeFavoriteByLocation(location);

  // Function to focus on current weather card
  const focusOnWeatherCard = () => {
    const timeoutId = setTimeout(() => {
      if (currentWeatherRef.current) {
        // Scroll to the element with instant behavior
        currentWeatherRef.current.scrollIntoView({
          behavior: "instant",
          block: "center",
          inline: "nearest",
        });
      }
    }, 300); // Wait for data to start loading
    
    // Return timeout ID for potential cleanup
    return timeoutId;
  };

  // Expanded popular cities list (curated subset from RANDOM_CITIES)
  // Do not slice here so regional tabs can access the full set.
  const ALL_POPULAR_CITIES = (RANDOM_CITIES || []).map((c) => ({
    label: c.name || c.city,
    query: c.city || c.name,
    country: c.country,
  }));

  // Region -> country mapping for quick filtering
  const REGION_COUNTRIES = {
    "North America": new Set(["US", "CA", "MX"]),
    "South America": new Set(["BR", "AR", "CL", "UY", "CO", "PE"]),
    Europe: new Set([
      "GB",
      "FR",
      "DE",
      "ES",
      "IT",
      "PT",
      "NL",
      "BE",
      "AT",
      "CH",
      "CZ",
      "PL",
      "HU",
      "RO",
      "GR",
      "BG",
      "RS",
      "DK",
      "NO",
      "SE",
      "FI",
      "IE",
    ]),
    Asia: new Set([
      "JP",
      "KR",
      "CN",
      "HK",
      "TW",
      "SG",
      "MY",
      "TH",
      "VN",
      "ID",
      "PH",
      "BD",
      "IN",
      "PK",
      "NP",
    ]),
    "Middle East": new Set(["AE", "SA", "QA", "OM", "IR", "IQ", "IL", "JO"]),
    Africa: new Set(["EG", "NG", "GH", "KE", "ET", "ZA", "MA", "TN", "DZ"]),
    Oceania: new Set(["AU", "NZ"]),
  };

  const REGIONS = ["All", ...Object.keys(REGION_COUNTRIES)];
  const [activeRegion, setActiveRegion] = useState("All");
  const [sortMode, setSortMode] = useState("curated"); // 'curated' | 'az'
  const [visibleCount, setVisibleCount] = useState(20); // Track number of visible cities per region

  const filteredPopularCities =
    activeRegion === "All"
      ? ALL_POPULAR_CITIES
      : ALL_POPULAR_CITIES.filter((c) =>
          REGION_COUNTRIES[activeRegion]?.has(c.country)
        );

  const sortedPopularCities =
    sortMode === "az"
      ? [...filteredPopularCities].sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
        )
      : filteredPopularCities;

  // Pagination logic: Show 20 cities initially, then 20 more with each "Show More" click
  const CITIES_PER_PAGE = 20;
  const hasMoreCities = sortedPopularCities.length > visibleCount;
  const visiblePopularCities = sortedPopularCities.slice(0, visibleCount);
  const remainingCitiesCount = sortedPopularCities.length - visibleCount;

  // Reset visible count when changing region or sort
  useEffect(() => {
    setVisibleCount(CITIES_PER_PAGE);
  }, [activeRegion, sortMode]);

  // Handle "Show More" button click
  const handleShowMore = () => {
    setVisibleCount((prevCount) =>
      Math.min(prevCount + CITIES_PER_PAGE, sortedPopularCities.length)
    );
  };

  return (
    <div className="search-page">
      <div className="search-page__container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="search-header__title">Search Weather</h1>
          <p className="search-header__subtitle">
            Get current weather and forecast for any city worldwide
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form search-form--page">
          <div className="search-form__input-group">
            <Search size={20} className="search-form__icon" />
            <input
              type="text"
              placeholder="Enter city name (e.g., London, New York, NY, Tokyo)"
              value={localSearchQuery}
              onChange={(e) => {
                const value = e.target.value;
                // Prevent XSS and invalid characters
                const sanitizedValue = value.replace(/[<>]/g, '');
                setLocalSearchQuery(sanitizedValue);
              }}
              className="search-form__input search-form__input--large"
              autoFocus
            />
            {localSearchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                className="search-form__clear"
                onClick={() => {
                  setLocalSearchQuery("");
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="search-form__submit search-form__submit--large"
            disabled={!localSearchQuery.trim()}
          >
            <Search size={20} />
            Search Weather
          </button>
        </form>

        {/* Search Results */}
        <div className="search-results">
          {/* Loading State */}
          {(currentWeather.isLoading || forecast.isLoading) && (
            <div className="search-results__loading">
              <LoadingSpinner />
              <p>Searching for weather in {searchedCity}...</p>
            </div>
          )}

          {/* Error State */}
          {(currentWeather.isError || forecast.isError) && (
            <div className="search-results__error">
              <ErrorMessage
                error={currentWeather.error || forecast.error}
                onRetry={() => {
                  currentWeather.refetch();
                  forecast.refetch();
                }}
              />
            </div>
          )}

          {/* Success State */}
          {currentWeather.isSuccess && currentWeather.data && (
            <div className="search-results__content">
              {/* Current Weather */}
              <section
                className="search-results__current"
                ref={currentWeatherRef}
              >
                <div className="section__header">
                  <h2 className="section__title">Current Weather</h2>
                  <div className="section__actions">
                    {(() => {
                      const loc = currentWeather.data.data.location;
                      const fav = isFavorite(loc);
                      return (
                        <button
                          onClick={() =>
                            fav
                              ? handleRemoveFromFavorites(loc)
                              : handleAddToFavorites(loc)
                          }
                          className="btn btn--secondary btn--small"
                        >
                          <Star size={16} />
                          {fav ? "Remove from Favorites" : "Add to Favorites"}
                        </button>
                      );
                    })()}
                  </div>
                </div>

                <WeatherCard
                  weather={currentWeather.data.data}
                  onAddToFavorites={handleAddToFavorites}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                />
              </section>

              {/* Forecast */}
              {forecast.isSuccess && forecast.data && (
                <section className="search-results__forecast">
                  <h2 className="section__title">5-Day Forecast</h2>

                  <div className="forecast-grid">
                    {forecast.data.data.forecast
                      .slice(0, 5)
                      .map((day, index) => (
                        <div key={day.date} className="forecast-day">
                          <div className="forecast-day__header">
                            <h4 className="forecast-day__date">
                              {index === 0
                                ? "Today"
                                : index === 1
                                ? "Tomorrow"
                                : new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    { weekday: "short" }
                                  )}
                            </h4>
                            <span className="forecast-day__date-full">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="forecast-day__weather">
                            <img
                              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                              alt={day.description}
                              className="forecast-day__icon"
                            />
                            <div className="forecast-day__temps">
                              <span className="forecast-day__temp-max">
                                {Math.round(day.maxTemp)}°
                              </span>
                              <span className="forecast-day__temp-min">
                                {Math.round(day.minTemp)}°
                              </span>
                            </div>
                          </div>

                          <div className="forecast-day__description">
                            {day.description}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* Explore More Locations Button */}
              <button
                className="btn btn--primary explore-more-btn"
                style={{
                  background: "#adc6fa",
                  color: "#fff",
                  border: "none",
                  borderRadius: "18px",
                  padding: "16px 48px",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "32px auto 0",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                onClick={() => {
                  window.location.reload();
                }}
              >
                <Search size={24} />
                Explore More Locations
              </button>
            </div>
          )}

          {/* Empty State */}
          {!searchedCity && !currentWeather.isLoading && (
            <div className="search-results__empty">
              <Search size={48} />
              <h3>Search for a city</h3>
              <p>
                Enter a city name above to get current weather and forecast
                information.
              </p>

              <div className="search-suggestions">
                <h4>Popular cities:</h4>
                <div
                  className="search-suggestions__tabs"
                  role="tablist"
                  aria-label="Popular city regions"
                >
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      role="tab"
                      aria-selected={activeRegion === region}
                      className={`btn btn--small ${
                        activeRegion === region
                          ? "btn--primary"
                          : "btn--secondary"
                      }`}
                      onClick={() => setActiveRegion(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                <div
                  className="search-suggestions__controls"
                  role="group"
                  aria-label="Sort popular cities"
                >
                  <button
                    type="button"
                    className={`btn btn--small ${
                      sortMode === "curated" ? "btn--primary" : "btn--secondary"
                    }`}
                    aria-pressed={sortMode === "curated"}
                    onClick={() => setSortMode("curated")}
                  >
                    Curated
                  </button>
                  <button
                    type="button"
                    className={`btn btn--small ${
                      sortMode === "az" ? "btn--primary" : "btn--secondary"
                    }`}
                    aria-pressed={sortMode === "az"}
                    onClick={() => setSortMode("az")}
                  >
                    A–Z
                  </button>
                </div>
                <div className="search-suggestions__list" role="list">
                  {visiblePopularCities.map(({ label, query }) => (
                    <button
                      key={label}
                      onClick={() => {
                        // Parse the location query to extract city and full name
                        const { city, fullName } = parseLocationQuery(query);

                        // Trigger search immediately but keep the input clear
                        setSearchedCity(city);
                        searchLocation(fullName); // Use full name for context
                        selectLocation({ city, name: label }); // city for API, name for display (prefer label over fullName)
                        setLocalSearchQuery("");

                        // Focus on current weather card with highlight effect
                        focusOnWeatherCard();
                      }}
                      className="search-suggestion"
                      role="listitem"
                    >
                      <MapPin size={14} />
                      {label}
                    </button>
                  ))}
                </div>
                {hasMoreCities && (
                  <div className="search-suggestions__more">
                    <button
                      type="button"
                      className="btn btn--secondary btn--small search-suggestions__more-btn"
                      onClick={handleShowMore}
                      aria-label={`Show ${Math.min(
                        CITIES_PER_PAGE,
                        remainingCitiesCount
                      )} more cities`}
                    >
                      Show More ({remainingCitiesCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

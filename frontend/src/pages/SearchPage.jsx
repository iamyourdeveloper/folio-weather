import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import "@/styles/search.css";
import { useWeatherContext } from "@context/WeatherContext";
import { queryClient } from "@context/QueryProvider";
import { useCurrentWeatherByCity, useForecastByCity } from "@hooks/useWeather";
import WeatherCard from "@components/weather/WeatherCard";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import SearchDropdown from "@components/ui/SearchDropdown";
import RANDOM_CITIES from "@/data/randomCities.js";
import {
  parseLocationQuery,
  isValidLocationQuery,
  searchAllCities,
} from "@/utils/searchUtils.js";
import { getRandomRegionCapital } from "@/utils/regionCapitalUtils.js";
import { getForecastDateLabel, formatDateDisplay } from "@utils/dateUtils";

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

  // Router helpers (place before state so we can read query params for initial state)
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // Keep the Search page input empty by default.
  // Do not hydrate from global search state to avoid lingering text
  // like a previous header search (e.g., "Mumbai").
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [searchedCity, setSearchedCity] = useState(() => {
    // Open Search fresh by default. Do not hydrate from global selection
    // so actions like Home's "Random City" don't auto-populate Search.
    // If a specific city is intended, it will be provided via ?city=
    // and handled by the effect below.
    return "";
  });

  // Toggle state for revealing the 5-day forecast on Search
  const [showSearchForecast, setShowSearchForecast] = useState(false);
  // Remember the last attempted query that produced no results or was invalid
  const [noMatchQuery, setNoMatchQuery] = useState("");
  const [showNoMatch, setShowNoMatch] = useState(false);

  // Ref for scrolling to current weather section
  const currentWeatherRef = useRef(null);
  // Ref for scrolling to forecast section
  const forecastSectionRef = useRef(null);
  // Transient highlight for current weather card
  const [highlightCurrent, setHighlightCurrent] = useState(false);
  // Force-remount key for SearchDropdown to reset its internal input value on demand
  const [searchInputKey, setSearchInputKey] = useState(0);

  // Debounce search to prevent excessive API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
  // routerLocation and navigate are declared above

  // Fetch weather data for searched city
  // Prefer the current attempted full name for backend disambiguation
  const originalAttemptName = searchQuery || selectedLocation?.name || null;

  const currentWeather = useCurrentWeatherByCity(
    searchedCity,
    preferences.units,
    originalAttemptName,
    {
      enabled: !!searchedCity,
      onError: (err) => {
        const isNotFound =
          err?.type === "NOT_FOUND" ||
          err?.status === 404 ||
          (typeof err?.message === "string" &&
            /not available|not found/i.test(err.message));
        if (isNotFound) {
          const attemptedLabel =
            selectedLocation?.name || searchQuery || searchedCity || "";
          setNoMatchQuery(attemptedLabel);
          setShowNoMatch(true);
        }
      },
      onSuccess: (data) => {
        // Clear any previous no-match message when data loads
        setNoMatchQuery("");
        setShowNoMatch(false);
        try {
          const loc = data?.data?.location;
          if (loc && loc.city && loc.name) {
            selectLocation({
              type: "city",
              city: loc.city,
              name: loc.name,
              state: loc.state,
              country: loc.country,
              coordinates: loc.coordinates,
            });
          }
        } catch (_) {}
      },
    }
  );

  const forecast = useForecastByCity(
    searchedCity,
    preferences.units,
    originalAttemptName,
    {
      enabled: !!searchedCity && showSearchForecast,
    }
  );

  // Helper: scroll to top safely
  const scrollToTop = useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Function to focus on current weather card
  const focusOnWeatherCard = useCallback(() => {
    const attemptScroll = (attempts = 0) => {
      const el = currentWeatherRef.current;
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        // Trigger a brief highlight once
        setHighlightCurrent(true);
        setTimeout(() => setHighlightCurrent(false), 1100);
      } else if (attempts < 5) {
        setTimeout(() => attemptScroll(attempts + 1), 150);
      }
    };
    // Initial delay to allow render/data to begin
    setTimeout(() => attemptScroll(), 300);
  }, []);

  const applyOptimisticSelection = useCallback(
    (cityName, fullName, fallback = {}) => {
      if (!cityName || !fullName) {
        return;
      }

      try {
        const [first] = searchAllCities(fullName, 1);
        if (first) {
          const optimisticName = first.name || first.displayName || fullName;
          const optimisticSelection = {
            type: "city",
            city: first.city || cityName,
            name: optimisticName,
          };

          if (first.state) optimisticSelection.state = first.state;
          if (first.country) optimisticSelection.country = first.country;
          if (first.coordinates) optimisticSelection.coordinates = first.coordinates;

          selectLocation(optimisticSelection);
          return;
        }
      } catch (_) {
        // Ignore lookup failures and fall back to provided metadata
      }

      const fallbackSelection = {
        type: "city",
        city: cityName,
        name: fallback.name || fullName,
      };

      if (fallback.state) fallbackSelection.state = fallback.state;
      if (fallback.country) fallbackSelection.country = fallback.country;
      if (fallback.coordinates) {
        fallbackSelection.coordinates = fallback.coordinates;
      }

      selectLocation(fallbackSelection);
    },
    [selectLocation]
  );

  // Memoize the navigation handler to prevent infinite re-renders
  const handleCityParamNavigation = useCallback(
    (cityParam) => {
      if (!cityParam || !cityParam.trim()) {
        return;
      }

      const rawQuery = cityParam.trim();
      const regionResult = getRandomRegionCapital(rawQuery);

      const runNavigationSearch = ({
        city,
        fullName,
        noMatchLabel,
        showNoMatch = true,
        countryCode,
        scrollToTopFirst = false,
      }) => {
        if (!city || !fullName) {
          return;
        }

        setLocalSearchQuery("");
        setSearchedCity(city);
        searchLocation(fullName);

        applyOptimisticSelection(city, fullName, {
          name: fullName,
          country: countryCode,
        });

        setNoMatchQuery(noMatchLabel ?? fullName);
        setShowNoMatch(showNoMatch);

        try {
          queryClient.invalidateQueries({
            queryKey: ["weather", "current", "city"],
          });
          queryClient.refetchQueries({
            queryKey: ["weather", "current", "city"],
            type: "active",
          });
        } catch (_) {
          // Non-fatal in environments without a provider
        }

        setShowSearchForecast(false);
        setSearchInputKey((k) => k + 1);

        navigate("/search", { replace: true });

        if (scrollToTopFirst) {
          scrollToTop();
        } else {
          focusOnWeatherCard();
        }
      };

      if (regionResult) {
        runNavigationSearch({
          city: regionResult.city,
          fullName: regionResult.fullName,
          countryCode: regionResult.countryCode,
          noMatchLabel: regionResult.fullName,
          showNoMatch: false,
        });
        return;
      }

      const invalidArrival = !isValidLocationQuery(rawQuery);
      const { city, fullName } = parseLocationQuery(rawQuery);

      runNavigationSearch({
        city,
        fullName,
        noMatchLabel: rawQuery,
        scrollToTopFirst: invalidArrival,
      });
    },
    [
      applyOptimisticSelection,
      focusOnWeatherCard,
      navigate,
      scrollToTop,
      searchLocation,
    ]
  );

  // If a ?city= parameter is present, hydrate the page and fetch immediately
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const cityParam = params.get("city");
    const isFresh = params.get("new") === "1";

    if (isFresh) {
      // Open Search fresh: clear local query and prevent initial fetch.
      setLocalSearchQuery("");
      setSearchedCity("");
      setShowSearchForecast(false);
      // Clear any previous error/placeholder state
      setShowNoMatch(false);
      setNoMatchQuery("");
      // Reset the dropdown's internal input by remounting it
      setSearchInputKey((k) => k + 1);
      // Do not modify selectedLocation here; header badge remains on current selection.
      // Remove the flag from the URL for a clean state if the user refreshes.
      navigate("/search", { replace: true });
      // Ensure user is at the top of the Search page
      scrollToTop();
      return;
    }

    handleCityParamNavigation(cityParam);
  }, [routerLocation.search, handleCityParamNavigation]);

  // Debounced search handler for input changes
  const debouncedSearch = debounce((query) => {
    if (!query) {
      return;
    }

    const regionResult = getRandomRegionCapital(query);
    if (regionResult) {
      const { city, fullName, countryCode } = regionResult;

      setSearchedCity(city);
      searchLocation(fullName);

      applyOptimisticSelection(city, fullName, {
        name: fullName,
        country: countryCode,
      });

      setShowSearchForecast(false);
      setNoMatchQuery(fullName);
      setShowNoMatch(false);

      try {
        queryClient.invalidateQueries({
          queryKey: ["weather", "current", "city"],
        });
        queryClient.refetchQueries({
          queryKey: ["weather", "current", "city"],
          type: "active",
        });
      } catch (_) {}

      focusOnWeatherCard();
      return;
    }

    if (!isValidLocationQuery(query)) {
      return;
    }

    const { city, fullName } = parseLocationQuery(query);
    setSearchedCity(city);
    searchLocation(fullName);

    applyOptimisticSelection(city, fullName);

    setShowSearchForecast(false);
    setNoMatchQuery(fullName);

    try {
      queryClient.invalidateQueries({
        queryKey: ["weather", "current", "city"],
      });
      queryClient.refetchQueries({
        queryKey: ["weather", "current", "city"],
        type: "active",
      });
    } catch (_) {}

    focusOnWeatherCard();
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
    if (!localSearchQuery.trim()) {
      // Do nothing on empty submit; keep current placeholder visibility/state
      return;
    }

    if (localSearchQuery.trim()) {
      const rawQuery = localSearchQuery.trim();

      // Validate the query before processing
      if (!isValidLocationQuery(rawQuery)) {
        // Show friendly placeholder for invalid input
        setNoMatchQuery(rawQuery);
        // Clear any existing results
        setSearchedCity("");
        setShowSearchForecast(false);
        setShowNoMatch(true);
        // Bring the error into view at the top
        scrollToTop();
        return;
      }

      const regionResult = getRandomRegionCapital(rawQuery);
      const locationInfo = regionResult
        ? { city: regionResult.city, fullName: regionResult.fullName }
        : parseLocationQuery(rawQuery);

      const resolvedCity = locationInfo.city;
      const resolvedFullName = locationInfo.fullName;

      setSearchedCity(resolvedCity);
      searchLocation(resolvedFullName); // Use full name for context

      applyOptimisticSelection(resolvedCity, resolvedFullName, {
        name: resolvedFullName,
        country: regionResult?.countryCode,
      });

      // Ensure the no-match placeholder is primed immediately so there is no blank state
      setNoMatchQuery(resolvedFullName);
      setShowNoMatch(true);

      // Force re-fetch in case the same query is submitted again
      try {
        queryClient.invalidateQueries({
          queryKey: ["weather", "current", "city"],
        });
        queryClient.refetchQueries({
          queryKey: ["weather", "current", "city"],
          type: "active",
        });
      } catch (_) {}

      // Reset forecast toggle when searching for a new city
      setShowSearchForecast(false);

      // Clear input so placeholder returns after submit
      setLocalSearchQuery("");

      // Don't clear placeholder yet; clear only after a successful result

      // Focus on current weather card with highlight effect
      focusOnWeatherCard();
    }
  };

  // Favorite actions
  const handleAddToFavorites = (location) => addFavorite(location);
  const handleRemoveFromFavorites = (location) =>
    removeFavoriteByLocation(location);

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
        console.log("✅ Scrolled to forecast section on SearchPage");
      } else if (attempts < 5) {
        console.log(
          `⏳ Forecast section not ready, retrying... (attempt ${attempts + 1})`
        );
        setTimeout(() => attemptScroll(attempts + 1), 100);
      } else {
        console.log(
          "❌ Failed to find forecast section ref on SearchPage after 5 attempts"
        );
      }
    };

    // Initial delay to allow React to render the forecast section
    setTimeout(() => attemptScroll(), 200);
  };

  // Expanded popular cities list (curated subset from RANDOM_CITIES)
  // Do not slice here so regional tabs can access the full set.
  const ALL_POPULAR_CITIES = (RANDOM_CITIES || []).map((c) => ({
    label: c.name || c.city,
    query: c.name || c.city, // Use full name (e.g., "Norfolk, VA") instead of just city name
    country: c.country,
  }));

  // Fisher-Yates shuffle algorithm for random sorting
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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
  const [sortMode, setSortMode] = useState("random"); // 'curated' | 'az' | 'random'
  const [visibleCount, setVisibleCount] = useState(20); // Track number of visible cities per region
  const [randomizedCities, setRandomizedCities] = useState({}); // Cache randomized cities per region

  // Region slider state for mobile navigation
  const regionSliderRef = useRef(null);
  const [canPrevRegion, setCanPrevRegion] = useState(false);
  const [canNextRegion, setCanNextRegion] = useState(false);

  const filteredPopularCities =
    activeRegion === "All"
      ? ALL_POPULAR_CITIES
      : ALL_POPULAR_CITIES.filter((c) =>
          REGION_COUNTRIES[activeRegion]?.has(c.country)
        );

  // Initialize randomized cities for the current region if not already cached
  useEffect(() => {
    if (sortMode === "random" && !randomizedCities[activeRegion]) {
      setRandomizedCities((prev) => ({
        ...prev,
        [activeRegion]: shuffleArray(filteredPopularCities),
      }));
    }
  }, [activeRegion, sortMode, filteredPopularCities, randomizedCities]);

  // Initialize random sorting on component mount (app refresh)
  useEffect(() => {
    // Set initial random order for "All" region on app load
    if (sortMode === "random" && Object.keys(randomizedCities).length === 0) {
      setRandomizedCities({
        All: shuffleArray(ALL_POPULAR_CITIES),
      });
    }
  }, [sortMode, randomizedCities, ALL_POPULAR_CITIES]);

  // Helper: randomize visible cities for the current region and for "All"
  const randomizePopularCities = useCallback(() => {
    if (sortMode !== "random") return;
    const regionCities =
      activeRegion === "All"
        ? ALL_POPULAR_CITIES
        : ALL_POPULAR_CITIES.filter((c) =>
            REGION_COUNTRIES[activeRegion]?.has(c.country)
          );

    setRandomizedCities((prev) => ({
      ...prev,
      [activeRegion]: shuffleArray(regionCities),
      All: shuffleArray(ALL_POPULAR_CITIES),
    }));
  }, [sortMode, activeRegion, ALL_POPULAR_CITIES]);

  // Persist the nicer no-results message when header/mobile triggers 404s
  useEffect(() => {
    const notFoundError =
      (currentWeather.isError && currentWeather?.error?.type === "NOT_FOUND") ||
      (forecast.isError && forecast?.error?.type === "NOT_FOUND");

    // Scroll to top on any error (network/server/etc.), not just 404s
    if ((currentWeather.isError || forecast.isError) && !notFoundError) {
      scrollToTop();
    }

    if (notFoundError) {
      const attemptedLabel =
        selectedLocation?.name || searchQuery || searchedCity || "";
      if (attemptedLabel) setNoMatchQuery(attemptedLabel);
      setShowNoMatch(true);
      // Ensure user sees the error message at the top
      scrollToTop();
    }

    // Clear message when we have a successful result
    if (currentWeather.isSuccess && currentWeather?.data?.data) {
      setNoMatchQuery("");
      setShowNoMatch(false);
    }
  }, [
    currentWeather.isError,
    currentWeather.error,
    forecast.isError,
    forecast.error,
    currentWeather.isSuccess,
    currentWeather.data,
    selectedLocation?.name,
    searchQuery,
    searchedCity,
  ]);

  // Re-randomize cities when switching regions (tab navigation)
  const handleRegionChange = (region) => {
    setActiveRegion(region);
    if (sortMode === "random") {
      // Generate new random order for the selected region
      const regionCities =
        region === "All"
          ? ALL_POPULAR_CITIES
          : ALL_POPULAR_CITIES.filter((c) =>
              REGION_COUNTRIES[region]?.has(c.country)
            );

      setRandomizedCities((prev) => ({
        ...prev,
        [region]: shuffleArray(regionCities),
      }));
    }
  };

  // Region slider navigation functions
  const updateRegionSliderNav = () => {
    const el = regionSliderRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrevRegion(el.scrollLeft > 0);
    setCanNextRegion(el.scrollLeft < maxScroll - 1);
  };

  const scrollRegions = (dir = 1) => {
    const el = regionSliderRef.current;
    if (!el) return;
    const amount = el.clientWidth; // scroll by one viewport width
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // Update region slider navigation on scroll and resize
  useEffect(() => {
    const el = regionSliderRef.current;
    if (!el) return;
    updateRegionSliderNav();
    const onScroll = () => updateRegionSliderNav();
    const onResize = () => updateRegionSliderNav();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [REGIONS.length]);

  const sortedPopularCities = (() => {
    switch (sortMode) {
      case "az":
        return [...filteredPopularCities].sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
        );
      case "random":
        return randomizedCities[activeRegion] || filteredPopularCities;
      default: // "curated"
        return filteredPopularCities;
    }
  })();

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
        <div className="search-page__search-container">
          <form className="search-page__search-form" onSubmit={handleSearch}>
            <SearchDropdown
              key={`search-dropdown-${searchInputKey}`}
              onSelect={(location) => {
                console.log("SearchPage dropdown selected:", location);
                // Use the location data to search for weather
                const fullName = location.displayName || location.name;
                const city = location.city;

                setSearchedCity(city);
                searchLocation(fullName);
                // Immediately reflect the user's intent globally so Home and the header badge update
                try {
                  selectLocation({
                    type: "city",
                    city,
                    name: fullName,
                    state: location.state,
                    country: location.country,
                    coordinates: location.coordinates,
                  });
                } catch (_) {}

                // Reset forecast toggle when searching for a new city
                setShowSearchForecast(false);

                // Clear input and focus on weather card
                setLocalSearchQuery("");
                setNoMatchQuery("");
                setShowNoMatch(false);
                focusOnWeatherCard();
              }}
              onQueryChange={(value) => {
                setLocalSearchQuery(value);
                // If the user is editing/clearing input, don't keep showing the no-match banner
                if (!value || !value.trim()) {
                  setShowNoMatch(false);
                  setNoMatchQuery("");
                  // Revert to empty-state suggestions when input is cleared by backspace/delete
                  setSearchedCity("");
                  setShowSearchForecast(false);
                }
              }}
              onClear={() => {
                // Reset input and results to show the empty state
                setLocalSearchQuery("");
                setSearchedCity("");
                setShowSearchForecast(false);
                setNoMatchQuery("");
                setShowNoMatch(false);
              }}
              placeholder="Enter city name (e.g., London, New York, Tokyo)"
              className="search-page__dropdown"
              maxSuggestions={10}
              minQueryLength={1}
              debounceMs={250}
              autoFocus={true}
              prioritizeUS={true}
            />
            <button
              type="submit"
              className="btn btn--primary search-page__submit-btn"
            >
              <Search size={20} />
              Search Weather
            </button>
          </form>
          <p className="search-page__help-text">
            Try searching for "New York" or "London", to discover instant
            suggestions and weather details for your city, state, & country.
          </p>
        </div>

        {/* Search Results */}
        <div className="search-results">
          {/* No-match placeholder for invalid input or not-found responses */}
          {(() => {
            const notFoundError =
              (currentWeather.isError &&
                currentWeather?.error?.type === "NOT_FOUND") ||
              (forecast.isError && forecast?.error?.type === "NOT_FOUND");

            const attemptedLabel =
              (noMatchQuery && noMatchQuery.trim()) ||
              selectedLocation?.name ||
              searchQuery ||
              searchedCity ||
              "your search";

            // If we're in the middle of a fresh-open navigation, hide the placeholder immediately
            const isFreshNav = (() => {
              try { return new URLSearchParams(routerLocation.search).get("new") === "1"; } catch (_) { return false; }
            })();

            if (!isFreshNav && (notFoundError || showNoMatch)) {
              return (
                <div className="search-results__error" style={{ textAlign: "center" }}>
                  <p className="search-header__subtitle" style={{ marginTop: 12 }}>
                    {`Hmm, we couldn't find a match for "${attemptedLabel}". Try searching for a known location or explore more locations below.`}
                  </p>
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn btn--primary explore-more-btn"
                      onClick={() => {
                        // Hide placeholder immediately and reset local state
                        setShowNoMatch(false);
                        setNoMatchQuery("");
                        setLocalSearchQuery("");
                        setSearchedCity("");
                        setShowSearchForecast(false);
                        setSearchInputKey((k) => k + 1);
                        // Optional: encourage exploration by reshuffling
                        try { randomizePopularCities(); } catch (_) {}
                        // Scroll to top right away for immediate feedback
                        scrollToTop();
                        // Navigate to a fresh Search view
                        navigate('/search?new=1');
                      }}
                    >
                      <Search size={20} />
                      Explore Locations
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          {/* Loading State */}
          {(currentWeather.isLoading || forecast.isLoading) && (
            <div className="search-results__loading">
              <LoadingSpinner />
              <p>Searching for weather in {searchedCity}...</p>
            </div>
          )}

          {/* Error State (non-404 errors only) */}
          {(currentWeather.isError || forecast.isError) &&
            !(
              (currentWeather.isError &&
                currentWeather?.error?.type === "NOT_FOUND") ||
              (forecast.isError && forecast?.error?.type === "NOT_FOUND")
            ) && (
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
          {currentWeather.isSuccess && currentWeather?.data?.data && (
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
                      // Safe access to location data with proper null checking
                      const loc = currentWeather?.data?.data?.location;
                      if (!loc) return null;

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

                <div className={`focus-highlight ${highlightCurrent ? "is-active" : ""}`}>
                  <WeatherCard
                    weather={currentWeather?.data?.data}
                    showForecastLink={true}
                    onAddToFavorites={handleAddToFavorites}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    onToggleForecast={() => {
                      const newValue = !showSearchForecast;
                      setShowSearchForecast(newValue);
                      // Scroll to forecast section when showing forecast
                      if (newValue) {
                        scrollToForecastSection();
                      }
                    }}
                    isForecastVisible={showSearchForecast}
                  />
                </div>
              </section>

              {/* Show 5-day forecast if toggled and available */}
              {showSearchForecast &&
                forecast.isSuccess &&
                forecast?.data?.data?.forecast && (
                  <section
                    className="search-results__forecast"
                    ref={forecastSectionRef}
                  >
                    <h2 className="section__title">5-Day Forecast</h2>

                    <div className="forecast-grid">
                      {forecast.data.data.forecast
                        .slice(0, 5)
                        .map((day, index) => (
                          <div key={day.date} className="forecast-day">
                            <div className="forecast-day__header">
                              <h4 className="forecast-day__date">
                                {getForecastDateLabel(day.date, index)}
                              </h4>
                              <span className="forecast-day__date-full">
                                {formatDateDisplay(day.date)}
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
                  // Scroll to the top immediately for instant feedback,
                  // then navigate to a fresh Search state.
                  try { scrollToTop(); } catch (_) {}
                  navigate('/search?new=1');
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
                <div className="regions-slider">
                  <div
                    className="search-suggestions__tabs"
                    role="tablist"
                    aria-label="Popular city regions"
                    ref={regionSliderRef}
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
                        onClick={() => handleRegionChange(region)}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                  {/* Navigation arrows for mobile */}
                  {REGIONS.length > 3 && (
                    <div className="regions-slider__controls">
                      <button
                        className="regions-slider__nav regions-slider__nav--prev"
                        onClick={() => scrollRegions(-1)}
                        disabled={!canPrevRegion}
                        aria-label="Previous regions"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        className="regions-slider__nav regions-slider__nav--next"
                        onClick={() => scrollRegions(1)}
                        disabled={!canNextRegion}
                        aria-label="Next regions"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="search-suggestions__controls"
                  role="group"
                  aria-label="Sort popular cities"
                >
                  <button
                    type="button"
                    className={`btn btn--small ${
                      sortMode === "random" ? "btn--primary" : "btn--secondary"
                    }`}
                    aria-pressed={sortMode === "random"}
                    onClick={() => {
                      setSortMode("random");
                      // Re-randomize current region when switching to random mode
                      const regionCities =
                        activeRegion === "All"
                          ? ALL_POPULAR_CITIES
                          : ALL_POPULAR_CITIES.filter((c) =>
                              REGION_COUNTRIES[activeRegion]?.has(c.country)
                            );

                      setRandomizedCities((prev) => ({
                        ...prev,
                        [activeRegion]: shuffleArray(regionCities),
                      }));
                    }}
                  >
                    Random
                  </button>
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

                        // Special handling for San Diego to ensure it always goes to California
                        let finalCity = city;
                        let finalFullName = fullName;
                        if (city.toLowerCase() === 'san diego') {
                          finalCity = 'San Diego';
                          finalFullName = 'San Diego, CA';
                        }

                        // Trigger search immediately but keep the input clear
                        setSearchedCity(finalCity);
                        searchLocation(finalFullName); // Use full name for context
                        
                        // Enhanced cache clearing for popular cities, especially San Diego
                        try {
                          // Clear all weather-related cache entries
                          queryClient.removeQueries({ queryKey: ["weather"] });
                          queryClient.invalidateQueries({ queryKey: ["weather"] });
                          
                          // Clear all weather and location related storage items
                          const weatherKeys = Object.keys(localStorage).filter(key => 
                            key.includes('weather') || key.includes('location') || key.includes('san diego')
                          );
                          weatherKeys.forEach(key => localStorage.removeItem(key));
                          
                          // Special clearing for San Diego to prevent any cached incorrect data
                          if (finalCity.toLowerCase() === 'san diego') {
                            queryClient.removeQueries({ queryKey: ["weather", "current", "city", "San Diego"] });
                            queryClient.removeQueries({ queryKey: ["weather", "forecast", "city", "San Diego"] });
                          }
                          
                        } catch (_) {}

                        // Set location state with the correct data
                        try {
                          selectLocation({ type: "city", city: finalCity, name: finalFullName });
                        } catch (_) {}

                        // Reset forecast toggle when searching for a new city
                        setShowSearchForecast(false);

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

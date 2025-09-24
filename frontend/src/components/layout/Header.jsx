import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Cloud,
  Search,
  Heart,
  Settings,
  Menu,
  X,
  MapPin,
  Sun,
  Moon,
  TestTube,
} from "lucide-react";
import { useWeatherContext } from "@context/WeatherContext";
import HeaderWeatherBadge from "./HeaderWeatherBadge";
import HeaderSearchDropdown from "../ui/HeaderSearchDropdown";
import {
  parseLocationQuery,
  isValidLocationQuery,
  searchAllCities,
  extractLocationComponents,
} from "@/utils/searchUtils.js";
import { getRandomRegionCapital } from "@/utils/regionCapitalUtils.js";

/**
 * Header component with navigation and search functionality
 */
const Header = () => {
  const location = useLocation();
  const {
    preferences,
    updatePreferences,
    searchLocation,
    selectedLocation,
    selectLocation,
  } = useWeatherContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null); // header (desktop/tablet) search input
  const mobileInputRef = useRef(null); // hamburger menu search input
  const formRef = useRef(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const navigate = useNavigate();
  // Preserve flag: only used to keep an already-open search open across allowed navigations
  const preserveSearchOnNextNavRef = useRef(false);

  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: Cloud },
    { path: "/search", label: "Search", icon: Search },
    { path: "/favorites", label: "Favorites", icon: Heart },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/test", label: "API Test", icon: TestTube },
  ];

  const applyOptimisticSelection = (cityName, fullName, fallback = {}) => {
    if (!cityName || !fullName) {
      return;
    }

    const { stateCode: parsedState, countryCode: parsedCountry } =
      extractLocationComponents(fullName) || {};

    try {
      const [first] = searchAllCities(fullName, 1);
      if (first) {
        const optimisticSelection = {
          type: "city",
          city: first.city || cityName,
          name: first.name || first.displayName || fullName,
        };

        if (first.state) optimisticSelection.state = first.state;
        if (first.country) optimisticSelection.country = first.country;
        if (first.coordinates) {
          optimisticSelection.coordinates = first.coordinates;
        }

        selectLocation(optimisticSelection);
        return;
      }
    } catch (_) {
      // Ignore lookup errors and fall back to provided metadata
    }

    const fallbackSelection = {
      type: "city",
      city: cityName,
      name: fallback.name || fullName,
    };

    if (fallback.state || parsedState) {
      fallbackSelection.state = fallback.state || parsedState;
    }
    if (fallback.country || parsedCountry) {
      fallbackSelection.country = fallback.country || parsedCountry;
    }
    if (fallback.coordinates) {
      fallbackSelection.coordinates = fallback.coordinates;
    }

    selectLocation(fallbackSelection);
  };

  // Handle search submission - improved state management and error handling
  const handleSearch = async (e, rawQuery) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions
    if (isSearching) {
      console.log("Search already in progress, skipping duplicate submission");
      return;
    }

    const fullQuery = (rawQuery ?? headerSearchQuery).trim();
    if (!fullQuery) {
      console.log("Empty search query, skipping");
      return;
    }

    // Validate the query before processing
    if (!isValidLocationQuery(fullQuery)) {
      console.log("Invalid location query format:", fullQuery, "– routing to Search to show helpful error");
      navigate(`/search?city=${encodeURIComponent(fullQuery)}`);
      // Reset state promptly so UI feels responsive
      setHeaderSearchQuery("");
      setIsSearchActive(false);
      setIsSearching(false);
      return;
    }

    console.log("Starting search for:", fullQuery);
    setIsSearching(true);

    try {
      const regionResult = getRandomRegionCapital(fullQuery);
      if (regionResult) {
        console.log("Resolved region query to capital:", regionResult);
      }

      const locationInfo = regionResult
        ? {
            city: regionResult.city,
            fullName: regionResult.fullName,
            countryCode: regionResult.countryCode,
          }
        : parseLocationQuery(fullQuery);

      const resolvedCity = locationInfo.city || fullQuery;
      const resolvedFullName = locationInfo.fullName || fullQuery;
      console.log("Parsed location:", {
        city: resolvedCity,
        fullName: resolvedFullName,
      });

      // Update query context first
      await searchLocation(resolvedFullName);

      applyOptimisticSelection(resolvedCity, resolvedFullName, {
        name: resolvedFullName,
        country: regionResult?.countryCode,
      });

      // Navigate to search page
      navigate(`/search?city=${encodeURIComponent(resolvedFullName)}`);

      // Reset state with proper timing to prevent race conditions
      const resetState = () => {
        console.log("Resetting search state");
        setHeaderSearchQuery("");
        setIsSearchActive(false);
        setIsSearching(false);

        // Blur input to remove focus
        if (inputRef.current) {
          inputRef.current.blur();
        }
      };

      // Use requestAnimationFrame for better timing with React updates
      requestAnimationFrame(() => {
        setTimeout(resetState, 150);
      });
    } catch (error) {
      console.error("Search error:", error);
      // Ensure state is always reset on error
      setIsSearching(false);
      setHeaderSearchQuery("");
      setIsSearchActive(false);

      // Show user feedback for errors
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle dropdown suggestion selection
  const handleDropdownSelect = async (location) => {
    console.log("Header dropdown selected:", location);

    // Prevent multiple submissions
    if (isSearching) {
      console.log("Search already in progress, skipping dropdown selection");
      return;
    }

    const fullQuery =
      location.fullQuery || location.displayName || location.name;
    if (!fullQuery) {
      console.log("No query available from dropdown selection");
      return;
    }

    console.log("Starting search for dropdown selection:", fullQuery);
    setIsSearching(true);

    try {
      // Update query context and immediately reflect selection so Home/badge update
      await searchLocation(fullQuery);
      try {
        const { city, fullName } = parseLocationQuery(fullQuery);
        selectLocation({ 
          type: "city", 
          city, 
          name: fullName,
          state: location.state,
          country: location.country,
          coordinates: location.coordinates
        });
      } catch (_) {}

      // Navigate to search page
      navigate(`/search?city=${encodeURIComponent(fullQuery)}`);

      // Reset state with proper timing
      const resetState = () => {
        console.log("Resetting dropdown search state");
        setHeaderSearchQuery("");
        setIsSearchActive(false);
        setIsSearching(false);
      };

      requestAnimationFrame(() => {
        setTimeout(resetState, 150);
      });
    } catch (error) {
      console.error("Dropdown search error:", error);
      // Ensure state is always reset on error
      setIsSearching(false);
      setIsSearchActive(false);
    }
  };

  // Handle dropdown clear
  const handleDropdownClear = () => {
    setHeaderSearchQuery("");
    setIsSearchActive(false);
  };

  // Handle mobile dropdown selection
  const handleMobileDropdownSelect = async (location) => {
    console.log("Mobile dropdown selected:", location);

    // Prevent multiple submissions
    if (isSearching) {
      console.log(
        "Mobile search already in progress, skipping dropdown selection"
      );
      return;
    }

    const fullQuery =
      location.fullQuery || location.displayName || location.name;
    if (!fullQuery) {
      console.log("No query available from mobile dropdown selection");
      return;
    }

    console.log("Starting mobile search for dropdown selection:", fullQuery);
    setIsSearching(true);

    try {
      // Update query context and immediately reflect selection so Home/badge update
      await searchLocation(fullQuery);
      try {
        const { city, fullName } = parseLocationQuery(fullQuery);
        selectLocation({ 
          type: "city", 
          city, 
          name: fullName,
          state: location.state,
          country: location.country,
          coordinates: location.coordinates
        });
      } catch (_) {}

      // Navigate to search page
      navigate(`/search?city=${encodeURIComponent(fullQuery)}`);

      // Reset mobile state with proper timing
      const resetMobileState = () => {
        console.log("Resetting mobile dropdown search state");
        setIsMenuOpen(false);
        setMobileSearchQuery("");
        setIsSearching(false);
      };

      requestAnimationFrame(() => {
        setTimeout(resetMobileState, 150);
      });
    } catch (error) {
      console.error("Mobile dropdown search error:", error);
      setIsSearching(false);
      // Keep menu open on error
    }
  };

  // Handle mobile dropdown clear
  const handleMobileDropdownClear = () => {
    setMobileSearchQuery("");
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = preferences.theme === "light" ? "dark" : "light";
    updatePreferences({ theme: newTheme });
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    const wasOpen = isMenuOpen;
    const willOpen = !isMenuOpen;
    setIsMenuOpen(willOpen);
    // Clear the hamburger search when the menu is closed
    if (wasOpen && !willOpen) setMobileSearchQuery("");
  };

  // Smoothly scroll viewport to the top on header nav clicks
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  // Close the expandable search on outside clicks - improved event handling
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't interfere if we're currently searching or search is not active
      if (!isSearchActive || isSearching) return;

      const formEl = formRef.current;
      if (!formEl) return;

      // Don't close if clicking inside the search form or its children
      if (formEl.contains(e.target)) return;

      // Keep search open for interactions with the search itself and select header controls
      // that are allowed to keep it open (logo, theme toggle, weather badge)
      const allowedElements = [
        ".search-form__submit",
        ".search-form__clear",
        ".search-form__icon",
        ".header-search-dropdown__suggestions",
        ".header-search-dropdown__suggestion",
        ".header__logo",
        ".header__brand",
        ".header__theme-toggle",
        ".header-weather",
        ".header-weather__link",
      ];

      const isAllowedClick = allowedElements.some((selector) => {
        const element = e.target.closest(selector);
        return element !== null;
      });

      // Only close search if it's clearly an outside click
      if (!isAllowedClick) {
        console.log("Closing search due to outside click");
        setIsSearchActive(false);
      }
    };

    // Only add listeners when search is active and we're not searching
    if (isSearchActive && !isSearching) {
      // Use a small delay to ensure other interactions complete first
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, {
          capture: true,
          passive: true,
        });
        document.addEventListener("touchstart", handleClickOutside, {
          capture: true,
          passive: true,
        });
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("touchstart", handleClickOutside, true);
      };
    }
  }, [isSearchActive, isSearching]);

  // Reset/search state on navigation: preserve if flagged, otherwise close
  useEffect(() => {
    // Only reset if we're not currently searching to avoid race conditions
    if (!isSearching) {
      const resetTimer = setTimeout(() => {
        // Only reset if we're still not searching (double-check)
        if (!isSearching) {
          if (preserveSearchOnNextNavRef.current) {
            // Preserve open search across this navigation
            preserveSearchOnNextNavRef.current = false; // consume flag
            console.log(
              "Preserving open search across navigation from allowed control"
            );
            setIsSearchActive(true);
            if (inputRef.current) {
              inputRef.current.focus();
            }
          } else {
            console.log("Resetting search state due to location change");
            setIsSearchActive(false);
            setHeaderSearchQuery("");
            if (
              inputRef.current &&
              document.activeElement !== inputRef.current
            ) {
              inputRef.current.blur();
            }
          }
        }
      }, 100); // Reduced timeout for better responsiveness

      return () => clearTimeout(resetTimer);
    }
  }, [location.pathname, isSearching]);

  // Handle escape key to close search - improved
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Close mobile menu if open
        if (isMenuOpen) {
          setIsMenuOpen(false);
          setMobileSearchQuery("");
          return;
        }

        // Close search if active and not currently searching
        if (isSearchActive && !isSearching) {
          console.log("Closing search due to Escape key");
          setIsSearchActive(false);
          setHeaderSearchQuery("");
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchActive, isSearching, isMenuOpen]);

  return (
    <header
      className={`header ${isSearchActive ? "header--search-active" : ""}`}
    >
      <div className="header__container">
        {/* Logo and Brand */}
        <div className="header__brand">
          <Link
            to="/#top"
            className="header__logo"
            onMouseDown={() => {
              // Only preserve if search is already open
              if (isSearchActive) preserveSearchOnNextNavRef.current = true;
            }}
            onClick={(e) => {
              // If already on Home, smoothly scroll to top instead of re-navigating
              if (location.pathname === "/") {
                e.preventDefault();
                // update hash to reflect intent
                if (window.location.hash !== "#top") {
                  window.history.replaceState({}, "", "/#top");
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Cloud size={32} />
            <span className="header__brand-text">
              {import.meta.env.VITE_APP_NAME || "Weather App"}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header__nav header__nav--desktop">
          <ul className="nav__list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path} className="nav__item">
                  <Link
                    to={item.path}
                    className={`nav__link ${
                      isActive ? "nav__link--active" : ""
                    }`}
                    onClick={scrollToTop}
                  >
                    <Icon size={20} />
                    <span className="nav__link-text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions: Weather badge, Search, Theme toggle, Mobile menu */}
        <div className="header__actions">
          {/* Live temperature badge for the active location */}
          <HeaderWeatherBadge
            onMouseDown={() => {
              // Only preserve if search is already open
              if (isSearchActive) preserveSearchOnNextNavRef.current = true;
            }}
            onTouchStart={() => {
              if (isSearchActive) preserveSearchOnNextNavRef.current = true;
            }}
          />

          <button
            onClick={toggleTheme}
            className="header__theme-toggle"
            aria-label="Toggle theme"
          >
            {preferences.theme === "light" ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )}
          </button>

          {/* Search Bar (desktop/tablet header area) */}
          <div className="header__search">
            <form
              key={`search-form-${location.pathname}-${isSearching}`}
              ref={formRef}
              onSubmit={handleSearch}
              className="search-form"
            >
              <HeaderSearchDropdown
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                onSelect={handleDropdownSelect}
                onClear={handleDropdownClear}
                onFocus={(e) => {
                  console.log("Search input focused");
                  setIsSearchActive(true);
                  if (isMenuOpen) {
                    console.log("Closing mobile menu due to search focus");
                    setIsMenuOpen(false);
                  }
                }}
              onBlur={(e) => {
                // Only close search if we're not interacting with search form elements
                // and we're not currently searching
                if (isSearching) {
                  console.log(
                    "Keeping search active during search operation"
                  );
                  return;
                }

                const relatedTarget = e.relatedTarget;
                const formEl = formRef.current;

                // Keep search active if focusing on form elements or search-related buttons
                  if (
                    relatedTarget &&
                    (formEl?.contains(relatedTarget) ||
                      relatedTarget.closest(".search-form__submit") ||
                      relatedTarget.closest(".search-form__clear") ||
                      relatedTarget.closest(".search-form__icon") ||
                      relatedTarget.closest(
                        ".header-search-dropdown__suggestions"
                      ) ||
                      relatedTarget.closest(
                        ".header-search-dropdown__suggestion"
                      ) ||
                      // Also allow focus to these header controls without closing
                      relatedTarget.closest(".header__logo") ||
                      relatedTarget.closest(".header__theme-toggle") ||
                      relatedTarget.closest(".header-weather") ||
                      relatedTarget.closest(".header-weather__link"))
                  ) {
                    console.log(
                      "Keeping search active - focus moved to search element"
                    );
                    return;
                  }

                  // Small delay to allow button clicks to register first
                  console.log("Scheduling search close due to blur");
                  setTimeout(() => {
                    if (!isSearching) {
                      setIsSearchActive(false);
                    }
                  }, 200);
                }}
                disabled={isSearching}
                inputRef={inputRef}
                isSearchActive={isSearchActive}
                setIsSearchActive={setIsSearchActive}
                isSearching={isSearching}
                className="header__search-dropdown"
                placeholder="Enter city name (e.g., London, New York, Tokyo)"
                maxSuggestions={6}
                minQueryLength={2}
                debounceMs={200}
                prioritizeUS={true}
              />
              <button
                type="submit"
                className="search-form__submit"
                disabled={isSearching}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          <button
            onClick={toggleMenu}
            className="header__menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="header__nav header__nav--mobile">
          <ul className="nav__list nav__list--mobile">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path} className="nav__item">
                  <Link
                    to={item.path}
                    className={`nav__link ${
                      isActive ? "nav__link--active" : ""
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setMobileSearchQuery("");
                      scrollToTop();
                    }}
                  >
                    <Icon size={20} />
                    <span className="nav__link-text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile menu search (placed under nav links, centered) */}
          <div className="nav__search">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Prevent multiple submissions
                if (isSearching) {
                  console.log(
                    "Mobile search already in progress, skipping duplicate"
                  );
                  return;
                }

                const fullQuery = mobileSearchQuery.trim();
                if (!fullQuery) {
                  console.log("Empty mobile search query");
                  return;
                }

                if (!isValidLocationQuery(fullQuery)) {
                  console.log("Invalid mobile search query:", fullQuery, "– routing to Search to show helpful error");
                  navigate(`/search?city=${encodeURIComponent(fullQuery)}`);
                  // Reset and close menu for a clear transition
                  setIsMenuOpen(false);
                  setMobileSearchQuery("");
                  setIsSearching(false);
                  return;
                }

                console.log("Starting mobile search for:", fullQuery);
                setIsSearching(true);

                try {
                  const regionResult = getRandomRegionCapital(fullQuery);
                  if (regionResult) {
                    console.log("Resolved mobile region query to capital:", regionResult);
                  }

                  const locationInfo = regionResult
                    ? {
                        city: regionResult.city,
                        fullName: regionResult.fullName,
                        countryCode: regionResult.countryCode,
                      }
                    : parseLocationQuery(fullQuery);

                  const resolvedCity = locationInfo.city || fullQuery;
                  const resolvedFullName = locationInfo.fullName || fullQuery;
                  console.log("Parsed mobile location:", {
                    city: resolvedCity,
                    fullName: resolvedFullName,
                  });

                  // Update query context first
                  await searchLocation(resolvedFullName);

                  applyOptimisticSelection(resolvedCity, resolvedFullName, {
                    name: resolvedFullName,
                    country: regionResult?.countryCode,
                  });

                  // Navigate to search page
                  navigate(`/search?city=${encodeURIComponent(resolvedFullName)}`);

                  // Reset mobile state with proper timing
                  const resetMobileState = () => {
                    console.log("Resetting mobile search state");
                    setIsMenuOpen(false);
                    setMobileSearchQuery("");
                    setIsSearching(false);
                  };

                  // Use requestAnimationFrame for better timing
                  requestAnimationFrame(() => {
                    setTimeout(resetMobileState, 150);
                  });
                } catch (error) {
                  console.error("Mobile search error:", error);
                  setIsSearching(false);
                  setMobileSearchQuery("");

                  // Keep menu open on error so user can retry
                  if (mobileInputRef.current) {
                    mobileInputRef.current.focus();
                  }
                }
              }}
              className="search-form search-form--mobile"
            >
              <HeaderSearchDropdown
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                onSelect={handleMobileDropdownSelect}
                onClear={handleMobileDropdownClear}
                disabled={isSearching}
                inputRef={mobileInputRef}
                isSearchActive={true} // Always active in mobile menu
                setIsSearchActive={() => {}} // No-op for mobile
                isSearching={isSearching}
                className="nav__search-dropdown"
                placeholder="Enter city name (e.g., London, New York, Tokyo)"
                maxSuggestions={8}
                minQueryLength={2}
                debounceMs={250}
                prioritizeUS={true}
              />
              <button
                type="submit"
                className="search-form__submit search-form__submit--large"
                disabled={isSearching}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;

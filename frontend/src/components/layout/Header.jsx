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
import {
  parseLocationQuery,
  isValidLocationQuery,
} from "@/utils/searchUtils.js";

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

  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: Cloud },
    { path: "/search", label: "Search", icon: Search },
    { path: "/favorites", label: "Favorites", icon: Heart },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/test", label: "API Test", icon: TestTube },
  ];

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
      console.log("Invalid location query format:", fullQuery);
      return;
    }

    console.log("Starting search for:", fullQuery);
    setIsSearching(true);

    try {
      // Parse the location query to extract city and full name
      const { city, fullName } = parseLocationQuery(fullQuery);
      console.log("Parsed location:", { city, fullName });

      // Update context
      await searchLocation(fullName);
      selectLocation({ city, name: fullName, type: "city" });

      // Navigate to search page
      navigate(`/search?city=${encodeURIComponent(fullName)}`);

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

  // Close the expandable search on outside clicks - improved event handling
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't interfere if we're currently searching or search is not active
      if (!isSearchActive || isSearching) return;

      const formEl = formRef.current;
      if (!formEl) return;

      // Don't close if clicking inside the search form or its children
      if (formEl.contains(e.target)) return;

      // Don't close if clicking on specific header controls
      const allowedElements = [
        ".header__theme-toggle",
        ".header-weather",
        ".header-weather__link",
        ".header__logo",
        ".header__brand",
        ".header__menu-toggle",
        ".nav__link",
        ".search-form__submit",
        ".search-form__clear",
        ".search-form__icon",
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

  // Reset search state when location changes - improved to prevent race conditions
  useEffect(() => {
    // Only reset if we're not currently searching to avoid race conditions
    if (!isSearching) {
      const resetTimer = setTimeout(() => {
        // Only reset if we're still not searching (double-check)
        if (!isSearching) {
          console.log("Resetting search state due to location change");
          setIsSearchActive(false);
          setHeaderSearchQuery("");
          if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.blur();
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
          <Link to="/" className="header__logo">
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
          <HeaderWeatherBadge />

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
              <div className="search-form__input-group">
                <Search
                  size={20}
                  className="search-form__icon"
                  role="button"
                  aria-label="Focus search"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Search icon clicked");
                    if (!isSearching) {
                      setIsSearchActive(true);
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Enter city name (e.g., London, New York, Tokyo)"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
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
                        relatedTarget.closest(".search-form__icon"))
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
                  ref={inputRef}
                  className="search-form__input"
                  aria-label="Search location"
                />
                {(isSearchActive || headerSearchQuery) && (
                  <button
                    type="button"
                    aria-label="Clear search and close"
                    className="search-form__clear"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Clearing search and closing");
                      setHeaderSearchQuery("");
                      setIsSearchActive(false);
                      if (inputRef.current) {
                        inputRef.current.blur();
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                    }}
                    disabled={isSearching}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
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
                  console.log("Invalid mobile search query:", fullQuery);
                  return;
                }

                console.log("Starting mobile search for:", fullQuery);
                setIsSearching(true);

                try {
                  // Parse the location query to extract city and full name
                  const { city, fullName } = parseLocationQuery(fullQuery);
                  console.log("Parsed mobile location:", { city, fullName });

                  // Update context
                  await searchLocation(fullName);
                  selectLocation({ city, name: fullName, type: "city" });

                  // Navigate to search page
                  navigate(`/search?city=${encodeURIComponent(fullName)}`);

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
              <div className="search-form__input-group">
                <Search size={22} className="search-form__icon" />
                <input
                  type="text"
                  placeholder="Enter city name (e.g., London, New York, Tokyo)"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="search-form__input search-form__input--large"
                  ref={mobileInputRef}
                  disabled={isSearching}
                />
                {!!mobileSearchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="search-form__clear"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMobileSearchQuery("");
                      if (mobileInputRef.current) {
                        mobileInputRef.current.focus();
                      }
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
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

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  TestTube
} from 'lucide-react';
import { useWeatherContext } from '@context/WeatherContext';
import HeaderWeatherBadge from './HeaderWeatherBadge';
import {
  parseLocationQuery,
  isValidLocationQuery,
} from "@/utils/searchUtils.js";

/**
 * Header component with navigation and search functionality
 */
const Header = () => {
  const location = useLocation();
  const { preferences, updatePreferences, searchLocation, selectedLocation, selectLocation } = useWeatherContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef(null); // header (desktop/tablet) search input
  const mobileInputRef = useRef(null); // hamburger menu search input
  const formRef = useRef(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  // Track when a click on specific header controls (weather badge, theme toggle)
  // should keep the search field open even though the input blurs.
  const keepOpenOnNextBlurRef = useRef(false);
  const markKeepOpenOnNextBlur = () => { keepOpenOnNextBlurRef.current = true; };
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const navigate = useNavigate();

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: Cloud },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/test', label: 'API Test', icon: TestTube },
  ];

  // Handle search submission - using same reliable pattern as Search page
  const handleSearch = (e, rawQuery) => {
    e.preventDefault();
    const fullQuery = (rawQuery ?? headerSearchQuery).trim();
    if (!fullQuery) return;

    // Validate the query before processing (same as Search page)
    if (!isValidLocationQuery(fullQuery)) {
      console.log("Invalid location query format:", fullQuery);
      return;
    }

    // Parse the location query to extract city and full name (same as Search page)
    const { city, fullName } = parseLocationQuery(fullQuery);
    console.log("Parsed location:", { city, fullName });

    // Update context using parsed data (same as Search page)
    searchLocation(fullName); // Use full name for context
    selectLocation({ city, name: fullName, type: 'city' }); // city for API, name for display

    // Client-side navigate to trigger Search page hydration
    navigate(`/search?city=${encodeURIComponent(fullName)}`);

    // Clear the input for next search but keep search form active
    setHeaderSearchQuery('');
    
    // Keep search form open and ready for next search (don't collapse)
    // This allows multiple consecutive searches without needing to reopen
    if (inputRef.current) {
      // Small delay to let navigation complete, then refocus for next search
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      
      // Store timeout ID for potential cleanup
      inputRef.current.setAttribute('data-focus-timeout', timeoutId);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updatePreferences({ theme: newTheme });
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    const wasOpen = isMenuOpen;
    const willOpen = !isMenuOpen;
    setIsMenuOpen(willOpen);
    // Clear the hamburger search when the menu is closed
    if (wasOpen && !willOpen) setMobileSearchQuery('');
  };

  // Close the expandable search on outside pointer interactions
  // (but keep it open when interacting with allowed controls)
  // Made less aggressive to support multiple consecutive searches
  useEffect(() => {
    const handler = (e) => {
      if (!isSearchActive) return;
      const formEl = formRef.current;
      if (!formEl) return;
      const t = e.target;
      const isInsideForm = formEl.contains(t);
      const isAllowed = !!t.closest?.('.header__theme-toggle, .header-weather, .header-weather__link, .header__logo, .header__nav, .header__actions');
      // Only close if clicking far outside the header area
      const isInHeader = !!t.closest?.('.header');
      if (!isInsideForm && !isAllowed && !isInHeader) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('touchstart', handler, true);
    return () => {
      document.removeEventListener('pointerdown', handler, true);
      document.removeEventListener('touchstart', handler, true);
    };
  }, [isSearchActive]);

  // Allow keyboard users to close with Escape
  useEffect(() => {
    const onKey = (e) => {
      if (isSearchActive && e.key === 'Escape') {
        setIsSearchActive(false);
        if (inputRef.current) inputRef.current.blur();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSearchActive]);

  // Cleanup any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (inputRef.current) {
        const timeoutId = inputRef.current.getAttribute('data-focus-timeout');
        if (timeoutId) {
          clearTimeout(parseInt(timeoutId));
        }
      }
    };
  }, []);

  return (
    <header className={`header ${isSearchActive ? 'header--search-active' : ''}`}>
      <div className="header__container">
        {/* Logo and Brand */}
        <div className="header__brand">
          <Link to="/" className="header__logo" onMouseDown={markKeepOpenOnNextBlur} onTouchStart={markKeepOpenOnNextBlur}>
            <Cloud size={32} />
            <span className="header__brand-text">
              {import.meta.env.VITE_APP_NAME || 'Weather App'}
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
                    className={`nav__link ${isActive ? 'nav__link--active' : ''}`}
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
            onMouseDown={markKeepOpenOnNextBlur}
            onTouchStart={markKeepOpenOnNextBlur}
          />

          <button 
            onMouseDown={markKeepOpenOnNextBlur}
            onTouchStart={markKeepOpenOnNextBlur}
            onClick={toggleTheme}
            className="header__theme-toggle"
            aria-label="Toggle theme"
          >
            {preferences.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Search Bar (desktop/tablet header area) */}
          <div className="header__search">
            <form
              ref={formRef}
              onSubmit={handleSearch}
              className="search-form"
              onFocus={() => setIsSearchActive(true)}
              onBlur={(e) => {
                // Less aggressive blur handling for multiple consecutive searches
                // Only collapse if focus moves completely outside the header area
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  const rt = e.relatedTarget;
                  const isInHeader = !!(rt && rt.closest?.('.header'));
                  const isAllowedTarget = !!(
                    rt &&
                    (rt.closest?.('.header__theme-toggle') ||
                     rt.closest?.('.header-weather') ||
                     rt.closest?.('.header-weather__link') ||
                     rt.closest?.('.header__logo') ||
                     rt.closest?.('.header__nav') ||
                     rt.closest?.('.header__actions'))
                  );

                  const keepOpen = keepOpenOnNextBlurRef.current || isAllowedTarget || isInHeader;

                  // Reset the one-shot flag for subsequent interactions
                  keepOpenOnNextBlurRef.current = false;

                  if (!keepOpen) {
                    // Add longer delay to prevent premature closing during navigation
                    setTimeout(() => {
                      // Double-check that search should still be closed
                      if (!document.activeElement?.closest?.('.header')) {
                        setIsSearchActive(false);
                      }
                    }, 200);
                  }
                }
              }}
            >
              <div className="search-form__input-group">
                <Search 
                  size={20} 
                  className="search-form__icon" 
                  role="button"
                  aria-label="Focus search"
                  onClick={() => {
                    setIsSearchActive(true);
                    if (inputRef.current) inputRef.current.focus();
                  }}
                />
                <input
                  type="text"
                  placeholder="Enter city name (e.g., London, New York, Tokyo)"
                  value={headerSearchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent XSS and invalid characters
                    const sanitizedValue = value.replace(/[<>]/g, '');
                    setHeaderSearchQuery(sanitizedValue);
                  }}
                  onFocus={() => {
                    setIsSearchActive(true);
                    if (isMenuOpen) setIsMenuOpen(false);
                  }}
                  ref={inputRef}
                  className="search-form__input"
                />
                {(isSearchActive || headerSearchQuery) && (
                  <button
                    type="button"
                    aria-label="Clear search and close"
                    className="search-form__clear"
                    onClick={() => {
                      setHeaderSearchQuery('');
                      if (inputRef.current) inputRef.current.blur();
                      setIsSearchActive(false);
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="search-form__submit">
                Search
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
                    className={`nav__link ${isActive ? 'nav__link--active' : ''}`}
                    onClick={() => { setIsMenuOpen(false); setMobileSearchQuery(''); }}
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
              onSubmit={(e) => {
                handleSearch(e, mobileSearchQuery);
                // Clear the mobile query for next search
                setMobileSearchQuery('');
                // Keep mobile menu open for multiple consecutive searches
                // Don't close menu automatically - let user close when done
              }}
              className="search-form search-form--mobile"
            >
              <div className="search-form__input-group">
                <Search size={22} className="search-form__icon" />
                <input
                  type="text"
                  placeholder="Enter city name (e.g., London, New York, Tokyo)"
                  value={mobileSearchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent XSS and invalid characters
                    const sanitizedValue = value.replace(/[<>]/g, '');
                    setMobileSearchQuery(sanitizedValue);
                  }}
                  className="search-form__input search-form__input--large"
                  ref={mobileInputRef}
                />
                {!!mobileSearchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="search-form__clear"
                    onClick={() => {
                      setMobileSearchQuery('');
                      if (mobileInputRef.current) mobileInputRef.current.focus();
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="search-form__submit search-form__submit--large">
                Search
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;

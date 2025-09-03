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

  // Handle search submission
  const handleSearch = (e, rawQuery) => {
    e.preventDefault();
    const q = (rawQuery ?? headerSearchQuery).trim();
    if (!q) return;

    // Collapse the expandable search immediately after submit
    // by removing focus from any element inside the search form.
    if (inputRef.current) inputRef.current.blur();
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      try { document.activeElement.blur(); } catch {}
    }
    setIsSearchActive(false);

    // Update context for consistency
    searchLocation(q);
    // Immediately reflect the most recent search in the header/weather badge
    // so users see the temperature update right after submitting.
    selectLocation({ city: q, name: q, type: 'city' });

    // Client-side navigate to trigger Search page hydration
    navigate(`/search?city=${encodeURIComponent(q)}`);

    // Clear the input so placeholder shows after submit
    setHeaderSearchQuery('');
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
  useEffect(() => {
    const handler = (e) => {
      if (!isSearchActive) return;
      const formEl = formRef.current;
      if (!formEl) return;
      const t = e.target;
      const isInsideForm = formEl.contains(t);
      const isAllowed = !!t.closest?.('.header__theme-toggle, .header-weather, .header-weather__link, .header__logo');
      if (!isInsideForm && !isAllowed) {
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
                // Only collapse if focus moved completely outside the form,
                // AND the next focus/click target is not one of the allowed
                // controls (theme toggle or weather badge). We also honor a
                // pointer-down flag to handle browsers that don't set
                // relatedTarget during blur reliably on link/button clicks.
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  const rt = e.relatedTarget;
                  const isAllowedTarget = !!(
                    rt &&
                    (rt.closest?.('.header__theme-toggle') ||
                     rt.closest?.('.header-weather') ||
                     rt.closest?.('.header-weather__link') ||
                     rt.closest?.('.header__logo'))
                  );

                  const keepOpen = keepOpenOnNextBlurRef.current || isAllowedTarget;

                  // Reset the one-shot flag for subsequent interactions
                  keepOpenOnNextBlurRef.current = false;

                  if (!keepOpen) {
                    // Defer collapse to allow any click to complete cleanly
                    setTimeout(() => setIsSearchActive(false), 0);
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
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
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
                setIsMenuOpen(false);
                setMobileSearchQuery('');
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

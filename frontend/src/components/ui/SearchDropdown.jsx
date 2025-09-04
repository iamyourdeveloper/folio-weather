import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { getAutocompleteSuggestions, debounce, validateSearchQuery } from '@/services/searchApi';
import '@/styles/components.css';

/**
 * SearchDropdown Component
 * Real-time search dropdown with autocomplete suggestions
 * Supports both US cities with states and international cities
 */
const SearchDropdown = ({
  onSelect,
  onClear,
  placeholder = "Search for a city...",
  initialValue = "",
  className = "",
  disabled = false,
  autoFocus = false,
  maxSuggestions = 8,
  minQueryLength = 1,
  debounceMs = 300,
  showClearButton = true,
  prioritizeUS = true
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const suggestionRefs = useRef([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < minQueryLength) {
        setSuggestions([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      const validation = validateSearchQuery(searchQuery);
      if (!validation.isValid) {
        setError(validation.error);
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getAutocompleteSuggestions(validation.query, maxSuggestions);
        
        if (response.success) {
          setSuggestions(response.data || []);
        } else {
          setError(response.error || 'Failed to fetch suggestions');
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [maxSuggestions, minQueryLength, debounceMs]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim().length >= minQueryLength) {
      setIsOpen(true);
      debouncedSearch(value.trim());
    } else {
      setIsOpen(false);
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.displayName);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (onSelect) {
      onSelect({
        city: suggestion.city,
        state: suggestion.state,
        country: suggestion.country,
        name: suggestion.name,
        displayName: suggestion.displayName,
        type: suggestion.type
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setError(null);
    
    if (onClear) {
      onClear();
    }
    
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    if (query.trim().length >= minQueryLength && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`search-dropdown ${className}`}>
      <div className="search-dropdown__input-container">
        <div className="search-dropdown__input-wrapper">
          <Search 
            size={20} 
            className="search-dropdown__icon" 
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="search-dropdown__input"
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-describedby={error ? 'search-error' : undefined}
          />
          {isLoading && (
            <Loader2 
              size={16} 
              className="search-dropdown__loading" 
              aria-label="Loading suggestions"
            />
          )}
          {showClearButton && query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="search-dropdown__clear"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {error && (
          <div id="search-error" className="search-dropdown__error" role="alert">
            {error}
          </div>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div 
          ref={dropdownRef}
          className="search-dropdown__suggestions"
          role="listbox"
          aria-label="City suggestions"
        >
          {isLoading && suggestions.length === 0 && (
            <div className="search-dropdown__loading-message">
              <Loader2 size={16} className="search-dropdown__loading-icon" />
              Searching cities...
            </div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              ref={el => suggestionRefs.current[index] = el}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`search-dropdown__suggestion ${
                index === selectedIndex ? 'search-dropdown__suggestion--selected' : ''
              } ${suggestion.type === 'us' ? 'search-dropdown__suggestion--us' : 'search-dropdown__suggestion--international'}`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <MapPin 
                size={14} 
                className="search-dropdown__suggestion-icon"
                aria-hidden="true"
              />
              <div className="search-dropdown__suggestion-content">
                <span className="search-dropdown__suggestion-name">
                  {suggestion.displayName}
                </span>
                {suggestion.type === 'us' && (
                  <span className="search-dropdown__suggestion-badge">
                    US
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import {
  getAutocompleteSuggestions,
  debounce,
  validateSearchQuery,
} from "@/services/searchApi";
import "@/styles/components.css";

/**
 * HeaderSearchDropdown Component
 * Real-time search dropdown specifically designed for the header search
 * Maintains all header-specific features and styles while adding dropdown functionality
 */
const HeaderSearchDropdown = ({
  onSelect,
  onClear,
  placeholder = "Enter city name (e.g., London, New York, Tokyo)",
  value = "",
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  isSearchActive,
  setIsSearchActive,
  isSearching = false,
  inputRef,
  className = "",
  maxSuggestions = 8,
  minQueryLength = 1,
  debounceMs = 250,
  prioritizeUS = true,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);
  const suggestionRefs = useRef([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < minQueryLength) {
        setSuggestions([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const results = await getAutocompleteSuggestions(query, maxSuggestions);

        // Extract the data array from the API response
        // Ensure we always have an array, even if the API response is malformed
        const suggestionsData = Array.isArray(results?.data)
          ? results.data
          : [];
        setSuggestions(suggestionsData);
      } catch (err) {
        console.error("Header search suggestions error:", err);
        setError("Failed to load suggestions");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [maxSuggestions, minQueryLength, debounceMs, prioritizeUS]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(e);
    setSelectedIndex(-1);

    if (inputValue.trim().length >= minQueryLength) {
      setIsOpen(true);
      debouncedSearch(inputValue.trim());
    } else {
      setIsOpen(false);
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    const selectedValue = suggestion.displayName;

    // Create synthetic event for onChange
    const syntheticEvent = {
      target: { value: selectedValue },
      preventDefault: () => {},
      stopPropagation: () => {},
    };

    onChange(syntheticEvent);
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
        type: suggestion.type,
        fullQuery: selectedValue,
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case "Enter":
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        if (inputRef && inputRef.current) {
          inputRef.current.blur();
        }
        break;
    }
  };

  // Handle input focus
  const handleFocus = (e) => {
    setIsSearchActive(true);
    if (value.trim().length >= minQueryLength) {
      setIsOpen(true);
      debouncedSearch(value.trim());
    }
    if (onFocus) {
      onFocus(e);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay closing to allow dropdown interaction
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isDropdownClick =
        dropdownRef.current?.contains(activeElement) ||
        suggestionRefs.current.some((ref) => ref?.contains(activeElement));

      if (!isDropdownClick) {
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 150);

    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle clear button click
  const handleClear = (shouldClose = false) => {
    const syntheticEvent = {
      target: { value: "" },
      preventDefault: () => {},
      stopPropagation: () => {},
    };

    onChange(syntheticEvent);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    if (onClear) {
      onClear();
    }

    // Only refocus if we're not closing the search entirely
    if (!shouldClose && inputRef && inputRef.current) {
      inputRef.current.focus();
    } else if (shouldClose && inputRef && inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`header-search-dropdown ${className}`}>
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
            if (!isSearching && inputRef && inputRef.current) {
              setIsSearchActive(true);
              inputRef.current.focus();
            }
          }}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="search-form__input"
          aria-label="Search location"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-describedby={error ? "header-search-error" : undefined}
        />

        {isLoading && (
          <Loader2
            size={16}
            className="search-form__loading"
            aria-label="Loading suggestions"
          />
        )}

        {(isSearchActive || value) && !isLoading && (
          <button
            type="button"
            aria-label="Clear search and close"
            className="search-form__clear"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Clearing search and closing");
              handleClear(true); // Pass true to indicate we want to close the search
              setIsSearchActive(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent input blur
            }}
            disabled={disabled}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <div
          id="header-search-error"
          className="search-form__error"
          role="alert"
        >
          {error}
        </div>
      )}

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div
          ref={dropdownRef}
          className="header-search-dropdown__suggestions"
          role="listbox"
          aria-label="City suggestions"
        >
          {isLoading && suggestions.length === 0 && (
            <div className="header-search-dropdown__loading-message">
              <Loader2
                size={16}
                className="header-search-dropdown__loading-icon"
              />
              Searching cities...
            </div>
          )}

          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              ref={(el) => (suggestionRefs.current[index] = el)}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`header-search-dropdown__suggestion ${
                index === selectedIndex
                  ? "header-search-dropdown__suggestion--selected"
                  : ""
              } ${
                suggestion.type === "us"
                  ? "header-search-dropdown__suggestion--us"
                  : "header-search-dropdown__suggestion--international"
              }`}
              role="option"
              aria-selected={index === selectedIndex}
              type="button"
            >
              <MapPin
                size={14}
                className="header-search-dropdown__suggestion-icon"
                aria-hidden="true"
              />
              <div className="header-search-dropdown__suggestion-content">
                <span className="header-search-dropdown__suggestion-name">
                  {suggestion.displayName}
                </span>
                {suggestion.type === "us" && (
                  <span className="header-search-dropdown__suggestion-badge">
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

export default HeaderSearchDropdown;

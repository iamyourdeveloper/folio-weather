# Changelog

All notable changes to this project will be documented in this file.

This project follows a human-friendly, date-based changelog.

## Start Date: 08-28-2025.

## [Major Search System Update] - September 2025

### Added

#### 🔍 Comprehensive Search System

- **US Cities Database**: Added database of 15,000+ US cities with complete state mapping and coordinate disambiguation
- **Advanced Search API**: New `/api/search` endpoints with autocomplete, state filtering, statistics, and caching
- **Real-time Autocomplete**: Intelligent search suggestions with US city prioritization and 300ms debouncing
- **Search Caching**: Performance optimization with configurable TTL (15-30 minutes) using custom middleware
- **State-Specific Searches**: Search cities by US state name or abbreviation (e.g., "California" returns CA cities)
- **US City State Display**: All US cities now display with proper state information (e.g., "Springfield, IL")

#### 🎨 Enhanced UI Components

- **SearchDropdown Component**: New real-time search dropdown with keyboard navigation and accessibility
- **Connection Status**: Real-time network connectivity monitoring with auto-reconnection attempts
- **Top Bar Progress**: Global loading indicator bound to all React Query activity
- **Enhanced Header Search**: Mobile-optimized search with improved state management and form resets

#### ⚡ Performance & API Enhancements

- **Search Cache System**: Intelligent middleware for caching search results with automatic cleanup
- **Coordinate Disambiguation**: Smart handling of duplicate city names using geographic coordinates
- **Search Statistics API**: Database analytics and metrics endpoint for monitoring and optimization
- **Enhanced Error Handling**: Improved location error handling for international cities and edge cases

### Enhanced (Previous Features)

- Header: small live temperature badge showing today's current temperature for the active location (matches Home). Updates immediately after searches and when switching locations/favorites/units.
- Favorites: drag-and-drop reordering on the Favorites page.
- Home page favorites slider with accessible controls.
- Favorited indicator (filled heart) when a location is already saved.
- Favorites auto-rotate on app load when geolocation is unavailable (cycles through saved locations across page loads).
- API Test page at `/test` for validating backend connectivity and endpoints.
- Global top-bar progress indicator bound to React Query fetching state.
- Error Boundary fallback UI wrapping the entire app.
- Home: "Random City" quick action to preview weather for a randomly selected popular city.
- Settings: staged changes with explicit Save (toast confirmation), live theme preview before saving, and a reset-to-defaults action (defaults to Fahrenheit). Unit changes surface a brief "Refreshing weather…" indicator.

### Changed

- Standardized frontend URL to `http://localhost:3000` across code and docs; simplified backend CORS origins.
- Documentation refreshed to match implemented features (Favorites, Query caching, Error Boundary, Test page).

### Fixed

- Favorites reliability: unified support for both `city` and `name` structures, preventing TypeErrors and mismatches.
- Favorites duplicate prevention and consistent comparison by city/name + country.
- Favorites data integrity: validation and recovery for corrupted `localStorage` entries.

### Changed

- URL configuration updates explored `3001`, then aligned the project to a single source of truth via `FRONTEND_URL`.
- Introduced Chat History documentation system and session indexing.

---

For earlier phases and a narrative of development, see `Chat History/Development-Session-Overview.md`.

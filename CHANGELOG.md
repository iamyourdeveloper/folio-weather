# Changelog

All notable changes to this project will be documented in this file.

This project follows a human-friendly, date-based changelog.

## Start Date: 08-28-2025.

### Added

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

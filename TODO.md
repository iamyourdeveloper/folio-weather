# Project TODOs

This TODO reflects the current, implemented state of FolioWeather and outlines next steps.

## Completed (Core Features)

- Frontend (React 19 + Vite) with responsive, modern UI
- Backend (Express) with OpenWeatherMap integration and REST endpoints
- Geolocation for current location weather
- **Advanced city search system with 15,000+ US cities database and real-time autocomplete**
- **US cities display with proper state information (e.g., "Springfield, IL")**
- **Comprehensive search API with caching, state filtering, and statistics**
- **Real-time search dropdown with debouncing and smart prioritization**
- City search with current + 5‑day forecast
- Favorites: add/remove, duplicate prevention, drag‑and‑drop reorder
- Home: favorites slider with accessible controls; Random City quick action
- Header: live temperature + location badge synchronized with active location
- **Enhanced header search with mobile optimization and improved state management**
- Settings: temperature units (C/F/K), theme (light/dark/auto), display toggles; staged changes with Save + toast; live theme preview; reset to defaults; refresh indicator on unit changes
- Error handling: Error Boundary, graceful API errors, global top‑bar progress indicator
- **Connection status monitoring with real-time network awareness**
- API Test page at `/test`

## Next Up (High Priority)

- PWA: install prompt, offline caching, basic fallback pages
- Hourly forecast view and additional daily details (precipitation probability, UV)
- Weather alerts/notifications (browser notifications, severe weather)
- Persistence: user accounts + MongoDB to sync favorites and preferences
- Accessibility pass: keyboard DnD reordering, ARIA for slider controls, color contrast checks
- Testing: add unit and integration tests (vitest) for hooks/services; consider Playwright for E2E
- Deployment: CI build, preview environments, production deploy (Vercel/Netlify + Railway)

## Backlog / Ideas

- Weather maps/radar layer; air quality index
- Multi-source weather providers with fallback
- Shareable links for saved locations and views
- GraphQL or WebSocket upgrades for real‑time updates

## Practice: Fetch & Promises

- Use the Test page at `/test` to experiment with concurrent requests, retries, and error handling.
- See `NEXT_STEPS.md` under “Learning Opportunities” for hands-on exercises and examples.

Keep this list current as features land; update CHANGELOG entries alongside notable changes.

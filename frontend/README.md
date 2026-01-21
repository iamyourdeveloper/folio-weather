# FolioWeather Frontend (React + Vite)

This is the React 19 frontend for FolioWeather. It provides a responsive, modern UI for searching weather, viewing forecasts, managing favorites, and adjusting settings. It communicates with the backend via `/api/*` routes (proxied to port 8000 in development).

## Quick Start

1) Install dependencies

```bash
cd frontend
npm install
```

2) Start the dev server

```bash
npm run dev
```

By default, the app runs at `http://localhost:3000` and proxies API calls to `http://localhost:8000/api` (see `VITE_API_BASE_URL` in `frontend/.env.development`).

## Environment

Copy the example and adjust as needed:

```bash
cp .env.example .env
```

The UI always displays the hard-coded app name `FolioWeather`, so no environment variable is required for the title.

Key variables:

- `VITE_API_BASE_URL`: Backend API base (default `http://localhost:8000/api`)
- `VITE_DEBUG`: Enable verbose console logs when `true`
- `VITE_ENABLE_GEOLOCATION`: Toggle geolocation features

## Notable Features

- Real-time header search with autocomplete and US city prioritization
- Advanced Search page with curated regions, sort modes, and progressive loading
- Home favorites slider + quick actions (Random City, Use My Location)
- Header weather badge with live temperature + smooth scroll to current weather
- Favorites management with drag-and-drop reordering and duplicate prevention
- Forecast toggle resets on new searches or favorite selection
- Settings with staged save, live theme preview, and unit selection
- Global top-bar progress tied to React Query activity
- Error Boundary, connection status indicator, and graceful error handling

## Development Notes

- UI components live under `src/components/` (layout, ui, weather, common)
- State: `src/context/` and hooks in `src/hooks/`
- API and search logic: `src/services/` and `src/utils/`
- Styles: `src/styles/` split by app, components, pages, and search

For full-stack setup, docs, and backend details, see the project root `README.md` and `docs/`.

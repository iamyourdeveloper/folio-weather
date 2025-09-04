# Test Files Organization

This directory contains all test files organized by purpose and type.

## Directory Structure

### `/api/` - API Integration Tests

- `test-api.mjs` - Basic API connectivity tests
- `test-api-location-fix.mjs` - Location API specific tests
- `test-connection.mjs` - Connection and health check tests

### `/integration/` - Integration Tests

- `test-header-search*.mjs` - Header search functionality tests (8 files)
- `test-header-dropdown*.mjs` - Header dropdown functionality tests (3 files)
- `test-mobile-search-alignment.mjs` - Mobile search alignment tests
- `test-realtime-dropdown.mjs` - Real-time dropdown functionality
- `test-location-fix.mjs` - Location service integration tests
- `test-comprehensive-city-state-search.mjs` - Comprehensive search tests

### `/development/` - Development & Debug Tests

- `demo-us-cities-solution.mjs` - US cities solution demo
- `test-formatting*.mjs` - Data formatting tests (3 files)
- `test-pagination.mjs` - Pagination functionality tests
- `test-fixes.js` - General fix validation tests
- `test-search-*.js` - Search functionality tests (4 files)
- `test-random-cities.js` - Random city selection tests
- `test-location-*.mjs` - Location enhancement and error fix tests (2 files)
- `test-comprehensive-city-search.mjs` - Comprehensive city search tests
- `test-us-city-state-display.mjs` - US city state display tests
- `test-weather-api-state-integration.mjs` - Weather API state integration

### `/performance/` - Performance Tests

Currently empty - reserved for future performance testing scripts.

## Usage

Run tests from the project root:

```bash
# API tests
node tests/api/test-api.mjs

# Integration tests
node tests/integration/test-header-search-final.mjs

# Development tests
node tests/development/test-formatting.mjs
```

## Notes

- All `.mjs` files use ES modules
- All `.js` files use CommonJS or are configured for ES modules
- Tests are designed to run against the development server (localhost:3000/8000)
- Ensure both frontend and backend servers are running before executing tests

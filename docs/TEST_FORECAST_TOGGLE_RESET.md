# Testing Guide: Forecast Toggle Reset on Favorite Location Click

This guide walks through testing the new feature where clicking on a favorite location on the Home page resets the forecast toggle button back to "View Forecast".

## Prerequisites

- Weather app is running (Frontend: http://localhost:3004, Backend: http://localhost:8001)
- You have at least one favorite location saved
- Home page shows current weather data

## Test Steps

### 1. Open the Home Page

Navigate to http://localhost:3004 in your browser.

### 2. Verify Initial State

- You should see current weather for your location or a default city
- Look for the "View Forecast" button in the weather card
- If favorites exist, you'll see them in the "Favorite Locations" section

### 3. Show the 5-Day Forecast

1. Click the "View Forecast" button in the current weather card
2. **Expected:**
   - Button text changes to "Hide Forecast"
   - 5-day forecast section appears below
   - Page may auto-scroll to show the forecast

### 4. Click on a Favorite Location

1. Scroll down to the "Favorite Locations" section (if not visible)
2. Click on any favorite location card
3. **Expected:**
   - Weather data updates for the clicked location
   - Page scrolls up to show the new weather data
   - **IMPORTANT:** The forecast button should now show "View Forecast" again (not "Hide Forecast")
   - The 5-day forecast section should be hidden

### 5. Verify the Reset Functionality

After clicking a favorite location, check:

- ✅ Weather card shows data for the new location
- ✅ Forecast button text is "View Forecast" (reset state)
- ✅ 5-day forecast section is not visible
- ✅ You can click "View Forecast" again to show the forecast for the new location

### 6. Test Multiple Favorites

Repeat step 4 with different favorite locations to ensure the reset works consistently.

## What Should Happen

- **Before the fix:** Clicking a favorite location would leave the button showing "Hide Forecast" even though the forecast was hidden
- **After the fix:** Clicking a favorite location resets the button to "View Forecast" and hides the forecast section

## Test with Browser Console (Optional)

You can also run the automated test script:

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Copy and paste the content of `/tests/frontend/test-favorite-forecast-toggle-reset.js`
4. Press Enter to run the test
5. Watch the console output for test results

## Expected Console Logs

When the feature works correctly, you should see logs like:

- `✅ Scrolled to forecast section on HomePage` (when showing forecast)
- Weather API calls when switching between locations

## Troubleshooting

- If no favorite locations are visible, add some by:
  1. Going to the Search page
  2. Searching for a city
  3. Clicking "Add to Favorites" on the weather card
- If weather data isn't loading, check the browser console for API errors
- Ensure both frontend and backend servers are running

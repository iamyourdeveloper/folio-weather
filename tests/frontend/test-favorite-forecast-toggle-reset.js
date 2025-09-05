/**
 * Test script to verify that clicking favorite locations resets the forecast toggle
 *
 * Usage: Run this in the browser console on the HomePage
 */

console.log("🧪 Starting test: Favorite location click resets forecast toggle");

// Helper function to wait for element
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

// Helper to simulate click
const simulateClick = (element) => {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
};

// Test the forecast toggle reset functionality
async function testForecastToggleReset() {
  try {
    console.log("1️⃣ Looking for weather card...");

    // Wait for the weather card to load
    const weatherCard = await waitForElement(".weather-card");
    console.log("✅ Weather card found");

    // Find the forecast toggle button
    const forecastButton = weatherCard.querySelector(
      ".weather-card__actions button"
    );
    if (!forecastButton) {
      throw new Error("Forecast toggle button not found");
    }

    console.log("2️⃣ Initial button text:", forecastButton.textContent.trim());

    // If button shows "View Forecast", click it to show forecast
    if (forecastButton.textContent.includes("View Forecast")) {
      console.log("3️⃣ Clicking forecast button to show forecast...");
      simulateClick(forecastButton);

      // Wait a moment for the button to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(
        "4️⃣ Button text after click:",
        forecastButton.textContent.trim()
      );

      if (!forecastButton.textContent.includes("Hide Forecast")) {
        throw new Error(
          'Expected button to show "Hide Forecast" after clicking'
        );
      }
    }

    // Look for favorite locations
    console.log("5️⃣ Looking for favorite locations...");
    const favoriteItems = document.querySelectorAll(".favorite-item");

    if (favoriteItems.length === 0) {
      console.log("⚠️ No favorite locations found. Test cannot continue.");
      return;
    }

    console.log(`6️⃣ Found ${favoriteItems.length} favorite locations`);

    // Click the first favorite location
    const firstFavorite = favoriteItems[0];
    const favoriteName =
      firstFavorite.querySelector(".forecast-card__location")?.textContent ||
      "Unknown";

    console.log(`7️⃣ Clicking favorite location: ${favoriteName}`);
    simulateClick(firstFavorite);

    // Wait for the page to update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the forecast button has reset to "View Forecast"
    const updatedButton = document.querySelector(
      ".weather-card__actions button"
    );
    if (!updatedButton) {
      throw new Error("Forecast button not found after clicking favorite");
    }

    console.log(
      "8️⃣ Button text after clicking favorite:",
      updatedButton.textContent.trim()
    );

    if (updatedButton.textContent.includes("View Forecast")) {
      console.log(
        '✅ SUCCESS: Forecast toggle correctly reset to "View Forecast"'
      );
    } else {
      console.log(
        "❌ FAIL: Forecast toggle did not reset. Current text:",
        updatedButton.textContent.trim()
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testForecastToggleReset();

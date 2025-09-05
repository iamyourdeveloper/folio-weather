// Test script for Random City scroll functionality
// Run this in the browser console to test the scroll behavior

console.log("🧪 Testing Random City scroll functionality");

// Function to simulate clicking the Random City button
function testRandomCityScroll() {
  console.log("🔍 Looking for Random City button...");

  // Find the Random City button
  const randomCityButton = document.querySelector(
    'button[aria-label="Show a random city\'s weather"]'
  );

  if (!randomCityButton) {
    console.error("❌ Random City button not found!");
    return;
  }

  console.log("✅ Random City button found");
  console.log("📍 Current scroll position:", window.scrollY);

  // Click the button
  randomCityButton.click();
  console.log("🎯 Random City button clicked");

  // Check scroll position after a delay
  setTimeout(() => {
    console.log("📍 New scroll position after 1 second:", window.scrollY);

    // Look for the weather section
    const weatherSection = document.querySelector(".home-weather");
    if (weatherSection) {
      const rect = weatherSection.getBoundingClientRect();
      console.log("🌤️ Weather section position:", {
        top: rect.top,
        bottom: rect.bottom,
        inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
      });

      if (rect.top >= 0 && rect.top <= 100) {
        console.log(
          "✅ SUCCESS: Weather section is at the top of the viewport"
        );
      } else {
        console.log("⚠️ Weather section position may need adjustment");
      }
    } else {
      console.log("❌ Weather section not found");
    }
  }, 1000);
}

// Run the test
testRandomCityScroll();

// Export for manual testing
window.testRandomCityScroll = testRandomCityScroll;

console.log("💡 You can run testRandomCityScroll() manually to test again");

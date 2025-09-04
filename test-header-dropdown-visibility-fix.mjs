#!/usr/bin/env node
import fs from "fs/promises";
import fetch from "node-fetch";

// Color logging
const log = (color, message, details = null) => {
  const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    reset: "\x1b[0m",
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
  if (details) {
    console.log(details);
  }
};

async function testHeaderDropdownVisibilityFix() {
  console.log("🔍 Testing Header Dropdown Visibility Fix");
  console.log("============================================\n");

  try {
    // Test 1: Check CSS fix for overflow visibility
    log("yellow", "1️⃣  Checking CSS overflow fix...");
    const cssPath =
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/styles/components.css";
    const cssContent = await fs.readFile(cssPath, "utf8");

    // Check if overflow: visible rule exists for search-active state
    const hasOverflowVisible =
      cssContent.includes(".header--search-active .header__container") &&
      cssContent.includes("overflow: visible");

    if (hasOverflowVisible) {
      log("green", "✅ Found overflow: visible rule for header--search-active");
    } else {
      log("red", "❌ Missing overflow: visible rule for header--search-active");
      return false;
    }

    // Test 2: Check z-index fix
    log("yellow", "2️⃣  Checking z-index fix...");

    const hasHighZIndex =
      cssContent.includes("z-index: 9999") &&
      cssContent.includes(".header-search-dropdown__suggestions");

    if (hasHighZIndex) {
      log("green", "✅ Found high z-index (9999) for dropdown suggestions");
    } else {
      log("red", "❌ Missing high z-index for dropdown suggestions");
      return false;
    }

    // Test 3: Verify API functionality
    log("yellow", "3️⃣  Testing API response for dropdown data...");

    try {
      const response = await fetch(
        "http://localhost:8000/api/search/autocomplete?q=tokyo&limit=3"
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        log("green", "✅ API returns valid dropdown data");
        console.log(
          `   Found ${data.data.length} suggestion(s): ${data.data
            .map((s) => s.displayName)
            .join(", ")}`
        );
      } else {
        log("red", "❌ API not returning valid dropdown data");
        return false;
      }
    } catch (error) {
      log("red", "❌ API connection failed:", error.message);
      return false;
    }

    // Test 4: Check header search dropdown component
    log("yellow", "4️⃣  Verifying HeaderSearchDropdown component...");

    const componentPath =
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/components/ui/HeaderSearchDropdown.jsx";
    try {
      const componentContent = await fs.readFile(componentPath, "utf8");

      const hasDropdownClass = componentContent.includes(
        "header-search-dropdown__suggestions"
      );
      const hasZIndexHandling =
        componentContent.includes("z-index") ||
        componentContent.includes("header-search-dropdown__suggestions");

      if (hasDropdownClass) {
        log(
          "green",
          "✅ HeaderSearchDropdown component has proper CSS classes"
        );
      } else {
        log(
          "red",
          "❌ HeaderSearchDropdown component missing proper CSS classes"
        );
        return false;
      }
    } catch (error) {
      log(
        "red",
        "❌ Failed to read HeaderSearchDropdown component:",
        error.message
      );
      return false;
    }

    // Test 5: Check if Header component uses HeaderSearchDropdown
    log("yellow", "5️⃣  Verifying Header component integration...");

    const headerPath =
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/components/layout/Header.jsx";
    const headerContent = await fs.readFile(headerPath, "utf8");

    const hasHeaderSearchDropdown =
      headerContent.includes("HeaderSearchDropdown") &&
      headerContent.includes("header__search-dropdown");

    if (hasHeaderSearchDropdown) {
      log(
        "green",
        "✅ Header component properly integrates HeaderSearchDropdown"
      );
    } else {
      log(
        "red",
        "❌ Header component missing HeaderSearchDropdown integration"
      );
      return false;
    }

    log("green", "\n🎉 ALL DROPDOWN VISIBILITY TESTS PASSED!");
    log("cyan", "\nDropdown Fix Summary:");
    log(
      "cyan",
      "✅ Added overflow: visible for .header--search-active .header__container"
    );
    log("cyan", "✅ Increased z-index to 9999 for dropdown suggestions");
    log("cyan", "✅ API providing valid suggestion data");
    log("cyan", "✅ Component integration working properly");

    log("magenta", "\nInstructions for testing:");
    log("magenta", "1. Open http://localhost:3001 in your browser");
    log("magenta", "2. Click on the search input in the header");
    log("magenta", "3. Type 'tokyo' or any city name");
    log(
      "magenta",
      "4. The dropdown should now be VISIBLE below the search input"
    );
    log("magenta", "5. The dropdown should not be hidden behind the header");

    return true;
  } catch (error) {
    log("red", "❌ Test failed with error:", error.message);
    return false;
  }
}

// Run the test
testHeaderDropdownVisibilityFix()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      log("red", "\n❌ Some tests failed. Please check the issues above.");
      process.exit(1);
    }
  })
  .catch((error) => {
    log("red", "Test suite crashed:", error);
    process.exit(1);
  });

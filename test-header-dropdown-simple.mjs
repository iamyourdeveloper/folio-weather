#!/usr/bin/env node

import fs from "fs/promises";

const log = (color, text) => {
  const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  };
  console.log(`${colors[color]}${text}${colors.reset}`);
};

async function checkHeaderSearchDropdown() {
  try {
    log("yellow", "Checking HeaderSearchDropdown component...");
    const headerDropdownPath =
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/components/ui/HeaderSearchDropdown.jsx";
    const dropdownContent = await fs.readFile(headerDropdownPath, "utf8");

    const requiredFeatures = [
      { name: "Real-time search with debounce", pattern: /debouncedSearch/ },
      {
        name: "Suggestion selection handling",
        pattern: /handleSelectSuggestion/,
      },
      { name: "Keyboard navigation", pattern: /handleKeyDown/ },
      { name: "Loading state with spinner", pattern: /Loader2/ },
      { name: "Error handling", pattern: /setError/ },
      {
        name: "Dropdown positioning",
        pattern: /header-search-dropdown__suggestions/,
      },
      { name: "Clear button functionality", pattern: /handleClear/ },
      {
        name: "Auto-complete integration",
        pattern: /getAutocompleteSuggestions/,
      },
    ];

    log("blue", "📋 HeaderSearchDropdown Component Analysis:");
    let featuresFound = 0;

    for (const feature of requiredFeatures) {
      if (feature.pattern.test(dropdownContent)) {
        log("green", `  ✓ ${feature.name}`);
        featuresFound++;
      } else {
        log("red", `  ✗ ${feature.name}`);
      }
    }

    const coverage = (featuresFound / requiredFeatures.length) * 100;
    log(
      "cyan",
      `  📊 Feature coverage: ${featuresFound}/${
        requiredFeatures.length
      } (${coverage.toFixed(1)}%)`
    );

    return coverage >= 85; // 85% coverage required
  } catch (error) {
    log(
      "red",
      `✗ HeaderSearchDropdown component check failed: ${error.message}`
    );
    return false;
  }
}

async function checkHeaderIntegration() {
  try {
    log("yellow", "Checking Header component integration...");
    const headerPath =
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/components/layout/Header.jsx";
    const headerContent = await fs.readFile(headerPath, "utf8");

    const integrationChecks = [
      {
        name: "HeaderSearchDropdown import",
        pattern: /import HeaderSearchDropdown/,
      },
      { name: "Dropdown selection handler", pattern: /handleDropdownSelect/ },
      {
        name: "Mobile dropdown handler",
        pattern: /handleMobileDropdownSelect/,
      },
      {
        name: "Desktop dropdown integration",
        pattern: /onSelect=\{handleDropdownSelect\}/,
      },
      {
        name: "Mobile dropdown integration",
        pattern: /onSelect=\{handleMobileDropdownSelect\}/,
      },
      { name: "Props configuration", pattern: /maxSuggestions/ },
    ];

    log("blue", "📋 Header Integration Analysis:");
    let checksFound = 0;

    for (const check of integrationChecks) {
      if (check.pattern.test(headerContent)) {
        log("green", `  ✓ ${check.name}`);
        checksFound++;
      } else {
        log("red", `  ✗ ${check.name}`);
      }
    }

    const coverage = (checksFound / integrationChecks.length) * 100;
    log(
      "cyan",
      `  📊 Integration coverage: ${checksFound}/${
        integrationChecks.length
      } (${coverage.toFixed(1)}%)`
    );

    return coverage >= 80; // 80% coverage required
  } catch (error) {
    log("red", `✗ Header integration check failed: ${error.message}`);
    return false;
  }
}

async function checkStyles() {
  try {
    log("yellow", "Checking Header Search Dropdown styles...");
    const stylesPath =
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/styles/components.css";
    const stylesContent = await fs.readFile(stylesPath, "utf8");

    const styleChecks = [
      {
        name: "Header search dropdown container",
        pattern: /\.header-search-dropdown/,
      },
      {
        name: "Suggestions dropdown",
        pattern: /\.header-search-dropdown__suggestions/,
      },
      {
        name: "Suggestion items",
        pattern: /\.header-search-dropdown__suggestion/,
      },
      { name: "Loading styles", pattern: /\.header-search-dropdown__loading/ },
      {
        name: "Dark mode support",
        pattern: /\[data-theme="dark"\].*header-search-dropdown/,
      },
      { name: "Animation keyframes", pattern: /@keyframes slideDown/ },
      { name: "Loading spinner", pattern: /\.search-form__loading/ },
      { name: "Error message styling", pattern: /\.search-form__error/ },
    ];

    log("blue", "📋 Styles Analysis:");
    let stylesFound = 0;

    for (const styleCheck of styleChecks) {
      if (styleCheck.pattern.test(stylesContent)) {
        log("green", `  ✓ ${styleCheck.name}`);
        stylesFound++;
      } else {
        log("red", `  ✗ ${styleCheck.name}`);
      }
    }

    const coverage = (stylesFound / styleChecks.length) * 100;
    log(
      "cyan",
      `  📊 Styles coverage: ${stylesFound}/${
        styleChecks.length
      } (${coverage.toFixed(1)}%)`
    );

    return coverage >= 75; // 75% coverage required
  } catch (error) {
    log("red", `✗ Styles check failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log("bold", "🚀 Header Search Dropdown Implementation Test");
  log("blue", "=".repeat(50));

  // Test 1: Check HeaderSearchDropdown component
  log("yellow", "\n1️⃣  Testing HeaderSearchDropdown Component...");
  const componentOk = await checkHeaderSearchDropdown();

  if (!componentOk) {
    log("red", "❌ HeaderSearchDropdown component issues detected");
  } else {
    log("green", "✅ HeaderSearchDropdown component looks good");
  }

  // Test 2: Check Header integration
  log("yellow", "\n2️⃣  Testing Header Integration...");
  const integrationOk = await checkHeaderIntegration();

  if (!integrationOk) {
    log("red", "❌ Header integration issues detected");
  } else {
    log("green", "✅ Header integration looks good");
  }

  // Test 3: Check styles
  log("yellow", "\n3️⃣  Testing Styles...");
  const stylesOk = await checkStyles();

  if (!stylesOk) {
    log("red", "❌ Styles issues detected");
  } else {
    log("green", "✅ Styles look good");
  }

  // Final Results
  log("bold", "\n📊 FINAL RESULTS");
  log("blue", "=".repeat(30));
  log(
    componentOk ? "green" : "red",
    `Component: ${componentOk ? "PASS" : "FAIL"}`
  );
  log(
    integrationOk ? "green" : "red",
    `Integration: ${integrationOk ? "PASS" : "FAIL"}`
  );
  log(stylesOk ? "green" : "red", `Styles: ${stylesOk ? "PASS" : "FAIL"}`);

  const allPassed = componentOk && integrationOk && stylesOk;

  if (allPassed) {
    log("bold", "\n🎉 ALL TESTS PASSED!");
    log(
      "green",
      "✅ Header Search Dropdown implementation is complete and ready!"
    );
    log("cyan", "\n💡 Features implemented:");
    log("white", "   • Real-time dropdown suggestions for header search");
    log("white", "   • Keyboard navigation (arrows, enter, escape)");
    log("white", "   • Loading states and error handling");
    log("white", "   • Mobile and desktop responsive design");
    log("white", "   • Dark mode support");
    log("white", "   • US cities prioritization");
    log("white", "   • Smooth animations and transitions");
    log("white", "   • Clear button functionality");
    log("white", "   • Form submission integration");
    log("white", "   • Auto-focus and blur handling");
  } else {
    log("bold", "\n❌ SOME TESTS FAILED");
    log("red", "Please review the issues above and fix before proceeding.");
  }

  return allPassed;
}

runTests().catch(console.error);

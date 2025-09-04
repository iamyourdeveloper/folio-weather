// Simple test for location formatting functions

class TestWeatherService {
  /**
   * Format location name to proper case (Title Case)
   * @param {string} locationName - Location name to format
   * @returns {string} Properly formatted location name
   */
  formatLocationName(locationName) {
    if (!locationName || typeof locationName !== "string") {
      return locationName;
    }

    return locationName
      .split(",")
      .map((part) => part.trim())
      .map((part) => {
        // Handle special cases for state/country codes that should remain uppercase
        if (/^[A-Z]{2,3}$/.test(part.trim())) {
          return part.toUpperCase();
        }

        // Handle words that should remain lowercase (prepositions, articles, etc.)
        const lowercaseWords = [
          "of",
          "the",
          "and",
          "de",
          "da",
          "do",
          "dos",
          "das",
        ];

        return part
          .split(" ")
          .map((word, index) => {
            const cleanWord = word.trim();
            if (!cleanWord) return cleanWord;

            // First word is always capitalized
            if (index === 0) {
              return this.capitalizeWord(cleanWord);
            }

            // Check if word should remain lowercase
            if (lowercaseWords.includes(cleanWord.toLowerCase())) {
              return cleanWord.toLowerCase();
            }

            return this.capitalizeWord(cleanWord);
          })
          .join(" ");
      })
      .join(", ");
  }

  /**
   * Capitalize a single word properly
   * @param {string} word - Word to capitalize
   * @returns {string} Properly capitalized word
   */
  capitalizeWord(word) {
    if (!word || typeof word !== "string") {
      return word;
    }

    // Handle special cases like "McDonald", "O'Connor", etc.
    if (word.includes("'")) {
      return word
        .split("'")
        .map((part, index) => {
          if (index === 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }
          // Capitalize after apostrophe for names like O'Connor
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("'");
    }

    // Handle hyphenated words like "Saint-Denis"
    if (word.includes("-")) {
      return word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-");
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}

const weatherService = new TestWeatherService();

// Test cases for location name formatting
const testCases = [
  "new york, ny",
  "NEW YORK, NY",
  "london, uk",
  "baltimore, md",
  "paris, france",
  "tokyo, jp",
  "los angeles, ca",
  "san francisco, california",
  "washington d.c.",
  "st. louis, mo",
  "las vegas, nevada",
  "o'connor, ireland",
  "saint-denis, france",
  "new orleans, la",
  "fort worth, tx",
];

console.log("Testing Location Name Formatting:");
console.log("=====================================");

testCases.forEach((testCase) => {
  const formatted = weatherService.formatLocationName(testCase);
  console.log(`"${testCase}" → "${formatted}"`);
});

console.log("\n");
console.log("Testing Individual Word Capitalization:");
console.log("======================================");

const wordTestCases = [
  "new",
  "york",
  "o'connor",
  "saint-denis",
  "washington",
  "ny",
  "usa",
  "uk",
];

wordTestCases.forEach((word) => {
  const formatted = weatherService.capitalizeWord(word);
  console.log(`"${word}" → "${formatted}"`);
});

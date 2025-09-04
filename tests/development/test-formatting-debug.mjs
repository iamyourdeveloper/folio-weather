#!/usr/bin/env node

// Simple test to debug location name formatting
console.log("🧪 Testing location name formatting functions...\n");

// Replicate the formatLocationName logic
function capitalizeWord(word) {
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
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("-");
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatLocationName(locationName) {
  if (!locationName || typeof locationName !== "string") {
    return locationName;
  }

  console.log(`\n🔍 Debugging "${locationName}":`);

  return locationName
    .split(",")
    .map((part) => part.trim())
    .map((part) => {
      console.log(`  Processing part: "${part}"`);

      // Handle special cases for state/country codes that should remain uppercase
      // Only match parts that are ONLY 2-3 letters and standalone (not part of a longer name)
      if (/^[A-Z]{2,3}$/i.test(part.trim()) && part.trim().length <= 3) {
        console.log(`    → State/country code: "${part.toUpperCase()}"`);
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

          console.log(`    Word ${index}: "${cleanWord}"`);

          // Handle state/country codes within words - be more selective
          // Only treat as state/country code if it's exactly 2-3 letters and common codes
          const commonStateCodes = [
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
            "ON",
            "BC",
            "AB",
            "MB",
            "SK",
            "NS",
            "NB",
            "NL",
            "PE",
            "NT",
            "NU",
            "YT", // Canadian provinces
            "US",
            "GB",
            "CA",
            "AU",
            "FR",
            "DE",
            "IT",
            "ES",
            "MX",
            "JP",
            "CN",
            "IN",
            "BR",
            "RU", // Countries
          ];

          if (
            cleanWord.length === 2 &&
            commonStateCodes.includes(cleanWord.toUpperCase())
          ) {
            console.log(
              `      → State/country code within word: "${cleanWord.toUpperCase()}"`
            );
            return cleanWord.toUpperCase();
          } else if (
            cleanWord.length === 3 &&
            commonStateCodes.includes(cleanWord.toUpperCase())
          ) {
            console.log(
              `      → State/country code within word: "${cleanWord.toUpperCase()}"`
            );
            return cleanWord.toUpperCase();
          }

          // First word is always capitalized
          if (index === 0) {
            const result = capitalizeWord(cleanWord);
            console.log(`      → First word: "${result}"`);
            return result;
          }

          // Check if word should remain lowercase
          if (lowercaseWords.includes(cleanWord.toLowerCase())) {
            console.log(`      → Lowercase word: "${cleanWord.toLowerCase()}"`);
            return cleanWord.toLowerCase();
          }

          const result = capitalizeWord(cleanWord);
          console.log(`      → Capitalized word: "${result}"`);
          return result;
        })
        .join(" ");
    })
    .join(", ");
}

// Test different variations that might come from the API
const testCases = [
  "NEW YORK",
  "new york",
  "NEW York",
  "nEw YoRk",
  "New York",
  "NEW YORK, NY, US",
  "new york, ny, us",
  "NEW York, NY, US",
];

console.log("Testing formatLocationName function:");
testCases.forEach((testCase) => {
  const result = formatLocationName(testCase);
  console.log(`"${testCase}" → "${result}"`);
});

console.log("\nTesting capitalizeWord function individually:");
const wordTests = ["NEW", "YORK", "new", "york", "New", "York"];
wordTests.forEach((word) => {
  const result = capitalizeWord(word);
  console.log(`capitalizeWord("${word}") → "${result}"`);
});

console.log("\n✅ Formatting test complete");

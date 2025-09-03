/**
 * Test script to verify the improved search functionality
 */

// Import the updated search utils
import { parseLocationQuery } from "./frontend/src/utils/searchUtils.js";

console.log("🧪 Testing improved search functionality...\n");

// Test cases for the improved search
const testCases = [
  // Original problematic cases
  { query: "London, ON", expected: "London, ON (Canada)" },
  { query: "London Ontario", expected: "London, ON (Canada)" },
  { query: "London Canada", expected: "London, ON (Canada)" },
  { query: "Frederick, Maryland", expected: "Frederick, MD (US)" },
  { query: "Frederick Maryland", expected: "Frederick, MD (US)" },

  // Various other test cases
  { query: "London", expected: "London, ON (Canada) - prioritized" },
  { query: "London, UK", expected: "London, UK" },
  { query: "London, GB", expected: "London, GB" },
  { query: "Baltimore", expected: "Baltimore, MD (from database)" },
  { query: "Baltimore, MD", expected: "Baltimore, MD" },
  { query: "New York, NY", expected: "New York, NY" },
  { query: "New York New York", expected: "New York, NY" },
  { query: "Paris, France", expected: "Paris, France" },
  { query: "Tokyo", expected: "Tokyo (no match in DB)" },
];

testCases.forEach(({ query, expected }) => {
  try {
    const result = parseLocationQuery(query);
    console.log(`🔍 "${query}"`);
    console.log(`   ➜ City: "${result.city}", Full Name: "${result.fullName}"`);
    console.log(`   ✨ Expected: ${expected}\n`);
  } catch (error) {
    console.log(`❌ Error testing "${query}": ${error.message}\n`);
  }
});

console.log("✅ Search improvements test completed!");

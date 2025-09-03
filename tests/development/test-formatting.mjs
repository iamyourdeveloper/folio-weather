// Test script to verify location name formatting
import WeatherService from "./backend/utils/weatherService.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./backend/.env" });

const weatherService = new WeatherService();

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

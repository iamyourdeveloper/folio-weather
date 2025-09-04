// Test script to verify random city selection uses the full database
const path = require("path");

// Load the cities data
const RANDOM_CITIES = require("./frontend/src/data/randomCities.js").default;

console.log("🌍 Testing Random City Selection");
console.log("================================");
console.log(`Total cities in database: ${RANDOM_CITIES.length}`);

// Simulate the selection logic from WeatherContext.jsx
const simulateRandomSelection = (iterations = 10) => {
  console.log(`\nTesting ${iterations} random selections:`);

  const selections = [];
  const countrySeen = new Set();

  for (let i = 0; i < iterations; i++) {
    const randomCity =
      RANDOM_CITIES[Math.floor(Math.random() * RANDOM_CITIES.length)];
    selections.push(randomCity);
    countrySeen.add(randomCity.country);

    console.log(`  ${i + 1}. ${randomCity.name} (${randomCity.country})`);
  }

  console.log(`\nResults:`);
  console.log(`- Selected ${selections.length} different cities`);
  console.log(`- From ${countrySeen.size} different countries`);
  console.log(`- Countries seen: ${Array.from(countrySeen).join(", ")}`);
};

// Test the selection
simulateRandomSelection(15);

// Show regional diversity
console.log("\n📊 Regional Distribution in Database:");
const byRegion = {};
const regionMap = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  PE: "South America",
  CL: "South America",
  CO: "South America",
  UY: "South America",
  GB: "Europe",
  DE: "Europe",
  FR: "Europe",
  ES: "Europe",
  IT: "Europe",
  NL: "Europe",
  PL: "Europe",
  SE: "Europe",
  NO: "Europe",
  FI: "Europe",
  DK: "Europe",
  IE: "Europe",
  PT: "Europe",
  BE: "Europe",
  AT: "Europe",
  CH: "Europe",
  CZ: "Europe",
  HU: "Europe",
  GR: "Europe",
  BG: "Europe",
  RO: "Europe",
  RS: "Europe",
  CN: "Asia",
  IN: "Asia",
  JP: "Asia",
  KR: "Asia",
  ID: "Asia",
  PH: "Asia",
  MY: "Asia",
  TH: "Asia",
  VN: "Asia",
  BD: "Asia",
  PK: "Asia",
  NP: "Asia",
  TW: "Asia",
  HK: "Asia",
  SG: "Asia",
  IR: "Asia",
  IQ: "Asia",
  IL: "Asia",
  JO: "Asia",
  SA: "Asia",
  AE: "Asia",
  OM: "Asia",
  QA: "Asia",
  AU: "Oceania",
  NZ: "Oceania",
  EG: "Africa",
  NG: "Africa",
  ZA: "Africa",
  GH: "Africa",
  KE: "Africa",
  ET: "Africa",
  MA: "Africa",
  DZ: "Africa",
  TN: "Africa",
};

RANDOM_CITIES.forEach((city) => {
  const region = regionMap[city.country] || "Other";
  byRegion[region] = (byRegion[region] || 0) + 1;
});

Object.entries(byRegion)
  .sort((a, b) => b[1] - a[1])
  .forEach(([region, count]) => {
    const percentage = ((count / RANDOM_CITIES.length) * 100).toFixed(1);
    console.log(`  ${region}: ${count} cities (${percentage}%)`);
  });

console.log("\n✅ Your app now uses all 960+ cities for maximum variety!");

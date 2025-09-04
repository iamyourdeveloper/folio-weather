// Test script to verify the pagination feature logic
import RANDOM_CITIES from "./frontend/src/data/randomCities.js";

// Region -> country mapping for quick filtering
const REGION_COUNTRIES = {
  "North America": new Set(["US", "CA", "MX"]),
  "South America": new Set(["BR", "AR", "CL", "UY", "CO", "PE"]),
  Europe: new Set([
    "GB",
    "FR",
    "DE",
    "ES",
    "IT",
    "PT",
    "NL",
    "BE",
    "AT",
    "CH",
    "CZ",
    "PL",
    "HU",
    "RO",
    "GR",
    "BG",
    "RS",
    "DK",
    "NO",
    "SE",
    "FI",
    "IE",
  ]),
  Asia: new Set([
    "JP",
    "KR",
    "CN",
    "HK",
    "TW",
    "SG",
    "MY",
    "TH",
    "VN",
    "ID",
    "PH",
    "BD",
    "IN",
    "PK",
    "NP",
  ]),
  "Middle East": new Set(["AE", "SA", "QA", "OM", "IR", "IQ", "IL", "JO"]),
  Africa: new Set(["EG", "NG", "GH", "KE", "ET", "ZA", "MA", "TN", "DZ"]),
  Oceania: new Set(["AU", "NZ"]),
};

const ALL_POPULAR_CITIES = (RANDOM_CITIES || []).map((c) => ({
  label: c.name || c.city,
  query: c.city || c.name,
  country: c.country,
}));

console.log("🧪 Testing pagination feature");
console.log("===============================");
console.log(`📊 Total cities in database: ${ALL_POPULAR_CITIES.length}`);

// Test each region
const REGIONS = ["All", ...Object.keys(REGION_COUNTRIES)];
const CITIES_PER_PAGE = 20;

REGIONS.forEach((region) => {
  const filteredCities =
    region === "All"
      ? ALL_POPULAR_CITIES
      : ALL_POPULAR_CITIES.filter((c) =>
          REGION_COUNTRIES[region]?.has(c.country)
        );

  const totalPages = Math.ceil(filteredCities.length / CITIES_PER_PAGE);
  const remainingAfterFirstPage = Math.max(
    0,
    filteredCities.length - CITIES_PER_PAGE
  );

  console.log(`\n🌍 ${region}:`);
  console.log(`  Total cities: ${filteredCities.length}`);
  console.log(
    `  Initial load: ${Math.min(CITIES_PER_PAGE, filteredCities.length)} cities`
  );
  console.log(
    `  Remaining after first page: ${remainingAfterFirstPage} cities`
  );
  console.log(
    `  Total "Show More" clicks needed: ${Math.max(0, totalPages - 1)}`
  );

  if (filteredCities.length > CITIES_PER_PAGE) {
    console.log(
      `  Show More button will display: "Show More (${remainingAfterFirstPage} remaining)"`
    );
  } else {
    console.log(`  No "Show More" button needed`);
  }
});

console.log("\n✅ Pagination logic verification complete!");

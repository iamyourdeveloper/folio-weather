/**
 * Search utility functions for handling city queries
 */

import RANDOM_CITIES from "../data/randomCities.js";
import { 
  ALL_US_CITIES_FLAT, 
  searchUSCities, 
  getCitiesByState,
  getRandomUSCities 
} from "../../../backend/data/allUSCitiesComplete.js";

/**
 * Extracts city name from a query that might include state/region/country
 * Enhanced to automatically map single city names to their full names from our database
 * and provide better location disambiguation
 * Examples:
 * - "Baltimore" -> { city: "Baltimore", fullName: "Baltimore, MD" } (found in database)
 * - "Baltimore, MD" -> { city: "Baltimore", fullName: "Baltimore, MD" }
 * - "New York, NY" -> { city: "New York", fullName: "New York, NY" }
 * - "London, ON" -> { city: "London", fullName: "London, ON" } (Canadian city)
 * - "London, UK" -> { city: "London", fullName: "London, UK" }
 * - "London Ontario" -> { city: "London", fullName: "London, ON" } (normalized)
 * - "Frederick, Maryland" -> { city: "Frederick", fullName: "Frederick, MD" } (normalized)
 * - "Tokyo" -> { city: "Tokyo", fullName: "Tokyo" } (not in US database, use as-is)
 * - "Paris, Île-de-France, France" -> { city: "Paris", fullName: "Paris, Île-de-France, France" }
 *
 * @param {string} query - The search query
 * @returns {Object} Object with city and fullName properties
 */
export const parseLocationQuery = (query) => {
  if (!query || typeof query !== "string") {
    return { city: "", fullName: "" };
  }

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { city: "", fullName: "" };
  }

  // Normalize and handle special patterns first
  const normalizedQuery = normalizeLocationQuery(trimmedQuery);

  // If there's no comma, this might be a single city name or "City State" format
  if (!normalizedQuery.includes(",")) {
    return handleSingleNameQuery(normalizedQuery, trimmedQuery);
  }

  // Split by comma and take the first part as the city name
  // This handles cases like "Baltimore, MD" or "Paris, Île-de-France, France"
  const parts = normalizedQuery.split(",");
  const cityPart = parts[0].trim();

  // If the first part is empty for some reason, use the full query
  if (!cityPart) {
    return { city: trimmedQuery, fullName: trimmedQuery };
  }

  return { city: cityPart, fullName: normalizedQuery };
};

/**
 * Normalize location queries to standard formats
 * @param {string} query - The search query
 * @returns {string} Normalized query
 */
const normalizeLocationQuery = (query) => {
  let normalized = query;

  // Handle common state/province name variations
  const stateNormalizations = {
    // Canadian provinces
    Ontario: "ON",
    "British Columbia": "BC",
    Alberta: "AB",
    Quebec: "QC",
    Québec: "QC",
    Manitoba: "MB",
    Saskatchewan: "SK",
    "Nova Scotia": "NS",
    "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL",
    Newfoundland: "NL",
    "Prince Edward Island": "PE",
    Yukon: "YT",
    "Northwest Territories": "NT",
    Nunavut: "NU",

    // US states (common full names)
    Maryland: "MD",
    California: "CA",
    "New York": "NY",
    Florida: "FL",
    Texas: "TX",
    Pennsylvania: "PA",
    Illinois: "IL",
    Ohio: "OH",
    Georgia: "GA",
    "North Carolina": "NC",
    Michigan: "MI",
    "New Jersey": "NJ",
    Virginia: "VA",
    Washington: "WA",
    Arizona: "AZ",
    Massachusetts: "MA",
    Indiana: "IN",
    Tennessee: "TN",
    Missouri: "MO",
    Wisconsin: "WI",
    Colorado: "CO",
    Minnesota: "MN",
    "South Carolina": "SC",
    Alabama: "AL",
    Louisiana: "LA",
    Kentucky: "KY",
    Oregon: "OR",
    Oklahoma: "OK",
    Connecticut: "CT",
    Utah: "UT",
    Iowa: "IA",
    Nevada: "NV",
    Arkansas: "AR",
    Mississippi: "MS",
    Kansas: "KS",
    "New Mexico": "NM",
    Nebraska: "NE",
    "West Virginia": "WV",
    Idaho: "ID",
    Hawaii: "HI",
    "New Hampshire": "NH",
    Maine: "ME",
    Montana: "MT",
    "Rhode Island": "RI",
    Delaware: "DE",
    "South Dakota": "SD",
    "North Dakota": "ND",
    Alaska: "AK",
    Vermont: "VT",
    Wyoming: "WY",
  };

  // Apply normalizations
  for (const [fullName, abbreviation] of Object.entries(stateNormalizations)) {
    // Handle "City State" format (without comma)
    const cityStatePattern = new RegExp(`\\b(.+)\\s+${fullName}\\b`, "i");
    const cityStateMatch = normalized.match(cityStatePattern);
    if (cityStateMatch) {
      const cityName = cityStateMatch[1].trim();
      normalized = `${cityName}, ${abbreviation}`;
      break;
    }

    // Handle "City, State" format - fix the double comma issue
    const cityCommaStatePattern = new RegExp(`^(.+),\\s*${fullName}$`, "i");
    const cityCommaStateMatch = normalized.match(cityCommaStatePattern);
    if (cityCommaStateMatch) {
      const cityName = cityCommaStateMatch[1].trim();
      normalized = `${cityName}, ${abbreviation}`;
      break;
    }
  }

  return normalized;
};

/**
 * Handle queries that don't contain commas (single city names or "City State" format)
 * @param {string} normalizedQuery - Normalized query
 * @param {string} originalQuery - Original query for fallback
 * @returns {Object} Object with city and fullName properties
 */
const handleSingleNameQuery = (normalizedQuery, originalQuery) => {
  // If normalization added a comma, split and return
  if (normalizedQuery.includes(",")) {
    const parts = normalizedQuery.split(",");
    const cityPart = parts[0].trim();
    return { city: cityPart, fullName: normalizedQuery };
  }

  // Try to find a matching city in our comprehensive US database first
  const usMatches = searchUSCities(normalizedQuery, 5);
  if (usMatches.length > 0) {
    // Prefer US cities for disambiguation
    const bestMatch = disambiguateUSCities(usMatches, normalizedQuery);
    return { city: bestMatch.city, fullName: bestMatch.name };
  }

  // Fall back to international cities database
  const matchingCities = RANDOM_CITIES.filter(
    (cityData) =>
      cityData.city &&
      cityData.city.toLowerCase() === normalizedQuery.toLowerCase()
  );

  if (matchingCities.length > 0) {
    // If multiple cities match, apply smart disambiguation
    const bestMatch = disambiguateCities(matchingCities, normalizedQuery);
    return { city: bestMatch.city, fullName: bestMatch.name };
  }

  // No match found, treat the whole string as both city and full name
  return { city: normalizedQuery, fullName: originalQuery };
};

/**
 * Disambiguate between multiple US cities with the same name
 * @param {Array} cities - Array of matching US cities
 * @param {string} query - Original query for context
 * @returns {Object} Best matching city
 */
const disambiguateUSCities = (cities, query) => {
  if (cities.length === 1) {
    return cities[0];
  }
  
  // For US cities, prefer more populous states/cities
  // Priority order: major metropolitan areas first
  const statePopulationPriority = [
    'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
    'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT'
  ];
  
  for (const state of statePopulationPriority) {
    const stateMatch = cities.find(city => city.state === state);
    if (stateMatch) return stateMatch;
  }
  
  // Fallback to first match
  return cities[0];
};

/**
 * Disambiguate between multiple cities with the same name
 * @param {Array} cities - Array of matching cities
 * @param {string} query - Original query for context
 * @returns {Object} Best matching city
 */
const disambiguateCities = (cities, query) => {
  // If only one city, return it
  if (cities.length === 1) {
    return cities[0];
  }

  // Priority rules for disambiguation:
  // 1. If there are hints in the query about the country/region, use those
  // 2. For "London": Prefer CA (Ontario) over GB unless specified otherwise
  // 3. For US cities: Prefer US locations
  // 4. For other cases: Use the first match (database order)

  const queryLower = query.toLowerCase();

  // Check for explicit country/region hints
  if (
    queryLower.includes("canada") ||
    queryLower.includes("ontario") ||
    queryLower.includes(" on")
  ) {
    const canadianCity = cities.find((city) => city.country === "CA");
    if (canadianCity) return canadianCity;
  }

  if (
    queryLower.includes("uk") ||
    queryLower.includes("britain") ||
    queryLower.includes("england")
  ) {
    const ukCity = cities.find((city) => city.country === "GB");
    if (ukCity) return ukCity;
  }

  if (queryLower.includes("usa") || queryLower.includes("america")) {
    const usCity = cities.find((city) => city.country === "US");
    if (usCity) return usCity;
  }

  // Special case for London: Default to Great Britain unless specifically searching for Canadian
  // Only prefer Canadian London if there are explicit hints about Ontario/Canada
  if (queryLower === "london") {
    const britishLondon = cities.find((city) => city.country === "GB");
    if (britishLondon) return britishLondon;
  }

  // General priority: US > GB > CA > others (restored original GB preference)
  const priorityOrder = ["US", "GB", "CA"];
  for (const country of priorityOrder) {
    const city = cities.find((c) => c.country === country);
    if (city) return city;
  }

  // Fallback to first match
  return cities[0];
};

/**
 * Resolves a location to its full display name using our database
 * @param {Object} location - Location object with city, name, country, state, countryCode
 * @returns {string} Full display name for the location
 */
export const resolveFullLocationName = (location) => {
  if (!location || (typeof location !== 'object')) return "Unknown Location";
  
  const cityName = location.city || location.name;
  const country = location.country;
  const state = location.state;
  const countryCode = location.countryCode;
  
  if (!cityName || typeof cityName !== 'string') return location.name || "Unknown Location";
  
  // If the location already has a properly formatted name that includes state/country, use it
  if (location.name && location.name.includes(",") && location.name !== cityName) {
    return location.name;
  }
  
  // Priority 1: Use backend-provided state information for US cities
  if ((country === "US" || countryCode === "US") && state) {
    return `${cityName}, ${state}`;
  }
  
  // Priority 2: Try to find an exact match in our database using city name and country
  const exactMatch = RANDOM_CITIES.find(
    (cityData) =>
      cityData.city &&
      cityData.city.toLowerCase() === cityName.toLowerCase() &&
      cityData.country === country
  );
  
  if (exactMatch) {
    return exactMatch.name;
  }
  
  // Priority 3: Try to find match using countryCode if available
  if (countryCode) {
    const countryCodeMatch = RANDOM_CITIES.find(
      (cityData) =>
        cityData.city &&
        cityData.city.toLowerCase() === cityName.toLowerCase() &&
        cityData.country === countryCode
    );
    
    if (countryCodeMatch) {
      return countryCodeMatch.name;
    }
  }
  
  // Priority 4: If no exact match, try to find any city with the same name in the same country
  const countryMatches = RANDOM_CITIES.filter(
    (cityData) =>
      cityData.city &&
      cityData.city.toLowerCase() === cityName.toLowerCase() &&
      (cityData.country === country || cityData.country === countryCode)
  );
  
  if (countryMatches.length > 0) {
    return countryMatches[0].name;
  }
  
  // Priority 5: Try a more flexible search - normalize spaces and case
  const normalizedCityName = cityName.toLowerCase().replace(/\s+/g, ' ').trim();
  const flexibleMatch = RANDOM_CITIES.find(
    (cityData) =>
      cityData.city &&
      cityData.city.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedCityName &&
      (cityData.country === country || cityData.country === countryCode)
  );
  
  if (flexibleMatch) {
    return flexibleMatch.name;
  }
  
  // Priority 6: Construct a properly formatted name based on available data
  const nameParts = [cityName];
  
  // Add state if available and it's a US location
  if (state && (country === "US" || countryCode === "US")) {
    nameParts.push(state);
  }
  // Add country or country code for non-US locations
  else if (country && country !== "US" && cityName !== country) {
    nameParts.push(country);
  } else if (countryCode && countryCode !== "US" && cityName !== countryCode) {
    nameParts.push(countryCode);
  }
  
  return nameParts.join(", ");
};

/**
 * Comprehensive search function that searches both US and international cities
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Array} Array of matching cities
 */
export const searchAllCities = (query, limit = 20) => {
  if (!query || typeof query !== "string") return [];
  
  const results = [];
  
  // Search US cities first (higher priority)
  const usResults = searchUSCities(query, Math.floor(limit * 0.7));
  results.push(...usResults);
  
  // Search international cities
  const remainingLimit = limit - results.length;
  if (remainingLimit > 0) {
    const normalizedQuery = query.toLowerCase().trim();
    const intlResults = RANDOM_CITIES.filter(cityData => 
      cityData.city && 
      (cityData.city.toLowerCase().includes(normalizedQuery) ||
       cityData.name.toLowerCase().includes(normalizedQuery))
    ).slice(0, remainingLimit);
    
    results.push(...intlResults);
  }
  
  return results;
};

/**
 * Get suggestions for city search with mixed US and international cities
 * @param {string} query - Partial search query
 * @param {number} limit - Maximum suggestions to return
 * @returns {Array} Array of city suggestions
 */
export const getCitySuggestions = (query, limit = 10) => {
  if (!query || query.length < 2) {
    // Return random mix of popular US and international cities
    const usRandomCities = getRandomUSCities(Math.floor(limit * 0.6));
    const intlRandomCities = RANDOM_CITIES
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(limit * 0.4));
    
    return [...usRandomCities, ...intlRandomCities];
  }
  
  return searchAllCities(query, limit);
};

/**
 * Search cities by state (US only)
 * @param {string} stateCode - Two-letter state code
 * @param {string} query - Optional city name filter
 * @returns {Array} Array of cities in the state
 */
export const searchCitiesByState = (stateCode, query = '') => {
  const stateCities = getCitiesByState(stateCode);
  
  if (!query) return stateCities;
  
  const normalizedQuery = query.toLowerCase().trim();
  return stateCities.filter(city => 
    city.city.toLowerCase().includes(normalizedQuery)
  );
};

/**
 * Validates if a query looks like a valid location search
 * @param {string} query - The search query
 * @returns {boolean} Whether the query appears to be valid
 */
export const isValidLocationQuery = (query) => {
  if (!query || typeof query !== "string") {
    return false;
  }

  const trimmed = query.trim();

  // Check for minimum length and that it contains some letters
  if (trimmed.length < 2 || !/[a-zA-Z]/.test(trimmed)) {
    return false;
  }

  // Check for obviously invalid patterns
  const invalidPatterns = [
    /^\d+$/, // Only numbers
    /^[^a-zA-Z]+$/, // No letters at all
    /^[.,\s]+$/, // Only punctuation and spaces
  ];

  return !invalidPatterns.some((pattern) => pattern.test(trimmed));
};

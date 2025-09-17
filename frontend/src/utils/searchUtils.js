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
 * Convert GB country code to UK for display purposes
 * @param {string} country - Country code
 * @returns {string} Display country code (GB -> UK)
 */
const formatCountryForDisplay = (country) => {
  return country === 'GB' ? 'UK' : country;
};

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
 * Enhanced to handle punctuation, casing, and various formatting variations
 * @param {string} query - The search query
 * @returns {string} Normalized query
 */
const normalizeLocationQuery = (query) => {
  if (!query || typeof query !== "string") {
    return "";
  }

  // Step 1: Basic cleanup - trim and normalize whitespace
  let normalized = query.trim().replace(/\s+/g, ' ');

  // Step 2: Remove/normalize punctuation while preserving meaning
  // Remove extra periods, but keep single periods in abbreviations like "D.C."
  normalized = normalized.replace(/\.{2,}/g, '.'); // Multiple periods to single
  normalized = normalized.replace(/,{2,}/g, ','); // Multiple commas to single
  
  // Normalize apostrophes and quotes to standard single quotes
  normalized = normalized.replace(/[''""]/g, "'");
  
  // Clean up spacing around punctuation
  normalized = normalized.replace(/\s*,\s*/g, ', '); // Normalize comma spacing
  
  // Handle D.C. specifically before general period normalization
  normalized = normalized.replace(/D\s*\.\s*C\s*\./gi, 'D.C.');
  
  // Then apply general period spacing (but avoid affecting D.C.)
  normalized = normalized.replace(/(?<!D)(?<!D\.)\s*\.\s*/g, '. '); // Normalize period spacing but avoid D.C.
  
  // Step 3: Handle special cases first
  
  // Special handling for Washington D.C. variations
  if (/washington.*d\.?c\.?/i.test(normalized)) {
    normalized = normalized.replace(/washington.*d\.?c\.?/i, 'Washington, D.C.');
  }
  
  // Handle specific D.C. patterns
  if (/^washington\s+d\.c\.$/i.test(normalized)) {
    normalized = 'Washington, D.C.';
  }

  // Step 4: Handle country abbreviations and common variations
  const countryNormalizations = {
    // Japan variations
    "jp": "Japan",
    "jpn": "Japan", 
    "japan": "Japan",
    
    // France variations
    "fr": "France",
    "france": "France",
    
    // Germany variations
    "de": "Germany",
    "ger": "Germany",
    "germany": "Germany",
    "deutschland": "Germany",
    
    // United Kingdom variations - normalize all to GB for internal processing
    // but display will always show UK
    // Order matters: longer phrases first to avoid partial matches
    "united kingdom": "GB",
    "great britain": "GB", 
    "britain": "GB",
    "england": "GB",
    "uk": "GB",
    "gb": "GB",
    
    // Canada variations
    "ca": "Canada",
    "can": "Canada",
    "canada": "Canada",
    
    // Australia variations
    "au": "Australia",
    "aus": "Australia",
    "australia": "Australia",
    
    // United States variations
    "us": "US",
    "usa": "US",
    "united states": "US",
    "america": "US",
  };

  // Step 5: Handle state/province name variations (enhanced)
  const stateNormalizations = {
    // Canadian provinces
    "ontario": "ON",
    "on": "ON",
    "british columbia": "BC",
    "bc": "BC",
    "alberta": "AB",
    "ab": "AB",
    "quebec": "QC",
    "québec": "QC",
    "qc": "QC",
    "manitoba": "MB",
    "mb": "MB",
    "saskatchewan": "SK",
    "sk": "SK",
    "nova scotia": "NS",
    "ns": "NS",
    "new brunswick": "NB",
    "nb": "NB",
    "newfoundland and labrador": "NL",
    "newfoundland": "NL",
    "nl": "NL",
    "prince edward island": "PE",
    "pei": "PE",
    "pe": "PE",
    "yukon": "YT",
    "yt": "YT",
    "northwest territories": "NT",
    "nt": "NT",
    "nunavut": "NU",
    "nu": "NU",

    // US states (full names and common abbreviations)
    "maryland": "MD",
    "md": "MD",
    "california": "CA",
    "ca": "CA",
    "new york": "NY",
    "ny": "NY",
    "florida": "FL",
    "fl": "FL",
    "texas": "TX",
    "tx": "TX",
    "pennsylvania": "PA",
    "pa": "PA",
    "illinois": "IL",
    "il": "IL",
    "ohio": "OH",
    "oh": "OH",
    "georgia": "GA",
    "ga": "GA",
    "north carolina": "NC",
    "nc": "NC",
    "michigan": "MI",
    "mi": "MI",
    "new jersey": "NJ",
    "nj": "NJ",
    "virginia": "VA",
    "va": "VA",
    "washington": "WA",
    "wa": "WA",
    "arizona": "AZ",
    "az": "AZ",
    "massachusetts": "MA",
    "ma": "MA",
    "indiana": "IN",
    "in": "IN",
    "tennessee": "TN",
    "tn": "TN",
    "missouri": "MO",
    "mo": "MO",
    "wisconsin": "WI",
    "wi": "WI",
    "colorado": "CO",
    "co": "CO",
    "minnesota": "MN",
    "mn": "MN",
    "south carolina": "SC",
    "sc": "SC",
    "alabama": "AL",
    "al": "AL",
    "louisiana": "LA",
    "la": "LA",
    "kentucky": "KY",
    "ky": "KY",
    "oregon": "OR",
    "or": "OR",
    "oklahoma": "OK",
    "ok": "OK",
    "connecticut": "CT",
    "ct": "CT",
    "utah": "UT",
    "ut": "UT",
    "iowa": "IA",
    "ia": "IA",
    "nevada": "NV",
    "nv": "NV",
    "arkansas": "AR",
    "ar": "AR",
    "mississippi": "MS",
    "ms": "MS",
    "kansas": "KS",
    "ks": "KS",
    "new mexico": "NM",
    "nm": "NM",
    "nebraska": "NE",
    "ne": "NE",
    "west virginia": "WV",
    "wv": "WV",
    "idaho": "ID",
    "id": "ID",
    "hawaii": "HI",
    "hi": "HI",
    "new hampshire": "NH",
    "nh": "NH",
    "maine": "ME",
    "me": "ME",
    "montana": "MT",
    "mt": "MT",
    "rhode island": "RI",
    "ri": "RI",
    "delaware": "DE",
    "de": "DE",
    "south dakota": "SD",
    "sd": "SD",
    "north dakota": "ND",
    "nd": "ND",
    "alaska": "AK",
    "ak": "AK",
    "vermont": "VT",
    "vt": "VT",
    "wyoming": "WY",
    "wy": "WY",
    "district of columbia": "D.C.",
    "dc": "D.C.",
  };

  // Step 6: Apply normalizations in order of specificity
  
  // First handle country normalizations at the end of the string
  // Sort country variations by length (longest first) to handle multi-word countries properly
  const sortedCountryEntries = Object.entries(countryNormalizations)
    .sort(([a], [b]) => b.length - a.length);
  
  for (const [variation, standard] of sortedCountryEntries) {
    const patterns = [
      // "city, country" format
      new RegExp(`^(.+),\\s*${escapeRegex(variation)}\\s*$`, "i"),
      // "city country" format (no comma) - use word boundary to ensure complete match
      new RegExp(`^(.+?)\\s+${escapeRegex(variation)}(?:\\s|$)`, "i"),
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const cityName = match[1].trim();
        normalized = `${cityName}, ${standard}`;
        return normalized; // Return early for country matches
      }
    }
  }

  // Then handle state/province normalizations
  for (const [variation, standard] of Object.entries(stateNormalizations)) {
    const patterns = [
      // "city, state" format (more specific)
      new RegExp(`^(.+),\\s*${escapeRegex(variation)}\\s*$`, "i"),
      // "city state" format (no comma)
      new RegExp(`^(.+?)\\s+${escapeRegex(variation)}\\s*$`, "i"),
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const cityName = match[1].trim();
        normalized = `${cityName}, ${standard}`;
        return normalized; // Return early for state matches
      }
    }
  }

  // Step 7: Final cleanup
  normalized = normalized.replace(/\s*,\s*$/, ''); // Remove trailing comma
  normalized = normalized.replace(/^\s*,\s*/, ''); // Remove leading comma
  normalized = normalized.trim();

  return normalized;
};

/**
 * Helper function to escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  // Try to find an EXACT matching city in our comprehensive US database first
  // Only prefer US cities if there's an exact name match, not partial matches
  const usMatches = searchUSCities(normalizedQuery, 5);
  const exactUSMatch = usMatches.find(city => 
    city.city.toLowerCase() === normalizedQuery.toLowerCase()
  );
  
  if (exactUSMatch) {
    // Only prefer US cities when there's an exact match
    const bestMatch = disambiguateUSCities([exactUSMatch], normalizedQuery);
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
 * Normalize GB/UK location display to consistently show as UK
 * @param {string} locationName - The location name to normalize
 * @returns {string} Normalized location name showing UK instead of GB variants
 */
const normalizeUKLocationDisplay = (locationName) => {
  if (!locationName || typeof locationName !== 'string') return locationName;
  
  // Replace various UK/GB variants with consistent "UK" format
  let normalized = locationName;
  
  // Replace GB with UK (at end of string)
  normalized = normalized.replace(/,\s*GB\s*$/i, ', UK');
  normalized = normalized.replace(/,\s*Great Britain\s*$/i, ', UK');
  normalized = normalized.replace(/,\s*United Kingdom\s*$/i, ', UK');
  normalized = normalized.replace(/,\s*England\s*$/i, ', UK');
  
  // Also handle cases where GB might be in the middle (less common but possible)
  normalized = normalized.replace(/,\s*GB\s*,/i, ', UK,');
  normalized = normalized.replace(/,\s*Great Britain\s*,/i, ', UK,');
  normalized = normalized.replace(/,\s*United Kingdom\s*,/i, ', UK,');
  normalized = normalized.replace(/,\s*England\s*,/i, ', UK,');
  
  return normalized;
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
  
  if (!cityName || typeof cityName !== 'string') return normalizeUKLocationDisplay(location.name) || "Unknown Location";
  
  // Special handling for Washington D.C. - always display as "Washington, D.C."
  if (cityName.toLowerCase() === 'washington' && 
      ((country === "US" || countryCode === "US") && 
       (state === "DC" || state === "D.C." || state === "dc"))) {
    return "Washington, D.C.";
  }
  
  // Special handling for UK/GB locations - always normalize to UK
  if (country === "GB" || countryCode === "GB") {
    // If the location has a name, normalize it
    if (location.name && location.name.includes(",")) {
      return normalizeUKLocationDisplay(location.name);
    }
    // Otherwise, construct it as "City, UK"
    return `${cityName}, UK`;
  }
  
  // Always apply UK normalization to any location name that might contain GB variants
  // This catches cases where the backend hasn't normalized properly
  const potentialName = location.name || `${cityName}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`;
  if (potentialName && (potentialName.includes('GB') || potentialName.includes('Great Britain') || potentialName.includes('United Kingdom') || potentialName.includes('England'))) {
    return normalizeUKLocationDisplay(potentialName);
  }
  
  // If the location already has a properly formatted name that includes state/country, use it
  if (location.name && location.name.includes(",") && location.name !== cityName) {
    // Special case: if it's Washington, DC in the name, convert to D.C.
    if (location.name.toLowerCase().includes('washington, dc')) {
      return location.name.replace(/washington,\s*dc/i, 'Washington, D.C.');
    }
    // Normalize UK display for any location name
    return normalizeUKLocationDisplay(location.name);
  }
  
  // Priority 1: Use backend-provided state information for US cities
  if ((country === "US" || countryCode === "US") && state) {
    // Special case for D.C.
    if ((state === "DC" || state === "D.C." || state === "dc") && cityName.toLowerCase() === 'washington') {
      return "Washington, D.C.";
    }
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
    nameParts.push(formatCountryForDisplay(country));
  } else if (countryCode && countryCode !== "US" && cityName !== countryCode) {
    nameParts.push(formatCountryForDisplay(countryCode));
  }
  
  const constructedName = nameParts.join(", ");
  
  // Apply UK normalization to the constructed name
  return normalizeUKLocationDisplay(constructedName);
};

/**
 * Comprehensive search function that searches both US and international cities
 * Uses intelligent prioritization: exact international matches first, then exact US, then partial matches
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Array} Array of matching cities
 */
export const searchAllCities = (query, limit = 20) => {
  if (!query || typeof query !== "string") return [];
  
  // Parse the query to extract the city name and handle country/state variations
  const parsedQuery = parseLocationQuery(query);
  const cityToSearch = parsedQuery.city || query;
  const normalizedQuery = cityToSearch.toLowerCase().trim();
  
  // Get US city results using the parsed city name
  const usResults = searchUSCities(cityToSearch, limit);
  
  // Get international city results using the parsed city name
  const intlResults = RANDOM_CITIES.filter(cityData => 
    cityData.city && 
    (cityData.city.toLowerCase().includes(normalizedQuery) ||
     cityData.name.toLowerCase().includes(normalizedQuery))
  );
  
  // Separate exact matches from partial matches
  const exactUSMatches = usResults.filter(city => 
    city.city.toLowerCase() === normalizedQuery
  );
  const partialUSMatches = usResults.filter(city => 
    city.city.toLowerCase() !== normalizedQuery
  );
  
  const exactIntlMatches = intlResults.filter(city => 
    city.city.toLowerCase() === normalizedQuery
  );
  const partialIntlMatches = intlResults.filter(city => 
    city.city.toLowerCase() !== normalizedQuery
  );
  
  // For exact international matches, prioritize major cities
  const prioritizedExactIntl = prioritizeInternationalCitiesLocal(exactIntlMatches, normalizedQuery);
  
  // Build results with intelligent prioritization:
  // 1. Exact international matches (with major cities first)
  // 2. Exact US matches  
  // 3. Partial US matches (maintaining original US priority for partial matches)
  // 4. Partial international matches
  const prioritizedResults = [
    ...prioritizedExactIntl,
    ...exactUSMatches,
    ...partialUSMatches,
    ...partialIntlMatches
  ];
  
  // Remove duplicates and limit results
  const uniqueResults = prioritizedResults.filter((city, index, self) => 
    index === self.findIndex(c => c.name === city.name)
  );
  
  return uniqueResults.slice(0, limit);
};

/**
 * Prioritize international cities, putting major world cities first (frontend version)
 * @param {Array} cities - Array of international cities
 * @param {string} query - Original query for context
 * @returns {Array} Prioritized array of cities
 */
const prioritizeInternationalCitiesLocal = (cities, query) => {
  if (cities.length <= 1) return cities;
  
  // Define major international cities that should be prioritized
  const majorCityPriority = {
    'london': ['GB', 'CA'], // London, UK first, then London, ON
    'paris': ['FR'],
    'berlin': ['DE'],
    'madrid': ['ES'],
    'rome': ['IT'],
    'moscow': ['RU'],
    'tokyo': ['JP'],
    'beijing': ['CN'],
    'sydney': ['AU'],
    'mumbai': ['IN'],
    'cairo': ['EG']
  };
  
  const priority = majorCityPriority[query.toLowerCase()];
  if (!priority) {
    return cities; // No special prioritization needed
  }
  
  // Sort cities according to the priority order
  return cities.sort((a, b) => {
    const aIndex = priority.indexOf(a.country);
    const bIndex = priority.indexOf(b.country);
    
    // If both cities are in the priority list, sort by priority order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one city is in the priority list, it comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the priority list, maintain original order
    return 0;
  });
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

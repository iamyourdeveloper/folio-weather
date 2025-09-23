import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { cacheSearchResults } from "../middleware/searchCache.js";
import { 
  searchUSCities, 
  searchByState,
  getCitiesByState, 
  getRandomUSCities, 
  ALL_US_CITIES_FLAT 
} from "../data/allUSCitiesComplete.js";
import RANDOM_CITIES from "../data/randomCities.js";

const router = express.Router();

/**
 * Convert GB country code to UK for display purposes
 * @param {string} country - Country code
 * @returns {string} Display country code (GB -> UK)
 */
const formatCountryForDisplay = (country) => {
  return country === 'GB' ? 'UK' : country;
};

// Normalize strings for consistent international comparisons (remove diacritics and lowercase)
const toInternationalKey = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Normalize search queries to handle punctuation, casing, and formatting variations
 * @param {string} query - The search query
 * @returns {string} Normalized query
 */
const normalizeSearchQuery = (query) => {
  if (!query || typeof query !== "string") {
    return "";
  }

  // Basic cleanup - trim and normalize whitespace
  let normalized = query.trim().replace(/\s+/g, ' ');

  // Remove/normalize punctuation while preserving meaning
  normalized = normalized.replace(/\.{2,}/g, '.'); // Multiple periods to single
  normalized = normalized.replace(/,{2,}/g, ','); // Multiple commas to single
  
  // Normalize apostrophes and quotes to standard single quotes
  normalized = normalized.replace(/[''""]/g, "'");
  
  // Clean up spacing around punctuation
  normalized = normalized.replace(/\s*,\s*/g, ', '); // Normalize comma spacing
  normalized = normalized.replace(/\s*\.\s*/g, '. '); // Normalize period spacing
  
  // Handle common country/state abbreviations
  const commonReplacements = {
    // Country variations (case insensitive)
    '\\bjp\\b': 'japan',
    '\\bjpn\\b': 'japan',
    '\\bfr\\b': 'france',
    '\\bde\\b': 'germany',
    '\\bger\\b': 'germany',
    '\\buk\\b': 'gb',
    '\\bgb\\b': 'gb',
    '\\bbritain\\b': 'gb',
    '\\bengland\\b': 'gb',
    '\\busa?\\b': 'us',
    '\\bamerica\\b': 'us',
    
    // State variations
    '\\bmd\\b': 'maryland',
    '\\bca\\b': 'california',
    '\\bny\\b': 'new york',
    '\\bfl\\b': 'florida',
    '\\btx\\b': 'texas',
    '\\bpa\\b': 'pennsylvania',
  };

  // Apply replacements
  for (const [pattern, replacement] of Object.entries(commonReplacements)) {
    const regex = new RegExp(pattern, 'gi');
    normalized = normalized.replace(regex, replacement);
  }

  // Final cleanup
  normalized = normalized.replace(/\s*,\s*$/, ''); // Remove trailing comma
  normalized = normalized.replace(/^\s*,\s*/, ''); // Remove leading comma
  normalized = normalized.trim();

  return normalized;
};

const getRegionDisplayNames = () => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      return new Intl.DisplayNames(['en'], { type: 'region' });
    }
  } catch (error) {
    // Ignore and fall back to manual aliases
  }
  return null;
};

const addAliasToSet = (aliasSet, value) => {
  const key = toInternationalKey(value);
  if (key) {
    aliasSet.add(key);
  }
};

const buildCountryAliasSet = () => {
  const aliases = new Set();
  const regionDisplayNames = getRegionDisplayNames();
  const codes = new Set(RANDOM_CITIES.map(city => city.country).filter(Boolean));

  // Ensure core codes are available even if not present in RANDOM_CITIES
  ['US', 'GB'].forEach(code => codes.add(code));

  for (const code of codes) {
    if (!code) continue;
    addAliasToSet(aliases, code);
    addAliasToSet(aliases, code.toLowerCase());

    if (regionDisplayNames) {
      try {
        const displayName = regionDisplayNames.of(code);
        if (displayName && displayName !== code) {
          addAliasToSet(aliases, displayName);
        }
      } catch (error) {
        // DisplayNames may throw for non-standard codes; ignore
      }
    }
  }

  const manualCountryAliases = {
    US: ['usa', 'u.s.', 'u.s', 'america', 'united states', 'united states of america'],
    GB: ['uk', 'u.k.', 'great britain', 'england', 'scotland', 'wales', 'britain'],
    CA: ['canada', 'ca'],
    MX: ['mexico', 'mx'],
    BR: ['brazil', 'brasil'],
    AR: ['argentina'],
    CL: ['chile'],
    CO: ['colombia'],
    PE: ['peru'],
    VE: ['venezuela'],
    RU: ['russia', 'russian federation', 'ru'],
    CN: ['china', 'prc', 'p.r.c'],
    JP: ['japan', 'nippon'],
    KR: ['south korea', 'republic of korea', 'korea republic', 'rok'],
    KP: ['north korea', 'dprk', "democratic people's republic of korea"],
    IN: ['india', 'bharat'],
    AU: ['australia'],
    NZ: ['new zealand'],
    ZA: ['south africa'],
    EG: ['egypt'],
    SA: ['saudi arabia', 'kingdom of saudi arabia', 'ksa'],
    AE: ['united arab emirates', 'uae', 'u.a.e'],
    DE: ['germany', 'deutschland', 'ger'],
    FR: ['france'],
    IT: ['italy'],
    ES: ['spain'],
    PT: ['portugal'],
    GR: ['greece'],
    NL: ['netherlands', 'holland'],
    BE: ['belgium'],
    AT: ['austria'],
    CH: ['switzerland'],
    SE: ['sweden'],
    NO: ['norway'],
    FI: ['finland'],
    DK: ['denmark'],
    IE: ['ireland'],
    SG: ['singapore'],
    TH: ['thailand'],
    VN: ['vietnam'],
    ID: ['indonesia'],
    MY: ['malaysia'],
    PH: ['philippines'],
    PK: ['pakistan'],
    BD: ['bangladesh'],
    LK: ['sri lanka'],
    NP: ['nepal'],
    KH: ['cambodia'],
    LA: ['laos'],
    MM: ['myanmar', 'burma'],
    TR: ['turkey', 'türkiye', 'turkiye'],
    IL: ['israel'],
    IR: ['iran', 'islamic republic of iran'],
    IQ: ['iraq'],
    QA: ['qatar'],
    KW: ['kuwait'],
    BH: ['bahrain'],
    OM: ['oman'],
    JO: ['jordan'],
    LB: ['lebanon'],
    SY: ['syria'],
    UA: ['ukraine'],
    PL: ['poland'],
    CZ: ['czech republic', 'czechia'],
    SK: ['slovakia'],
    HU: ['hungary'],
    RO: ['romania'],
    BG: ['bulgaria'],
    HR: ['croatia'],
    SI: ['slovenia'],
    RS: ['serbia'],
    BA: ['bosnia and herzegovina', 'bosnia'],
    MK: ['north macedonia', 'macedonia'],
    AL: ['albania'],
    GE: ['georgia'],
    AM: ['armenia'],
    AZ: ['azerbaijan'],
    KZ: ['kazakhstan'],
    UZ: ['uzbekistan'],
    KG: ['kyrgyzstan'],
    TJ: ['tajikistan'],
    TM: ['turkmenistan'],
    MN: ['mongolia'],
  };

  Object.values(manualCountryAliases).forEach(aliasList => {
    aliasList.forEach(alias => addAliasToSet(aliases, alias));
  });

  return aliases;
};

const COUNTRY_ALIAS_SET = buildCountryAliasSet();

const buildStateAliasSet = () => {
  const aliases = new Set();
  const stateNames = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC'
  };

  Object.entries(stateNames).forEach(([name, code]) => {
    addAliasToSet(aliases, name);
    addAliasToSet(aliases, code);
  });

  ['d.c.', 'dc', 'd c', 'washington dc', 'washington d.c.'].forEach(alias => addAliasToSet(aliases, alias));

  return aliases;
};

const STATE_ALIAS_SET = buildStateAliasSet();

const removeTrailingAliases = (tokens, aliasSet, maxAliasTokens) => {
  let didUpdate = false;

  do {
    didUpdate = false;
    const limit = Math.min(tokens.length, maxAliasTokens);

    for (let len = limit; len > 0; len--) {
      const candidate = tokens.slice(tokens.length - len).join(' ');
      if (aliasSet.has(toInternationalKey(candidate))) {
        tokens.splice(tokens.length - len, len);
        didUpdate = true;
        break;
      }
    }
  } while (didUpdate && tokens.length > 0);
};

/**
 * Extract city name from complex search queries
 * Handles queries like "london great britain" -> "london"
 * @param {string} query - Normalized search query
 * @returns {string} Extracted city name
 */
const extractCityFromQuery = (query) => {
  if (!query) return "";

  const cleaned = query
    .replace(/[\u2019\u2018\u201c\u201d]/g, "'")
    .replace(/[-.,\/#!$%\^&*;:{}=+_`~()?<>\[\]\|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return "";

  const tokens = cleaned.split(' ').filter(Boolean);
  if (tokens.length === 0) return "";

  removeTrailingAliases(tokens, COUNTRY_ALIAS_SET, 4);
  removeTrailingAliases(tokens, STATE_ALIAS_SET, 3);

  if (tokens.length === 0) {
    return query;
  }

  return tokens.join(' ').trim() || query;
};

/**
 * Intelligent city search that prioritizes exact matches over partial matches
 * and major international cities over smaller cities for common names like "London"
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Array} Array of prioritized city results
 */
const searchAllCitiesWithPriority = (query, limit) => {
  // Enhanced normalization to handle punctuation and casing variations
  const normalizedQuery = normalizeSearchQuery(query).toLowerCase().trim();
  
  // Extract city name from complex queries like "london great britain"
  const cityName = extractCityFromQuery(normalizedQuery);
  
  // Get US city results with extracted city name
  const usResults = searchUSCities(cityName, limit);
  
  // Get international city results with flexible matching using extracted city name
  const intlResults = RANDOM_CITIES.filter(cityData => 
    cityData.city && 
    (cityData.city.toLowerCase().includes(cityName) ||
     cityData.name.toLowerCase().includes(cityName) ||
     // Also match against normalized versions of the city data
     normalizeSearchQuery(cityData.city).toLowerCase().includes(cityName) ||
     normalizeSearchQuery(cityData.name).toLowerCase().includes(cityName))
  );
  
  // Separate exact matches from partial matches using extracted city name
  const exactUSMatches = usResults.filter(city => 
    city.city.toLowerCase() === cityName
  );
  const partialUSMatches = usResults.filter(city => 
    city.city.toLowerCase() !== cityName
  );
  
  const exactIntlMatches = intlResults.filter(city => 
    city.city.toLowerCase() === cityName
  );
  const partialIntlMatches = intlResults.filter(city => 
    city.city.toLowerCase() !== cityName
  );
  
  // For exact international matches, prioritize major cities
  const prioritizedExactIntl = prioritizeInternationalCities(exactIntlMatches, cityName);
  
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
 * Prioritize international cities, putting major world cities first
 * @param {Array} cities - Array of international cities
 * @param {string} query - Original query for context
 * @returns {Array} Prioritized array of cities
 */
const prioritizeInternationalCities = (cities, query) => {
  if (cities.length <= 1) return cities;
  
  // Define major international cities that should be prioritized
  const majorCityPriority = {
    'london': ['GB', 'CA'], // London, UK first, then London, ON
    'paris': ['FR'],
    'berlin': ['DE'],
    'amsterdam': ['NL'],
    'madrid': ['ES'],
    'rome': ['IT'],
    'budapest': ['HU'],
    'moscow': ['RU'],
    'manchester': ['GB'],
    'sao paulo': ['BR'],
    'tokyo': ['JP'],
    'osaka': ['JP'],
    'beijing': ['CN'],
    'sydney': ['AU'],
    'mumbai': ['IN'],
    'cairo': ['EG']
  };
  
  const priority = majorCityPriority[toInternationalKey(query)];
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
 * @route   GET /api/search/cities
 * @desc    Search for cities (US and international)
 * @access  Public
 * @query   q - Search query
 * @query   limit - Maximum results (default: 20, max: 100)
 * @query   country - Filter by country code (optional)
 */
router.get(
  "/cities",
  cacheSearchResults(15 * 60 * 1000), // 15 minutes cache
  asyncHandler(async (req, res) => {
    const { q: query, limit = 20, country } = req.query;

    // Input validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'q' is required and must be a string",
      });
    }

    const sanitizedQuery = query.trim().replace(/[<>]/g, '');
    if (sanitizedQuery.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query cannot be empty",
      });
    }

    if (sanitizedQuery.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Query too long (max 100 characters)",
      });
    }

    // Validate and sanitize limit
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    let results = [];

    try {
      if (country === 'US' || country === 'us') {
        // Search only US cities with normalized query
        results = searchUSCities(normalizeSearchQuery(sanitizedQuery), parsedLimit);
      } else if (country && country !== 'US' && country !== 'us') {
        // Search only international cities for specific country
        const normalizedQuery = normalizeSearchQuery(sanitizedQuery).toLowerCase();
        results = RANDOM_CITIES.filter(cityData => 
          cityData.country === country.toUpperCase() &&
          cityData.city &&
          (cityData.city.toLowerCase().includes(normalizedQuery) ||
           cityData.name.toLowerCase().includes(normalizedQuery) ||
           normalizeSearchQuery(cityData.city).toLowerCase().includes(normalizedQuery) ||
           normalizeSearchQuery(cityData.name).toLowerCase().includes(normalizedQuery))
        ).slice(0, parsedLimit);
      } else {
        // Search all cities with intelligent prioritization
        results = searchAllCitiesWithPriority(sanitizedQuery, parsedLimit);
      }

      res.json({
        success: true,
        data: results,
        query: sanitizedQuery,
        count: results.length,
        limit: parsedLimit,
        country: country || 'all'
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: "Internal server error during search",
      });
    }
  })
);

/**
 * @route   GET /api/search/cities/us/:state
 * @desc    Get cities by US state
 * @access  Public
 * @param   state - Two-letter state code
 * @query   q - Optional city name filter
 * @query   limit - Maximum results (default: 50, max: 200)
 */
router.get(
  "/cities/us/:state",
  cacheSearchResults(30 * 60 * 1000), // 30 minutes cache
  asyncHandler(async (req, res) => {
    const { state } = req.params;
    const { q: query, limit = 50 } = req.query;

    // Validate state code
    if (!state || state.length !== 2) {
      return res.status(400).json({
        success: false,
        error: "State parameter must be a 2-letter state code",
      });
    }

    const stateCode = state.toUpperCase();
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 200);

    try {
      let cities = getCitiesByState(stateCode);

      if (cities.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No cities found for state: ${stateCode}`,
        });
      }

      // Filter by query if provided
      if (query && typeof query === 'string') {
        const sanitizedQuery = query.trim().replace(/[<>]/g, '');
        if (sanitizedQuery.length > 0) {
          const normalizedQuery = normalizeSearchQuery(sanitizedQuery).toLowerCase();
          cities = cities.filter(city => 
            city.city.toLowerCase().includes(normalizedQuery) ||
            normalizeSearchQuery(city.city).toLowerCase().includes(normalizedQuery)
          );
        }
      }

      // Apply limit
      cities = cities.slice(0, parsedLimit);

      res.json({
        success: true,
        data: cities,
        state: stateCode,
        query: query || '',
        count: cities.length,
        limit: parsedLimit
      });

    } catch (error) {
      console.error('State cities search error:', error);
      res.status(500).json({
        success: false,
        error: "Internal server error during state search",
      });
    }
  })
);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get city suggestions for autocomplete with real-time dropdown support
 * @access  Public
 * @query   q - Search query (optional, returns random cities if empty)
 * @query   limit - Maximum results (default: 10, max: 20)
 * @query   realtime - Enable real-time suggestions (default: false)
 */
router.get(
  "/suggestions",
  cacheSearchResults(10 * 60 * 1000), // 10 minutes cache
  asyncHandler(async (req, res) => {
    const { q: query, limit = 10, realtime = false } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 20);
    const isRealtime = realtime === 'true' || realtime === true;

    try {
      let suggestions = [];

      if (!query || query.trim().length < (isRealtime ? 1 : 2)) {
        // Return random mix of popular US and international cities
        const usRandomCities = getRandomUSCities(Math.floor(parsedLimit * 0.6));
        const intlRandomCities = RANDOM_CITIES
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(parsedLimit * 0.4));
        
        suggestions = [...usRandomCities, ...intlRandomCities];
      } else {
        const sanitizedQuery = query.trim().replace(/[<>]/g, '');
        
        // For real-time suggestions, prioritize US cities even more heavily
        const usResultsRatio = isRealtime ? 0.8 : 0.7;
        const normalizedSanitizedQuery = normalizeSearchQuery(sanitizedQuery);
        const usResults = searchUSCities(normalizedSanitizedQuery, Math.floor(parsedLimit * usResultsRatio));
        suggestions.push(...usResults);
        
        // Fill remaining with international cities
        const remainingLimit = parsedLimit - suggestions.length;
        if (remainingLimit > 0) {
          const normalizedQuery = normalizedSanitizedQuery.toLowerCase();
          const intlResults = RANDOM_CITIES.filter(cityData => {
            if (!cityData.city) return false;
            const cityName = cityData.city.toLowerCase();
            const normalizedCityName = normalizeSearchQuery(cityData.city).toLowerCase();
            const normalizedFullName = normalizeSearchQuery(cityData.name).toLowerCase();
            
            // For real-time, use more flexible matching
            return isRealtime 
              ? (cityName.includes(normalizedQuery) || 
                 cityData.name.toLowerCase().includes(normalizedQuery) ||
                 normalizedCityName.includes(normalizedQuery) ||
                 normalizedFullName.includes(normalizedQuery))
              : (cityName.startsWith(normalizedQuery) || 
                 normalizedCityName.startsWith(normalizedQuery));
          }).slice(0, remainingLimit);
          
          suggestions.push(...intlResults);
        }
      }

      // For real-time suggestions, ensure each result has proper formatting
      if (isRealtime) {
        suggestions = suggestions.map(city => ({
          ...city,
          displayName: city.name || `${city.city}${city.state ? ', ' + city.state : ''}${city.country && city.country !== 'US' ? ', ' + formatCountryForDisplay(city.country) : ''}`,
          searchValue: city.city,
          type: city.country === 'US' ? 'us' : 'international'
        }));
      }

      res.json({
        success: true,
        data: suggestions,
        query: query || '',
        count: suggestions.length,
        limit: parsedLimit,
        realtime: isRealtime
      });

    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({
        success: false,
        error: "Internal server error during suggestions",
      });
    }
  })
);

/**
 * @route   GET /api/search/autocomplete
 * @desc    Fast autocomplete endpoint for real-time dropdown suggestions
 * @access  Public
 * @query   q - Search query (required)
 * @query   limit - Maximum results (default: 8, max: 15)
 */
router.get(
  "/autocomplete",
  cacheSearchResults(5 * 60 * 1000), // 5 minutes cache for faster updates
  asyncHandler(async (req, res) => {
    const { q: query, limit = 8 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 8, 1), 15);

    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length < 1) {
      return res.json({
        success: true,
        data: [],
        query: query || '',
        count: 0,
        limit: parsedLimit
      });
    }

    const sanitizedQuery = query.trim().replace(/[<>]/g, '');
    
    try {
      let suggestions = [];
      
      // Use the same intelligent prioritization for autocomplete with normalization
      suggestions = searchAllCitiesWithPriority(sanitizedQuery, parsedLimit);

      // Format for autocomplete dropdown
      const formattedSuggestions = suggestions.map(city => ({
        id: `${city.city}-${city.state || city.country}`,
        city: city.city,
        state: city.state,
        country: city.country,
        name: city.name,
        displayName: city.name || `${city.city}${city.state ? ', ' + city.state : ''}${city.country && city.country !== 'US' ? ', ' + formatCountryForDisplay(city.country) : ''}`,
        searchValue: city.city,
        type: city.country === 'US' ? 'us' : 'international',
        priority: city.country === 'US' ? 1 : 2 // US cities get higher priority
      }));

      // Sort by priority (US first) and then alphabetically
      formattedSuggestions.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.displayName.localeCompare(b.displayName);
      });

      res.json({
        success: true,
        data: formattedSuggestions,
        query: sanitizedQuery,
        count: formattedSuggestions.length,
        limit: parsedLimit
      });

    } catch (error) {
      console.error('Autocomplete error:', error);
      res.status(500).json({
        success: false,
        error: "Internal server error during autocomplete",
      });
    }
  })
);

/**
 * @route   GET /api/search/stats
 * @desc    Get search database statistics
 * @access  Public
 */
router.get("/stats", (req, res) => {
  try {
    const usCitiesCount = ALL_US_CITIES_FLAT.length;
    const intlCitiesCount = RANDOM_CITIES.length;
    
    // Count cities by state
    const citiesByState = {};
    ALL_US_CITIES_FLAT.forEach(city => {
      citiesByState[city.state] = (citiesByState[city.state] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalUSCities: usCitiesCount,
        totalInternationalCities: intlCitiesCount,
        totalCities: usCitiesCount + intlCitiesCount,
        usStatesCount: Object.keys(citiesByState).length,
        citiesByState: citiesByState,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error retrieving stats",
    });
  }
});

/**
 * @route   GET /api/search
 * @desc    Get search API information
 * @access  Public
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "City Search API endpoints",
    endpoints: {
      search: {
        "GET /cities?q=<query>&limit=<limit>&country=<country>": "Search for cities",
        "GET /cities/us/:state?q=<query>&limit=<limit>": "Get cities by US state",
        "GET /suggestions?q=<query>&limit=<limit>&realtime=<bool>": "Get city suggestions for autocomplete",
        "GET /autocomplete?q=<query>&limit=<limit>": "Fast real-time autocomplete suggestions"
      },
      utility: {
        "GET /stats": "Get search database statistics",
        "GET /": "This endpoint - API information"
      }
    },
    parameters: {
      q: "Search query string",
      limit: "Maximum results to return (varies by endpoint)",
      country: "Filter by country code (US for US cities only)",
      state: "Two-letter US state code (for state-specific searches)"
    },
    examples: {
      searchCities: "/api/search/cities?q=New+York&limit=10",
      searchUSOnly: "/api/search/cities?q=Springfield&country=US&limit=20",
      searchByState: "/api/search/cities?q=California&limit=15",
      citiesByState: "/api/search/cities/us/CA?q=San&limit=15",
      suggestions: "/api/search/suggestions?q=Chi&limit=8",
      autocomplete: "/api/search/autocomplete?q=Los&limit=8"
    }
  });
});

export default router;

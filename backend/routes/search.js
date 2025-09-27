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
import {
  getCountryMetadataForInput,
  buildCountryCapitalEntry,
} from "../../shared/utils/countryLookup.js";

const router = express.Router();

let cachedRegionDisplayNames;

const getRegionDisplayNames = () => {
  if (cachedRegionDisplayNames !== undefined) {
    return cachedRegionDisplayNames;
  }

  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      cachedRegionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    } else {
      cachedRegionDisplayNames = null;
    }
  } catch (error) {
    cachedRegionDisplayNames = null;
  }

  return cachedRegionDisplayNames;
};

const COUNTRY_DISPLAY_OVERRIDES = {
  GB: 'UK',
  UK: 'UK',
  US: 'United States',
  BR: 'Brazil',
  GR: 'Greece',
};

/**
 * Convert ISO country codes to reader-friendly names when possible
 * @param {string} country - Country code or name
 * @returns {string} Display-ready country label
 */
const formatCountryForDisplay = (country) => {
  if (!country || typeof country !== 'string') {
    return '';
  }

  const trimmed = country.trim();
  if (!trimmed) {
    return '';
  }

  const upper = trimmed.toUpperCase();
  if (COUNTRY_DISPLAY_OVERRIDES[upper]) {
    return COUNTRY_DISPLAY_OVERRIDES[upper];
  }

  const displayNames = getRegionDisplayNames();
  if (displayNames && /^[A-Z]{2}$/i.test(upper)) {
    try {
      const resolved = displayNames.of(upper);
      if (resolved && resolved !== upper) {
        return resolved;
      }
    } catch (_) {
      // Ignore and fall back to defaults
    }
  }

  return upper.length === 2 ? upper : trimmed;
};

const US_SUFFIX_PATTERN = /(,?\s*(usa|u\.s\.a\.|united states(?: of america)?|us|u\.s\.))$/i;

const ensureUsDisplaySuffix = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (US_SUFFIX_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}, USA`;
};

const buildSuggestionPayload = (city, options = {}) => {
  if (!city || typeof city !== 'object') {
    return null;
  }

  const { includePriority = false } = options;
  const suggestion = { ...city };

  const rawCountry = ((suggestion.country ?? suggestion.countryCode) || '')
    .toString()
    .trim()
    .toUpperCase();

  const baseDisplayName =
    suggestion.name ||
    `${suggestion.city || ''}${suggestion.state ? ', ' + suggestion.state : ''}` +
    (rawCountry && rawCountry !== 'US'
      ? `, ${formatCountryForDisplay(rawCountry)}`
      : '');

  const inferredType =
    rawCountry === 'US'
      ? 'us'
      : suggestion.type === 'capital' || suggestion.isCapital
        ? 'capital'
        : 'international';

  const type = suggestion.type || inferredType;

  const badgeValue = (suggestion.badge || rawCountry || '')
    .toString()
    .trim();

  let badge = badgeValue ? badgeValue.toUpperCase() : '';
  if (!badge) {
    if (type === 'us') {
      badge = 'US';
    } else if (rawCountry) {
      badge = rawCountry;
    }
  }

  const displayName =
    rawCountry === 'US'
      ? ensureUsDisplaySuffix(baseDisplayName)
      : baseDisplayName;

  suggestion.id =
    suggestion.id ||
    `${suggestion.city || suggestion.name || 'unknown'}-${
      suggestion.state || rawCountry || 'UNK'
    }`;
  suggestion.country = rawCountry || null;
  suggestion.badge = badge || null;
  suggestion.type = type;
  suggestion.displayName = displayName;
  suggestion.searchValue =
    suggestion.searchValue || suggestion.city || suggestion.name || '';

  if (includePriority) {
    suggestion.priority = rawCountry === 'US' ? 1 : 2;
  } else {
    delete suggestion.priority;
  }

  return suggestion;
};

const buildSuggestionSignature = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const city = (entry.city || '').toString().trim().toLowerCase();
  const state = (entry.state || '').toString().trim().toLowerCase();
  const country = (
    entry.country || entry.countryCode || entry.alpha2 || entry.alpha3 || ''
  )
    .toString()
    .trim()
    .toLowerCase();
  const fallbackName = (entry.displayName || entry.name || '')
    .toString()
    .trim()
    .toLowerCase();

  if (!city && !fallbackName) {
    return null;
  }

  if (city) {
    return [city, state, country].join('|');
  }

  return fallbackName;
};

const dedupeSuggestions = (suggestions) => {
  if (!Array.isArray(suggestions)) {
    return [];
  }

  const signatureToEntry = new Map();
  const fallbackEntries = [];

  for (const entry of suggestions) {
    const signature = buildSuggestionSignature(entry);

    if (!signature) {
      fallbackEntries.push(entry);
      continue;
    }

    if (!signatureToEntry.has(signature)) {
      signatureToEntry.set(signature, entry);
      continue;
    }

    const existingEntry = signatureToEntry.get(signature);
    const existingType = (existingEntry?.type || '').toString().trim().toLowerCase();
    const currentType = (entry?.type || '').toString().trim().toLowerCase();

    const typePriority = {
      capital: 3,
      us: 2,
      international: 1,
    };

    const existingPriority = typePriority[existingType] || 0;
    const currentPriority = typePriority[currentType] || 0;

    if (currentPriority > existingPriority) {
      signatureToEntry.set(signature, entry);
    }
  }

  return [...signatureToEntry.values(), ...fallbackEntries];
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

const addAliasToSet = (aliasSet, value) => {
  const key = toInternationalKey(value);
  if (key) {
    aliasSet.add(key);
  }
};

const COUNTRY_ALIAS_DEFINITIONS = {
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
  DE: ['germany', 'deutschland', 'ger', 'de'],
  FR: ['france', 'fr'],
  IT: ['italy', 'italia', 'it'],
  ES: ['spain', 'españa', 'espana', 'es'],
  PT: ['portugal', 'pt'],
  GR: ['greece', 'gr'],
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
  HU: ['hungary', 'magyarorszag'],
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

const MAJOR_INTERNATIONAL_CITY_PRIORITY = {
  'london': ['GB', 'CA'],
  'paris': ['FR'],
  'berlin': ['DE'],
  'amsterdam': ['NL'],
  'madrid': ['ES'],
  'rome': ['IT'],
  'budapest': ['HU'],
  'moscow': ['RU'],
  'manchester': ['GB'],
  'rio': ['BR'],
  'rio de janeiro': ['BR'],
  'sao paulo': ['BR'],
  'tokyo': ['JP'],
  'osaka': ['JP'],
  'beijing': ['CN'],
  'sydney': ['AU'],
  'mumbai': ['IN'],
  'cairo': ['EG'],
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

  Object.values(COUNTRY_ALIAS_DEFINITIONS).forEach(aliasList => {
    aliasList.forEach(alias => addAliasToSet(aliases, alias));
  });

  return aliases;
};

const buildCountryAliasMap = () => {
  const aliasMap = new Map();
  const regionDisplayNames = getRegionDisplayNames();
  const codes = new Set([
    ...RANDOM_CITIES.map((city) => city.country).filter(Boolean),
    ...Object.keys(COUNTRY_ALIAS_DEFINITIONS),
    'US',
    'GB',
  ]);

  const addAliasToMap = (alias, code) => {
    const key = toInternationalKey(alias);
    if (key && !aliasMap.has(key)) {
      aliasMap.set(key, code);
    }
  };

  codes.forEach((code) => {
    if (!code) return;
    addAliasToMap(code, code);
    addAliasToMap(code.toLowerCase(), code);

    if (regionDisplayNames) {
      try {
        const displayName = regionDisplayNames.of(code);
        if (displayName && displayName !== code) {
          addAliasToMap(displayName, code);
        }
      } catch (_) {
        // Ignore errors thrown for uncommon codes
      }
    }
  });

  Object.entries(COUNTRY_ALIAS_DEFINITIONS).forEach(([code, aliases]) => {
    aliases.forEach((alias) => addAliasToMap(alias, code));
  });

  return aliasMap;
};

const COUNTRY_ALIAS_SET = buildCountryAliasSet();
const COUNTRY_ALIAS_MAP = buildCountryAliasMap();

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

const detectCountryCodeFromQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return null;
  }

  const cleaned = query
    .replace(/[\u2019\u2018\u201c\u201d]/g, "'")
    .replace(/[-.,\/#!$%\^&*;:{}=+_`~()?<>\[\]\\|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return null;
  }

  const tokens = cleaned.split(' ').filter(Boolean);
  const limit = Math.min(tokens.length, 4);

  for (let len = limit; len > 0; len--) {
    const candidate = tokens.slice(tokens.length - len).join(' ');
    const normalizedCandidate = toInternationalKey(candidate);
    if (normalizedCandidate && COUNTRY_ALIAS_MAP.has(normalizedCandidate)) {
      return COUNTRY_ALIAS_MAP.get(normalizedCandidate);
    }
  }

  return null;
};

const applyExplicitCountryPriority = (cities, countryCode) => {
  if (!Array.isArray(cities) || !countryCode) {
    return cities;
  }

  const normalizedCountry = countryCode.toUpperCase();
  if (!normalizedCountry) {
    return cities;
  }

  const matches = [];
  const others = [];

  cities.forEach((city) => {
    if (city?.country === normalizedCountry) {
      matches.push(city);
    } else {
      others.push(city);
    }
  });

  if (matches.length === 0) {
    return cities;
  }

  return [...matches, ...others];
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
  const rawInput = typeof query === "string" ? query.trim() : "";
  const countryMetadata = getCountryMetadataForInput(rawInput);
  const capitalEntry = countryMetadata
    ? buildCountryCapitalEntry(countryMetadata)
    : null;

  // Enhanced normalization to handle punctuation and casing variations
  const normalizedQuery = normalizeSearchQuery(query).toLowerCase().trim();
  
  // Extract city name from complex queries like "london great britain"
  let cityName = extractCityFromQuery(normalizedQuery);
  if (
    capitalEntry?.city &&
    (!cityName || /^[a-z]{2,3}$/i.test(cityName)) &&
    /^[a-z]{2,3}$/i.test(rawInput)
  ) {
    cityName = normalizeSearchQuery(capitalEntry.city).toLowerCase();
  }

  const explicitCountry =
    countryMetadata?.alpha2 ||
    detectCountryCodeFromQuery(query) ||
    detectCountryCodeFromQuery(normalizedQuery);
  
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

  if (!explicitCountry) {
    const priorityCountries =
      MAJOR_INTERNATIONAL_CITY_PRIORITY[toInternationalKey(cityName)] || [];

    priorityCountries.forEach((countryCode) => {
      const alreadyExact = exactIntlMatches.some(
        (city) => city.country === countryCode
      );

      if (!alreadyExact) {
        const candidateIndex = partialIntlMatches.findIndex(
          (city) => city.country === countryCode
        );

        if (candidateIndex !== -1) {
          const [promoted] = partialIntlMatches.splice(candidateIndex, 1);
          exactIntlMatches.unshift(promoted);
        }
      }
    });
  }
  
  // For exact international matches, prioritize major cities
  const prioritizedExactIntl = prioritizeInternationalCities(
    exactIntlMatches,
    cityName,
    explicitCountry
  );
  const prioritizedPartialIntl = prioritizeInternationalCities(
    partialIntlMatches,
    cityName,
    explicitCountry
  );
  
  // Build results with intelligent prioritization:
  // 1. Exact international matches (with major cities first)
  // 2. Exact US matches  
  // 3. Partial US matches (maintaining original US priority for partial matches)
  // 4. Partial international matches
  const prioritizedResults = [
    ...(capitalEntry ? [capitalEntry] : []),
    ...prioritizedExactIntl,
    ...exactUSMatches,
    ...partialUSMatches,
    ...prioritizedPartialIntl
  ];
  
  // Remove duplicates and limit results
  const uniqueResults = prioritizedResults.filter((city, index, self) => 
    index === self.findIndex(c => c.name === city.name)
  );

  const orderedResults = applyExplicitCountryPriority(uniqueResults, explicitCountry);

  return orderedResults.slice(0, limit);
};

/**
 * Prioritize international cities, putting major world cities first
 * @param {Array} cities - Array of international cities
 * @param {string} query - Original query for context
 * @returns {Array} Prioritized array of cities
 */
const prioritizeInternationalCities = (cities, query, preferredCountry = null) => {
  if (cities.length <= 1) return cities;

  const priorityOrder = [];
  if (preferredCountry) {
    priorityOrder.push(preferredCountry);
  }
  
  const priority = MAJOR_INTERNATIONAL_CITY_PRIORITY[toInternationalKey(query)];
  if (priority) {
    priority.forEach((code) => {
      if (!priorityOrder.includes(code)) {
        priorityOrder.push(code);
      }
    });
  }

  if (priorityOrder.length === 0) {
    return cities; // No special prioritization needed
  }
  
  // Sort cities according to the priority order
  return [...cities].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.country);
    const bIndex = priorityOrder.indexOf(b.country);
    
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
        suggestions = suggestions
          .map((city) => buildSuggestionPayload(city))
          .filter(Boolean);
      }

      const deduped = dedupeSuggestions(suggestions);

      res.json({
        success: true,
        data: deduped,
        query: query || '',
        count: deduped.length,
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
      const formattedSuggestions = suggestions
        .map((city) => buildSuggestionPayload(city, { includePriority: true }))
        .filter(Boolean);

      // Sort by priority (US first) and then alphabetically
      formattedSuggestions.sort((a, b) => {
        if ((a.priority ?? 0) !== (b.priority ?? 0)) {
          return (a.priority ?? 0) - (b.priority ?? 0);
        }
        return a.displayName.localeCompare(b.displayName);
      });

      const deduped = dedupeSuggestions(formattedSuggestions);

      res.json({
        success: true,
        data: deduped,
        query: sanitizedQuery,
        count: deduped.length,
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

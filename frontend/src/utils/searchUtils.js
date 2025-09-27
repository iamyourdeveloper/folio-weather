/**
 * Search utility functions for handling city queries
 */

import RANDOM_CITIES from "../data/randomCities.js";
import {
  getCountryCapital,
  getCountryMetadata,
} from "../data/countryCapitals.js";
import {
  getCountryMetadataForInput,
  buildCountryCapitalEntry,
  buildFuzzyCountryCapitalEntry,
} from "../../../shared/utils/countryLookup.js";
import { 
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
  if (!country || typeof country !== 'string') {
    return '';
  }

  const trimmed = country.trim();
  if (!trimmed) {
    return '';
  }

  const upper = trimmed.toUpperCase();
  if (upper === 'GB') {
    return 'UK';
  }

  const fullName = getCountryFullName(upper);
  if (fullName && fullName !== upper) {
    return fullName;
  }

  return upper.length === 2 ? upper : trimmed;
};

// Helper to normalize strings for comparison (remove diacritics, lowercase)
const toInternationalKey = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const WASHINGTON_DC_REMAINDERS = new Set([
  'd',
  'dc',
  'd c',
  'district of columbia',
  'the district of columbia',
]);

const WASHINGTON_DC_TRAILING_ALIASES = [
  'united states of america',
  'united states',
  'usa',
  'u s a',
  'u s',
  'us',
  'america',
];

const stripWashingtonDcTrailingAliases = (value) => {
  if (!value) {
    return value;
  }

  let current = value;
  let changed;

  do {
    changed = false;

    for (const alias of WASHINGTON_DC_TRAILING_ALIASES) {
      if (!current) {
        break;
      }

      if (current === alias) {
        current = '';
        changed = true;
        break;
      }

      const aliasSuffix = ` ${alias}`;
      if (current.endsWith(aliasSuffix)) {
        current = current.slice(0, -aliasSuffix.length).trim();
        changed = true;
        break;
      }
    }
  } while (changed && current);

  return current;
};

function resolveUSStateCapitalQuery(stateCode) {
  if (!stateCode || typeof stateCode !== 'string') {
    return null;
  }

  const normalizedState = stateCode.replace(/\./g, '').trim().toUpperCase();
  if (!normalizedState) {
    return null;
  }

  const stateCities = getCitiesByState(normalizedState);
  if (!Array.isArray(stateCities) || stateCities.length === 0) {
    return null;
  }

  const capitalEntry = stateCities[0];
  const cityNameRaw = typeof capitalEntry?.city === 'string'
    ? capitalEntry.city.trim()
    : typeof capitalEntry?.name === 'string'
      ? capitalEntry.name.split(',')[0].trim()
      : '';

  const cityName = cityNameRaw;

  if (!cityName) {
    return null;
  }

  return {
    city: cityName,
    fullName: `${cityName}, ${normalizedState}, USA`,
  };
}

const isWashingtonDcQuery = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const cleaned = normalized
    .replace(/[.,/#!$%\^&*;:{}=+_`~()?<>\[\]\\|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned.startsWith('washington')) {
    return false;
  }

  const remainderRaw = cleaned.slice('washington'.length).trim();
  if (!remainderRaw) {
    return false;
  }

  const remainder = stripWashingtonDcTrailingAliases(remainderRaw);
  if (!remainder) {
    return false;
  }

  return WASHINGTON_DC_REMAINDERS.has(remainder);
};

const TOP_INTERNATIONAL_CITY_LIMIT = 5;

const findInternationalCityData = (cityName, countryCode) => {
  if (!cityName || !countryCode) return null;

  const normalizedName = toInternationalKey(cityName);
  if (!normalizedName) return null;

  return (
    RANDOM_CITIES.find(
      (entry) =>
        entry?.city &&
        entry.country === countryCode &&
        toInternationalKey(entry.city) === normalizedName
    ) || null
  );
};

const COUNTRY_CITY_SUGGESTIONS = (() => {
  const map = new Map();

  RANDOM_CITIES.forEach((entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const cityName = typeof entry.city === 'string' ? entry.city.trim() : '';
    const rawCountry = typeof entry.country === 'string' ? entry.country.trim() : '';

    if (!cityName || !rawCountry) {
      return;
    }

    const countryCode = rawCountry.toUpperCase();
    if (!countryCode) {
      return;
    }

    if (!map.has(countryCode)) {
      map.set(countryCode, []);
    }

    const preparedEntry = {
      ...entry,
      city: cityName,
      country: countryCode,
      countryCode,
      badge: (entry.badge || countryCode || '').toString().toUpperCase() || countryCode,
      type: entry.type || 'international',
      source: entry.source || 'countryCities',
    };

    map.get(countryCode).push(preparedEntry);
  });

  return map;
})();

const getCountryCitySuggestions = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return [];
  }

  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) {
    return [];
  }

  const entries = COUNTRY_CITY_SUGGESTIONS.get(normalized);
  return Array.isArray(entries) ? entries : [];
};

const buildInternationalCityDefaults = () => {
  const defaults = {};
  const countryCounts = new Map();

  const addCityData = (cityData, { force = false } = {}) => {
    if (!cityData || !cityData.city || !cityData.country) {
      return null;
    }

    const normalizedKey = toInternationalKey(cityData.city);
    if (!normalizedKey) {
      return null;
    }

    if (!force && defaults[normalizedKey]) {
      return defaults[normalizedKey];
    }

    const fullName = cityData.name || `${cityData.city}, ${cityData.country}`;

    const entry = {
      city: cityData.city,
      fullName,
      country: cityData.country,
    };

    defaults[normalizedKey] = entry;
    return entry;
  };

  const incrementCountryCount = (countryCode) => {
    const currentCount = countryCounts.get(countryCode) || 0;
    countryCounts.set(countryCode, currentCount + 1);
  };

  const getCountryCount = (countryCode) => countryCounts.get(countryCode) || 0;

  for (const cityData of RANDOM_CITIES) {
    if (!cityData?.city || cityData.country === 'US') {
      continue;
    }

    if (getCountryCount(cityData.country) >= TOP_INTERNATIONAL_CITY_LIMIT) {
      continue;
    }

    const added = addCityData(cityData);
    if (added) {
      incrementCountryCount(cityData.country);
    }
  }

  const additionalPriorityCities = [
    // Canada & Mexico
    { city: 'Quebec City', country: 'CA' },
    { city: 'Halifax', country: 'CA' },
    { city: 'Hamilton', country: 'CA' },
    { city: 'Cancún', country: 'MX' },
    // South America
    { city: 'Brasilia', country: 'BR' },
    { city: 'Montevideo', country: 'UY' },
    // Europe
    { city: 'Amsterdam', country: 'NL' },
    { city: 'Brussels', country: 'BE' },
    { city: 'Geneva', country: 'CH' },
    { city: 'Zurich', country: 'CH' },
    { city: 'Lisbon', country: 'PT' },
    { city: 'Dublin', country: 'IE' },
    { city: 'Edinburgh', country: 'GB' },
    { city: 'Coventry', country: 'GB' },
    { city: 'Reading', country: 'GB' },
    { city: 'Newport', country: 'GB' },
    { city: 'Belfast', country: 'GB' },
    { city: 'Derby', country: 'GB' },
    { city: 'Plymouth', country: 'GB' },
    { city: 'Portsmouth', country: 'GB' },
    { city: 'York', country: 'GB' },
    { city: 'Aberdeen', country: 'GB' },
    { city: 'Brighton', country: 'GB' },
    { city: 'Manchester', country: 'GB' },
    { city: 'Birmingham', country: 'GB' },
    { city: 'Florence', country: 'IT' },
    { city: 'Naples', country: 'IT' },
    { city: 'Milan', country: 'IT' },
    { city: 'Parma', country: 'IT' },
    { city: 'Barcelona', country: 'ES' },
    { city: 'Valencia', country: 'ES' },
    { city: 'Munich', country: 'DE' },
    { city: 'Frankfurt', country: 'DE' },
    { city: 'Hamburg', country: 'DE' },
    { city: 'Prague', country: 'CZ' },
    { city: 'Warsaw', country: 'PL' },
    { city: 'Budapest', country: 'HU' },
    { city: 'Vienna', country: 'AT' },
    { city: 'Stockholm', country: 'SE' },
    { city: 'Oslo', country: 'NO' },
    { city: 'Copenhagen', country: 'DK' },
    { city: 'Helsinki', country: 'FI' },
    { city: 'Athens', country: 'GR' },
    { city: 'Istanbul', country: 'TR' },
    { city: 'Moscow', country: 'RU' },
    { city: 'Belgrade', country: 'RS' },
    { city: 'Bucharest', country: 'RO' },
    { city: 'Sofia', country: 'BG' },
    // Middle East & Africa
    { city: 'Dubai', country: 'AE' },
    { city: 'Abu Dhabi', country: 'AE' },
    { city: 'Doha', country: 'QA' },
    { city: 'Riyadh', country: 'SA' },
    { city: 'Jeddah', country: 'SA' },
    { city: 'Tel Aviv', country: 'IL' },
    { city: 'Jerusalem', country: 'IL' },
    { city: 'Amman', country: 'JO' },
    { city: 'Cairo', country: 'EG' },
    { city: 'Alexandria', country: 'EG' },
    { city: 'Lagos', country: 'NG' },
    { city: 'Abuja', country: 'NG' },
    { city: 'Accra', country: 'GH' },
    { city: 'Nairobi', country: 'KE' },
    { city: 'Addis Ababa', country: 'ET' },
    { city: 'Johannesburg', country: 'ZA' },
    { city: 'Cape Town', country: 'ZA' },
    { city: 'Casablanca', country: 'MA' },
    { city: 'Tunis', country: 'TN' },
    { city: 'Algiers', country: 'DZ' },
    // Asia & Oceania
    { city: 'Tokyo', country: 'JP' },
    { city: 'Osaka', country: 'JP' },
    { city: 'Kyoto', country: 'JP' },
    { city: 'Seoul', country: 'KR' },
    { city: 'Busan', country: 'KR' },
    { city: 'Shanghai', country: 'CN' },
    { city: 'Beijing', country: 'CN' },
    { city: 'Shenzhen', country: 'CN' },
    { city: 'Guangzhou', country: 'CN' },
    { city: 'Singapore', country: 'SG' },
    { city: 'Bangkok', country: 'TH' },
    { city: 'Phuket', country: 'TH' },
    { city: 'Kuala Lumpur', country: 'MY' },
    { city: 'Jakarta', country: 'ID' },
    { city: 'Manila', country: 'PH' },
    { city: 'Cebu City', country: 'PH' },
    { city: 'Ho Chi Minh City', country: 'VN' },
    { city: 'Hanoi', country: 'VN' },
    { city: 'Mumbai', country: 'IN' },
    { city: 'Delhi', country: 'IN' },
    { city: 'Bengaluru', country: 'IN' },
    { city: 'Hyderabad', country: 'IN' },
    { city: 'Chennai', country: 'IN' },
    { city: 'Kolkata', country: 'IN' },
    { city: 'Karachi', country: 'PK' },
    { city: 'Lahore', country: 'PK' },
    { city: 'Islamabad', country: 'PK' },
    { city: 'Dhaka', country: 'BD' },
    { city: 'Kathmandu', country: 'NP' },
    { city: 'Sydney', country: 'AU' },
    { city: 'Melbourne', country: 'AU' },
    { city: 'Brisbane', country: 'AU' },
    { city: 'Perth', country: 'AU' },
    { city: 'Newcastle', country: 'AU' },
    { city: 'Auckland', country: 'NZ' },
    { city: 'Wellington', country: 'NZ' },
  ];

  additionalPriorityCities.forEach(({ city, country, fallbackName }) => {
    const cityData = findInternationalCityData(city, country) ||
      (fallbackName
        ? { city, country, name: fallbackName }
        : null);

    if (cityData) {
      addCityData(cityData, { force: true });
    }
  });

  const aliasMap = {
    bangalore: { city: 'Bengaluru', country: 'IN' },
    bombay: { city: 'Mumbai', country: 'IN' },
    madras: { city: 'Chennai', country: 'IN' },
    calcutta: { city: 'Kolkata', country: 'IN' },
    saigon: { city: 'Ho Chi Minh City', country: 'VN' },
    'ho chi minh': { city: 'Ho Chi Minh City', country: 'VN' },
    peking: { city: 'Beijing', country: 'CN' },
    muenchen: { city: 'Munich', country: 'DE' },
    munchen: { city: 'Munich', country: 'DE' },
    wien: { city: 'Vienna', country: 'AT' },
    köln: { city: 'Cologne', country: 'DE' },
    koln: { city: 'Cologne', country: 'DE' },
    rio: { city: 'Rio de Janeiro', country: 'BR' },
    'rio de': { city: 'Rio de Janeiro', country: 'BR' },
    'rio, greece': { city: 'Rio', country: 'GR', fallbackName: 'Rio, Greece' },
    'rio greece': { city: 'Rio', country: 'GR', fallbackName: 'Rio, Greece' },
    'the hague': { city: 'The Hague', country: 'NL' },
    'den haag': { city: 'The Hague', country: 'NL' },
  };

  Object.entries(aliasMap).forEach(([alias, target]) => {
    const aliasKey = toInternationalKey(alias);
    if (!aliasKey || defaults[aliasKey]) {
      return;
    }

    const canonicalData = findInternationalCityData(target.city, target.country);
    const canonicalEntry = canonicalData ? addCityData(canonicalData) : defaults[toInternationalKey(target.city)];

    if (!canonicalEntry) {
      return;
    }

    defaults[aliasKey] = canonicalEntry;
  });

  const rioBrazilData = findInternationalCityData('Rio de Janeiro', 'BR');
  if (rioBrazilData) {
    defaults[toInternationalKey('Rio')] = {
      city: rioBrazilData.city,
      fullName:
        rioBrazilData.name || `${rioBrazilData.city}, ${rioBrazilData.country}`,
      country: rioBrazilData.country,
    };
  }

  const rioGreeceData = findInternationalCityData('Rio', 'GR');
  if (rioGreeceData) {
    const greekEntry = {
      city: rioGreeceData.city,
      fullName:
        rioGreeceData.name || `${rioGreeceData.city}, ${rioGreeceData.country}`,
      country: rioGreeceData.country,
    };
    defaults[toInternationalKey('Rio, Greece')] = greekEntry;
    defaults[toInternationalKey('Rio Greece')] = greekEntry;
  }

  return defaults;
};

const MAJOR_INTERNATIONAL_CITY_DEFAULTS = buildInternationalCityDefaults();

const getInternationalDefaultForCity = (value) => {
  const key = toInternationalKey(value);
  return key ? MAJOR_INTERNATIONAL_CITY_DEFAULTS[key] : null;
};

// Map of common alias codes to their canonical ISO representation
const COUNTRY_CODE_ALIASES = {
  UK: 'GB',
};

// Fallback names when Intl.DisplayNames is unavailable or for non-standard codes
const COUNTRY_NAME_OVERRIDES = {
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  US: 'United States',
  CV: 'Cape Verde',
};

const COUNTRY_NAME_FALLBACKS = {
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  MX: 'Mexico',
  BR: 'Brazil',
  CN: 'China',
  JP: 'Japan',
  IN: 'India',
  AU: 'Australia',
  NZ: 'New Zealand',
  RU: 'Russia',
};

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

const getCountryFullName = (countryOrCode) => {
  if (!countryOrCode || typeof countryOrCode !== 'string') return null;

  const trimmed = countryOrCode.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  const canonicalCode = COUNTRY_CODE_ALIASES[upper] || upper;

  if (COUNTRY_NAME_OVERRIDES[canonicalCode]) {
    return COUNTRY_NAME_OVERRIDES[canonicalCode];
  }

  const displayNames = getRegionDisplayNames();
  if (displayNames && /^[A-Z]{2}$/i.test(canonicalCode)) {
    const resolved = displayNames.of(canonicalCode);
    if (resolved && resolved !== canonicalCode) {
      return resolved;
    }
  }

  if (COUNTRY_NAME_FALLBACKS[canonicalCode]) {
    return COUNTRY_NAME_FALLBACKS[canonicalCode];
  }

  if (trimmed.length > 3 || trimmed.includes(' ')) {
    return trimmed;
  }

  return trimmed;
};

const COUNTRY_ALIAS_DEFINITIONS = {
  US: ['usa', 'u.s.', 'u.s', 'america', 'united states', 'united states of america'],
  GB: ['uk', 'u.k.', 'great britain', 'england', 'scotland', 'wales', 'britain'],
  NL: ['netherlands', 'the netherlands', 'nederland', 'holland'],
  RU: ['russia', 'russian federation', 'ru'],
  CA: ['canada', 'ca', 'can'],
  MX: ['mexico', 'mx'],
  BR: ['brazil', 'brasil', 'br'],
  AR: ['argentina'],
  CL: ['chile'],
  CO: ['colombia'],
  PE: ['peru'],
  VE: ['venezuela'],
  FR: ['france', 'fr'],
  DE: ['germany', 'deutschland', 'ger', 'de'],
  IT: ['italy', 'italia', 'it'],
  ES: ['spain', 'españa', 'espana', 'es'],
  PT: ['portugal', 'pt'],
  IE: ['ireland', 'ie'],
  BE: ['belgium', 'be'],
  CH: ['switzerland', 'swiss', 'ch'],
  AT: ['austria', 'at'],
  SE: ['sweden', 'se'],
  NO: ['norway', 'no'],
  FI: ['finland', 'fi'],
  DK: ['denmark', 'dk'],
  HU: ['hungary', 'magyarorszag'],
  PL: ['poland', 'pl'],
  CZ: ['czech republic', 'czechia', 'cz'],
  SK: ['slovakia', 'sk'],
  UA: ['ukraine', 'ua'],
  RO: ['romania', 'ro'],
  BG: ['bulgaria', 'bg'],
  HR: ['croatia', 'hr'],
  SI: ['slovenia', 'si'],
  RS: ['serbia', 'rs'],
  BA: ['bosnia and herzegovina', 'bosnia', 'ba'],
  MK: ['north macedonia', 'macedonia', 'mk'],
  GR: ['greece', 'gr'],
  TR: ['turkey', 'turkiye', 'tr'],
  IL: ['israel', 'il'],
  EG: ['egypt', 'eg'],
  ZA: ['south africa', 'za'],
  MA: ['morocco', 'ma'],
  DZ: ['algeria', 'dz'],
  TN: ['tunisia', 'tn'],
  NG: ['nigeria', 'ng'],
  GH: ['ghana', 'gh'],
  KE: ['kenya', 'ke'],
  ET: ['ethiopia', 'et'],
  CN: ['china', 'prc', 'p.r.c', 'cn'],
  JP: ['japan', 'nippon', 'nihon', 'jp'],
  KR: ['south korea', 'republic of korea', 'korea republic', 'rok', 'kr'],
  IN: ['india', 'bharat', 'in'],
  PK: ['pakistan', 'pk'],
  BD: ['bangladesh', 'bd'],
  NP: ['nepal', 'np'],
  LK: ['sri lanka', 'lk'],
  VN: ['vietnam', 'viet nam', 'vn'],
  TH: ['thailand', 'th'],
  SG: ['singapore', 'sg'],
  PH: ['philippines', 'ph'],
  MY: ['malaysia', 'my'],
  ID: ['indonesia', 'id'],
  KH: ['cambodia', 'kh'],
  LA: ['laos', 'lao', 'la'],
  MM: ['myanmar', 'burma', 'mm'],
  AU: ['australia', 'au', 'aus'],
  NZ: ['new zealand', 'nz'],
  SA: ['saudi arabia', 'kingdom of saudi arabia', 'ksa', 'sa'],
  AE: ['united arab emirates', 'uae', 'u.a.e', 'ae'],
  QA: ['qatar', 'qa'],
  KW: ['kuwait', 'kw'],
  BH: ['bahrain', 'bh'],
  OM: ['oman', 'om'],
  JO: ['jordan', 'jo'],
  LB: ['lebanon', 'lb'],
  SY: ['syria', 'sy'],
  IR: ['iran', 'islamic republic of iran', 'ir'],
  IQ: ['iraq', 'iq'],
  HK: ['hong kong', 'hk'],
  MO: ['macao', 'macau', 'macau sar', 'macao special administrative region'],
  TW: ['taiwan', 'republic of china', 'roc', 'tw'],
  MV: ['maldives', 'republic of maldives', 'mv'],
  UY: ['uruguay', 'uy'],
  PY: ['paraguay', 'py'],
  BO: ['bolivia', 'plurinational state of bolivia', 'bo'],
  EC: ['ecuador', 'ec'],
  CR: ['costa rica', 'cr'],
  PA: ['panama', 'pa'],
  CU: ['cuba', 'cu'],
  DO: ['dominican republic', 'do'],
  JM: ['jamaica', 'jm'],
  HT: ['haiti', 'ht'],
  CV: ['cape verde', 'cabo verde', 'cv'],
};

const buildAliasKeySet = (code) => {
  const aliases = COUNTRY_ALIAS_DEFINITIONS[code] || [];
  const keys = new Set();

  const pushKey = (value) => {
    const key = toInternationalKey(value);
    if (key) {
      keys.add(key);
    }
  };

  if (code) {
    pushKey(code);
  }

  aliases.forEach(pushKey);

  return keys;
};

const US_COUNTRY_ALIAS_KEYS = buildAliasKeySet('US');
const FALLBACK_US_ALIAS_KEYS = new Set([
  'united states of america',
  'united states',
  'us',
  'usa',
  'u.s.',
  'u.s',
  'america',
  'united states of',
  'united states of, us',
]);

const matchesUSCountryAliasKey = (key) =>
  key && (US_COUNTRY_ALIAS_KEYS.has(key) || FALLBACK_US_ALIAS_KEYS.has(key));

const STATE_ALIAS_DEFINITIONS = {
  // Canadian provinces and territories
  'ontario': 'ON', 'on': 'ON',
  'british columbia': 'BC', 'bc': 'BC',
  'alberta': 'AB', 'ab': 'AB',
  'quebec': 'QC', 'québec': 'QC', 'qc': 'QC',
  'manitoba': 'MB', 'mb': 'MB',
  'saskatchewan': 'SK', 'sk': 'SK',
  'nova scotia': 'NS', 'ns': 'NS',
  'new brunswick': 'NB', 'nb': 'NB',
  'newfoundland and labrador': 'NL', 'newfoundland': 'NL', 'nl': 'NL',
  'prince edward island': 'PE', 'pei': 'PE', 'pe': 'PE',
  'yukon': 'YT', 'yt': 'YT',
  'northwest territories': 'NT', 'nt': 'NT',
  'nunavut': 'NU', 'nu': 'NU',

  // US states and District of Columbia
  'alabama': 'AL', 'al': 'AL',
  'alaska': 'AK', 'ak': 'AK',
  'arizona': 'AZ', 'az': 'AZ',
  'arkansas': 'AR', 'ar': 'AR',
  'california': 'CA', 'ca': 'CA',
  'colorado': 'CO', 'co': 'CO',
  'connecticut': 'CT', 'ct': 'CT',
  'delaware': 'DE', 'de': 'DE',
  'florida': 'FL', 'fl': 'FL',
  'georgia': 'GA', 'ga': 'GA',
  'hawaii': 'HI', 'hi': 'HI',
  'idaho': 'ID', 'id': 'ID',
  'illinois': 'IL', 'il': 'IL',
  'indiana': 'IN', 'in': 'IN',
  'iowa': 'IA', 'ia': 'IA',
  'kansas': 'KS', 'ks': 'KS',
  'kentucky': 'KY', 'ky': 'KY',
  'louisiana': 'LA', 'la': 'LA',
  'maine': 'ME', 'me': 'ME',
  'maryland': 'MD', 'md': 'MD',
  'massachusetts': 'MA', 'ma': 'MA',
  'michigan': 'MI', 'mi': 'MI',
  'minnesota': 'MN', 'mn': 'MN',
  'mississippi': 'MS', 'ms': 'MS',
  'missouri': 'MO', 'mo': 'MO',
  'montana': 'MT', 'mt': 'MT',
  'nebraska': 'NE', 'ne': 'NE',
  'nevada': 'NV', 'nv': 'NV',
  'new hampshire': 'NH', 'nh': 'NH',
  'new jersey': 'NJ', 'nj': 'NJ',
  'new mexico': 'NM', 'nm': 'NM',
  'new york': 'NY', 'ny': 'NY',
  'north carolina': 'NC', 'nc': 'NC',
  'north dakota': 'ND', 'nd': 'ND',
  'ohio': 'OH', 'oh': 'OH',
  'oklahoma': 'OK', 'ok': 'OK',
  'oregon': 'OR', 'or': 'OR',
  'pennsylvania': 'PA', 'pa': 'PA',
  'rhode island': 'RI', 'ri': 'RI',
  'south carolina': 'SC', 'sc': 'SC',
  'south dakota': 'SD', 'sd': 'SD',
  'tennessee': 'TN', 'tn': 'TN',
  'texas': 'TX', 'tx': 'TX',
  'utah': 'UT', 'ut': 'UT',
  'vermont': 'VT', 'vt': 'VT',
  'virginia': 'VA', 'va': 'VA',
  'washington': 'WA', 'wa': 'WA',
  'west virginia': 'WV', 'wv': 'WV',
  'wisconsin': 'WI', 'wi': 'WI',
  'wyoming': 'WY', 'wy': 'WY',
  'district of columbia': 'DC', 'd.c.': 'DC', 'dc': 'DC', 'washington dc': 'DC', 'washington d.c.': 'DC', 'd c': 'DC',
};

const addAliasToMap = (map, alias, code) => {
  const key = toInternationalKey(alias);
  if (!key || map.has(key)) {
    return;
  }
  map.set(key, code);
};

const buildCountryAliasMap = () => {
  const aliasMap = new Map();
  const regionDisplayNames = getRegionDisplayNames();
  const codes = new Set(RANDOM_CITIES.map(city => city.country).filter(Boolean));

  Object.keys(COUNTRY_ALIAS_DEFINITIONS).forEach(code => codes.add(code));
  ['US', 'GB'].forEach(code => codes.add(code));

  codes.forEach(code => {
    if (!code) return;
    addAliasToMap(aliasMap, code, code);
    addAliasToMap(aliasMap, code.toLowerCase(), code);

    if (regionDisplayNames) {
      try {
        const displayName = regionDisplayNames.of(code);
        if (displayName && displayName !== code) {
          addAliasToMap(aliasMap, displayName, code);
        }
      } catch (_) {
        // DisplayNames may throw for non-standard codes; ignore
      }
    }
  });

  Object.entries(COUNTRY_ALIAS_DEFINITIONS).forEach(([code, aliases]) => {
    aliases.forEach(alias => addAliasToMap(aliasMap, alias, code));
  });

  return aliasMap;
};

const buildStateAliasMap = () => {
  const aliasMap = new Map();
  Object.entries(STATE_ALIAS_DEFINITIONS).forEach(([alias, code]) => {
    addAliasToMap(aliasMap, alias, code);
  });
  return aliasMap;
};

const COUNTRY_ALIAS_MAP = buildCountryAliasMap();
const STATE_ALIAS_MAP = buildStateAliasMap();

const removeAliasFromTokens = (tokens, aliasMap, maxAliasTokens) => {
  if (!tokens.length) {
    return null;
  }

  const limit = Math.min(tokens.length, maxAliasTokens);

  for (let len = limit; len > 0; len--) {
    const candidate = tokens.slice(tokens.length - len).join(' ');
    const normalizedCandidate = toInternationalKey(candidate);
    if (normalizedCandidate && aliasMap.has(normalizedCandidate)) {
      tokens.splice(tokens.length - len, len);
      return aliasMap.get(normalizedCandidate);
    }
  }

  return null;
};

export const extractLocationComponents = (value) => {
  if (!value || typeof value !== 'string') {
    return { city: '', stateCode: null, countryCode: null };
  }

  const cleaned = value
    .replace(/[\u2019\u2018\u201c\u201d]/g, "'")
    .replace(/[-.,\/#!$%\^&*;:{}=+_`~()?<>\[\]\|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return { city: '', stateCode: null, countryCode: null };
  }

  const tokens = cleaned.split(' ').filter(Boolean);
  if (!tokens.length) {
    return { city: '', stateCode: null, countryCode: null };
  }

  const countryCode = removeAliasFromTokens(tokens, COUNTRY_ALIAS_MAP, 4);
  const stateCode = removeAliasFromTokens(tokens, STATE_ALIAS_MAP, 3);

  return {
    city: tokens.join(' ').trim(),
    stateCode,
    countryCode,
  };
};

const toTitleCase = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const buildInternationalDisplayName = (cityData, explicitCountryCode = null) => {
  if (!cityData) {
    return '';
  }

  const preferredCountry = explicitCountryCode || cityData.country;
  const displayCountry = preferredCountry
    ? formatCountryForDisplay(preferredCountry)
    : null;

  if (cityData.fullName) {
    if (
      displayCountry &&
      !cityData.fullName.toLowerCase().includes(displayCountry.toLowerCase())
    ) {
      return `${cityData.city}, ${displayCountry}`;
    }
    return cityData.fullName;
  }

  if (cityData.name) {
    if (
      displayCountry &&
      !cityData.name.toLowerCase().includes(displayCountry.toLowerCase())
    ) {
      return `${cityData.city}, ${displayCountry}`;
    }
    return cityData.name;
  }

  if (displayCountry) {
    return `${cityData.city}, ${displayCountry}`;
  }

  return cityData.city;
};

const extractPrimaryLocationName = (location) => {
  if (!location || typeof location !== 'object') return '';

  const candidates = [location.city, location.name, location.displayName];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      const trimmed = candidate.trim();
      if (trimmed.includes(',')) {
        const [firstPart] = trimmed.split(',');
        if (firstPart && firstPart.trim()) {
          return firstPart.trim();
        }
      }
      return trimmed;
    }
  }

  return '';
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
  const normalizedOriginalKey = toInternationalKey(trimmedQuery);
  const normalizedQueryKey = toInternationalKey(normalizedQuery);

  const componentsFromOriginal = extractLocationComponents(trimmedQuery);
  const componentsFromNormalized =
    normalizedQuery && normalizedQuery !== trimmedQuery
      ? extractLocationComponents(normalizedQuery)
      : null;

  const hasExplicitUSLocationContext = (() => {
    const isMeaningfulLocation = (components) => {
      if (!components) {
        return false;
      }

      if (components.stateCode) {
        return true;
      }

      const cityKey = toInternationalKey(components.city);

      if (!cityKey) {
        return false;
      }

      if (matchesUSCountryAliasKey(cityKey)) {
        return false;
      }

      return true;
    };

    if (isMeaningfulLocation(componentsFromOriginal)) {
      return true;
    }

    if (isMeaningfulLocation(componentsFromNormalized)) {
      return true;
    }

    return false;
  })();

  const shouldFallbackToUSCapital = (key) =>
    key && matchesUSCountryAliasKey(key) && !hasExplicitUSLocationContext;

  const detectStateOnlyIntent = (components) => {
    if (!components || !components.stateCode) {
      return null;
    }

    const normalizedState = components.stateCode
      .toString()
      .replace(/\./g, '')
      .trim()
      .toUpperCase();

    if (!normalizedState) {
      return null;
    }

    const cityKey = toInternationalKey(components.city);
    if (cityKey) {
      return null;
    }

    return normalizedState;
  };

  const stateOnlyIntent =
    detectStateOnlyIntent(componentsFromOriginal) ||
    detectStateOnlyIntent(componentsFromNormalized);

  if (isWashingtonDcQuery(trimmedQuery) || isWashingtonDcQuery(normalizedQuery)) {
    return {
      city: 'Washington',
      fullName: 'Washington, D.C., USA',
    };
  }

  if (stateOnlyIntent) {
    const capitalResult = resolveUSStateCapitalQuery(stateOnlyIntent);
    if (capitalResult) {
      return capitalResult;
    }
  }

  if (
    shouldFallbackToUSCapital(normalizedOriginalKey) ||
    shouldFallbackToUSCapital(normalizedQueryKey)
  ) {
    return {
      city: 'Washington',
      fullName: 'Washington, D.C., USA',
    };
  }

  // If there's no comma, this might be a single city name or "City State" format
  if (!normalizedQuery.includes(",")) {
    return handleSingleNameQuery(normalizedQuery, trimmedQuery, {
      normalizedOriginalKey,
      normalizedQueryKey,
    });
  }

  // Split by comma and take the first part as the city name
  // This handles cases like "Baltimore, MD" or "Paris, Île-de-France, France"
  const parts = normalizedQuery.split(",");
  const cityPart = parts[0].trim();

  const cityPartKey = toInternationalKey(cityPart);
  const remainingKey = toInternationalKey(parts.slice(1).join(',').trim());

  if (
    shouldFallbackToUSCapital(cityPartKey) ||
    shouldFallbackToUSCapital(remainingKey)
  ) {
    return {
      city: 'Washington',
      fullName: 'Washington, D.C., USA',
    };
  }

  // If the first part is empty for some reason, use the full query
  if (!cityPart) {
    return { city: trimmedQuery, fullName: trimmedQuery };
  }

  const remainingParts = parts
    .slice(1)
    .map((part) => part.trim())
    .filter(Boolean);

  const formattedCity = toTitleCase(cityPart);
  const formattedFullName =
    remainingParts.length > 0
      ? `${formattedCity}, ${remainingParts.join(', ')}`
      : formattedCity;

  return { city: formattedCity, fullName: formattedFullName };
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
    "DE": "Germany",
    "ger": "Germany",
    "germany": "Germany",
    "deutschland": "Germany",

    // Greece variations
    "gr": "Greece",
    "greece": "Greece",
    
    // United Kingdom variations - normalize all to GB for internal processing
    // but display will always show UK
    // Order matters: longer phrases first to avoid partial matches
    "united kingdom": "GB",
    "great britain": "GB", 
    "britain": "GB",
    "england": "GB",
    "uk": "GB",
    "gb": "GB",
    
    // Cape Verde variations (must come before Canada to avoid false matches)
    "cape verde": "Cape Verde",
    "cabo verde": "Cape Verde",
    
    // Canada variations
    "ca": "Canada",
    "can": "Canada",
    "canada": "Canada",
    
    // Australia variations
    "au": "Australia",
    "aus": "Australia",
    "australia": "Australia",
    
    // United States variations
    "united states of america": "US",
    "united states of": "US",
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
  
  // Check if the string already contains a known valid country name to avoid corruption
  const knownCountries = new Set([
    "Cape Verde", "United States", "United Kingdom", "Great Britain",
    "Canada", "Australia", "Germany", "France", "Japan", "Greece",
    "US", "USA", "UK", "GB", "CA", "AU", "DE", "FR", "JP", "GR"
  ]);
  
  // Special handling for Cape Verde to prevent "Ca" from being matched as Canada
  if (normalized.toLowerCase().includes("cape verde") || normalized.toLowerCase().includes("cabo verde")) {
    // Don't normalize country names if Cape Verde is present
    return normalized;
  }
  
  // Check if we already have a valid country in the query
  let hasValidCountry = false;
  if (normalized.includes(',')) {
    const parts = normalized.split(',');
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1].trim();
      if (knownCountries.has(lastPart)) {
        hasValidCountry = true;
      }
    }
  }
  
  // First handle country normalizations at the end of the string
  // Sort country variations by length (longest first) to handle multi-word countries properly
  const sortedCountryEntries = Object.entries(countryNormalizations)
    .sort(([a], [b]) => b.length - a.length);
  
  let countryMatched = false;

  // Skip normalization if we already have a valid country
  if (!hasValidCountry) {
    for (const [variation, standard] of sortedCountryEntries) {
      const patterns = [
        // "city, country" format
        new RegExp(`^(.+?),\\s*(${escapeRegex(variation)})\\s*$`, "i"),
        // "city country" format (no comma) - alias must appear at end
        new RegExp(`^(.+?)\\s+(${escapeRegex(variation)})\\s*$`, "i"),
      ];

      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          const cityName = match[1].trim();
          const matchedAlias = (match[2] || variation).trim();

          // Require explicit uppercase for two-letter country codes to avoid false positives
          if (
            variation.length === 2 &&
            variation === variation.toUpperCase() &&
            matchedAlias !== matchedAlias.toUpperCase()
          ) {
            continue;
          }

          normalized = `${cityName}, ${standard}`;
          countryMatched = true;
          break;
        }
      }

      if (countryMatched) {
        break;
      }
    }
  }

  // Then handle state/province normalizations
  let stateMatched = false;

  for (const [variation, standard] of Object.entries(stateNormalizations)) {
    const patterns = [
      // "city, state" format (more specific)
      new RegExp(`^(.+?),\\s*(${escapeRegex(variation)})(\\s*,\\s*.+)?$`, "i"),
      // "city state" format (no comma) with optional trailing content
      new RegExp(`^(.+?)\\s+(${escapeRegex(variation)})(\\s*,?\\s*.+)?$`, "i"),
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const cityName = match[1].trim();
        const matchedAlias = (match[2] || variation).trim();
        const trailing = match[3] ? match[3].trim() : '';

        // Avoid treating mid-word connectors like "de" as the Delaware state unless explicitly capitalized
        if (
          standard === 'DE' &&
          matchedAlias === matchedAlias.toLowerCase()
        ) {
          continue;
        }

        let suffix = '';
        if (trailing) {
          const cleanedSuffix = trailing.replace(/^,/, '').trim();
          if (cleanedSuffix && (countryMatched || /[a-z]/i.test(cleanedSuffix))) {
            suffix = `, ${cleanedSuffix}`;
          }
        }

        normalized = `${cityName}, ${standard}${suffix}`;
        stateMatched = true;
        break;
      }
    }

    if (stateMatched) {
      break;
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
const handleSingleNameQuery = (
  normalizedQuery,
  originalQuery,
  precomputedKeys = {}
) => {
  if (!normalizedQuery) {
    return { city: originalQuery || '', fullName: originalQuery || '' };
  }

  const rawInput = typeof originalQuery === 'string' ? originalQuery.trim() : '';
  const countryMetadataFromCode = getCountryMetadataForInput(rawInput);
  if (countryMetadataFromCode?.capital) {
    const capitalEntry = buildCountryCapitalEntry(countryMetadataFromCode);
    if (capitalEntry) {
      return {
        city: capitalEntry.city,
        fullName: capitalEntry.name,
      };
    }
  }

  // If the user's original text maps directly to a curated international city (e.g., "Rio" -> Rio de Janeiro)
  const originalAliasDefault = getInternationalDefaultForCity(originalQuery);
  if (originalAliasDefault) {
    return {
      city: originalAliasDefault.city,
      fullName: buildInternationalDisplayName(originalAliasDefault),
    };
  }

  const { city: candidateCity, stateCode, countryCode } = extractLocationComponents(normalizedQuery);
  const normalizedOriginalKey = precomputedKeys.normalizedOriginalKey ?? toInternationalKey(originalQuery);
  const normalizedQueryKey = precomputedKeys.normalizedQueryKey ?? toInternationalKey(normalizedQuery);

  const candidateCityKey = typeof candidateCity === 'string'
    ? toInternationalKey(candidateCity)
    : '';

  const isUSCountryAliasOnlyQuery =
    countryCode === 'US' &&
    !stateCode &&
    (
      matchesUSCountryAliasKey(normalizedQueryKey) ||
      matchesUSCountryAliasKey(normalizedOriginalKey) ||
      matchesUSCountryAliasKey(candidateCityKey)
    );

  if (isUSCountryAliasOnlyQuery) {
    return {
      city: 'Washington',
      fullName: 'Washington, D.C., USA',
    };
  }

  const baseCity = candidateCity || normalizedQuery.trim();

  if (!baseCity) {
    return { city: originalQuery || '', fullName: originalQuery || '' };
  }

  const normalizedCityKey = toInternationalKey(baseCity);

  const aliasMatchesCountry = (key) =>
    Boolean(countryCode && key && COUNTRY_ALIAS_MAP.get(key) === countryCode);

  if (
    countryCode &&
    !candidateCity &&
    (aliasMatchesCountry(normalizedOriginalKey) ||
      aliasMatchesCountry(normalizedQueryKey) ||
      aliasMatchesCountry(normalizedCityKey))
  ) {
    const metadata = getCountryMetadata(countryCode) || getCountryMetadata(originalQuery);
    if (metadata?.capital) {
      const capitalEntry = buildCountryCapitalEntry(metadata);
      if (capitalEntry) {
        return {
          city: capitalEntry.city,
          fullName: capitalEntry.name,
        };
      }
    }

    const capitalMatch =
      getCountryCapital(countryCode) ||
      getCountryCapital(originalQuery) ||
      getCountryCapital(baseCity);

    if (capitalMatch) {
      const displayCountry =
        getCountryFullName(countryCode) ||
        formatCountryForDisplay(countryCode) ||
        toTitleCase(originalQuery);

      return {
        city: capitalMatch,
        fullName: `${capitalMatch}, ${displayCountry}`,
      };
    }
  }

  if (!normalizedCityKey) {
    return { city: baseCity, fullName: originalQuery || baseCity };
  }

  const hasCountryHint = Boolean(countryCode);
  const hasStateHint = Boolean(stateCode);
  const explicitUSIntent = hasStateHint || countryCode === 'US';

  const findInternationalMatches = (countryFilter = null) =>
    RANDOM_CITIES.filter(
      (cityData) =>
        cityData.city &&
        toInternationalKey(cityData.city) === normalizedCityKey &&
        (!countryFilter || cityData.country === countryFilter)
    );

  if (hasCountryHint && countryCode && countryCode !== 'US') {
    const countryMatches = findInternationalMatches(countryCode);

    if (countryMatches.length > 0) {
      const bestMatch =
        countryMatches.length === 1
          ? countryMatches[0]
          : disambiguateCities(countryMatches, normalizedQuery);

      return {
        city: bestMatch.city,
        fullName: buildInternationalDisplayName(bestMatch, countryCode),
      };
    }

    const internationalDefault = getInternationalDefaultForCity(baseCity);
    if (internationalDefault) {
      return {
        city: internationalDefault.city,
        fullName: buildInternationalDisplayName(internationalDefault, countryCode),
      };
    }

    const displayCity = toTitleCase(baseCity);
    if (countryCode) {
      return {
        city: displayCity,
        fullName: `${displayCity}, ${formatCountryForDisplay(countryCode)}`,
      };
    }
  }

  const usMatches = searchUSCities(baseCity, 10);

  if (explicitUSIntent && usMatches.length > 0) {
    let prioritizedMatches = usMatches;

    if (stateCode) {
      const stateFiltered = usMatches.filter((city) => city.state === stateCode);
      if (stateFiltered.length > 0) {
        prioritizedMatches = stateFiltered;
      }
    }

    const bestUSMatch = disambiguateUSCities(prioritizedMatches, normalizedQuery);
    return { city: bestUSMatch.city, fullName: bestUSMatch.name };
  }

  const internationalDefault = getInternationalDefaultForCity(baseCity);
  if (
    internationalDefault &&
    (!hasCountryHint || !countryCode || internationalDefault.country === countryCode)
  ) {
    return {
      city: internationalDefault.city,
      fullName: buildInternationalDisplayName(internationalDefault, countryCode || null),
    };
  }

  const exactUSMatch = usMatches.find(
    (city) => toInternationalKey(city.city) === normalizedCityKey
  );

  if (exactUSMatch && !hasCountryHint) {
    const bestMatch = disambiguateUSCities([exactUSMatch], normalizedQuery);
    return { city: bestMatch.city, fullName: bestMatch.name };
  }

  const internationalMatches = findInternationalMatches();
  if (internationalMatches.length > 0) {
    const bestInternational =
      internationalMatches.length === 1
        ? internationalMatches[0]
        : disambiguateCities(internationalMatches, normalizedQuery);

    return {
      city: bestInternational.city,
      fullName: buildInternationalDisplayName(
        bestInternational,
        countryCode || bestInternational.country
      ),
    };
  }

  if (usMatches.length > 0) {
    const fallbackUS = disambiguateUSCities(usMatches, normalizedQuery);
    return { city: fallbackUS.city, fullName: fallbackUS.name };
  }

  const fallbackCity = toTitleCase(baseCity);

  if (countryCode) {
    return {
      city: fallbackCity,
      fullName: `${fallbackCity}, ${formatCountryForDisplay(countryCode)}`,
    };
  }

  return {
    city: fallbackCity,
    fullName: originalQuery || fallbackCity,
  };
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
    'CA', 'TX', 'FL', 'NY', 'DC', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
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

  // Special case for San Diego: Always prefer US location
  if (queryLower === "san diego") {
    const usCity = cities.find((city) => city.country === "US");
    if (usCity) return usCity;
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

const PLACEHOLDER_LOCATION_SEGMENT_PATTERN = /^(?:n\/?a|n\.a\.?|none|null|undefined|unknown|not available|not applicable|na|nada)$/i;

const sanitizeLocationNameSegments = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return value.trim();
  }

  const filtered = parts.filter((part, index) => {
    if (index === 0) {
      return true;
    }

    const normalizedPart = part
      .replace(/[.\-\s]+/g, ' ')
      .trim()
      .toLowerCase();

    return !PLACEHOLDER_LOCATION_SEGMENT_PATTERN.test(normalizedPart);
  });

  return filtered.join(', ');
};

const ensureUsDisplaySuffix = (name) => {
  if (!name || typeof name !== 'string') {
    return name;
  }

  const sanitizedName = sanitizeLocationNameSegments(name);
  const trimmed = sanitizedName.trim();
  if (!trimmed) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();

  if (lower === 'unknown location' || lower === 'current location') {
    return trimmed;
  }

  const stripUsSuffixPattern = /(?:,?\s*(?:united states(?: of america| of)?|u\.s\.a\.?|u\.s\.?(?:a\.?)*|usa|us|america))+$/i;

  const base = trimmed
    .replace(stripUsSuffixPattern, '')
    .replace(/,\s*$/, '')
    .trim();

  if (!base) {
    return 'USA';
  }

  return `${base}, USA`;
};

/**
 * Resolves a location to its full display name using our database
 * @param {Object} location - Location object with city, name, country, state, countryCode
 * @returns {string} Full display name for the location
 */
export const resolveFullLocationName = (location) => {
  if (!location || (typeof location !== 'object')) return "Unknown Location";
  
  // Special case: if this is a coordinate-only location (no city/name), return a generic message
  if (location.type === "coords" && !location.city && !location.name && location.coordinates) {
    return "Current Location";
  }
  
  const sanitizedLocationName = sanitizeLocationNameSegments(location.name);
  const cityName = location.city || sanitizedLocationName || location.name;
  const country = location.country;
  const state = location.state;
  const countryCode = location.countryCode;
  
  if (!cityName || typeof cityName !== 'string') return normalizeUKLocationDisplay(sanitizedLocationName || location.name) || "Unknown Location";
  
  // Special handling for Washington D.C. - always display as "Washington, D.C."
  if (cityName.toLowerCase() === 'washington' && 
      ((country === "US" || countryCode === "US") && 
       (state === "DC" || state === "D.C." || state === "dc"))) {
    return "Washington, D.C.";
  }
  
  // Special handling for UK/GB locations - always normalize to UK
  if (country === "GB" || countryCode === "GB") {
    // If the location has a name, normalize it
    if (sanitizedLocationName && sanitizedLocationName.includes(",")) {
      return normalizeUKLocationDisplay(sanitizedLocationName);
    }
    // Otherwise, construct it as "City, UK"
    return `${cityName}, UK`;
  }
  
  // Always apply UK normalization to any location name that might contain GB variants
  // This catches cases where the backend hasn't normalized properly
  const potentialName = sanitizedLocationName || location.name || `${cityName}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`;
  if (potentialName && (potentialName.includes('GB') || potentialName.includes('Great Britain') || potentialName.includes('United Kingdom') || potentialName.includes('England'))) {
    return normalizeUKLocationDisplay(potentialName);
  }
  
  // If the location already has a properly formatted name that includes state/country, use it
  if (sanitizedLocationName && sanitizedLocationName.includes(",") && sanitizedLocationName !== cityName) {
    // Special case: if it's Washington, DC in the name, convert to D.C.
    if (sanitizedLocationName.toLowerCase().includes('washington, dc')) {
      return sanitizedLocationName.replace(/washington,\s*dc/i, 'Washington, D.C.');
    }
    // Normalize UK display for any location name
    return normalizeUKLocationDisplay(sanitizedLocationName);
  }
  
  // Priority 1: Use backend-provided state information for US cities
  if ((country === "US" || countryCode === "US") && state) {
    // Special case for D.C.
    if ((state === "DC" || state === "D.C." || state === "dc") && cityName.toLowerCase() === 'washington') {
      return "Washington, D.C.";
    }
    return `${cityName}, ${state}`;
  }
  
  // Priority 1.5: For US cities without state but with US country, try to construct proper name
  if ((country === "US" || countryCode === "US") && sanitizedLocationName && sanitizedLocationName.includes(",")) {
    // If we have a properly formatted name like "San Diego, CA" and it's a US location, use it
    const nameParts = sanitizedLocationName.split(",").map(p => p.trim());
    if (nameParts.length >= 2) {
      return sanitizedLocationName;
    }
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
  } else {
    const appendDistinctPart = (value) => {
      if (!value || typeof value !== 'string') {
        return;
      }

      const normalizedValue = value.trim();
      if (!normalizedValue) {
        return;
      }

      const lower = normalizedValue.toLowerCase();
      const alreadyPresent = nameParts.some(
        (part) => typeof part === 'string' && part.trim().toLowerCase() === lower
      );

      if (!alreadyPresent) {
        nameParts.push(normalizedValue);
      }
    };

    if (country && country !== "US") {
      appendDistinctPart(formatCountryForDisplay(country));
    } else if (countryCode && countryCode !== "US") {
      appendDistinctPart(formatCountryForDisplay(countryCode));
    }
  }
  
  const constructedName = nameParts.join(", ");
  
  // Apply UK normalization to the constructed name
  return normalizeUKLocationDisplay(sanitizeLocationNameSegments(constructedName));
};

/**
 * Resolves a location label for WeatherCard with full country names for non-US locations.
 * Falls back to resolveFullLocationName for US and edge cases.
 * @param {Object} location - Location object from weather data
 * @returns {string} Display name suitable for WeatherCard headers
 */
export const resolveLocationNameForWeatherCard = (location) => {
  if (!location || typeof location !== 'object') return 'Unknown Location';

  if (location.type === 'coords' && !location.city && !location.name) {
    return 'Current Location';
  }

  const sanitizedLocationName = sanitizeLocationNameSegments(location.name);
  const primaryName = extractPrimaryLocationName({ ...location, name: sanitizedLocationName });
  const trimmedPrimary = primaryName?.trim();

  if (!trimmedPrimary) {
    return resolveFullLocationName(location);
  }

  let countrySource = typeof location.country === 'string' && location.country.trim()
    ? location.country
    : typeof location.countryCode === 'string' && location.countryCode.trim()
      ? location.countryCode
      : '';

  if (!countrySource && typeof sanitizedLocationName === 'string' && sanitizedLocationName.includes(',')) {
    const parts = sanitizedLocationName
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      countrySource = parts[parts.length - 1];
    }
  }

  const normalizedCountryCode = countrySource ? countrySource.trim().toUpperCase() : '';
  const countryFullName = getCountryFullName(countrySource);

  const dcCityLower = typeof location.city === 'string'
    ? location.city.trim().toLowerCase()
    : '';
  const dcStateToken = typeof location.state === 'string'
    ? location.state.replace(/\./g, '').trim().toLowerCase()
    : '';
  const dcNameValue = typeof sanitizedLocationName === 'string' && sanitizedLocationName
    ? sanitizedLocationName
    : (typeof location.name === 'string' ? location.name.trim() : '');
  const dcPrimaryLower = trimmedPrimary ? trimmedPrimary.toLowerCase() : '';
  const rawCountryValue = typeof location.country === 'string' ? location.country.trim() : '';
  const rawCountryCodeValue = typeof location.countryCode === 'string' ? location.countryCode.trim() : '';
  const rawCountryLower = rawCountryValue.toLowerCase();
  const rawCountryCodeUpper = rawCountryCodeValue.toUpperCase();
  const looksLikeWashingtonDC =
    /washington,\s*d\.?c\.?/i.test(dcNameValue) ||
    (dcPrimaryLower && dcPrimaryLower.startsWith('washington, d.c.'));
  const isUSForDC =
    normalizedCountryCode === 'US' ||
    rawCountryCodeUpper === 'US' ||
    rawCountryLower === 'united states' ||
    rawCountryLower === 'united states of america' ||
    (countryFullName && countryFullName.toLowerCase().includes('united states'));

  if (
    isUSForDC &&
    (
      (dcCityLower === 'washington' &&
        (dcStateToken === 'dc' || dcStateToken === 'district of columbia')) ||
      looksLikeWashingtonDC
    )
  ) {
    return 'Washington, D.C., USA';
  }

  const isUSLocation =
    normalizedCountryCode === 'US' ||
    (countryFullName && countryFullName.toLowerCase().includes('united states'));

  if (isUSLocation) {
    const resolvedName = resolveFullLocationName({ ...location, name: sanitizedLocationName });
    return ensureUsDisplaySuffix(resolvedName);
  }

  const primaryLower = trimmedPrimary ? trimmedPrimary.toLowerCase() : '';
  const countryNameLower = countryFullName ? countryFullName.toLowerCase() : '';
  const countryCodeLower = normalizedCountryCode ? normalizedCountryCode.toLowerCase() : '';
  const cityValue = typeof location.city === 'string' ? location.city.trim() : '';
  const cityLower = cityValue ? cityValue.toLowerCase() : '';
  const fullNameValue = typeof sanitizedLocationName === 'string' && sanitizedLocationName
    ? sanitizedLocationName
    : (typeof location.name === 'string' ? location.name.trim() : '');
  const fullNameLower = fullNameValue ? fullNameValue.toLowerCase() : '';

  const looksLikeCountrySearch = (() => {
    if (!countryFullName && !normalizedCountryCode) {
      return false;
    }

    if (
      typeof location.type === 'string' &&
      location.type.trim().toLowerCase() === 'country'
    ) {
      return true;
    }

    if (!cityLower) {
      return true;
    }

    if (countryNameLower && cityLower === countryNameLower) {
      return true;
    }

    if (countryCodeLower && cityLower === countryCodeLower) {
      return true;
    }

    if (countryNameLower && primaryLower === countryNameLower) {
      return true;
    }

    if (countryCodeLower && primaryLower === countryCodeLower) {
      return true;
    }

    if (countryNameLower && fullNameLower === countryNameLower) {
      return true;
    }

    if (
      fullNameLower &&
      countryNameLower &&
      fullNameLower === `${countryNameLower}, ${countryNameLower}`
    ) {
      return true;
    }

    return false;
  })();

  if (looksLikeCountrySearch) {
    const resolvedCapital =
      getCountryCapital(normalizedCountryCode) ||
      getCountryCapital(countryFullName);

    if (resolvedCapital) {
      const displayCountry = countryFullName || trimmedPrimary || normalizedCountryCode;
      if (displayCountry) {
        return `${resolvedCapital}, ${displayCountry}`;
      }
      return resolvedCapital;
    }
  }

  if (!countryFullName) {
    return resolveFullLocationName(location) || trimmedPrimary;
  }

  if (trimmedPrimary.toLowerCase() === countryFullName.toLowerCase()) {
    return countryFullName;
  }

  return `${trimmedPrimary}, ${countryFullName}`;
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

  const { countryCode: explicitCountryCode } = extractLocationComponents(
    parsedQuery.fullName || query
  );
  const normalizedCountryCode = explicitCountryCode
    ? explicitCountryCode.toUpperCase()
    : null;
  
  // Get US city results using the parsed city name
  const countryMetadata = getCountryMetadataForInput(query);
  const capitalEntry = countryMetadata ? buildCountryCapitalEntry(countryMetadata) : null;

  const normalizedCityKey = toInternationalKey(cityToSearch);
  const normalizedRawKey = toInternationalKey(query);

  const matchesExplicitCountry = (key) =>
    Boolean(
      key &&
        normalizedCountryCode &&
        COUNTRY_ALIAS_MAP.has(key) &&
        COUNTRY_ALIAS_MAP.get(key) === normalizedCountryCode
    );

  const matchesCountryCode = (key) =>
    Boolean(
      key && normalizedCountryCode && key === normalizedCountryCode.toLowerCase()
    );

  const looksLikeCountryQuery = Boolean(normalizedCountryCode) && (
    !cityToSearch ||
    matchesExplicitCountry(normalizedCityKey) ||
    matchesExplicitCountry(normalizedRawKey) ||
    matchesCountryCode(normalizedCityKey) ||
    matchesCountryCode(normalizedRawKey)
  );

  const countrySpecificSuggestions = looksLikeCountryQuery && normalizedCountryCode
    ? getCountryCitySuggestions(normalizedCountryCode).map((entry) => ({
        ...entry,
        country: normalizedCountryCode,
        countryCode: normalizedCountryCode,
        badge: (entry.badge || normalizedCountryCode).toUpperCase(),
        source: entry.source || 'countryCities',
        type: entry.type || 'international',
      }))
    : [];

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
  const prioritizedExactIntl = prioritizeInternationalCitiesLocal(
    exactIntlMatches,
    normalizedQuery,
    normalizedCountryCode
  );
  const prioritizedPartialIntl = prioritizeInternationalCitiesLocal(
    partialIntlMatches,
    normalizedQuery,
    normalizedCountryCode
  );
  
  // Build results with intelligent prioritization:
  // 1. Exact international matches (with major cities first)
  // 2. Exact US matches  
  // 3. Partial US matches (maintaining original US priority for partial matches)
  // 4. Partial international matches
  const prioritizedResults = [
    ...(capitalEntry ? [capitalEntry] : []),
    ...countrySpecificSuggestions,
    ...prioritizedExactIntl,
    ...exactUSMatches,
    ...partialUSMatches,
    ...prioritizedPartialIntl
  ];
  
  // Remove duplicates and limit results
  const uniqueResults = prioritizedResults.filter((city, index, self) => 
    index === self.findIndex(c => c.name === city.name)
  );
  
  const orderedResults = applyExplicitCountryPriority(
    uniqueResults,
    normalizedCountryCode
  );

  return orderedResults.slice(0, limit);
};

/**
 * Prioritize international cities, putting major world cities first (frontend version)
 * @param {Array} cities - Array of international cities
 * @param {string} query - Original query for context
 * @returns {Array} Prioritized array of cities
 */
const prioritizeInternationalCitiesLocal = (cities, query, preferredCountry = null) => {
  if (cities.length <= 1) return cities;
  
  const priorityOrder = [];
  if (preferredCountry) {
    priorityOrder.push(preferredCountry);
  }
  
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
    'rio': ['BR'],
    'rio de janeiro': ['BR'],
    'sao paulo': ['BR'],
    'tokyo': ['JP'],
    'osaka': ['JP'],
    'beijing': ['CN'],
    'sydney': ['AU'],
    'mumbai': ['IN'],
    'cairo': ['EG']
  };
  
  const majorPriority = majorCityPriority[toInternationalKey(query)];
  if (majorPriority) {
    majorPriority.forEach((code) => {
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

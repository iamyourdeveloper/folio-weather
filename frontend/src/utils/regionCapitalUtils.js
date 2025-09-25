import COUNTRY_CAPITALS from "@/data/countryCapitals.js";

const REGION_COUNTRY_CODES = {
  "North America": [
    "AG",
    "BB",
    "BS",
    "BZ",
    "CA",
    "CR",
    "CU",
    "DM",
    "DO",
    "GD",
    "GL",
    "GT",
    "HN",
    "HT",
    "JM",
    "KN",
    "LC",
    "MX",
    "NI",
    "PA",
    "SV",
    "TT",
    "US",
    "VC",
  ],
  "South America": [
    "AR",
    "BO",
    "BR",
    "CL",
    "CO",
    "EC",
    "GF",
    "GY",
    "PE",
    "PY",
    "SR",
    "UY",
    "VE",
  ],
  Europe: [
    "AD",
    "AL",
    "AM",
    "AT",
    "AZ",
    "BA",
    "BE",
    "BG",
    "BY",
    "CH",
    "CY",
    "CZ",
    "DE",
    "DK",
    "EE",
    "ES",
    "FI",
    "FR",
    "GB",
    "GE",
    "GR",
    "HR",
    "HU",
    "IE",
    "IS",
    "IT",
    "LI",
    "LT",
    "LU",
    "LV",
    "MC",
    "MD",
    "ME",
    "MK",
    "MT",
    "NL",
    "NO",
    "PL",
    "PT",
    "RO",
    "RS",
    "RU",
    "SE",
    "SI",
    "SK",
    "SM",
    "TR",
    "UA",
    "VA",
    "XK",
  ],
  Asia: [
    "AF",
    "BD",
    "BN",
    "BT",
    "CN",
    "HK",
    "ID",
    "IN",
    "JP",
    "KG",
    "KH",
    "KP",
    "KR",
    "KZ",
    "LA",
    "LK",
    "MM",
    "MN",
    "MO",
    "MV",
    "MY",
    "NP",
    "PH",
    "PK",
    "SG",
    "TH",
    "TJ",
    "TL",
    "TM",
    "TW",
    "UZ",
    "VN",
  ],
  Africa: [
    "AO",
    "BF",
    "BI",
    "BJ",
    "BW",
    "CD",
    "CF",
    "CG",
    "CI",
    "CM",
    "CV",
    "DJ",
    "DZ",
    "EG",
    "ER",
    "ET",
    "GA",
    "GH",
    "GM",
    "GN",
    "GQ",
    "GW",
    "KE",
    "KM",
    "LR",
    "LS",
    "LY",
    "MA",
    "MG",
    "ML",
    "MR",
    "MU",
    "MW",
    "MZ",
    "NA",
    "NE",
    "NG",
    "RW",
    "SC",
    "SD",
    "SL",
    "SN",
    "SO",
    "SS",
    "ST",
    "SZ",
    "TD",
    "TG",
    "TN",
    "TZ",
    "UG",
    "ZA",
    "ZM",
    "ZW",
  ],
  Oceania: [
    "AU",
    "FJ",
    "FM",
    "KI",
    "MH",
    "NR",
    "NZ",
    "PG",
    "PW",
    "SB",
    "TO",
    "TV",
    "VU",
    "WS",
  ],
  "Middle East": [
    "AE",
    "BH",
    "CY",
    "IL",
    "IQ",
    "IR",
    "JO",
    "KW",
    "LB",
    "OM",
    "PS",
    "QA",
    "SA",
    "SY",
    "TR",
    "YE",
  ],
};

const REGION_ALIASES = {
  northamerica: "North America",
  "north-america": "North America",
  southamerica: "South America",
  "south-america": "South America",
  europe: "Europe",
  asia: "Asia",
  africa: "Africa",
  oceania: "Oceania",
  australia: "Oceania",
  australasia: "Oceania",
  "middleeast": "Middle East",
  "middle-east": "Middle East",
  "themiddleeast": "Middle East",
};

const normalizeQueryKey = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
};

const pickRandom = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index] || null;
};

const buildRegionOptions = (regionName) => {
  const countryCodes = REGION_COUNTRY_CODES[regionName];
  if (!countryCodes) {
    return [];
  }

  return countryCodes
    .map((code) => {
      const entry = COUNTRY_CAPITALS[code];
      if (!entry || !entry.capital) {
        return null;
      }

      const displayCountry = entry.name || code;
      const displayCity = entry.capital;

      return {
        countryCode: code,
        countryName: displayCountry,
        city: displayCity,
        fullName: `${displayCity}, ${displayCountry}`,
      };
    })
    .filter(Boolean);
};

export const getRandomRegionCapital = (query) => {
  if (!query || typeof query !== "string") {
    return null;
  }

  const key = normalizeQueryKey(query);
  if (!key) {
    return null;
  }

  const trimmed = query.trim();

  const canonicalRegion = (() => {
    if (trimmed && REGION_COUNTRY_CODES[trimmed]) {
      return trimmed;
    }

    if (REGION_ALIASES[key]) {
      return REGION_ALIASES[key];
    }

    return null;
  })();

  if (!canonicalRegion || !REGION_COUNTRY_CODES[canonicalRegion]) {
    return null;
  }

  const options = buildRegionOptions(canonicalRegion);
  if (!options.length) {
    return null;
  }

  const selection = pickRandom(options);
  if (!selection) {
    return null;
  }

  return {
    region: canonicalRegion,
    ...selection,
  };
};

export const isRegionQuery = (query) => Boolean(getRandomRegionCapital(query));

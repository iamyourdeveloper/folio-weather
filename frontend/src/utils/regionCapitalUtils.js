import COUNTRY_CAPITALS from "@/data/countryCapitals.js";

const REGION_COUNTRY_CODES = {
  "North America": [
    "US",
    "CA",
    "MX",
    "GT",
    "BZ",
    "SV",
    "HN",
    "NI",
    "CR",
    "PA",
    "CU",
    "DO",
    "HT",
    "JM",
    "BS",
    "GL",
  ],
  "South America": [
    "AR",
    "BO",
    "BR",
    "CL",
    "CO",
    "EC",
    "GY",
    "PE",
    "PY",
    "SR",
    "UY",
    "VE",
    "GF",
  ],
  Europe: [
    "AL",
    "AD",
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
    "KZ",
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
    "AZ",
    "BD",
    "BH",
    "BN",
    "BT",
    "CN",
    "GE",
    "HK",
    "ID",
    "IN",
    "JP",
    "KH",
    "KP",
    "KR",
    "KG",
    "LA",
    "LK",
    "MM",
    "MN",
    "MO",
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
    "DZ",
    "AO",
    "BJ",
    "BW",
    "BF",
    "BI",
    "CV",
    "CM",
    "CF",
    "TD",
    "KM",
    "CG",
    "CD",
    "CI",
    "DJ",
    "EG",
    "GQ",
    "ER",
    "ET",
    "GA",
    "GM",
    "GH",
    "GN",
    "GW",
    "KE",
    "LS",
    "LR",
    "LY",
    "MG",
    "MW",
    "ML",
    "MR",
    "MU",
    "MA",
    "MZ",
    "NA",
    "NE",
    "NG",
    "RW",
    "ST",
    "SN",
    "SC",
    "SL",
    "SO",
    "ZA",
    "SS",
    "SD",
    "SZ",
    "TZ",
    "TG",
    "TN",
    "UG",
    "ZM",
    "ZW",
  ],
  Oceania: [
    "AU",
    "NZ",
    "FJ",
    "FM",
    "KI",
    "MH",
    "NR",
    "PW",
    "PG",
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

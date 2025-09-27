import { ALPHA2_TO_METADATA, ALPHA3_TO_ALPHA2 } from "../data/countryCodeMetadata.js";

const COUNTRY_SPECIAL_ALIASES = {
  UK: "GB",
};

const buildMetadataResponse = (alpha2Code) => {
  if (!alpha2Code) {
    return null;
  }

  const entry = ALPHA2_TO_METADATA[alpha2Code];
  if (!entry) {
    return null;
  }

  return { ...entry };
};

const normalizeCodeInput = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
};

export const getCountryMetadataForInput = (value) => {
  const normalized = normalizeCodeInput(value);
  if (!normalized) {
    return null;
  }

  if (COUNTRY_SPECIAL_ALIASES[normalized]) {
    return buildMetadataResponse(COUNTRY_SPECIAL_ALIASES[normalized]);
  }

  if (normalized.length === 2) {
    return buildMetadataResponse(normalized);
  }

  if (normalized.length === 3) {
    const alpha2 = ALPHA3_TO_ALPHA2[normalized];
    return buildMetadataResponse(alpha2);
  }

  return null;
};

export const buildCountryCapitalEntry = (metadata) => {
  if (!metadata || !metadata.capital) {
    return null;
  }

  const alpha2 = metadata.alpha2 || null;
  const alpha3 = metadata.alpha3 || null;
  const numeric = metadata.numeric || null;
  const countryName = metadata.name || alpha2 || alpha3 || "";
  const capital = metadata.capital;

  const entry = {
    city: capital,
    name: `${capital}, ${countryName}`,
    country: alpha2 || null,
    alpha2,
    alpha3,
    numeric,
    countryName,
    badge: (alpha2 || alpha3 || "").toUpperCase() || null,
    isCapital: true,
    type: "capital",
    source: "countryMetadata",
  };

  if (alpha2 === "US") {
    entry.state = "DC";
  }

  return entry;
};

export const buildCountryCapitalQuery = (metadata) => {
  if (!metadata) {
    return null;
  }

  if (metadata.capital) {
    const countryName = metadata.name || metadata.alpha2 || metadata.alpha3 || "";
    return `${metadata.capital}, ${countryName}`;
  }

  return metadata.name || metadata.alpha2 || metadata.alpha3 || null;
};

export const buildFuzzyCountryCapitalEntry = (value) => {
  const normalized = (value || '').trim();
  if (!normalized) {
    return { metadata: null, isExact: false };
  }

  const upper = normalized.toUpperCase();
  const exactByCode = getCountryMetadataForInput(upper);
  if (exactByCode && exactByCode.capital) {
    return { metadata: exactByCode, isExact: true };
  }

  const normalizedKey = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  for (const entry of Object.values(ALPHA2_TO_METADATA)) {
    if (!entry?.name) continue;
    const nameKey = entry.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (nameKey.includes(normalizedKey) || normalizedKey.includes(nameKey)) {
      return { metadata: entry, isExact: false };
    }
  }

  return { metadata: null, isExact: false };
};

export const ISO_ALPHA2_CODES = Object.freeze(Object.keys(ALPHA2_TO_METADATA));
export const ISO_ALPHA3_CODES = Object.freeze(Object.keys(ALPHA3_TO_ALPHA2));


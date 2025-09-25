const COUNTRY_CAPITALS = {
  AD: { capital: "Andorra la Vella", name: "Andorra" },
  AE: { capital: "Abu Dhabi", name: "United Arab Emirates" },
  AF: { capital: "Kabul", name: "Afghanistan" },
  AG: { capital: "St. John's", name: "Antigua and Barbuda" },
  AL: { capital: "Tirana", name: "Albania" },
  AM: { capital: "Yerevan", name: "Armenia" },
  AO: { capital: "Luanda", name: "Angola" },
  AR: { capital: "Buenos Aires", name: "Argentina" },
  AT: { capital: "Vienna", name: "Austria" },
  AU: { capital: "Canberra", name: "Australia" },
  AZ: { capital: "Baku", name: "Azerbaijan" },
  BA: { capital: "Sarajevo", name: "Bosnia and Herzegovina" },
  BB: { capital: "Bridgetown", name: "Barbados" },
  BD: { capital: "Dhaka", name: "Bangladesh" },
  BE: { capital: "Brussels", name: "Belgium" },
  BF: { capital: "Ouagadougou", name: "Burkina Faso" },
  BG: { capital: "Sofia", name: "Bulgaria" },
  BH: { capital: "Manama", name: "Bahrain" },
  BI: { capital: "Gitega", name: "Burundi" },
  BJ: { capital: "Porto-Novo", name: "Benin" },
  BN: { capital: "Bandar Seri Begawan", name: "Brunei" },
  BO: { capital: "La Paz", name: "Bolivia" },
  BR: { capital: "Brasilia", name: "Brazil" },
  BS: { capital: "Nassau", name: "Bahamas" },
  BT: { capital: "Thimphu", name: "Bhutan" },
  BW: { capital: "Gaborone", name: "Botswana" },
  BY: { capital: "Minsk", name: "Belarus" },
  BZ: { capital: "Belmopan", name: "Belize" },
  CA: { capital: "Ottawa", name: "Canada" },
  CD: {
    capital: "Kinshasa",
    name: "Democratic Republic of the Congo",
    altNames: [
      "Congo-Kinshasa",
      "DR Congo",
      "Democratic Republic of Congo",
    ],
  },
  CF: { capital: "Bangui", name: "Central African Republic" },
  CG: {
    capital: "Brazzaville",
    name: "Republic of the Congo",
    altNames: ["Congo-Brazzaville", "Republic of Congo"],
  },
  CH: { capital: "Bern", name: "Switzerland" },
  CI: {
    capital: "Yamoussoukro",
    name: "Cote d'Ivoire",
    altNames: ["Ivory Coast"],
  },
  CL: { capital: "Santiago", name: "Chile" },
  CM: { capital: "Yaounde", name: "Cameroon" },
  CN: { capital: "Beijing", name: "China" },
  CO: { capital: "Bogota", name: "Colombia" },
  CR: { capital: "San Jose", name: "Costa Rica" },
  CU: { capital: "Havana", name: "Cuba" },
  CV: { capital: "Praia", name: "Cabo Verde" },
  CY: { capital: "Nicosia", name: "Cyprus" },
  CZ: {
    capital: "Prague",
    name: "Czech Republic",
    altNames: ["Czechia"],
  },
  DE: { capital: "Berlin", name: "Germany" },
  DJ: { capital: "Djibouti", name: "Djibouti" },
  DK: { capital: "Copenhagen", name: "Denmark" },
  DM: { capital: "Roseau", name: "Dominica" },
  DO: { capital: "Santo Domingo", name: "Dominican Republic" },
  DZ: { capital: "Algiers", name: "Algeria" },
  EC: { capital: "Quito", name: "Ecuador" },
  EE: { capital: "Tallinn", name: "Estonia" },
  EG: { capital: "Cairo", name: "Egypt" },
  ER: { capital: "Asmara", name: "Eritrea" },
  ES: { capital: "Madrid", name: "Spain" },
  ET: { capital: "Addis Ababa", name: "Ethiopia" },
  FI: { capital: "Helsinki", name: "Finland" },
  FJ: { capital: "Suva", name: "Fiji" },
  FM: { capital: "Palikir", name: "Micronesia" },
  FR: { capital: "Paris", name: "France" },
  GA: { capital: "Libreville", name: "Gabon" },
  GB: { capital: "London", name: "United Kingdom" },
  GD: { capital: "St. George's", name: "Grenada" },
  GE: { capital: "Tbilisi", name: "Georgia" },
  GF: {
    capital: "Cayenne",
    name: "French Guiana",
    altNames: ["Guyane"],
  },
  GL: { capital: "Nuuk", name: "Greenland" },
  GH: { capital: "Accra", name: "Ghana" },
  GM: { capital: "Banjul", name: "Gambia" },
  GN: { capital: "Conakry", name: "Guinea" },
  GQ: { capital: "Malabo", name: "Equatorial Guinea" },
  GR: { capital: "Athens", name: "Greece" },
  GT: { capital: "Guatemala City", name: "Guatemala" },
  GW: { capital: "Bissau", name: "Guinea-Bissau" },
  GY: { capital: "Georgetown", name: "Guyana" },
  HK: {
    capital: "Hong Kong",
    name: "Hong Kong",
    altNames: [
      "Hong Kong SAR",
      "Hong Kong Special Administrative Region",
      "Hong Kong S.A.R.",
    ],
  },
  HN: { capital: "Tegucigalpa", name: "Honduras" },
  HR: { capital: "Zagreb", name: "Croatia" },
  HT: { capital: "Port-au-Prince", name: "Haiti" },
  HU: { capital: "Budapest", name: "Hungary" },
  ID: { capital: "Jakarta", name: "Indonesia" },
  IE: { capital: "Dublin", name: "Ireland" },
  IL: { capital: "Jerusalem", name: "Israel" },
  IN: { capital: "New Delhi", name: "India" },
  IQ: { capital: "Baghdad", name: "Iraq" },
  IR: { capital: "Tehran", name: "Iran" },
  IS: { capital: "Reykjavik", name: "Iceland" },
  IT: { capital: "Rome", name: "Italy" },
  JM: { capital: "Kingston", name: "Jamaica" },
  JO: { capital: "Amman", name: "Jordan" },
  JP: { capital: "Tokyo", name: "Japan" },
  KE: { capital: "Nairobi", name: "Kenya" },
  KG: { capital: "Bishkek", name: "Kyrgyzstan" },
  KH: { capital: "Phnom Penh", name: "Cambodia" },
  KI: { capital: "South Tarawa", name: "Kiribati" },
  KM: { capital: "Moroni", name: "Comoros" },
  KN: { capital: "Basseterre", name: "Saint Kitts and Nevis" },
  KP: {
    capital: "Pyongyang",
    name: "North Korea",
    altNames: ["Democratic People's Republic of Korea"],
  },
  KR: {
    capital: "Seoul",
    name: "South Korea",
    altNames: ["Republic of Korea"],
  },
  KW: { capital: "Kuwait City", name: "Kuwait" },
  KZ: { capital: "Astana", name: "Kazakhstan" },
  LA: { capital: "Vientiane", name: "Laos" },
  LB: { capital: "Beirut", name: "Lebanon" },
  LC: { capital: "Castries", name: "Saint Lucia" },
  LI: { capital: "Vaduz", name: "Liechtenstein" },
  LK: {
    capital: "Sri Jayawardenepura Kotte",
    name: "Sri Lanka",
    altNames: ["Sri Jayawardenepura"],
  },
  LR: { capital: "Monrovia", name: "Liberia" },
  LS: { capital: "Maseru", name: "Lesotho" },
  LT: { capital: "Vilnius", name: "Lithuania" },
  LU: { capital: "Luxembourg", name: "Luxembourg" },
  LV: { capital: "Riga", name: "Latvia" },
  LY: { capital: "Tripoli", name: "Libya" },
  MA: { capital: "Rabat", name: "Morocco" },
  MC: { capital: "Monaco", name: "Monaco" },
  MD: { capital: "Chisinau", name: "Moldova" },
  ME: { capital: "Podgorica", name: "Montenegro" },
  MG: { capital: "Antananarivo", name: "Madagascar" },
  MH: { capital: "Majuro", name: "Marshall Islands" },
  MK: { capital: "Skopje", name: "North Macedonia" },
  ML: { capital: "Bamako", name: "Mali" },
  MM: { capital: "Naypyidaw", name: "Myanmar", altNames: ["Burma"] },
  MN: { capital: "Ulaanbaatar", name: "Mongolia" },
  MO: {
    capital: "Macau",
    name: "Macao",
    altNames: [
      "Macau",
      "Macau SAR",
      "Macau, China",
      "Macao Special Administrative Region",
      "Macau S.A.R.",
    ],
  },
  MR: { capital: "Nouakchott", name: "Mauritania" },
  MT: { capital: "Valletta", name: "Malta" },
  MU: { capital: "Port Louis", name: "Mauritius" },
  MV: { capital: "Male", name: "Maldives" },
  MW: { capital: "Lilongwe", name: "Malawi" },
  MX: { capital: "Mexico City", name: "Mexico" },
  MY: { capital: "Kuala Lumpur", name: "Malaysia" },
  MZ: { capital: "Maputo", name: "Mozambique" },
  NA: { capital: "Windhoek", name: "Namibia" },
  NE: { capital: "Niamey", name: "Niger" },
  NG: { capital: "Abuja", name: "Nigeria" },
  NI: { capital: "Managua", name: "Nicaragua" },
  NL: { capital: "Amsterdam", name: "Netherlands" },
  NO: { capital: "Oslo", name: "Norway" },
  NP: { capital: "Kathmandu", name: "Nepal" },
  NR: { capital: "Yaren", name: "Nauru" },
  NZ: { capital: "Wellington", name: "New Zealand" },
  OM: { capital: "Muscat", name: "Oman" },
  PA: { capital: "Panama City", name: "Panama" },
  PE: { capital: "Lima", name: "Peru" },
  PG: { capital: "Port Moresby", name: "Papua New Guinea" },
  PH: { capital: "Manila", name: "Philippines" },
  PK: { capital: "Islamabad", name: "Pakistan" },
  PL: { capital: "Warsaw", name: "Poland" },
  PT: { capital: "Lisbon", name: "Portugal" },
  PS: {
    capital: "Ramallah",
    name: "Palestine",
    altNames: ["State of Palestine", "Palestinian Territories"],
  },
  PW: { capital: "Ngerulmud", name: "Palau" },
  PY: { capital: "Asuncion", name: "Paraguay" },
  QA: { capital: "Doha", name: "Qatar" },
  RO: { capital: "Bucharest", name: "Romania" },
  RS: { capital: "Belgrade", name: "Serbia" },
  RU: { capital: "Moscow", name: "Russia", altNames: ["Russian Federation"] },
  RW: { capital: "Kigali", name: "Rwanda" },
  SA: { capital: "Riyadh", name: "Saudi Arabia" },
  SB: { capital: "Honiara", name: "Solomon Islands" },
  SC: { capital: "Victoria", name: "Seychelles" },
  SD: { capital: "Khartoum", name: "Sudan" },
  SE: { capital: "Stockholm", name: "Sweden" },
  SG: { capital: "Singapore", name: "Singapore" },
  SI: { capital: "Ljubljana", name: "Slovenia" },
  SK: { capital: "Bratislava", name: "Slovakia" },
  SL: { capital: "Freetown", name: "Sierra Leone" },
  SM: { capital: "San Marino", name: "San Marino" },
  SN: { capital: "Dakar", name: "Senegal" },
  SO: { capital: "Mogadishu", name: "Somalia" },
  SR: { capital: "Paramaribo", name: "Suriname" },
  SS: { capital: "Juba", name: "South Sudan" },
  ST: { capital: "Sao Tome", name: "Sao Tome and Principe" },
  SV: { capital: "San Salvador", name: "El Salvador" },
  SY: { capital: "Damascus", name: "Syria", altNames: ["Syrian Arab Republic"] },
  SZ: { capital: "Mbabane", name: "Eswatini" },
  TD: { capital: "N'Djamena", name: "Chad" },
  TG: { capital: "Lome", name: "Togo" },
  TH: { capital: "Bangkok", name: "Thailand" },
  TJ: { capital: "Dushanbe", name: "Tajikistan" },
  TL: { capital: "Dili", name: "Timor-Leste", altNames: ["East Timor"] },
  TM: { capital: "Ashgabat", name: "Turkmenistan" },
  TN: { capital: "Tunis", name: "Tunisia" },
  TO: { capital: "Nuku'alofa", name: "Tonga" },
  TR: { capital: "Ankara", name: "Turkey" },
  TT: { capital: "Port of Spain", name: "Trinidad and Tobago" },
  TV: { capital: "Funafuti", name: "Tuvalu" },
  TW: {
    capital: "Taipei",
    name: "Taiwan",
    altNames: ["Taiwan, Province of China"],
  },
  TZ: { capital: "Dodoma", name: "Tanzania", altNames: ["United Republic of Tanzania"] },
  UA: { capital: "Kyiv", name: "Ukraine" },
  UG: { capital: "Kampala", name: "Uganda" },
  UY: { capital: "Montevideo", name: "Uruguay" },
  UZ: { capital: "Tashkent", name: "Uzbekistan" },
  VA: { capital: "Vatican City", name: "Vatican City", altNames: ["Holy See"] },
  VC: { capital: "Kingstown", name: "Saint Vincent and the Grenadines" },
  VE: {
    capital: "Caracas",
    name: "Venezuela",
    altNames: ["Bolivarian Republic of Venezuela"],
  },
  VN: { capital: "Hanoi", name: "Vietnam" },
  VU: { capital: "Port Vila", name: "Vanuatu" },
  WS: { capital: "Apia", name: "Samoa" },
  XK: { capital: "Pristina", name: "Kosovo" },
  YE: { capital: "Sanaa", name: "Yemen" },
  ZA: { capital: "Pretoria", name: "South Africa" },
  ZM: { capital: "Lusaka", name: "Zambia" },
  ZW: { capital: "Harare", name: "Zimbabwe" },
  US: { capital: "Washington, D.C.", name: "United States" },
};

const COUNTRY_CODE_ALIASES = {
  UK: "GB",
};

const normalizeCountryName = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

export const getCountryCapital = (countryOrCode) => {
  if (!countryOrCode || typeof countryOrCode !== "string") {
    return null;
  }

  const trimmed = countryOrCode.trim();
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase();
  const canonicalCode = COUNTRY_CODE_ALIASES[upper] || upper;

  if (COUNTRY_CAPITALS[canonicalCode]) {
    return COUNTRY_CAPITALS[canonicalCode].capital;
  }

  const normalized = normalizeCountryName(trimmed);
  for (const entry of Object.values(COUNTRY_CAPITALS)) {
    if (entry.name && normalizeCountryName(entry.name) === normalized) {
      return entry.capital;
    }

    if (Array.isArray(entry.altNames)) {
      for (const alt of entry.altNames) {
        if (normalizeCountryName(alt) === normalized) {
          return entry.capital;
        }
      }
    }
  }

  return null;
};

export default COUNTRY_CAPITALS;

import axios from "axios";
import http from "http";
import https from "https";
import {
  getStateForUSCity,
  formatUSCityWithState,
  isUSCity,
  getNearestUSStateByCoordinates,
} from "../data/usCitiesStateMapping.js";
import {
  searchUSCities,
  ALL_US_CITIES_FLAT,
} from "../data/allUSCitiesComplete.js";

/**
 * Convert GB country code to UK for display purposes
 * @param {string} country - Country code
 * @returns {string} Display country code (GB -> UK)
 */
const formatCountryForDisplay = (country) => {
  return country === 'GB' ? 'UK' : country;
};

class WeatherService {
  constructor() {
    // Ensure environment is loaded
    import("dotenv").then((dotenv) => dotenv.config());

    this.apiKey =
      process.env.OPENWEATHER_API_KEY || "b12265d01881b865932694e3950ffd1f";
    this.baseUrl =
      process.env.OPENWEATHER_BASE_URL ||
      "https://api.openweathermap.org/data/2.5";

    // Configure axios instance with better defaults
    this.axiosInstance = axios.create({
      timeout: 45000, // Increased timeout to 45 seconds for external API calls
      retry: 3, // Increased retries for better reliability
      retryDelay: 3000, // Increased delay between retries
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("🔥 Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(
          `✅ API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      async (error) => {
        const config = error.config;

        // Check if we should retry
        if (config && !config.__retryCount) {
          config.__retryCount = 0;
        }

        const shouldRetry =
          config &&
          config.__retryCount < (config.retry || 2) &&
          (!error.response ||
            error.response.status >= 500 ||
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT");

        if (shouldRetry) {
          config.__retryCount += 1;
          const delay = Math.min(
            config.retryDelay * Math.pow(2, config.__retryCount - 1), // Exponential backoff
            10000 // Max delay of 10 seconds
          );

          console.log(
            `🔄 Retrying OpenWeather API request (${config.__retryCount}/${config.retry}) after ${delay}ms`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.axiosInstance(config);
        }

        console.error(
          `❌ API Request Failed: ${error.config?.url} - ${error.message}`
        );
        return Promise.reject(error);
      }
    );

    // Simple in-memory cache for API responses
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // Increased to 10 minutes cache for better performance

    console.log(
      "🔑 WeatherService initialized with API key:",
      this.apiKey ? `${this.apiKey.slice(0, 8)}...` : "MISSING"
    );

    if (!this.apiKey) {
      console.warn(
        "⚠️ OpenWeather API key not found. Please set OPENWEATHER_API_KEY in your .env file"
      );
    }
  }

  // Cache key generator
  getCacheKey(url, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return `${url}?${sortedParams}`;
  }

  // Check cache for existing data
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Using cached data for: ${key}`);
      return cached.data;
    }
    return null;
  }

  // Store data in cache
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Enhanced API call with caching and retry logic
  async makeApiCall(url, params) {
    const cacheKey = this.getCacheKey(url, params);

    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log(`🌐 Making API call to: ${url} with params:`, params);
      const response = await this.axiosInstance.get(url, { params });

      // Cache the successful response
      this.setCachedData(cacheKey, response);

      return response;
    } catch (error) {
      console.error(`❌ API call failed for ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Get current weather by city name
   * @param {string} city - City name
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeatherByCity(city, units = "metric", originalName = null) {
    try {
      // Try to construct a better query for the OpenWeatherMap API
      const queryString = this.constructLocationQuery(city, originalName);

      console.log(
        `🔍 Searching for weather with query: "${queryString}" (original: "${
          originalName || city
        }")`
      );

      const response = await this.makeApiCall(`${this.baseUrl}/weather`, {
        q: queryString,
        appid: this.apiKey,
        units: units,
      });

      return this.formatCurrentWeatherData(response.data, originalName);
    } catch (error) {
      const queryString = this.constructLocationQuery(city, originalName);
      console.log(`⚠️ Primary query failed for "${queryString}"`);

      // Try multiple fallback strategies
      const fallbackStrategies = this.getFallbackStrategies(city, originalName);

      for (const fallback of fallbackStrategies) {
        try {
          console.log(
            `🔄 Trying fallback: "${fallback.query}" (${fallback.reason})`
          );

          const fallbackResponse = await this.makeApiCall(
            `${this.baseUrl}/weather`,
            {
              q: fallback.query,
              appid: this.apiKey,
              units: units,
            }
          );

          // Use the original name for display, but indicate it's a fallback
          const displayName = originalName || city;
          console.log(
            `✅ Fallback successful: Using "${fallback.query}" for "${displayName}"`
          );

          return this.formatCurrentWeatherData(
            fallbackResponse.data,
            displayName
          );
        } catch (fallbackError) {
          console.log(
            `❌ Fallback "${fallback.query}" failed: ${fallbackError.message}`
          );
          continue;
        }
      }

      // If all fallbacks fail, throw the original error with enhanced message
      const enhancedError = this.handleWeatherApiError(error);
      enhancedError.message = `Weather data not available for "${
        originalName || city
      }". This location may not be recognized by the weather service. Try searching for a nearby major city instead.`;
      throw enhancedError;
    }
  }

  /**
   * Get current weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Temperature units
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeatherByCoords(
    lat,
    lon,
    units = "metric",
    originalName = null
  ) {
    try {
      const response = await this.makeApiCall(`${this.baseUrl}/weather`, {
        lat: lat,
        lon: lon,
        appid: this.apiKey,
        units: units,
      });

      return this.formatCurrentWeatherData(response.data, originalName);
    } catch (error) {
      throw this.handleWeatherApiError(error);
    }
  }

  /**
   * Get 5-day weather forecast
   * @param {string} city - City name
   * @param {string} units - Temperature units
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByCity(city, units = "metric", originalName = null) {
    try {
      // Try to construct a better query for the OpenWeatherMap API
      const queryString = this.constructLocationQuery(city, originalName);

      console.log(
        `🔍 Searching for forecast with query: "${queryString}" (original: "${
          originalName || city
        }")`
      );

      const response = await this.makeApiCall(`${this.baseUrl}/forecast`, {
        q: queryString,
        appid: this.apiKey,
        units: units,
      });

      return this.formatForecastData(response.data, originalName);
    } catch (error) {
      const queryString = this.constructLocationQuery(city, originalName);
      console.log(`⚠️ Primary forecast query failed for "${queryString}"`);

      // Try multiple fallback strategies
      const fallbackStrategies = this.getFallbackStrategies(city, originalName);

      for (const fallback of fallbackStrategies) {
        try {
          console.log(
            `🔄 Trying forecast fallback: "${fallback.query}" (${fallback.reason})`
          );

          const fallbackResponse = await this.makeApiCall(
            `${this.baseUrl}/forecast`,
            {
              q: fallback.query,
              appid: this.apiKey,
              units: units,
            }
          );

          // Use the original name for display, but indicate it's a fallback
          const displayName = originalName || city;
          console.log(
            `✅ Forecast fallback successful: Using "${fallback.query}" for "${displayName}"`
          );

          return this.formatForecastData(fallbackResponse.data, displayName);
        } catch (fallbackError) {
          console.log(
            `❌ Forecast fallback "${fallback.query}" failed: ${fallbackError.message}`
          );
          continue;
        }
      }

      // If all fallbacks fail, throw the original error with enhanced message
      const enhancedError = this.handleWeatherApiError(error);
      enhancedError.message = `Forecast data not available for "${
        originalName || city
      }". This location may not be recognized by the weather service. Try searching for a nearby major city instead.`;
      throw enhancedError;
    }
  }

  /**
   * Get 5-day weather forecast by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Temperature units
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByCoords(lat, lon, units = "metric", originalName = null) {
    try {
      const response = await this.makeApiCall(`${this.baseUrl}/forecast`, {
        lat: lat,
        lon: lon,
        appid: this.apiKey,
        units: units,
      });

      return this.formatForecastData(response.data, originalName);
    } catch (error) {
      throw this.handleWeatherApiError(error);
    }
  }

  /**
   * Format location name to proper case (Title Case)
   * @param {string} locationName - Location name to format
   * @returns {string} Properly formatted location name
   */
  formatLocationName(locationName) {
    if (!locationName || typeof locationName !== "string") {
      return locationName;
    }

    // Special case for Washington D.C. - always format as "Washington, D.C."
    if (/^washington,?\s*(dc|d\.?c\.?)$/i.test(locationName.trim())) {
      return "Washington, D.C.";
    }

    // Normalize province/state names to abbreviations
    const stateProvinceNormalizations = {
      // Canadian provinces
      'Ontario': 'ON',
      'British Columbia': 'BC', 
      'Alberta': 'AB',
      'Quebec': 'QC',
      'Québec': 'QC',
      'Manitoba': 'MB',
      'Saskatchewan': 'SK',
      'Nova Scotia': 'NS',
      'New Brunswick': 'NB',
      'Newfoundland and Labrador': 'NL',
      'Newfoundland': 'NL',
      'Prince Edward Island': 'PE',
      'Yukon': 'YT',
      'Northwest Territories': 'NT',
      'Nunavut': 'NU',
      
      // US states (common full names that might appear)
      'Maryland': 'MD',
      'California': 'CA',
      'New York': 'NY',
      'Florida': 'FL',
      'Texas': 'TX',
      'Pennsylvania': 'PA',
      'Illinois': 'IL',
      'Ohio': 'OH',
      'Georgia': 'GA',
      'North Carolina': 'NC',
      'Michigan': 'MI',
      'New Jersey': 'NJ',
      'Virginia': 'VA',
      'Washington': 'WA',
      'Arizona': 'AZ',
      'Massachusetts': 'MA',
      'Indiana': 'IN',
      'Tennessee': 'TN',
      'Missouri': 'MO',
      'Wisconsin': 'WI',
      'Colorado': 'CO',
      'Minnesota': 'MN',
      'South Carolina': 'SC',
      'Alabama': 'AL',
      'Louisiana': 'LA',
      'Kentucky': 'KY',
      'Oregon': 'OR',
      'Oklahoma': 'OK',
      'Connecticut': 'CT',
      'Utah': 'UT',
      'Iowa': 'IA',
      'Nevada': 'NV',
      'Arkansas': 'AR',
      'Mississippi': 'MS',
      'Kansas': 'KS',
      'New Mexico': 'NM',
      'Nebraska': 'NE',
      'West Virginia': 'WV',
      'Idaho': 'ID',
      'Hawaii': 'HI',
      'New Hampshire': 'NH',
      'Maine': 'ME',
      'Montana': 'MT',
      'Rhode Island': 'RI',
      'Delaware': 'DE',
      'South Dakota': 'SD',
      'North Dakota': 'ND',
      'Alaska': 'AK',
      'Vermont': 'VT',
      'Wyoming': 'WY'
    };

    // Apply state/province normalizations
    let normalizedLocationName = locationName;
    for (const [fullName, abbreviation] of Object.entries(stateProvinceNormalizations)) {
      // Handle "City, Province/State" format
      const cityCommaStatePattern = new RegExp(`^(.+),\\s*${fullName}$`, 'i');
      const cityCommaStateMatch = normalizedLocationName.match(cityCommaStatePattern);
      if (cityCommaStateMatch) {
        const cityName = cityCommaStateMatch[1].trim();
        normalizedLocationName = `${cityName}, ${abbreviation}`;
        break;
      }

      // Handle "City Province/State" format (without comma)
      const cityStatePattern = new RegExp(`^(.+?)\\s+${fullName}$`, 'i');
      const cityStateMatch = normalizedLocationName.match(cityStatePattern);
      if (cityStateMatch) {
        const cityName = cityStateMatch[1].trim();
        normalizedLocationName = `${cityName}, ${abbreviation}`;
        break;
      }
    }

    return normalizedLocationName
      .split(",")
      .map((part) => part.trim())
      .map((part) => {
        // Handle special cases for state/country codes that should remain uppercase
        // Only match parts that are ONLY 2-3 letters and standalone (not part of a longer name)
        if (/^[A-Z]{2,3}$/i.test(part.trim()) && part.trim().length <= 3) {
          return part.toUpperCase();
        }

        // Handle words that should remain lowercase (prepositions, articles, etc.)
        const lowercaseWords = [
          "of",
          "the",
          "and",
          "de",
          "da",
          "do",
          "dos",
          "das",
          "la",
          "le",
          "les",
          "el",
          "del",
          "am",
          "an",
          "auf",
          "im",
          "in",
          "von",
          "zu",
          "zur",
        ];

        return part
          .split(" ")
          .map((word, index) => {
            const cleanWord = word.trim();
            if (!cleanWord) return cleanWord;

            // Handle state/country codes within words - be more selective
            // Only treat as state/country code if it's exactly 2 letters, common codes,
            // AND appears at the end of a location name (after comma) to avoid affecting
            // prepositions like "de" in "Rio de Janeiro"
            const commonStateCodes = [
              "AL",
              "AK",
              "AZ",
              "AR",
              "CA",
              "CO",
              "CT",
              "DC",
              "FL",
              "GA",
              "HI",
              "ID",
              "IL",
              "IN",
              "IA",
              "KS",
              "KY",
              "LA",
              "ME",
              "MD",
              "MA",
              "MI",
              "MN",
              "MS",
              "MO",
              "MT",
              "NE",
              "NV",
              "NH",
              "NJ",
              "NM",
              "NY",
              "NC",
              "ND",
              "OH",
              "OK",
              "OR",
              "PA",
              "RI",
              "SC",
              "SD",
              "TN",
              "TX",
              "UT",
              "VT",
              "VA",
              "WA",
              "WV",
              "WI",
              "WY",
              "ON",
              "BC",
              "AB",
              "MB",
              "SK",
              "NS",
              "NB",
              "NL",
              "PE",
              "NT",
              "NU",
              "YT", // Canadian provinces
            ];

            const commonCountryCodes = [
              "US",
              "GB",
              "CA",
              "AU",
              "FR",
              "DE",
              "IT",
              "ES",
              "MX",
              "JP",
              "CN",
              "IN",
              "BR",
              "RU", // Countries
            ];

            // Check if this word is a standalone state/country code
            // Only uppercase if it's a standalone 2-3 letter code at the end of a part
            const isStandaloneStateCode =
              cleanWord.length === 2 &&
              commonStateCodes.includes(cleanWord.toUpperCase()) &&
              part.trim().split(" ").length === 1; // Only if it's the only word in this comma-separated part

            const isStandaloneCountryCode =
              (cleanWord.length === 2 || cleanWord.length === 3) &&
              commonCountryCodes.includes(cleanWord.toUpperCase()) &&
              part.trim().split(" ").length === 1; // Only if it's the only word in this comma-separated part

            if (isStandaloneStateCode || isStandaloneCountryCode) {
              return cleanWord.toUpperCase();
            }

            // First word is always capitalized
            if (index === 0) {
              return this.capitalizeWord(cleanWord);
            }

            // Check if word should remain lowercase
            if (lowercaseWords.includes(cleanWord.toLowerCase())) {
              return cleanWord.toLowerCase();
            }

            return this.capitalizeWord(cleanWord);
          })
          .join(" ");
      })
      .join(", ");
  }

  /**
   * Capitalize a single word properly
   * @param {string} word - Word to capitalize
   * @returns {string} Properly capitalized word
   */
  capitalizeWord(word) {
    if (!word || typeof word !== "string") {
      return word;
    }

    // Handle special cases like "McDonald", "O'Connor", etc.
    if (word.includes("'")) {
      return word
        .split("'")
        .map((part, index) => {
          if (index === 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }
          // Capitalize after apostrophe for names like O'Connor
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("'");
    }

    // Handle hyphenated words like "Saint-Denis"
    if (word.includes("-")) {
      return word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-");
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  /**
   * Normalize GB location display to consistently show as UK
   * @param {string} cityName - The city name
   * @param {string} enhancedLocationName - Current enhanced location name
   * @param {string} originalName - Original search query
   * @returns {string} Normalized location name showing UK
   */
  normalizeGBLocationDisplay(cityName, enhancedLocationName, originalName) {
    // Always ensure GB locations show as UK, regardless of input format
    
    // Case 1: If the name already contains "GB", replace it with "UK"
    if (enhancedLocationName.includes(", GB")) {
      return enhancedLocationName.replace(", GB", ", UK");
    }
    
    // Case 2: If the name contains "Great Britain", replace it with "UK"
    if (enhancedLocationName.includes(", Great Britain")) {
      return enhancedLocationName.replace(", Great Britain", ", UK");
    }
    
    // Case 3: If the name contains "United Kingdom", replace it with "UK"
    if (enhancedLocationName.includes(", United Kingdom")) {
      return enhancedLocationName.replace(", United Kingdom", ", UK");
    }
    
    // Case 4: If the name contains "England", replace it with "UK" (for international recognition)
    if (enhancedLocationName.includes(", England")) {
      return enhancedLocationName.replace(", England", ", UK");
    }
    
    // Case 5: If no country is shown in the name, add "UK"
    if (!enhancedLocationName.includes(",")) {
      return `${cityName}, UK`;
    }
    
    // Case 6: If the original name had UK variations but current name doesn't show it properly
    if (originalName && this.isUKLocation(originalName) && !enhancedLocationName.includes(", UK")) {
      // Extract just the city name and add UK
      const cleanCityName = cityName || enhancedLocationName.split(',')[0].trim();
      return `${cleanCityName}, UK`;
    }
    
    // Default: ensure UK is shown
    return enhancedLocationName.includes(", UK") ? enhancedLocationName : `${cityName}, UK`;
  }

  /**
   * Format current weather data
   * @param {Object} data - Raw API response
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Object} Formatted weather data
   */
  formatCurrentWeatherData(data, originalName = null) {
    // Validate required data structure
    if (
      !data ||
      !data.coord ||
      !data.main ||
      !data.weather ||
      !data.weather[0] ||
      !data.sys
    ) {
      console.error("Invalid weather data structure:", data);
      throw new Error("Invalid weather data received from API");
    }

    const locationName = originalName || data.name || "Unknown Location";
    const formattedLocationName = this.formatLocationName(locationName);
    const cityName = this.formatLocationName(data.name) || "Unknown City";
    const countryCode = data.sys?.country || "";

    // Enhanced location formatting for US cities
    let enhancedLocationName = formattedLocationName;
    let state = null;

    // If this is a US city, try to add state information
    if (countryCode === "US" && data.name) {
      let detectedState = getStateForUSCity(
        data.name,
        data.coord?.lat,
        data.coord?.lon
      );

      // Fallback: infer state purely from coordinates if city is unknown
      if (!detectedState && typeof data.coord?.lat === 'number' && typeof data.coord?.lon === 'number') {
        detectedState = getNearestUSStateByCoordinates(data.coord.lat, data.coord.lon);
      }

      if (detectedState) {
        state = detectedState;
        // Only update the name if the original doesn't already contain state info
        if (!originalName || !originalName.includes(",")) {
          enhancedLocationName = formatUSCityWithState(cityName, detectedState);
        }
      }
    }
    // For non-US cities, ensure proper country display formatting
    else if (countryCode && countryCode !== "US") {
      // Always ensure GB is displayed as UK, regardless of original formatting
      if (countryCode === "GB") {
        enhancedLocationName = this.normalizeGBLocationDisplay(cityName, enhancedLocationName, originalName);
      } else if (!enhancedLocationName.includes(",") && !originalName) {
        // For other non-US countries, add country if not already present
        enhancedLocationName = `${cityName}, ${formatCountryForDisplay(countryCode)}`;
      }
    }

    return {
      location: {
        name: String(enhancedLocationName),
        city: String(cityName),
        country: String(countryCode),
        state: state, // Add state information
        coordinates: {
          lat: Number(data.coord.lat) || 0,
          lon: Number(data.coord.lon) || 0,
        },
      },
      current: {
        temperature: Math.round(Number(data.main.temp) || 0),
        feelsLike: Math.round(Number(data.main.feels_like) || 0),
        humidity: Number(data.main.humidity) || 0,
        pressure: Number(data.main.pressure) || 0,
        visibility: (Number(data.visibility) || 0) / 1000, // Convert to km
        uvIndex: data.uvi ? Number(data.uvi) : null,
        windSpeed: Number(data.wind?.speed) || 0,
        windDirection: Number(data.wind?.deg) || 0,
        cloudiness: Number(data.clouds?.all) || 0,
        description: String(data.weather[0].description || "Unknown"),
        main: String(data.weather[0].main || "Unknown"),
        icon: String(data.weather[0].icon || "01d"),
      },
      sun: {
        sunrise: data.sys.sunrise
          ? new Date(Number(data.sys.sunrise) * 1000).toISOString()
          : null,
        sunset: data.sys.sunset
          ? new Date(Number(data.sys.sunset) * 1000).toISOString()
          : null,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format forecast data
   * @param {Object} data - Raw API response
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Object} Formatted forecast data
   */
  formatForecastData(data, originalName = null) {
    // Validate required data structure
    if (!data || !data.list || !Array.isArray(data.list) || !data.city) {
      console.error("Invalid forecast data structure:", data);
      throw new Error("Invalid forecast data received from API");
    }

    const dailyForecasts = {};

    // Group forecasts by day
    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0];

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          forecasts: [],
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          mainWeather: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        };
      }

      dailyForecasts[date].forecasts.push({
        time: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        windDirection: item.wind.deg,
        cloudiness: item.clouds.all,
        description: item.weather[0].description,
        main: item.weather[0].main,
        icon: item.weather[0].icon,
        pop: item.pop, // Probability of precipitation
      });

      // Update min/max temperatures
      dailyForecasts[date].minTemp = Math.min(
        dailyForecasts[date].minTemp,
        item.main.temp_min
      );
      dailyForecasts[date].maxTemp = Math.max(
        dailyForecasts[date].maxTemp,
        item.main.temp_max
      );
    });

    const locationName = originalName || data.city?.name || "Unknown Location";
    const formattedLocationName = this.formatLocationName(locationName);
    const cityName = this.formatLocationName(data.city?.name) || "Unknown City";
    const countryCode = data.city?.country || "";

    // Enhanced location formatting for US cities
    let enhancedLocationName = formattedLocationName;
    let state = null;

    // If this is a US city, try to add state information
    if (countryCode === "US" && data.city?.name) {
      let detectedState = getStateForUSCity(
        data.city.name,
        data.city.coord?.lat,
        data.city.coord?.lon
      );

      // Fallback: infer state purely from coordinates if city is unknown
      if (!detectedState && typeof data.city?.coord?.lat === 'number' && typeof data.city?.coord?.lon === 'number') {
        detectedState = getNearestUSStateByCoordinates(data.city.coord.lat, data.city.coord.lon);
      }

      if (detectedState) {
        state = detectedState;
        // Only update the name if the original doesn't already contain state info
        if (!originalName || !originalName.includes(",")) {
          enhancedLocationName = formatUSCityWithState(cityName, detectedState);
        }
      }
    }
    // For non-US cities, ensure proper country display formatting
    else if (countryCode && countryCode !== "US") {
      // Always ensure GB is displayed as UK, regardless of original formatting
      if (countryCode === "GB") {
        enhancedLocationName = this.normalizeGBLocationDisplay(cityName, enhancedLocationName, originalName);
      } else if (!enhancedLocationName.includes(",") && !originalName) {
        // For other non-US countries, add country if not already present
        enhancedLocationName = `${cityName}, ${formatCountryForDisplay(countryCode)}`;
      }
    }

    return {
      location: {
        name: String(enhancedLocationName),
        city: String(cityName),
        country: String(countryCode),
        state: state, // Add state information
        coordinates: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon,
        },
      },
      forecast: Object.values(dailyForecasts).map((day) => ({
        ...day,
        minTemp: Math.round(day.minTemp),
        maxTemp: Math.round(day.maxTemp),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fallback strategies for location queries when primary search fails
   * @param {string} city - The base city name
   * @param {string} originalName - The full original search query
   * @returns {Array} Array of fallback query strategies
   */
  getFallbackStrategies(city, originalName) {
    const fallbacks = [];

    // Strategy 1: For US cities, try alternative state-specific queries first
    if (originalName && this.isUSLocation(originalName)) {
      const stateInfo = this.extractUSStateInfo(originalName);
      if (stateInfo) {
        // Try with state and US: "San Diego,CA,US"
        fallbacks.push({
          query: `${city},${stateInfo},US`,
          reason: "US city with state and country",
        });
        
        // Try with just state: "San Diego,CA"  
        fallbacks.push({
          query: `${city},${stateInfo}`,
          reason: "US city with state only",
        });
      }
      
      // Try with just US country code
      fallbacks.push({
        query: `${city},US`,
        reason: "US city with country only",
      });
    }

    // Strategy 2: Try just the city name without country/state
    if (originalName && originalName !== city) {
      fallbacks.push({
        query: city,
        reason: "city name only",
      });
    }

    // Strategy 3: For Canadian cities, add specific fallbacks
    if (originalName && this.isCanadianLocation(originalName)) {
      fallbacks.push({
        query: `${city},CA`,
        reason: "Canadian city with country code",
      });
    }

    // Strategy 4: For Uruguayan cities, try nearby major cities
    if (originalName && originalName.includes("UY")) {
      const uruguayanFallbacks = [
        "Montevideo,UY",
        "Canelones,UY",
        "Maldonado,UY",
        "Punta del Este,UY",
      ];

      for (const fallback of uruguayanFallbacks) {
        if (!fallback.toLowerCase().includes(city.toLowerCase())) {
          fallbacks.push({
            query: fallback,
            reason: "nearby major city in Uruguay",
          });
        }
      }
    }

    // Strategy 5: Try the country/region only
    if (originalName) {
      const parts = originalName.split(",").map((p) => p.trim());
      if (parts.length > 1) {
        // Try the last part (usually country/state)
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart !== city) {
          fallbacks.push({
            query: lastPart,
            reason: "country/region only",
          });
        }

        // Try second-to-last part (usually state/province)
        if (parts.length > 2) {
          const secondLastPart = parts[parts.length - 2];
          if (secondLastPart && secondLastPart !== city) {
            fallbacks.push({
              query: `${secondLastPart},${lastPart}`,
              reason: "state and country",
            });
          }
        }
      }
    }

    // Strategy 6: Common alternative spellings and variations
    const cityVariations = this.getCityVariations(city);
    for (const variation of cityVariations) {
      fallbacks.push({
        query: variation,
        reason: "alternative spelling",
      });
    }

    return fallbacks;
  }

  /**
   * Get common variations and alternative spellings for city names
   * @param {string} city - The city name
   * @returns {Array} Array of alternative city names
   */
  getCityVariations(city) {
    const variations = [];
    const cityLower = city.toLowerCase();

    // Common variations for Spanish cities
    const spanishVariations = {
      "ciudad de la costa": ["Costa de Oro", "Ciudad Costa", "La Costa"],
      ciudad: ["City"],
      la: [""],
      de: [""],
    };

    // Apply variations
    for (const [original, alternatives] of Object.entries(spanishVariations)) {
      if (cityLower.includes(original)) {
        for (const alt of alternatives) {
          if (alt) {
            const variation = city.replace(new RegExp(original, "gi"), alt);
            if (variation !== city) {
              variations.push(variation);
            }
          }
        }
      }
    }

    // Remove articles and prepositions
    const withoutArticles = city
      .replace(/\b(la|el|de|del|los|las)\b/gi, "")
      .trim();
    if (withoutArticles && withoutArticles !== city) {
      variations.push(withoutArticles);
    }

    return variations;
  }

  /**
   * Construct a location query string optimized for OpenWeatherMap API
   * Enhanced to handle normalized search patterns and punctuation variations
   * @param {string} city - The base city name
   * @param {string} originalName - The full original search query
   * @returns {string} Optimized query string
   */
  constructLocationQuery(city, originalName) {
    // Special case for San Diego: Always ensure it resolves to California, US
    if (city.toLowerCase() === 'san diego') {
      return `${city},CA,US`;
    }

    if (!originalName || originalName === city) {
      return city;
    }

    // Normalize the original name for better pattern matching
    const normalized = this.normalizeLocationForAPI(originalName);

    // Handle patterns like "London, ON" -> "London,CA" (Canada)
    // Handle patterns like "London, Ontario" -> "London,CA"
    // Handle patterns like "London Ontario" -> "London,CA"
    if (this.isCanadianLocation(normalized)) {
      return `${city},CA`;
    }

    // Handle US state abbreviations and full names with enhanced specificity
    if (this.isUSLocation(normalized)) {
      // Extract state information for more precise queries
      const stateInfo = this.extractUSStateInfo(normalized);
      if (stateInfo) {
        // For US cities, include state for better disambiguation: "San Diego,CA,US"
        return `${city},${stateInfo},US`;
      }
      // Fallback to just US if we can't extract state
      return `${city},US`;
    }

    // Handle UK patterns like "London, UK" or "London, GB"
    if (this.isUKLocation(normalized)) {
      return `${city},GB`;
    }

    // Handle other country patterns
    const countryCode = this.extractCountryCode(normalized);
    if (countryCode) {
      return `${city},${countryCode}`;
    }

    // If we can't determine a specific country, try the normalized name first
    // This handles cases like "Frederick, Maryland" or complex city names
    return normalized;
  }

  /**
   * Normalize location string for API queries
   * @param {string} location - Location string
   * @returns {string} Normalized location
   */
  normalizeLocationForAPI(location) {
    if (!location || typeof location !== "string") {
      return "";
    }

    // Basic cleanup - trim and normalize whitespace
    let normalized = location.trim().replace(/\s+/g, ' ');

    // Remove/normalize punctuation while preserving meaning
    normalized = normalized.replace(/\.{2,}/g, '.'); // Multiple periods to single
    normalized = normalized.replace(/,{2,}/g, ','); // Multiple commas to single
    
    // Normalize apostrophes and quotes to standard single quotes
    normalized = normalized.replace(/[''""]/g, "'");
    
    // Clean up spacing around punctuation
    normalized = normalized.replace(/\s*,\s*/g, ', '); // Normalize comma spacing
    normalized = normalized.replace(/\s*\.\s*/g, '. '); // Normalize period spacing
    
    // Handle common abbreviations that OpenWeather might not recognize
    const apiNormalizations = {
      // Country variations
      '\\bjp\\b': 'Japan',
      '\\bjpn\\b': 'Japan',
      '\\bfr\\b': 'France',
      '\\bde\\b': 'Germany',
      '\\bger\\b': 'Germany',
    };

    // Apply normalizations
    for (const [pattern, replacement] of Object.entries(apiNormalizations)) {
      const regex = new RegExp(pattern, 'gi');
      normalized = normalized.replace(regex, replacement);
    }

    // Final cleanup
    normalized = normalized.replace(/\s*,\s*$/, ''); // Remove trailing comma
    normalized = normalized.replace(/^\s*,\s*/, ''); // Remove leading comma
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * Check if a location string indicates a Canadian location
   * @param {string} location - Location string
   * @returns {boolean} True if likely Canadian
   */
  isCanadianLocation(location) {
    const canadianPatterns = [
      /\b(ON|Ontario)\b/i,
      /\b(BC|British Columbia)\b/i,
      /\b(AB|Alberta)\b/i,
      /\b(QC|Quebec|Québec)\b/i,
      /\b(MB|Manitoba)\b/i,
      /\b(SK|Saskatchewan)\b/i,
      /\b(NS|Nova Scotia)\b/i,
      /\b(NB|New Brunswick)\b/i,
      /\b(NL|Newfoundland|Labrador)\b/i,
      /\b(PE|PEI|Prince Edward Island)\b/i,
      /\b(YT|Yukon)\b/i,
      /\b(NT|Northwest Territories)\b/i,
      /\b(NU|Nunavut)\b/i,
      /\bCanada\b/i,
    ];

    return canadianPatterns.some((pattern) => pattern.test(location));
  }

  /**
   * Check if a location string indicates a US location
   * @param {string} location - Location string
   * @returns {boolean} True if likely US
   */
  isUSLocation(location) {
    const usPatterns = [
      /\b(AL|Alabama|AK|Alaska|AZ|Arizona|AR|Arkansas|CA|California|CO|Colorado|CT|Connecticut|DE|Delaware|FL|Florida|GA|Georgia|HI|Hawaii|ID|Idaho|IL|Illinois|IN|Indiana|IA|Iowa|KS|Kansas|KY|Kentucky|LA|Louisiana|ME|Maine|MD|Maryland|MA|Massachusetts|MI|Michigan|MN|Minnesota|MS|Mississippi|MO|Missouri|MT|Montana|NE|Nebraska|NV|Nevada|NH|New Hampshire|NJ|New Jersey|NM|New Mexico|NY|New York|NC|North Carolina|ND|North Dakota|OH|Ohio|OK|Oklahoma|OR|Oregon|PA|Pennsylvania|RI|Rhode Island|SC|South Carolina|SD|South Dakota|TN|Tennessee|TX|Texas|UT|Utah|VT|Vermont|VA|Virginia|WA|Washington|WV|West Virginia|WI|Wisconsin|WY|Wyoming)\b/i,
      /\bUSA?\b/i,
      /\bUnited States\b/i,
    ];

    return usPatterns.some((pattern) => pattern.test(location));
  }

  /**
   * Extract US state information from a location string
   * @param {string} location - Location string
   * @returns {string|null} State abbreviation or null if not found
   */
  extractUSStateInfo(location) {
    // Special case for Washington D.C. - check this first to avoid confusion with Washington state
    if (/(DC|D\.C\.|D\.\s*C\.|District of Columbia)/i.test(location)) {
      return 'DC';
    }

    // Map of full state names and abbreviations to their standard abbreviations
    const stateMap = {
      // State abbreviations (already correct)
      'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA', 'CO': 'CO',
      'CT': 'CT', 'DE': 'DE', 'FL': 'FL', 'GA': 'GA', 'HI': 'HI', 'ID': 'ID',
      'IL': 'IL', 'IN': 'IN', 'IA': 'IA', 'KS': 'KS', 'KY': 'KY', 'LA': 'LA',
      'ME': 'ME', 'MD': 'MD', 'MA': 'MA', 'MI': 'MI', 'MN': 'MN', 'MS': 'MS',
      'MO': 'MO', 'MT': 'MT', 'NE': 'NE', 'NV': 'NV', 'NH': 'NH', 'NJ': 'NJ',
      'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH', 'OK': 'OK',
      'OR': 'OR', 'PA': 'PA', 'RI': 'RI', 'SC': 'SC', 'SD': 'SD', 'TN': 'TN',
      'TX': 'TX', 'UT': 'UT', 'VT': 'VT', 'VA': 'VA', 'WA': 'WA', 'WV': 'WV',
      'WI': 'WI', 'WY': 'WY',
      
      // Full state names to abbreviations
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY'
    };

    // Try to find state information in the location string
    const locationLower = location.toLowerCase();
    
    // First, try to match full state names (longer matches first to avoid conflicts)
    // But avoid matching "Washington" when it's "Washington, D.C."
    const fullStateNames = Object.keys(stateMap).filter(key => key.length > 2).sort((a, b) => b.length - a.length);
    for (const stateName of fullStateNames) {
      // Skip Washington state if we're dealing with D.C.
      if (stateName === 'washington' && /d\.?c\.?/i.test(location)) {
        continue;
      }
      
      const pattern = new RegExp(`\\b${stateName}\\b`, 'i');
      if (pattern.test(location)) {
        return stateMap[stateName];
      }
    }

    // Then try to match state abbreviations - look for them after commas or at word boundaries
    const stateAbbrevs = Object.keys(stateMap).filter(key => key.length === 2);
    for (const abbrev of stateAbbrevs) {
      // Look for state abbreviations after a comma (more specific)
      const commaPattern = new RegExp(`,\\s*${abbrev}\\b`, 'i');
      if (commaPattern.test(location)) {
        return stateMap[abbrev.toUpperCase()];
      }
      
      // Also try word boundaries as fallback
      const wordBoundaryPattern = new RegExp(`\\b${abbrev}\\b`, 'i');
      if (wordBoundaryPattern.test(location)) {
        return stateMap[abbrev.toUpperCase()];
      }
    }

    return null;
  }

  /**
   * Check if a location string indicates a UK location
   * @param {string} location - Location string
   * @returns {boolean} True if likely UK
   */
  isUKLocation(location) {
    const ukPatterns = [
      /\b(UK|United Kingdom|GB|Great Britain|England|Scotland|Wales|Northern Ireland)\b/i,
    ];

    return ukPatterns.some((pattern) => pattern.test(location));
  }

  /**
   * Extract country code from location string
   * @param {string} location - Location string
   * @returns {string|null} Country code or null
   */
  extractCountryCode(location) {
    // Look for common country codes or names
    const countryMappings = {
      AU: ["Australia", "AU"],
      DE: ["Germany", "Deutschland", "DE"],
      FR: ["France", "FR"],
      IT: ["Italy", "Italia", "IT"],
      ES: ["Spain", "España", "ES"],
      JP: ["Japan", "日本", "JP"],
      BR: ["Brazil", "Brasil", "BR"],
      IN: ["India", "IN"],
      CN: ["China", "中国", "CN"],
      MX: ["Mexico", "México", "MX"],
      ZA: ["South Africa", "ZA"],
      UY: ["Uruguay", "UY"],
      AR: ["Argentina", "AR"],
      CL: ["Chile", "CL"],
      CO: ["Colombia", "CO"],
      PE: ["Peru", "PE"],
    };

    for (const [code, patterns] of Object.entries(countryMappings)) {
      for (const pattern of patterns) {
        if (location.includes(pattern)) {
          return code;
        }
      }
    }

    return null;
  }

  /**
   * Handle API errors with comprehensive logging and recovery
   * @param {Object} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleWeatherApiError(error) {
    // Log the full error for debugging
    console.error("🔥 WeatherService Error Details:");
    console.error("- URL:", error.config?.url);
    console.error("- Method:", error.config?.method?.toUpperCase());
    console.error("- Params:", error.config?.params);
    console.error("- Message:", error.message);

    if (error.response) {
      const { status, data } = error.response;
      console.error("- Status:", status);
      console.error("- Response Data:", data);

      let message = "Weather API error";

      switch (status) {
        case 401:
          message = "Invalid API key. Please check your OpenWeather API key.";
          break;
        case 404:
          message =
            "Location not found. Please check the city name or coordinates.";
          break;
        case 429:
          message = "API rate limit exceeded. Please try again later.";
          break;
        case 500:
          message = "Weather service temporarily unavailable.";
          break;
        case 502:
        case 503:
        case 504:
          message =
            "Weather service is experiencing issues. Please try again later.";
          break;
        default:
          message = data.message || `Weather API error (${status})`;
      }

      const customError = new Error(message);
      customError.status = status;
      customError.code = data?.cod;
      customError.isWeatherAPIError = true;
      return customError;
    }

    if (error.request) {
      console.error("- Request timeout or network error");
      const customError = new Error(
        "Weather service is currently unavailable. Please check your internet connection."
      );
      customError.status = 503;
      customError.isNetworkError = true;
      return customError;
    }

    if (error.code === "ECONNABORTED") {
      const customError = new Error(
        "Request timeout. The weather service is taking too long to respond."
      );
      customError.status = 408;
      customError.isTimeoutError = true;
      return customError;
    }

    console.error("- Unknown error type:", error);
    const customError = new Error(
      error.message || "An unexpected error occurred"
    );
    customError.status = 500;
    return customError;
  }

  /**
   * Format current weather data from OpenWeatherMap API response
   * @param {Object} data - Raw OpenWeatherMap API response
   * @param {string} originalName - Original location name for display
   * @returns {Object} Formatted weather data
   */
  formatCurrentWeatherData(data, originalName = null) {
    // Extract location information
    const locationName = originalName || `${data.name}, ${data.sys.country}`;
    
    // For US locations, try to include state information
    let displayName = locationName;
    if (data.sys.country === 'US' && originalName) {
      const stateInfo = this.extractUSStateInfo(originalName);
      if (stateInfo) {
        displayName = `${data.name}, ${stateInfo}`;
      }
    }

    return {
      location: {
        name: displayName,
        city: data.name,
        country: data.sys.country,
        state: data.sys.country === 'US' && originalName ? this.extractUSStateInfo(originalName) : null,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
        uvIndex: data.uvi || null,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0,
        cloudiness: data.clouds?.all || 0,
        description: data.weather[0]?.description || 'Unknown',
        main: data.weather[0]?.main || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
      },
      sun: {
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test API connection with comprehensive checks
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      console.log("🧪 Testing OpenWeather API connection...");

      // Test with a simple, reliable location
      const testResult = await this.getCurrentWeatherByCity("London", "metric");

      console.log("✅ OpenWeather API connection test successful");
      return {
        success: true,
        message: "OpenWeather API connection successful",
        data: {
          location: testResult.location?.name || "Unknown",
          temperature: testResult.current?.temperature || "N/A",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(
        "❌ OpenWeather API connection test failed:",
        error.message
      );
      return {
        success: false,
        message: error.message,
        error: {
          type: error.isWeatherAPIError
            ? "API_ERROR"
            : error.isNetworkError
            ? "NETWORK_ERROR"
            : error.isTimeoutError
            ? "TIMEOUT_ERROR"
            : "UNKNOWN_ERROR",
          status: error.status,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

export default new WeatherService();

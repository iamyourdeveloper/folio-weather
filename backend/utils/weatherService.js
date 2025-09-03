import axios from "axios";
import http from "http";
import https from "https";

class WeatherService {
  constructor() {
    // Ensure environment is loaded
    import("dotenv").then((dotenv) => dotenv.config());

    this.apiKey =
      process.env.OPENWEATHER_API_KEY || "b12265d01881b865932694e3950ffd1f";
    this.baseUrl =
      process.env.OPENWEATHER_BASE_URL ||
      "https://api.openweathermap.org/data/2.5";

    // Create axios instance with optimized configuration
    this.axiosInstance = axios.create({
      timeout: 15000, // Increased timeout
      headers: {
        "User-Agent": "FolioWeather/1.0.0",
      },
      // Retry configuration
      retry: 3,
      retryDelay: 1000,
      // Keep connections alive
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
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
          config.__retryCount < (config.retry || 3) &&
          (!error.response ||
            error.response.status >= 500 ||
            error.code === "ECONNABORTED");

        if (shouldRetry) {
          config.__retryCount += 1;
          const delay =
            config.retryDelay * Math.pow(2, config.__retryCount - 1);

          console.log(
            `🔄 Retrying request (${config.__retryCount}/${config.retry}) after ${delay}ms`
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
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

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
      // If the enhanced query fails, try with just the city name as fallback
      if (originalName && originalName !== city) {
        console.log(
          `⚠️ Enhanced query failed, trying fallback with city name: "${city}"`
        );
        try {
          const fallbackResponse = await this.makeApiCall(
            `${this.baseUrl}/weather`,
            {
              q: city,
              appid: this.apiKey,
              units: units,
            }
          );

          return this.formatCurrentWeatherData(
            fallbackResponse.data,
            originalName
          );
        } catch (fallbackError) {
          throw this.handleWeatherApiError(fallbackError);
        }
      }
      throw this.handleWeatherApiError(error);
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
      // If the enhanced query fails, try with just the city name as fallback
      if (originalName && originalName !== city) {
        console.log(
          `⚠️ Enhanced forecast query failed, trying fallback with city name: "${city}"`
        );
        try {
          const fallbackResponse = await this.makeApiCall(
            `${this.baseUrl}/forecast`,
            {
              q: city,
              appid: this.apiKey,
              units: units,
            }
          );

          return this.formatForecastData(fallbackResponse.data, originalName);
        } catch (fallbackError) {
          throw this.handleWeatherApiError(fallbackError);
        }
      }
      throw this.handleWeatherApiError(error);
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

    return locationName
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
        ];

        return part
          .split(" ")
          .map((word, index) => {
            const cleanWord = word.trim();
            if (!cleanWord) return cleanWord;

            // Handle state/country codes within words - be more selective
            // Only treat as state/country code if it's exactly 2 letters and common codes
            const commonStateCodes = [
              "AL",
              "AK",
              "AZ",
              "AR",
              "CA",
              "CO",
              "CT",
              "DE",
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

            if (
              cleanWord.length === 2 &&
              commonStateCodes.includes(cleanWord.toUpperCase())
            ) {
              return cleanWord.toUpperCase();
            } else if (
              cleanWord.length === 3 &&
              commonStateCodes.includes(cleanWord.toUpperCase())
            ) {
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
   * Format current weather data
   * @param {Object} data - Raw API response
   * @param {string} originalName - Original location name with state/region (optional)
   * @returns {Object} Formatted weather data
   */
  formatCurrentWeatherData(data, originalName = null) {
    const locationName = originalName || data.name || "Unknown Location";
    const formattedLocationName = this.formatLocationName(locationName);

    return {
      location: {
        name: String(formattedLocationName),
        city: String(this.formatLocationName(data.name) || "Unknown City"),
        country: String(data.sys?.country || ""),
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
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: data.uvi || null,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
      },
      sun: {
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
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

    return {
      location: {
        name: String(
          this.formatLocationName(
            originalName || data.city?.name || "Unknown Location"
          )
        ),
        city: String(
          this.formatLocationName(data.city?.name) || "Unknown City"
        ),
        country: String(data.city?.country || ""),
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
   * Construct a location query string optimized for OpenWeatherMap API
   * @param {string} city - The base city name
   * @param {string} originalName - The full original search query
   * @returns {string} Optimized query string
   */
  constructLocationQuery(city, originalName) {
    if (!originalName || originalName === city) {
      return city;
    }

    // Convert common location patterns to OpenWeatherMap format
    const normalized = originalName.trim();

    // Handle patterns like "London, ON" -> "London,CA" (Canada)
    // Handle patterns like "London, Ontario" -> "London,CA"
    // Handle patterns like "London Ontario" -> "London,CA"
    if (this.isCanadianLocation(normalized)) {
      return `${city},CA`;
    }

    // Handle US state abbreviations and full names
    if (this.isUSLocation(normalized)) {
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

    // If we can't determine a specific country, try the original name first
    // This handles cases like "Frederick, Maryland" or complex city names
    return originalName;
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

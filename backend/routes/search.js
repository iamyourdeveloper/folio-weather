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
        // Search only US cities
        results = searchUSCities(sanitizedQuery, parsedLimit);
      } else if (country && country !== 'US' && country !== 'us') {
        // Search only international cities for specific country
        const normalizedQuery = sanitizedQuery.toLowerCase();
        results = RANDOM_CITIES.filter(cityData => 
          cityData.country === country.toUpperCase() &&
          cityData.city &&
          (cityData.city.toLowerCase().includes(normalizedQuery) ||
           cityData.name.toLowerCase().includes(normalizedQuery))
        ).slice(0, parsedLimit);
      } else {
        // Search all cities (US priority)
        const usResults = searchUSCities(sanitizedQuery, Math.floor(parsedLimit * 0.7));
        results.push(...usResults);
        
        // Fill remaining with international cities
        const remainingLimit = parsedLimit - results.length;
        if (remainingLimit > 0) {
          const normalizedQuery = sanitizedQuery.toLowerCase();
          const intlResults = RANDOM_CITIES.filter(cityData => 
            cityData.city && 
            (cityData.city.toLowerCase().includes(normalizedQuery) ||
             cityData.name.toLowerCase().includes(normalizedQuery))
          ).slice(0, remainingLimit);
          
          results.push(...intlResults);
        }
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
          const normalizedQuery = sanitizedQuery.toLowerCase();
          cities = cities.filter(city => 
            city.city.toLowerCase().includes(normalizedQuery)
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
        const usResults = searchUSCities(sanitizedQuery, Math.floor(parsedLimit * usResultsRatio));
        suggestions.push(...usResults);
        
        // Fill remaining with international cities
        const remainingLimit = parsedLimit - suggestions.length;
        if (remainingLimit > 0) {
          const normalizedQuery = sanitizedQuery.toLowerCase();
          const intlResults = RANDOM_CITIES.filter(cityData => {
            if (!cityData.city) return false;
            const cityName = cityData.city.toLowerCase();
            // For real-time, use more flexible matching
            return isRealtime 
              ? (cityName.includes(normalizedQuery) || cityData.name.toLowerCase().includes(normalizedQuery))
              : cityName.startsWith(normalizedQuery);
          }).slice(0, remainingLimit);
          
          suggestions.push(...intlResults);
        }
      }

      // For real-time suggestions, ensure each result has proper formatting
      if (isRealtime) {
        suggestions = suggestions.map(city => ({
          ...city,
          displayName: city.name || `${city.city}${city.state ? ', ' + city.state : ''}${city.country && city.country !== 'US' ? ', ' + city.country : ''}`,
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
      
      // Prioritize US cities heavily for autocomplete (90%)
      const usResults = searchUSCities(sanitizedQuery, Math.floor(parsedLimit * 0.9));
      suggestions.push(...usResults);
      
      // Add a few international cities if there's room
      const remainingLimit = parsedLimit - suggestions.length;
      if (remainingLimit > 0) {
        const normalizedQuery = sanitizedQuery.toLowerCase();
        const intlResults = RANDOM_CITIES.filter(cityData => {
          if (!cityData.city) return false;
          const cityName = cityData.city.toLowerCase();
          return cityName.startsWith(normalizedQuery) || cityName.includes(normalizedQuery);
        }).slice(0, remainingLimit);
        
        suggestions.push(...intlResults);
      }

      // Format for autocomplete dropdown
      const formattedSuggestions = suggestions.map(city => ({
        id: `${city.city}-${city.state || city.country}`,
        city: city.city,
        state: city.state,
        country: city.country,
        name: city.name,
        displayName: city.name || `${city.city}${city.state ? ', ' + city.state : ''}${city.country && city.country !== 'US' ? ', ' + city.country : ''}`,
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

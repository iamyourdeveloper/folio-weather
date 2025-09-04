/**
 * Search Cache Middleware
 * Implements caching for city search results to improve performance
 */

class SearchCache {
  constructor(maxSize = 1000, ttl = 30 * 60 * 1000) { // 30 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get cached search results
   * @param {string} query - Search query
   * @returns {Array|null} Cached results or null if not found/expired
   */
  get(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const cached = this.cache.get(normalizedQuery);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(normalizedQuery);
      return null;
    }
    
    return cached.results;
  }

  /**
   * Cache search results
   * @param {string} query - Search query
   * @param {Array} results - Search results to cache
   */
  set(query, results) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(normalizedQuery, {
      results: results,
      timestamp: Date.now()
    });
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

// Create singleton instance
const searchCache = new SearchCache();

/**
 * Express middleware for caching search results
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} Express middleware function
 */
export const cacheSearchResults = (ttl = 30 * 60 * 1000) => {
  return (req, res, next) => {
    const query = req.query.q || req.params.query || req.body.query;
    
    if (!query) {
      return next();
    }

    // Try to get cached results
    const cachedResults = searchCache.get(query);
    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Store original res.json to intercept response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache successful search results
      if (data.success && data.data && Array.isArray(data.data)) {
        searchCache.set(query, data.data);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

export default searchCache;

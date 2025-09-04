/**
 * Search API service functions
 * Handles all search-related API calls with proper error handling and caching
 */

import api from './api.js';

/**
 * Search for cities with comprehensive filtering
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise} API response with city results
 */
export const searchCities = async (query, options = {}) => {
  const {
    limit = 20,
    country = null,
    includeInternational = true
  } = options;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Search query is required');
  }

  const params = new URLSearchParams({
    q: query.trim(),
    limit: limit.toString()
  });

  if (country) {
    params.append('country', country);
  }

  try {
    const response = await api.get(`/search/cities?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Search cities error:', error);
    throw error;
  }
};

/**
 * Get fast autocomplete suggestions for real-time dropdown
 * @param {string} query - Search query
 * @param {number} limit - Maximum results (default: 8)
 * @returns {Promise} API response with formatted suggestions
 */
export const getAutocompleteSuggestions = async (query, limit = 8) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      success: true,
      data: [],
      query: '',
      count: 0,
      limit
    };
  }

  const params = new URLSearchParams({
    q: query.trim(),
    limit: limit.toString()
  });

  try {
    const response = await api.get(`/search/autocomplete?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Autocomplete suggestions error:', error);
    // Return empty results on error to avoid breaking the UI
    return {
      success: false,
      data: [],
      query: query.trim(),
      count: 0,
      limit,
      error: error.message
    };
  }
};

/**
 * Get city suggestions with optional real-time mode
 * @param {string} query - Search query
 * @param {Object} options - Options for suggestions
 * @returns {Promise} API response with suggestions
 */
export const getCitySuggestions = async (query, options = {}) => {
  const {
    limit = 10,
    realtime = false
  } = options;

  const params = new URLSearchParams({
    limit: limit.toString()
  });

  if (query && query.trim().length > 0) {
    params.append('q', query.trim());
  }

  if (realtime) {
    params.append('realtime', 'true');
  }

  try {
    const response = await api.get(`/search/suggestions?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('City suggestions error:', error);
    throw error;
  }
};

/**
 * Get cities by US state
 * @param {string} stateCode - Two-letter state code
 * @param {Object} options - Search options
 * @returns {Promise} API response with state cities
 */
export const getCitiesByState = async (stateCode, options = {}) => {
  const {
    query = '',
    limit = 50
  } = options;

  if (!stateCode || typeof stateCode !== 'string' || stateCode.length !== 2) {
    throw new Error('Valid two-letter state code is required');
  }

  const params = new URLSearchParams({
    limit: limit.toString()
  });

  if (query && query.trim().length > 0) {
    params.append('q', query.trim());
  }

  try {
    const response = await api.get(`/search/cities/us/${stateCode.toUpperCase()}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Cities by state error:', error);
    throw error;
  }
};

/**
 * Get search database statistics
 * @returns {Promise} API response with database stats
 */
export const getSearchStats = async () => {
  try {
    const response = await api.get('/search/stats');
    return response.data;
  } catch (error) {
    console.error('Search stats error:', error);
    throw error;
  }
};

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate search query
 * @param {string} query - Query to validate
 * @returns {Object} Validation result
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      error: 'Query must be a string'
    };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Query cannot be empty'
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Query is too long (maximum 100 characters)'
    };
  }

  // Check for invalid characters
  if (/[<>]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Query contains invalid characters'
    };
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Query must contain at least one letter'
    };
  }

  return {
    isValid: true,
    query: trimmed
  };
};

export default {
  searchCities,
  getAutocompleteSuggestions,
  getCitySuggestions,
  getCitiesByState,
  getSearchStats,
  debounce,
  validateSearchQuery
};

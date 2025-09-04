import axios from "axios";

// Simple circuit breaker to prevent overwhelming the server
class CircuitBreaker {
  constructor(failureThreshold = 3, resetTimeout = 30000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`⚠️ Circuit breaker OPEN - too many failures (${this.failureCount})`);
    }
  }
}

const circuitBreaker = new CircuitBreaker(3, 30000);

// Request debouncing to prevent duplicate requests
const pendingRequests = new Map();

const createRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000, // Reduced timeout to 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
  // Add retry configuration
  retryDelayMs: 1000,
  maxRetries: 2, // Reduced from 3 to 2 retries
});

// Retry function for failed requests
const retryRequest = async (error) => {
  const config = error.config;

  // Don't retry if we've already exceeded max retries
  if (!config || config.__retryCount >= (config.maxRetries || 2)) {
    console.log(`❌ Max retries (${config.maxRetries || 2}) exceeded for ${config.url}`);
    return Promise.reject(error);
  }

  // Initialize retry count
  config.__retryCount = config.__retryCount || 0;
  config.__retryCount += 1;

  // Only retry on specific error conditions
  const shouldRetry = 
    (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED') &&
    config.__retryCount <= (config.maxRetries || 2);
    
  if (!shouldRetry) {
    console.log(`⚠️ Not retrying request to ${config.url} - reason: ${error.response?.status || error.code}`);
    return Promise.reject(error);
  }

  // Calculate delay with exponential backoff (max 4 seconds)
  const delay = Math.min(
    (config.retryDelayMs || 1000) * Math.pow(2, config.__retryCount - 1),
    4000
  );

  console.log(
    `🔄 Retrying request (attempt ${config.__retryCount}/${
      config.maxRetries || 2
    }) in ${delay}ms... URL: ${config.url}`
  );

  // Wait for the delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Retry the request
  return api(config);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for duplicate requests
    const requestKey = createRequestKey(config);
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Duplicate request detected, returning existing promise: ${requestKey}`);
      return pendingRequests.get(requestKey);
    }

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Clean up pending request
    const requestKey = createRequestKey(response.config);
    pendingRequests.delete(requestKey);

    // Log responses in development
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    console.error("❌ Response Error:", error);

    // Try to retry the request first
    try {
      return await circuitBreaker.call(() => retryRequest(error));
    } catch (retryError) {
      // If retry fails, handle the error normally
      error = retryError;
    }

    // Clean up pending request on error
    if (error.config) {
      const requestKey = createRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem("token");
          // Don't redirect in development
          if (import.meta.env.MODE === "production") {
            window.location.href = "/login";
          }
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 429:
          console.error("Too many requests - please wait before retrying");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error(
            `HTTP Error ${status}:`,
            data?.message || error.message
          );
      }

      // Return a more user-friendly error object
      return Promise.reject({
        status,
        message: data?.error || data?.message || `HTTP Error ${status}`,
        originalError: error,
      });
    }

    if (error.request) {
      // Network error - provide more specific messages
      let message = "Network error. Please check your internet connection.";

      if (error.code === "ECONNREFUSED") {
        message = "Unable to connect to the weather service. Please try again.";
      } else if (error.code === "ECONNABORTED") {
        message = "Request timeout. The weather service is taking too long to respond.";
      } else if (error.code === "NETWORK_ERROR") {
        message =
          "Network connection failed. Please check your connection and try again.";
      } else if (error.code === "ENOTFOUND") {
        message =
          "Weather service is temporarily unavailable. Please try again later.";
      }

      console.log(`🌐 Network Error Details:`, {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        timeout: error.config?.timeout,
      });

      return Promise.reject({
        status: 0,
        message,
        originalError: error,
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || "An unexpected error occurred",
      originalError: error,
    });
  }
);

export default api;

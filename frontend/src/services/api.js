import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000, // Increased timeout for slower connections
  headers: {
    "Content-Type": "application/json",
  },
  // Add retry configuration
  retryDelayMs: 1000,
  maxRetries: 3,
});

// Retry function for failed requests
const retryRequest = async (error) => {
  const config = error.config;

  // Don't retry if we've already exceeded max retries
  if (!config || config.__retryCount >= (config.maxRetries || 3)) {
    return Promise.reject(error);
  }

  // Initialize retry count
  config.__retryCount = config.__retryCount || 0;
  config.__retryCount += 1;

  // Only retry on network errors or 5xx server errors
  const shouldRetry = !error.response || error.response.status >= 500;
  if (!shouldRetry) {
    return Promise.reject(error);
  }

  // Calculate delay with exponential backoff
  const delay =
    (config.retryDelayMs || 1000) * Math.pow(2, config.__retryCount - 1);

  console.log(
    `🔄 Retrying request (attempt ${config.__retryCount}/${
      config.maxRetries || 3
    }) in ${delay}ms...`
  );

  // Wait for the delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Retry the request
  return api(config);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
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
      return await retryRequest(error);
    } catch (retryError) {
      // If retry fails, handle the error normally
      error = retryError;
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
      } else if (error.code === "NETWORK_ERROR") {
        message =
          "Network connection failed. Please check your connection and try again.";
      } else if (error.code === "ENOTFOUND") {
        message =
          "Weather service is temporarily unavailable. Please try again later.";
      }

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

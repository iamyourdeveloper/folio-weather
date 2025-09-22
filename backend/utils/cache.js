import NodeCache from "node-cache";

// Create a new cache instance with optimized settings for faster responses
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes in seconds (reduced from 15 for fresher data)
  checkperiod: 60, // Check for expired entries every 1 minute (more frequent cleanup)
  useClones: false, // Faster performance by avoiding deep clones
  maxKeys: 1000, // Limit cache size to prevent memory bloat
});

export const cacheMiddleware = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  // Store the original json method
  const originalJson = res.json;

  // Override res.json method
  res.json = function (body) {
    // Store the response in cache
    cache.set(key, body, duration);

    // Call the original json method
    originalJson.call(this, body);
  };

  next();
};

export default cache;

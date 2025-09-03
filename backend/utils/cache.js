import NodeCache from "node-cache";

// Create a new cache instance with a 15-minute TTL
const cache = new NodeCache({
  stdTTL: 900, // 15 minutes in seconds
  checkperiod: 120, // Check for expired entries every 2 minutes
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

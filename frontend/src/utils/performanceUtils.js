/**
 * Performance utility functions to optimize app loading and runtime performance
 */

// Debounce function to prevent excessive API calls
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization cache for expensive computations
const memoCache = new Map();

export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  return (...args) => {
    const key = keyGenerator(...args);
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    const result = fn(...args);
    memoCache.set(key, result);
    return result;
  };
};

// Clear memoization cache to prevent memory leaks
export const clearMemoCache = () => {
  memoCache.clear();
};

// Lazy initialization for heavy computations
export const lazyInit = (initFn) => {
  let initialized = false;
  let value;
  
  return () => {
    if (!initialized) {
      value = initFn();
      initialized = true;
    }
    return value;
  };
};

// Preload critical resources
export const preloadResource = (href, as = 'fetch') => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Optimize image loading
export const optimizeImageLoading = (imgElement) => {
  if (!imgElement) return;
  
  // Add loading="lazy" for better performance
  imgElement.loading = 'lazy';
  
  // Add decoding="async" for better performance
  imgElement.decoding = 'async';
};

// Batch DOM updates to prevent layout thrashing
export const batchDOMUpdates = (updates) => {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
};

export default {
  debounce,
  throttle,
  memoize,
  clearMemoCache,
  lazyInit,
  preloadResource,
  prefersReducedMotion,
  optimizeImageLoading,
  batchDOMUpdates,
};

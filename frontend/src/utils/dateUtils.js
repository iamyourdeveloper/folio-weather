/**
 * Date utilities for weather forecast display
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date string
 */
export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get tomorrow's date in YYYY-MM-DD format
 * @returns {string} Tomorrow's date string
 */
export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Determine the display label for a forecast date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {number} index - Index in the forecast array (fallback)
 * @returns {string} Display label ("Today", "Tomorrow", or weekday)
 */
export const getForecastDateLabel = (dateString, index = 0) => {
  const todayString = getTodayDateString();
  const tomorrowString = getTomorrowDateString();
  
  // Compare actual dates instead of relying on array index
  if (dateString === todayString) {
    return "Today";
  } else if (dateString === tomorrowString) {
    return "Tomorrow";
  } else {
    // For other days, show the weekday
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
};

/**
 * Format a date string for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "Sep 22")
 */
export const formatDateDisplay = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Check if a date string represents today
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateString) => {
  return dateString === getTodayDateString();
};

/**
 * Check if a date string represents tomorrow
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is tomorrow
 */
export const isTomorrow = (dateString) => {
  return dateString === getTomorrowDateString();
};

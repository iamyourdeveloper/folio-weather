/**
 * Date utilities for weather forecast display
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date string
 */
const formatAsLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = () => {
  const today = new Date();
  return formatAsLocalISODate(today);
};

/**
 * Get tomorrow's date in YYYY-MM-DD format
 * @returns {string} Tomorrow's date string
 */
export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatAsLocalISODate(tomorrow);
};

/**
 * Get forecast days that start from tomorrow in viewer's local time
 * @param {Array} forecastDays - Array of daily forecast objects
 * @param {number|null} limit - Optional limit for number of days returned
 * @returns {Array} Filtered and ordered forecast days
 */
export const getForecastDaysStartingTomorrow = (forecastDays = [], limit = null) => {
  const todayString = getTodayDateString();

  const normalizedDays = (Array.isArray(forecastDays) ? forecastDays : [])
    .filter((day) => day && typeof day.date === "string" && day.date > todayString)
    .sort((a, b) => {
      if (a.date === b.date) return 0;
      return a.date < b.date ? -1 : 1;
    });

  if (typeof limit === "number") {
    return normalizedDays.slice(0, limit);
  }

  return normalizedDays;
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

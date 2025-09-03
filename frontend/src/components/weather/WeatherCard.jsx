import { Link } from "react-router-dom";
import {
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Sunset,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useWeatherContext } from "@context/WeatherContext";

/**
 * WeatherCard component for displaying current weather information
 * @param {Object} props - Component props
 * @param {Object} props.weather - Weather data object
 * @param {boolean} props.showForecastLink - Whether to show link to forecast
 * @param {boolean} props.compact - Whether to show compact version
 * @param {Function} props.onAddToFavorites - Function to add location to favorites
 * @param {Function} [props.onRemoveFromFavorites] - Function to remove location from favorites
 * @param {Function} [props.onToggleForecast] - Optional handler to toggle forecast visibility (used on Home page)
 * @param {boolean} [props.isForecastVisible] - Whether forecast is currently visible (for button label)
 */
const WeatherCard = ({
  weather,
  showForecastLink = false,
  compact = false,
  onAddToFavorites,
  onRemoveFromFavorites,
  onToggleForecast,
  isForecastVisible,
}) => {
  const { preferences, formatTemperature, formatWindSpeed, isFavorite } =
    useWeatherContext();

  if (!weather) {
    return null;
  }

  const { location, current, sun } = weather;

  // Format time for sunrise/sunset
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get weather icon URL (OpenWeatherMap icons)
  const getWeatherIconUrl = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  // Check if location is already favorited
  const isLocationFavorited = isFavorite(location);

  return (
    <div className={`weather-card ${compact ? "weather-card--compact" : ""}`}>
      {/* Header */}
      <div className="weather-card__header">
        <div className="weather-card__location">
          <MapPin size={16} />
          <h3 className="weather-card__location-name">
            {/* Show original name if available, otherwise show city, country */}
            {location.name || location.city || "Unknown Location"}
            {/* Only show country if it's not already included in the name */}
            {location.country &&
              typeof location.name === "string" &&
              !location.name.includes(location.country) && (
                <span className="weather-card__country">
                  , {location.country}
                </span>
              )}
          </h3>
        </div>

        {onAddToFavorites && !isLocationFavorited && (
          <button
            onClick={() => {
              const result = onAddToFavorites(location);
              if (result) {
                // Could add a toast notification here in the future
                console.log("Added to favorites:", result.name);
              }
            }}
            className="weather-card__favorite-btn"
            aria-label="Add to favorites"
            title="Add to favorites"
          >
            <Heart size={16} />
          </button>
        )}

        {isLocationFavorited &&
          (onRemoveFromFavorites ? (
            <button
              onClick={() => {
                const removed = onRemoveFromFavorites(location);
                if (removed) {
                  console.log(
                    "Removed from favorites:",
                    location.name || location.city
                  );
                }
              }}
              className="weather-card__favorite-btn"
              aria-label="Remove from favorites"
              title="Remove from favorites"
            >
              <Heart size={16} fill="currentColor" />
            </button>
          ) : (
            <div
              className="weather-card__favorited"
              title="Already in favorites"
            >
              <Heart size={16} fill="currentColor" />
            </div>
          ))}
      </div>

      {/* Main Weather Display */}
      <div className="weather-card__main">
        <div className="weather-card__current">
          <div className="weather-card__temperature">
            <span className="weather-card__temp-value">
              {formatTemperature(current.temperature)}
            </span>
            <div className="weather-card__weather-info">
              <img
                src={getWeatherIconUrl(current.icon)}
                alt={current.description}
                className="weather-card__icon"
              />
              <span className="weather-card__description">
                {current.description}
              </span>
            </div>
          </div>

          <div className="weather-card__feels-like">
            <Thermometer size={14} />
            <span>Feels like {formatTemperature(current.feelsLike)}</span>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      {!compact && (
        <div className="weather-card__details">
          <div className="weather-details-grid">
            <div className="weather-detail">
              <Wind size={16} />
              <span className="weather-detail__label">Wind</span>
              <span className="weather-detail__value">
                {formatWindSpeed(current.windSpeed)}
              </span>
            </div>

            <div className="weather-detail">
              <Droplets size={16} />
              <span className="weather-detail__label">Humidity</span>
              <span className="weather-detail__value">{current.humidity}%</span>
            </div>

            {preferences.showPressure && (
              <div className="weather-detail">
                <Gauge size={16} />
                <span className="weather-detail__label">Pressure</span>
                <span className="weather-detail__value">
                  {current.pressure} hPa
                </span>
              </div>
            )}

            <div className="weather-detail">
              <Eye size={16} />
              <span className="weather-detail__label">Visibility</span>
              <span className="weather-detail__value">
                {current.visibility} km
              </span>
            </div>

            {preferences.showUvIndex && current.uvIndex && (
              <div className="weather-detail">
                <Sun size={16} />
                <span className="weather-detail__label">UV Index</span>
                <span className="weather-detail__value">{current.uvIndex}</span>
              </div>
            )}

            <div className="weather-detail">
              <span className="weather-detail__label">Cloudiness</span>
              <span className="weather-detail__value">
                {current.cloudiness}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sun Times */}
      {!compact && preferences.showSunriseSunset && sun && (
        <div className="weather-card__sun-times">
          <div className="sun-time">
            <Sun size={16} />
            <span className="sun-time__label">Sunrise</span>
            <span className="sun-time__value">{formatTime(sun.sunrise)}</span>
          </div>
          <div className="sun-time">
            <Sunset size={16} />
            <span className="sun-time__label">Sunset</span>
            <span className="sun-time__value">{formatTime(sun.sunset)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showForecastLink && (
        <div className="weather-card__actions">
          {typeof onToggleForecast === "function" ? (
            <button
              type="button"
              onClick={onToggleForecast}
              className="btn btn--secondary btn--small"
              aria-expanded={!!isForecastVisible}
            >
              <TrendingUp size={16} />
              {isForecastVisible ? "Hide Forecast" : "View Forecast"}
            </button>
          ) : (
            <Link
              to={`/search?city=${encodeURIComponent(location.name)}`}
              className="btn btn--secondary btn--small"
            >
              <TrendingUp size={16} />
              View Forecast
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;

import { MapPin, TrendingUp } from 'lucide-react';
import { useCurrentWeatherByCity } from '@hooks/useWeather';
import { useWeatherContext } from '@context/WeatherContext';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';

/**
 * ForecastCard component for displaying weather forecast for a location
 * @param {Object} props - Component props
 * @param {Object} props.location - Location object
 * @param {boolean} props.compact - Whether to show compact version
 */
const ForecastCard = ({ location, compact = false }) => {
  const { preferences, formatTemperature } = useWeatherContext();
  
  const { data, isLoading, isError, error } = useCurrentWeatherByCity(
    location.city || location.name,
    preferences.units
  );

  // Get weather icon URL
  const getWeatherIconUrl = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  if (isLoading) {
    return (
      <div className={`forecast-card ${compact ? 'forecast-card--compact' : ''}`}>
        <div className="forecast-card__loading">
          <LoadingSpinner size="small" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`forecast-card ${compact ? 'forecast-card--compact' : ''}`}>
        <ErrorMessage error={error} variant="compact" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const weather = data.data;

  return (
    <div className={`forecast-card ${compact ? 'forecast-card--compact' : ''}`}>
      <div className="forecast-card__header">
        <div className="forecast-card__location">
          <MapPin size={14} />
          <span className="forecast-card__location-name">
            {location.name || location.city}
          </span>
        </div>
      </div>

      <div className="forecast-card__content">
        <div className="forecast-card__weather">
          <img 
            src={getWeatherIconUrl(weather.current.icon)} 
            alt={weather.current.description}
            className="forecast-card__icon"
          />
          <div className="forecast-card__temp">
            {formatTemperature(weather.current.temperature)}
          </div>
        </div>
        
        <div className="forecast-card__description">
          {weather.current.description}
        </div>
      </div>

      {!compact && (
        <div className="forecast-card__details">
          <span>Feels like {formatTemperature(weather.current.feelsLike)}</span>
          <span>Humidity {weather.current.humidity}%</span>
        </div>
      )}
    </div>
  );
};

export default ForecastCard;


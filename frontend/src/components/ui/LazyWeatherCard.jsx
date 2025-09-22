import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load the WeatherCard component to improve initial load time
const WeatherCard = lazy(() => import('../weather/WeatherCard'));

/**
 * LazyWeatherCard component that lazy loads the actual WeatherCard
 * This helps reduce the initial bundle size and improves loading performance
 */
const LazyWeatherCard = (props) => {
  return (
    <Suspense fallback={
      <div className="weather-card-loading">
        <LoadingSpinner size="small" />
        <span>Loading weather...</span>
      </div>
    }>
      <WeatherCard {...props} />
    </Suspense>
  );
};

export default LazyWeatherCard;

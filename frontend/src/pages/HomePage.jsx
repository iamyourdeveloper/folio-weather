import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Heart, TrendingUp, AlertCircle, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { useWeatherContext } from '@context/WeatherContext';
import { useCurrentWeatherByCoords, useCurrentWeatherByCity, useForecastByCoords, useForecastByCity } from '@hooks/useWeather';
import WeatherCard from '@components/weather/WeatherCard';
import ForecastCard from '@components/weather/ForecastCard';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';

/**
 * HomePage component - Main landing page with current weather and quick actions
 */
const HomePage = () => {
  const {
    currentLocation,
    locationError,
    locationLoading,
    selectedLocation,
    autoSelectedLocation,
    favorites,
    preferences,
    isLoading,
    error,
    clearError,
    getEffectiveLocation,
    addFavorite,
    removeFavoriteByLocation,
    selectLocation,
    selectRandomDefaultCity,
  } = useWeatherContext();

  // Get the effective location to use
  const effectiveLocation = getEffectiveLocation();
  
  // Determine which weather data to fetch based on effective location
  const shouldFetchByCoords = effectiveLocation?.type === 'coords' || 
    (currentLocation && !selectedLocation && !autoSelectedLocation && preferences.autoLocation);
  const shouldFetchByCity = effectiveLocation?.type === 'city' || selectedLocation;

  // Toggle state for revealing the 5-day forecast on Home
  const [showHomeForecast, setShowHomeForecast] = useState(false);

  // Favorites slider state and helpers
  const sliderRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateSliderNav = () => {
    const el = sliderRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < maxScroll - 1);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateSliderNav();
    const onScroll = () => updateSliderNav();
    const onResize = () => updateSliderNav();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [favorites.length]);

  const scrollFavorites = (dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth; // scroll by one viewport width
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // Fetch weather data based on location
  const coordsWeather = useCurrentWeatherByCoords(
    shouldFetchByCoords ? (effectiveLocation?.coordinates || currentLocation)?.lat : null,
    shouldFetchByCoords ? (effectiveLocation?.coordinates || currentLocation)?.lon : null,
    preferences.units
  );

  const cityWeather = useCurrentWeatherByCity(
    shouldFetchByCity ? (effectiveLocation?.city || selectedLocation?.city) : null,
    preferences.units
  );

  // Fetch forecast data (enabled only when toggled open)
  const coordsForecast = useForecastByCoords(
    shouldFetchByCoords ? (effectiveLocation?.coordinates || currentLocation)?.lat : null,
    shouldFetchByCoords ? (effectiveLocation?.coordinates || currentLocation)?.lon : null,
    preferences.units,
    {
      enabled:
        showHomeForecast &&
        !!(
          shouldFetchByCoords &&
          (effectiveLocation?.coordinates || currentLocation)?.lat &&
          (effectiveLocation?.coordinates || currentLocation)?.lon
        ),
    }
  );

  const cityForecast = useForecastByCity(
    shouldFetchByCity ? (effectiveLocation?.city || selectedLocation?.city) : null,
    preferences.units,
    {
      enabled: showHomeForecast && !!(shouldFetchByCity && (effectiveLocation?.city || selectedLocation?.city)),
    }
  );

  // Determine which weather data to use
  const activeWeather = shouldFetchByCity ? cityWeather : coordsWeather;
  const activeForecast = shouldFetchByCity ? cityForecast : coordsForecast;

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="home-page">
      <div className="home-page__container">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero__content">
            <h1 className="home-hero__title">
              Welcome to {import.meta.env.VITE_APP_NAME || 'Weather App'}
            </h1>
            <p className="home-hero__subtitle">
              Get real-time weather information, forecasts, and manage your favorite locations
            </p>

            {/* Quick Action Buttons */}
            <div className="home-hero__actions">
              <Link to="/search" className="btn btn--primary">
                <Search size={20} />
                Search Weather
              </Link>
              
              <Link to="/favorites" className="btn btn--secondary">
                <Heart size={20} />
                View Favorites
              </Link>
            </div>
          </div>
        </section>

        {/* Current Weather Section */}
        <section className="home-weather">
          <div className="section__header">
            <h2 className="section__title">Current Weather</h2>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                // Picking a random default city and showing it
                setShowHomeForecast(false);
                selectRandomDefaultCity();
              }}
              title="Show a random city's weather"
              aria-label="Show a random city's weather"
            >
              <Shuffle size={18} />
              Random City
            </button>
          </div>
          
          {/* Location Status */}
          <div className="location-status">
            {locationLoading && (
              <div className="location-status__item">
                <LoadingSpinner size="small" />
                <span>Getting your location...</span>
              </div>
            )}
            
            {locationError && (
              <div className="location-status__item location-status__item--error">
                <AlertCircle size={16} />
                <span>
                  {(locationError?.message || 'Unable to retrieve your location.')}
                  {" "}Please search for a city.
                </span>
              </div>
            )}
            
            {currentLocation && !selectedLocation && (
              <div className="location-status__item location-status__item--success">
                <MapPin size={16} />
                <span>Using your current location</span>
              </div>
            )}
            
            {selectedLocation && (
              <div className="location-status__item location-status__item--info">
                <Search size={16} />
                <span>Showing weather for {selectedLocation.name || selectedLocation.city}</span>
              </div>
            )}
            
            {!selectedLocation && autoSelectedLocation && (
              <div className="location-status__item location-status__item--info">
                {autoSelectedLocation.type === 'coords' ? (
                  <>
                    <MapPin size={16} />
                    <span>Showing weather for {autoSelectedLocation.name}</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Showing weather for {autoSelectedLocation.name}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Weather Content */}
          <div className="home-weather__content">
            {(isLoading || activeWeather.isLoading) && (
              <div className="weather-loading">
                <LoadingSpinner />
                <p>Loading weather data...</p>
              </div>
            )}

            {(error || activeWeather.isError) && (
              <ErrorMessage 
                error={error || activeWeather.error} 
                onRetry={activeWeather.refetch}
              />
            )}

            {activeWeather.isSuccess && activeWeather.data && (
              <div className="weather-display">
                <WeatherCard 
                  weather={activeWeather.data.data}
                  showForecastLink={true}
                  onAddToFavorites={(loc) => addFavorite(loc)}
                  onRemoveFromFavorites={(loc) => removeFavoriteByLocation(loc)}
                  onToggleForecast={() => setShowHomeForecast((v) => !v)}
                  isForecastVisible={showHomeForecast}
                />
                
                {/* Show 5-day forecast if available */}
                {showHomeForecast &&
                 activeForecast.isSuccess &&
                 activeForecast.data &&
                 activeForecast.data.data &&
                 activeForecast.data.data.forecast &&
                 preferences.show5DayForecast && (
                  <div className="forecast-section">
                    <h3 className="forecast-section__title">5-Day Forecast</h3>
                    <div className="forecast-grid">
                      {activeForecast.data.data.forecast.slice(0, 5).map((day, index) => (
                        <div key={day.date} className="forecast-item">
                          <div className="forecast-item__date">
                            {index === 0
                              ? 'Today'
                              : index === 1
                              ? 'Tomorrow'
                              : new Date(day.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                })}
                            {" "}
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {new Date(day.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <img
                            src={`https://openweathermap.org/img/wn/${day.icon || '01d'}@2x.png`}
                            alt={day.description || 'Weather'}
                            className="forecast-item__icon"
                          />
                          <div className="forecast-item__temps">
                            <span className="forecast-item__temp-high">{Math.round(day.maxTemp)}°</span>
                            <span className="forecast-item__temp-low">{Math.round(day.minTemp)}°</span>
                          </div>
                          <div className="forecast-item__description">
                            {day.description || day.mainWeather || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !activeWeather.isLoading && !activeWeather.data && !error && !activeWeather.isError && !effectiveLocation && (
              <div className="weather-empty">
                <Search size={48} />
                <h3>No weather data available</h3>
                <p>
                  {locationError 
                    ? 'Please search for a city to get weather information.'
                    : 'Allow location access or search for a city to get started.'
                  }
                </p>
                <Link to="/search" className="btn btn--primary">
                  Search for Weather
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Favorite Locations Section */}
        {favorites.length > 0 && (
          <section className="home-favorites">
            <div className="section__header">
              <h2 className="section__title">Favorite Locations</h2>
              <Link to="/favorites" className="section__link">
                View All
                <TrendingUp size={16} />
              </Link>
            </div>
            
            <div className="favorites-slider">
              <div className="favorites-slider__viewport" ref={sliderRef} aria-label="Favorite locations slider">
                <div className="favorites-slider__track">
                  {favorites.map((favorite) => (
                    <div 
                      key={favorite.id} 
                      className="favorite-item"
                      role="button"
                      tabIndex={0}
                      title={`Show ${favorite.name || favorite.city} on Home`}
                      onClick={() => selectLocation({
                        type: 'city',
                        city: favorite.city || favorite.name,
                        name: favorite.name || favorite.city,
                        country: favorite.country,
                        coordinates: favorite.coordinates,
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectLocation({
                            type: 'city',
                            city: favorite.city || favorite.name,
                            name: favorite.name || favorite.city,
                            country: favorite.country,
                            coordinates: favorite.coordinates,
                          });
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <ForecastCard 
                        location={favorite}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {favorites.length > 3 && (
                <div className="favorites-slider__controls">
                  <button
                    className="favorites-slider__nav favorites-slider__nav--prev"
                    onClick={() => scrollFavorites(-1)}
                    disabled={!canPrev}
                    aria-label="Previous favorites"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="favorites-slider__nav favorites-slider__nav--next"
                    onClick={() => scrollFavorites(1)}
                    disabled={!canNext}
                    aria-label="Next favorites"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="home-features">
          <h2 className="section__title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <MapPin size={24} />
              </div>
              <h3 className="feature-card__title">Current Location</h3>
              <p className="feature-card__description">
                Automatically get weather for your current location with GPS.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <Search size={24} />
              </div>
              <h3 className="feature-card__title">City Search</h3>
              <p className="feature-card__description">
                Search for weather in any city worldwide with detailed forecasts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <Heart size={24} />
              </div>
              <h3 className="feature-card__title">Favorites</h3>
              <p className="feature-card__description">
                Save your favorite locations for quick access to their weather.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-card__title">5-Day Forecast</h3>
              <p className="feature-card__description">
                Get detailed weather forecasts up to 5 days in advance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

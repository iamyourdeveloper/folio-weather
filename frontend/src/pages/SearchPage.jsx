import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Plus, X } from 'lucide-react';
import { useWeatherContext } from '@context/WeatherContext';
import { useCurrentWeatherByCity, useForecastByCity } from '@hooks/useWeather';
import WeatherCard from '@components/weather/WeatherCard';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';

/**
 * SearchPage component for searching weather by city
 */
const SearchPage = () => {
  const { 
    searchQuery, 
    selectedLocation,
    preferences,
    addFavorite,
    removeFavoriteByLocation,
    isFavorite,
    searchLocation,
    selectLocation 
  } = useWeatherContext();
  
  // Keep the Search page input empty by default.
  // Do not hydrate from global search state to avoid lingering text
  // like a previous header search (e.g., "Mumbai").
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchedCity, setSearchedCity] = useState(selectedLocation?.city || '');
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // Fetch weather data for searched city
  const currentWeather = useCurrentWeatherByCity(
    searchedCity,
    preferences.units,
    { enabled: !!searchedCity }
  );

  const forecast = useForecastByCity(
    searchedCity,
    preferences.units,
    { enabled: !!searchedCity }
  );

  // If a ?city= parameter is present, hydrate the page and fetch immediately
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const cityParam = params.get('city');
    if (cityParam && cityParam.trim() && cityParam !== searchedCity) {
      const city = cityParam.trim();
      // Do not keep the typed query in the input; show placeholder instead
      setLocalSearchQuery('');
      setSearchedCity(city);
      searchLocation(city);
      selectLocation({ city, name: city });

      // Clear the query string so a browser refresh on the Search page
      // doesn't re-hydrate results. This preserves the immediate view
      // when navigating from Favorites but resets on reload.
      navigate('/search', { replace: true });
    }
  }, [routerLocation.search, searchedCity, searchLocation, selectLocation, navigate]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      const city = localSearchQuery.trim();
      setSearchedCity(city);
      searchLocation(city);
      selectLocation({ city, name: city });
      // Clear input so placeholder returns after submit
      setLocalSearchQuery('');
    }
  };

  // Favorite actions
  const handleAddToFavorites = (location) => addFavorite(location);
  const handleRemoveFromFavorites = (location) => removeFavoriteByLocation(location);

  return (
    <div className="search-page">
      <div className="search-page__container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="search-header__title">Search Weather</h1>
          <p className="search-header__subtitle">
            Get current weather and forecast for any city worldwide
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form search-form--page">
          <div className="search-form__input-group">
            <Search size={20} className="search-form__icon" />
            <input
              type="text"
              placeholder="Enter city name (e.g., London, New York, Tokyo)"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="search-form__input search-form__input--large"
              autoFocus
            />
            {localSearchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                className="search-form__clear"
                onClick={() => {
                  setLocalSearchQuery('');
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            type="submit" 
            className="search-form__submit search-form__submit--large"
            disabled={!localSearchQuery.trim()}
          >
            <Search size={20} />
            Search Weather
          </button>
        </form>

        {/* Search Results */}
        <div className="search-results">
          {/* Loading State */}
          {(currentWeather.isLoading || forecast.isLoading) && (
            <div className="search-results__loading">
              <LoadingSpinner />
              <p>Searching for weather in {searchedCity}...</p>
            </div>
          )}

          {/* Error State */}
          {(currentWeather.isError || forecast.isError) && (
            <div className="search-results__error">
              <ErrorMessage 
                error={currentWeather.error || forecast.error}
                onRetry={() => {
                  currentWeather.refetch();
                  forecast.refetch();
                }}
              />
            </div>
          )}

          {/* Success State */}
          {currentWeather.isSuccess && currentWeather.data && (
            <div className="search-results__content">
              {/* Current Weather */}
              <section className="search-results__current">
                <div className="section__header">
                  <h2 className="section__title">Current Weather</h2>
                  <div className="section__actions">
                    {(() => {
                      const loc = currentWeather.data.data.location;
                      const fav = isFavorite(loc);
                      return (
                        <button
                          onClick={() => (fav ? handleRemoveFromFavorites(loc) : handleAddToFavorites(loc))}
                          className="btn btn--secondary btn--small"
                        >
                          <Star size={16} />
                          {fav ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
                
                <WeatherCard 
                  weather={currentWeather.data.data}
                  onAddToFavorites={handleAddToFavorites}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                />
              </section>

              {/* Forecast */}
              {forecast.isSuccess && forecast.data && (
                <section className="search-results__forecast">
                  <h2 className="section__title">5-Day Forecast</h2>
                  
                  <div className="forecast-grid">
                    {forecast.data.data.forecast.slice(0, 5).map((day, index) => (
                      <div key={day.date} className="forecast-day">
                        <div className="forecast-day__header">
                          <h4 className="forecast-day__date">
                            {index === 0 ? 'Today' : 
                             index === 1 ? 'Tomorrow' : 
                             new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </h4>
                          <span className="forecast-day__date-full">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        
                        <div className="forecast-day__weather">
                          <img 
                            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                            alt={day.description}
                            className="forecast-day__icon"
                          />
                          <div className="forecast-day__temps">
                            <span className="forecast-day__temp-max">
                              {Math.round(day.maxTemp)}°
                            </span>
                            <span className="forecast-day__temp-min">
                              {Math.round(day.minTemp)}°
                            </span>
                          </div>
                        </div>
                        
                        <div className="forecast-day__description">
                          {day.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchedCity && !currentWeather.isLoading && (
            <div className="search-results__empty">
              <Search size={48} />
              <h3>Search for a city</h3>
              <p>Enter a city name above to get current weather and forecast information.</p>
              
              <div className="search-suggestions">
                <h4>Popular cities:</h4>
                <div className="search-suggestions__list">
                  {['London', 'New York', 'Tokyo', 'Paris', 'Sydney'].map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        // Trigger search immediately but keep the input clear
                        setSearchedCity(city);
                        searchLocation(city);
                        selectLocation({ city, name: city });
                        setLocalSearchQuery('');
                      }}
                      className="search-suggestion"
                    >
                      <MapPin size={14} />
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

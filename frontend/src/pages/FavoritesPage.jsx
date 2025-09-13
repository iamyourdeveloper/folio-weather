import { Heart, Trash2, MapPin, Plus, GripVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeatherContext } from '@context/WeatherContext';
import ForecastCard from '@components/weather/ForecastCard';
import { resolveFullLocationName } from '@utils/searchUtils';
import { useState, useCallback } from 'react';

/**
 * FavoritesPage component for managing favorite locations
 */
const FavoritesPage = () => {
  const { favorites, removeFavorite, reorderFavorites, selectLocation } = useWeatherContext();
  const navigate = useNavigate();

  // DnD state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Handle removing a favorite
  const handleRemoveFavorite = (favoriteId) => {
    if (window.confirm('Are you sure you want to remove this location from favorites?')) {
      removeFavorite(favoriteId);
    }
  };

  // Drag handlers
  const onDragStart = useCallback((e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', id);
    } catch (_) {}
  }, []);

  const onDragOver = useCallback((e, overId) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== overId) setDragOverId(overId);
  }, [dragOverId]);

  const onDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const onDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const sourceId = (() => {
      try { return e.dataTransfer.getData('text/plain') || draggingId; } catch (_) { return draggingId; }
    })();
    if (!sourceId || !targetId || sourceId === targetId) return;

    const sourceIndex = favorites.findIndex(f => f.id === sourceId);
    const destinationIndex = favorites.findIndex(f => f.id === targetId);
    if (sourceIndex === -1 || destinationIndex === -1) return;
    reorderFavorites({ sourceIndex, destinationIndex });
    setDragOverId(null);
    setDraggingId(null);
  }, [draggingId, favorites, reorderFavorites]);

  const onDragEnd = useCallback(() => {
    setDragOverId(null);
    setDraggingId(null);
  }, []);

  // Navigate to Search without clearing the currently selected location
  // This preserves the header weather badge (which follows selectedLocation)
  const handleAddNewLocation = useCallback(() => {
    // Do NOT clear selection here; keep current selection so the header badge
    // remains on the actively viewed location while the user adds another.
    // Tell Search page to open fresh while preserving header selection
    navigate('/search?new=1');
  }, [navigate]);

  return (
    <div className="favorites-page">
      <div className="favorites-page__container">
        {/* Header */}
        <div className="favorites-header">
          <h1 className="favorites-header__title">
            <Heart size={28} />
            Favorite Locations
          </h1>
          <p className="favorites-header__subtitle">
            Quick access to weather for your saved locations. Drag cards to reorder — this order is used on Home.
          </p>
          
          <button onClick={handleAddNewLocation} className="btn btn--primary">
            <Plus size={16} />
            Add New Location
          </button>
        </div>

        {/* Favorites Grid */}
        <div className="favorites-content">
          {favorites.length > 0 ? (
            <div className="favorites-grid" role="list">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className={
                    `favorite-item` +
                    (draggingId === favorite.id ? ' favorite-item--dragging' : '') +
                    (dragOverId === favorite.id ? ' favorite-item--dragover' : '')
                  }
                  role="listitem"
                  draggable
                  onDragStart={(e) => onDragStart(e, favorite.id)}
                  onDragOver={(e) => onDragOver(e, favorite.id)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, favorite.id)}
                  onDragEnd={onDragEnd}
                  aria-grabbed={draggingId === favorite.id}
                >
                  <div className="favorite-item__header">
                    <div className="favorite-item__draghandle" title="Drag to reorder" aria-label="Drag to reorder">
                      <GripVertical size={16} />
                    </div>
                    <div className="favorite-item__location">
                      <MapPin size={16} />
                      <span className="favorite-item__name">{resolveFullLocationName(favorite)}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="favorite-item__remove"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <ForecastCard location={favorite} />
                  
                  <div className="favorite-item__actions">
                    <Link 
                      to={`/search?city=${encodeURIComponent(favorite.city || favorite.name)}`}
                      className="btn btn--secondary btn--small"
                      onClick={(e) => {
                        // Promote this favorite to the active selection so the
                        // header badge and Home reflect it immediately.
                        try {
                          const name = resolveFullLocationName(favorite);
                          selectLocation({
                            type: 'city',
                            city: favorite.city || favorite.name,
                            name,
                            state: favorite.state,
                            country: favorite.country,
                            countryCode: favorite.countryCode,
                            coordinates: favorite.coordinates,
                          });
                        } catch (_) {}
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="favorites-empty">
              <Heart size={64} />
              <h3>No favorite locations yet</h3>
              <p>
                Add locations to your favorites for quick access to their weather information.
              </p>
              <button onClick={handleAddNewLocation} className="btn btn--primary">
                <Plus size={16} />
                Add Your First Favorite
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;

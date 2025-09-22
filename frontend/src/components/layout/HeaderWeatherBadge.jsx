import { useEffect } from "react";
import { Link, useLocation as useRouterLocation } from "react-router-dom";
import { Thermometer, MapPin } from "lucide-react";
import { useWeatherContext } from "@context/WeatherContext";
import {
  useCurrentWeatherByCity,
  useCurrentWeatherByCoords,
} from "@hooks/useWeather";
import { resolveFullLocationName } from "@utils/searchUtils";

/**
 * Small, live temperature display used in the header.
 * Mirrors the active location used on Home (selected or auto).
 * Updates immediately after searches because Header sets selectedLocation.
 */
const HeaderWeatherBadge = ({ onMouseDown, onTouchStart }) => {
  const {
    getEffectiveLocation,
    currentLocation,
    locationLoading,
    locationError,
    selectedLocation,
    autoSelectedLocation,
    preferences,
    formatTemperature,
    selectLocation,
  } = useWeatherContext();

  const routerLocation = useRouterLocation();

  // Prefer current coordinates whenever location services are enabled/available.
  // This keeps the badge consistently tied to your current location across pages.
  const effectiveLocation = getEffectiveLocation();
  // Only prefer coordinates when we actually have valid coordinates.
  // Do not prefer coords merely because geolocation is still loading —
  // this allows favorites to drive the badge while location is disabled/blocked.
  const hasCoords = !!(
    currentLocation &&
    currentLocation.lat != null &&
    currentLocation.lon != null
  );
  const preferCoords = preferences.autoLocation && !locationError && hasCoords;
  
  // When user explicitly selects a location (selectedLocation exists), respect their choice
  // Otherwise, fall back to autoLocation preference
  const userHasExplicitSelection = !!selectedLocation;
  const shouldFetchByCoords = userHasExplicitSelection 
    ? effectiveLocation?.type === "coords"
    : (preferCoords || effectiveLocation?.type === "coords");
  // Only fetch by city if we're not preferring coords and an explicit city is selected
  const shouldFetchByCity = !shouldFetchByCoords && effectiveLocation?.type === "city";

  const coordsWeather = useCurrentWeatherByCoords(
    shouldFetchByCoords
      ? (preferCoords ? currentLocation?.lat : effectiveLocation?.coordinates?.lat)
      : null,
    shouldFetchByCoords
      ? (preferCoords ? currentLocation?.lon : effectiveLocation?.coordinates?.lon)
      : null,
    preferences.units,
    effectiveLocation?.name || selectedLocation?.name, // Pass original name when available
    { staleTime: 60_000 }
  );

  const cityWeather = useCurrentWeatherByCity(
    shouldFetchByCity
      ? effectiveLocation?.city || selectedLocation?.city
      : null,
    preferences.units,
    selectedLocation?.name, // Pass original name when available
    { staleTime: 60_000 }
  );

  const active = shouldFetchByCity ? cityWeather : coordsWeather;

  // Compact render helpers
  const Loading = (
    <div
      className="header-weather header-weather--loading"
      title="Loading weather…"
    >
      <span className="header-weather__dot" />
      <span className="header-weather__text">Loading</span>
    </div>
  );

  // Always show location when we have an effectiveLocation, even if weather is loading or failed
  if (effectiveLocation) {
    const data = active?.data?.data;
    
    // If we have weather data, show temperature + location
    if (data?.current && data?.location) {
      const temp = formatTemperature(data.current.temperature);
      const locName = data.location.name || resolveFullLocationName(data.location) || resolveFullLocationName(effectiveLocation) || "Unknown";
      
      const isHome = routerLocation.pathname === "/";
      const content = (
        <div
          className="header-weather"
          aria-live="polite"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <Thermometer size={14} className="header-weather__icon" />
          <span className="header-weather__temp">{temp}</span>
          <span className="header-weather__sep">•</span>
          <MapPin size={12} className="header-weather__icon" />
          <span className="header-weather__city" title={locName}>
            {locName}
          </span>
        </div>
      );

      return (
        <Link
          to="/#current-weather"
          className="header-weather__link"
          title={isHome ? "Jump to current weather" : "View on Home"}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {content}
        </Link>
      );
    }
    
    // If weather is loading or failed, show location with loading indicator
    const loadingLocName = effectiveLocation?.name || resolveFullLocationName(effectiveLocation) || "Loading...";
    return (
      <Link
        to="/#current-weather"
        className="header-weather__link"
        title="Loading weather..."
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="header-weather header-weather--loading">
          <Thermometer size={14} className="header-weather__icon" />
          <span className="header-weather__temp">--°</span>
          <span className="header-weather__sep">•</span>
          <MapPin size={12} className="header-weather__icon" />
          <span className="header-weather__city" title={loadingLocName}>
            {loadingLocName}
          </span>
        </div>
      </Link>
    );
  }
  
  // Fallback: no effective location
  return null;
};

export default HeaderWeatherBadge;

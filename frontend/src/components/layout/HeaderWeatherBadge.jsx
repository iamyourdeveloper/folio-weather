import { memo } from "react";
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
const HeaderWeatherBadge = memo(({ onMouseDown, onTouchStart }) => {
  const {
    getEffectiveLocation,
    currentLocation,
    selectedLocation,
    autoSelectedLocation,
    preferences,
    formatTemperature,
  } = useWeatherContext();

  const routerLocation = useRouterLocation();

  // Match Home's effective location logic
  const effectiveLocation = getEffectiveLocation();
  const shouldFetchByCoords =
    effectiveLocation?.type === "coords" ||
    (currentLocation &&
      !selectedLocation &&
      !autoSelectedLocation &&
      preferences.autoLocation);
  const shouldFetchByCity =
    effectiveLocation?.type === "city" || selectedLocation;

  const coordsWeather = useCurrentWeatherByCoords(
    shouldFetchByCoords
      ? (effectiveLocation?.coordinates || currentLocation)?.lat
      : null,
    shouldFetchByCoords
      ? (effectiveLocation?.coordinates || currentLocation)?.lon
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

  if (!effectiveLocation) return null;

  if (active.isLoading) return Loading;
  if (active.isError) return null; // stay subtle if there’s an error

  const data = active?.data?.data;
  if (!data?.current || !data?.location) return null;

  const temp = formatTemperature(data.current.temperature);
  const locName =
    data.location?.name ?? resolveFullLocationName(effectiveLocation) ?? "Unknown";

  // We always link to Home's Current Weather section via hash.
  // Even on Home, this updates the hash and triggers a smooth scroll.
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
});

export default HeaderWeatherBadge;

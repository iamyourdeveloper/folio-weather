import { memo, useEffect } from "react";
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
  const shouldFetchByCoords = preferCoords || effectiveLocation?.type === "coords";
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

  // Promote a successful city result to the global selection to keep badge/Home in sync
  useEffect(() => {
    if (!shouldFetchByCity) return; // only promote city-based lookups
    const payload = active?.data?.data;
    const loc = payload?.location;
    if (!active?.isSuccess || !loc?.name || !loc?.city) return;

    const different =
      !selectedLocation ||
      selectedLocation.name !== loc.name ||
      (selectedLocation.city || "").toLowerCase() !== (loc.city || "").toLowerCase();

    if (different) {
      try {
        selectLocation({
          type: "city",
          city: loc.city,
          name: loc.name,
          state: loc.state,
          country: loc.country,
          coordinates: loc.coordinates,
        });
      } catch (_) {}
    }
  }, [shouldFetchByCity, active?.isSuccess, active?.data, selectLocation, selectedLocation]);

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

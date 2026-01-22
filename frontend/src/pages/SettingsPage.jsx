import { useEffect, useRef, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import {
  Save,
  Settings,
  Thermometer,
  Palette,
  MapPin,
  Eye,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { useWeatherContext } from "@context/WeatherContext";

/**
 * SettingsPage component for managing user preferences
 */
const SettingsPage = () => {
  const { preferences, updatePreferences, resetPreferences } =
    useWeatherContext();

  // Local UI state for toast + refresh indicator
  const [showSaved, setShowSaved] = useState(false);
  const [pendingRefresh, setPendingRefresh] = useState(false);
  const prevUnitsRef = useRef(preferences.units);
  const activeFetches = useIsFetching({ queryKey: ["weather"] });

  // Local draft of preferences. Changes here do NOT apply until Save.
  const [draft, setDraft] = useState(preferences);

  // Keep draft in sync when saved preferences change (e.g., after reset or external update)
  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouchDevice = window.matchMedia?.(
      "(hover: none) and (pointer: coarse)"
    ).matches;

    if (!prefersReducedMotion && !isTouchDevice) {
      return;
    }

    const previousDuration = root.style.getPropertyValue(
      "--theme-transition-duration"
    );
    const nextDuration = prefersReducedMotion ? "0ms" : "2ms";
    root.style.setProperty("--theme-transition-duration", nextDuration);

    return () => {
      if (previousDuration) {
        root.style.setProperty("--theme-transition-duration", previousDuration);
      } else {
        root.style.removeProperty("--theme-transition-duration");
      }
    };
  }, []);

  // Live theme preview: apply draft.theme to document root immediately
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme) => {
      root.classList.remove("theme-light", "theme-dark");
      if (theme === "dark") root.classList.add("theme-dark");
      else if (theme === "light") root.classList.add("theme-light");
      // 'auto' leaves classes off to follow media queries
    };

    const clearInlineVars = () => {
      const CSS_VARS = [
        "--color-background",
        "--color-background-secondary",
        "--color-background-tertiary",
        "--color-text-primary",
        "--color-text-secondary",
        "--color-text-tertiary",
        "--color-border",
        "--color-border-light",
      ];
      CSS_VARS.forEach((v) => root.style.removeProperty(v));
      root.style.removeProperty("background-color");
      root.style.removeProperty("color");
    };

    // Apply draft selection for preview
    applyTheme(draft.theme);
    clearInlineVars();

    // On unmount or when preferences change, restore to saved prefs
    return () => {
      applyTheme(preferences.theme);
      clearInlineVars();
    };
  }, [draft.theme, preferences.theme]);

  // Handle preference changes (only update local draft)
  const handlePreferenceChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Apply local draft to global preferences
    const unitsChanged = draft.units !== preferences.units;
    updatePreferences(draft);
    setShowSaved(true);
    if (unitsChanged) {
      setPendingRefresh(true);
      prevUnitsRef.current = draft.units;
    }
    window.setTimeout(() => setShowSaved(false), 2000);
  };

  // Handle reset to defaults (Fahrenheit)
  const handleReset = () => {
    const targetUnits = "imperial";
    resetPreferences();
    setShowSaved(true);
    setPendingRefresh(true);
    prevUnitsRef.current = targetUnits;
    window.setTimeout(() => setShowSaved(false), 2000);
  };

  // Clear refresh flag when queries finish
  useEffect(() => {
    if (pendingRefresh && activeFetches === 0) {
      setPendingRefresh(false);
    }
  }, [activeFetches, pendingRefresh]);

  return (
    <div className="settings-page">
      <div className="settings-page__container">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-header__title">
            <Settings size={28} />
            Settings
          </h1>
          <p className="settings-header__subtitle">
            Customize your weather app experience
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="settings-form">
          {/* Toast: Saved */}
          {showSaved && (
            <div
              className="toast toast--success"
              role="status"
              aria-live="polite"
            >
              <CheckCircle size={16} />
              <span>Settings saved</span>
            </div>
          )}

          {/* Refetching indicator when units change */}
          {pendingRefresh && (
            <div className="inline-status">
              <span className="inline-status__dot" />
              <span>Refreshing weather data…</span>
            </div>
          )}

          {/* Temperature Units */}
          <div className="settings-section">
            <div className="settings-section__header">
              <Thermometer size={20} />
              <h3 className="settings-section__title">Temperature Units</h3>
            </div>
            <div className="settings-group">
              <label className="radio-group">
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={draft.units === "metric"}
                  onChange={(e) =>
                    handlePreferenceChange("units", e.target.value)
                  }
                />
                <span className="radio-button"></span>
                <span className="radio-label">
                  <strong>Celsius (°C)</strong>
                  <small>Metric system, wind in m/s</small>
                </span>
              </label>

              <label className="radio-group">
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={draft.units === "imperial"}
                  onChange={(e) =>
                    handlePreferenceChange("units", e.target.value)
                  }
                />
                <span className="radio-button"></span>
                <span className="radio-label">
                  <strong>Fahrenheit (°F)</strong>
                  <small>Imperial system, wind in mph</small>
                </span>
              </label>

              <label className="radio-group">
                <input
                  type="radio"
                  name="units"
                  value="kelvin"
                  checked={draft.units === "kelvin"}
                  onChange={(e) =>
                    handlePreferenceChange("units", e.target.value)
                  }
                />
                <span className="radio-button"></span>
                <span className="radio-label">
                  <strong>Kelvin (K)</strong>
                  <small>Scientific units</small>
                </span>
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="settings-section">
            <div className="settings-section__header">
              <Palette size={20} />
              <h3 className="settings-section__title">Appearance</h3>
            </div>
            <div className="settings-group">
              <label className="radio-group">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={draft.theme === "light"}
                  onChange={(e) =>
                    handlePreferenceChange("theme", e.target.value)
                  }
                />
                <span className="radio-button"></span>
                <span className="radio-label">
                  <strong>Light Theme</strong>
                  <small>Bright and clean interface</small>
                </span>
              </label>

              <label className="radio-group">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={draft.theme === "dark"}
                  onChange={(e) =>
                    handlePreferenceChange("theme", e.target.value)
                  }
                />
                <span className="radio-button"></span>
                <span className="radio-label">
                  <strong>Dark Theme</strong>
                  <small>Easy on the eyes</small>
                </span>
              </label>

              <label className="radio-group">
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={draft.theme === "auto"}
                  onChange={(e) =>
                    handlePreferenceChange("theme", e.target.value)
                  }
                />
                <span className="radio-button"></span>
                <span className="radio-label">
                  <strong>Auto</strong>
                  <small>Follow system preference</small>
                </span>
              </label>
            </div>
          </div>

          {/* Location Settings */}
          <div className="settings-section">
            <div className="settings-section__header">
              <MapPin size={20} />
              <h3 className="settings-section__title">Location</h3>
            </div>
            <div className="settings-group">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={draft.autoLocation}
                  onChange={(e) =>
                    handlePreferenceChange("autoLocation", e.target.checked)
                  }
                />
                <span className="checkbox"></span>
                <span className="checkbox-label">
                  <strong>Auto-detect location</strong>
                  <small>
                    Use GPS to automatically get weather for your current
                    location.{" "}
                    <span
                      style={{ marginTop: "10px", display: "inline-block" }}
                    >
                      * Having this option selected, along with enabling your PC
                      & Browser's location settings will keep your current
                      weather location displayed upon the Home page & Weather
                      badge (top right of app's header) after refreshing the
                      app. *
                    </span>
                  </small>
                </span>
              </label>
            </div>
          </div>

          {/* Display Settings */}
          <div className="settings-section">
            <div className="settings-section__header">
              <Eye size={20} />
              <h3 className="settings-section__title">Display Options</h3>
            </div>
            <div className="settings-group">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={draft.showWindSpeed}
                  onChange={(e) =>
                    handlePreferenceChange("showWindSpeed", e.target.checked)
                  }
                />
                <span className="checkbox"></span>
                <span className="checkbox-label">Show wind speed</span>
              </label>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={draft.showHumidity}
                  onChange={(e) =>
                    handlePreferenceChange("showHumidity", e.target.checked)
                  }
                />
                <span className="checkbox"></span>
                <span className="checkbox-label">Show humidity</span>
              </label>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={draft.showPressure}
                  onChange={(e) =>
                    handlePreferenceChange("showPressure", e.target.checked)
                  }
                />
                <span className="checkbox"></span>
                <span className="checkbox-label">Show pressure</span>
              </label>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={draft.showUvIndex}
                  onChange={(e) =>
                    handlePreferenceChange("showUvIndex", e.target.checked)
                  }
                />
                <span className="checkbox"></span>
                <span className="checkbox-label">Show UV index</span>
              </label>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={draft.showSunriseSunset}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "showSunriseSunset",
                      e.target.checked
                    )
                  }
                />
                <span className="checkbox"></span>
                <span className="checkbox-label">
                  Show sunrise/sunset times
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-form__actions">
            <div className="settings-form__actions-buttons">
              <button type="submit" className="btn btn--primary">
                <Save size={16} />
                Save Settings
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleReset}
                data-testid="reset-defaults"
              >
                <RotateCcw size={16} />
                Reset to Defaults
              </button>
            </div>
            <p className="settings-form__note">
              Changes apply after you click Save.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;

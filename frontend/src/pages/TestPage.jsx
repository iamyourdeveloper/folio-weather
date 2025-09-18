import React, { useEffect, useRef, useState } from "react";
import {
  useCurrentWeatherByCity,
  useForecastByCity,
  useWeatherApiTest,
  useWeatherUnits,
} from "@hooks/useWeather";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import weatherService from "@services/weatherService.js";

const TestPage = () => {
  // Separate input value from the city used for queries
  const [inputCity, setInputCity] = useState("London");
  const [testCity, setTestCity] = useState("London");
  // Start with tests disabled so buttons show "Start"
  const [enableWeatherTest, setEnableWeatherTest] = useState(false);
  const [enableForecastTest, setEnableForecastTest] = useState(false);
  // Reduce network chatter while typing
  const [onlyFetchOnEnter, setOnlyFetchOnEnter] = useState(true);
  const [debounceMs, setDebounceMs] = useState(500);
  const inputRef = useRef(null);
  const lastTypedRef = useRef(0);

  // Run once state
  const [runOnceLoading, setRunOnceLoading] = useState(false);
  const [runOnceError, setRunOnceError] = useState(null);
  const [runOnceData, setRunOnceData] = useState(null);
  const runOnceTokenRef = useRef(0);

  // Clear one-off results if any test is started
  useEffect(() => {
    if (enableWeatherTest || enableForecastTest) {
      setRunOnceLoading(false);
      setRunOnceError(null);
      setRunOnceData(null);
    }
  }, [enableWeatherTest, enableForecastTest]);

  // Helpers for Integration Summary reflecting Run Once
  // (computed after queries are defined below)

  // Debounce updating testCity while typing (if enabled)
  useEffect(() => {
    if (onlyFetchOnEnter) return;
    const handle = setTimeout(() => {
      setTestCity(inputCity.trim());
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [inputCity, onlyFetchOnEnter, debounceMs]);

  // API Tests
  const apiTest = useWeatherApiTest();
  const unitsTest = useWeatherUnits();

  // Weather Data Tests
  const weatherTest = useCurrentWeatherByCity(testCity, "metric", null, {
    enabled: enableWeatherTest,
  });
  const forecastTest = useForecastByCity(
    testCity,
    "metric",
    null,
    {
      enabled: enableForecastTest,
    }
  );

  const runOnceSuccess = !!runOnceData && !runOnceError;
  const weatherSummary = {
    bg: enableWeatherTest
      ? weatherTest.isSuccess
        ? "#d4edda"
        : "#f8d7da"
      : runOnceSuccess
      ? "#d4edda"
      : "#fff3cd",
    status: enableWeatherTest
      ? weatherTest.isSuccess
        ? "success"
        : "error"
      : runOnceSuccess
      ? "success"
      : "idle",
    text: enableWeatherTest
      ? weatherTest.isSuccess
        ? "PASS"
        : "FAIL"
      : runOnceSuccess
      ? "PASS"
      : "NOT TESTED",
  };
  const forecastSummary = {
    bg: enableForecastTest
      ? forecastTest.isSuccess
        ? "#d4edda"
        : "#f8d7da"
      : runOnceSuccess
      ? "#d4edda"
      : "#fff3cd",
    status: enableForecastTest
      ? forecastTest.isSuccess
        ? "success"
        : "error"
      : runOnceSuccess
      ? "success"
      : "idle",
    text: enableForecastTest
      ? forecastTest.isSuccess
        ? "PASS"
        : "FAIL"
      : runOnceSuccess
      ? "PASS"
      : "NOT TESTED",
  };

  const TestSection = ({ title, children, id }) => (
    <div
      id={id}
      style={{
        margin: "20px 0",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#333" }}>{title}</h3>
      {children}
    </div>
  );

  const StatusBadge = ({ status, children }) => {
    const colors = {
      loading: "#ffc107",
      success: "#28a745",
      error: "#dc3545",
      idle: "#6c757d",
    };

    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          color: "white",
          backgroundColor: colors[status] || colors.idle,
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {children}
      </span>
    );
  };

  const ResultDisplay = ({ result, title }) => {
    if (result.isLoading) return <LoadingSpinner />;
    if (result.isError) return <ErrorMessage error={result.error} />;
    if (!result.data) return <p>No data available</p>;

    return (
      <div>
        <h4>
          {title} - <StatusBadge status="success">SUCCESS</StatusBadge>
        </h4>
        <pre
          style={{
            background: "#f1f1f1",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {JSON.stringify(result.data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Frontend API Integration Test</h1>
      <p>
        This page tests the React frontend integration with the backend API
        using React Query hooks.
      </p>

      <TestSection title="🔗 Basic API Connection Tests">
        <div style={{ marginBottom: "15px" }}>
          <h4>
            API Connection Test -{" "}
            <StatusBadge
              status={
                apiTest.isLoading
                  ? "loading"
                  : apiTest.isError
                  ? "error"
                  : "success"
              }
            >
              {apiTest.isLoading
                ? "LOADING"
                : apiTest.isError
                ? "ERROR"
                : "SUCCESS"}
            </StatusBadge>
          </h4>
          {apiTest.isLoading && <LoadingSpinner />}
          {apiTest.isError && <ErrorMessage error={apiTest.error} />}
          {apiTest.data && (
            <div
              style={{
                background: "#e8f5e8",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              ✅ {apiTest.data.message}
            </div>
          )}
        </div>

        <div>
          <h4>
            Units Test -{" "}
            <StatusBadge
              status={
                unitsTest.isLoading
                  ? "loading"
                  : unitsTest.isError
                  ? "error"
                  : "success"
              }
            >
              {unitsTest.isLoading
                ? "LOADING"
                : unitsTest.isError
                ? "ERROR"
                : "SUCCESS"}
            </StatusBadge>
          </h4>
          {unitsTest.isLoading && <LoadingSpinner />}
          {unitsTest.isError && <ErrorMessage error={unitsTest.error} />}
          {unitsTest.data && (
            <div
              style={{
                background: "#e8f5e8",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              ✅ Retrieved {unitsTest.data.data.units.length} temperature units
              <ul>
                {unitsTest.data.data.units.map((unit) => (
                  <li key={unit.key}>
                    {unit.name} ({unit.symbol}) - {unit.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </TestSection>

      <TestSection title="🌍 Weather Data Tests">
        <div className="test-city-container" style={{ marginBottom: "20px" }}>
          <div className="test-city-input-wrapper">
            <label>
              Test City:
              <input
                type="text"
                value={inputCity}
                ref={inputRef}
                autoFocus
                onChange={(e) => setInputCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onlyFetchOnEnter) {
                    setTestCity(inputCity.trim());
                  }
                }}
                onInput={() => {
                  lastTypedRef.current = Date.now();
                }}
                onBlur={(e) => {
                  // If blur happens right after typing due to re-renders, keep focus
                  if (Date.now() - lastTypedRef.current < 600) {
                    // Don't steal focus if user intentionally clicked another control
                    if (!e.relatedTarget) {
                      requestAnimationFrame(() => inputRef.current?.focus());
                    }
                  }
                }}
                className="test-city-input"
                style={{ marginLeft: "10px", padding: "5px" }}
              />
            </label>
          </div>
          <div className="test-city-buttons">
            <button
              onClick={() => setTestCity(inputCity.trim())}
              className="test-city-btn test-city-btn--apply"
              style={{
                padding: "6px 10px",
                marginLeft: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Apply City
            </button>
            <button
              onClick={async () => {
              const city = inputCity.trim();
              if (!city) return;
              const token = ++runOnceTokenRef.current;
              setRunOnceLoading(true);
              setRunOnceError(null);
              setRunOnceData(null);
              setTestCity(city); // keep UI in sync
              try {
                const [w, f] = await Promise.all([
                  weatherService.getCurrentWeatherByCity(city, "metric", null),
                  weatherService.getForecastByCity(city, "metric", null),
                ]);
                if (runOnceTokenRef.current === token) {
                  setRunOnceData({ weather: w, forecast: f });
                }
              } catch (err) {
                if (runOnceTokenRef.current === token) {
                  setRunOnceError(err);
                }
              } finally {
                if (runOnceTokenRef.current === token) {
                  setRunOnceLoading(false);
                }
              }
            }}
            disabled={enableWeatherTest || enableForecastTest || runOnceLoading}
            className="test-city-btn test-city-btn--run"
            style={{
              padding: "6px 10px",
              marginLeft: "10px",
              backgroundColor:
                enableWeatherTest || enableForecastTest || runOnceLoading
                  ? "#74c0d0"
                  : "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Run Once
          </button>
          <button
            onClick={() => {
              runOnceTokenRef.current++;
              setRunOnceLoading(false);
              setRunOnceError(null);
              setRunOnceData(null);
            }}
            className="test-city-btn test-city-btn--clear"
            style={{
              padding: "6px 10px",
              marginLeft: "10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Clear Run Once
          </button>
          </div>
        </div>

        <div className="test-control-buttons">
          <button
            onClick={() => {
              const next = !enableWeatherTest;
              setEnableWeatherTest(next);
              if (next) {
                // Clear any Run Once results when tests are started
                setRunOnceLoading(false);
                setRunOnceError(null);
                setRunOnceData(null);
              }
            }}
            className="test-control-btn test-control-btn--weather"
            style={{
              padding: "10px 15px",
              margin: "5px",
              backgroundColor: enableWeatherTest ? "#dc3545" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {enableWeatherTest ? "Stop Weather Test" : "Start Weather Test"}
          </button>

          <button
            onClick={() => {
              const next = !enableForecastTest;
              setEnableForecastTest(next);
              if (next) {
                // Clear any Run Once results when tests are started
                setRunOnceLoading(false);
                setRunOnceError(null);
                setRunOnceData(null);
              }
            }}
            className="test-control-btn test-control-btn--forecast"
            style={{
              padding: "10px 15px",
              margin: "5px",
              backgroundColor: enableForecastTest ? "#dc3545" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {enableForecastTest ? "Stop Forecast Test" : "Start Forecast Test"}
          </button>

          <button
            onClick={() =>
              document
                .getElementById("integration-summary")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="test-control-btn test-control-btn--summary"
            style={{
              padding: "10px 15px",
              margin: "5px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            View Summary
          </button>
        </div>

        <p className="test-control-help" style={{ fontSize: "14px", color: "#666", fontStyle: "italic", marginBottom: "20px" }}>
          💡 Weather and Forecast tests do not run automatically. Use the
          buttons above to start/stop tests.
        </p>

        {enableWeatherTest && (
          <ResultDisplay
            result={weatherTest}
            title={`Current Weather for ${testCity}`}
          />
        )}

        {enableForecastTest && (
          <ResultDisplay
            result={forecastTest}
            title={`5-Day Forecast for ${testCity}`}
          />
        )}
      </TestSection>

      {/* Run Once Results */}
      <TestSection title="⚡ Run Once Results">
        {runOnceLoading && <LoadingSpinner />}
        {runOnceError && <ErrorMessage error={runOnceError} />}
        {!runOnceLoading && !runOnceError && runOnceData && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <h4>
                Current Weather - <StatusBadge status="success">SUCCESS</StatusBadge>
              </h4>
              <pre
                style={{
                  background: "#f1f1f1",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(runOnceData.weather, null, 2)}
              </pre>
            </div>
            <div>
              <h4>
                5-Day Forecast - <StatusBadge status="success">SUCCESS</StatusBadge>
              </h4>
              <pre
                style={{
                  background: "#f1f1f1",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(runOnceData.forecast, null, 2)}
              </pre>
            </div>
          </div>
        )}
        {!runOnceLoading && !runOnceError && !runOnceData && (
          <p style={{ color: "#666" }}>Click "Run Once" to fetch data without starting tests.</p>
        )}
      </TestSection>

      <TestSection id="integration-summary" title="📊 Integration Summary">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: apiTest.isSuccess ? "#d4edda" : "#f8d7da",
              borderRadius: "4px",
            }}
          >
            <strong>API Connection</strong>
            <br />
            <StatusBadge status={apiTest.isSuccess ? "success" : "error"}>
              {apiTest.isSuccess ? "PASS" : "FAIL"}
            </StatusBadge>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: unitsTest.isSuccess ? "#d4edda" : "#f8d7da",
              borderRadius: "4px",
            }}
          >
            <strong>Units Endpoint</strong>
            <br />
            <StatusBadge status={unitsTest.isSuccess ? "success" : "error"}>
              {unitsTest.isSuccess ? "PASS" : "FAIL"}
            </StatusBadge>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: weatherSummary.bg,
              borderRadius: "4px",
            }}
          >
            <strong>Weather Data</strong>
            <br />
            <StatusBadge
              status={weatherSummary.status}
            >
              {weatherSummary.text}
            </StatusBadge>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: forecastSummary.bg,
              borderRadius: "4px",
            }}
          >
            <strong>Forecast Data</strong>
            <br />
            <StatusBadge
              status={forecastSummary.status}
            >
              {forecastSummary.text}
            </StatusBadge>
          </div>
        </div>
      </TestSection>

      <TestSection title="ℹ️ Debug Information">
        <div style={{ fontSize: "14px", color: "#666" }}>
          <p>
            <strong>Frontend URL:</strong> {window.location.origin}
          </p>
          <p>
            <strong>API Base URL:</strong>{" "}
            {import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}
          </p>
          <p>
            <strong>Environment:</strong> {import.meta.env.MODE}
          </p>
          <p>
            <strong>React Query Dev Tools:</strong> Check browser console and
            network tab
          </p>
        </div>
      </TestSection>
    </div>
  );
};

export default TestPage;

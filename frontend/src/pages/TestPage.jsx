import React, { useState } from "react";
import {
  useCurrentWeatherByCity,
  useForecastByCity,
  useWeatherApiTest,
  useWeatherUnits,
} from "@hooks/useWeather";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";

const TestPage = () => {
  const [testCity, setTestCity] = useState("London");
  const [enableWeatherTest, setEnableWeatherTest] = useState(true);
  const [enableForecastTest, setEnableForecastTest] = useState(true);

  // API Tests
  const apiTest = useWeatherApiTest();
  const unitsTest = useWeatherUnits();

  // Weather Data Tests
  const weatherTest = useCurrentWeatherByCity(testCity, "metric", null, {
    enabled: enableWeatherTest,
  });
  const forecastTest = useForecastByCity(testCity, "metric", {
    enabled: enableForecastTest,
  });

  const TestSection = ({ title, children }) => (
    <div
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
        <div style={{ marginBottom: "20px" }}>
          <label>
            Test City:
            <input
              type="text"
              value={testCity}
              onChange={(e) => setTestCity(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setEnableWeatherTest(!enableWeatherTest)}
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
            onClick={() => setEnableForecastTest(!enableForecastTest)}
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

          <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
            💡 Weather and Forecast tests run automatically on page load. Use
            buttons above to start/stop tests.
          </p>
        </div>

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

      <TestSection title="📊 Integration Summary">
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
              background: !enableWeatherTest
                ? "#fff3cd"
                : weatherTest.isSuccess
                ? "#d4edda"
                : "#f8d7da",
              borderRadius: "4px",
            }}
          >
            <strong>Weather Data</strong>
            <br />
            <StatusBadge
              status={
                !enableWeatherTest
                  ? "idle"
                  : weatherTest.isSuccess
                  ? "success"
                  : "error"
              }
            >
              {!enableWeatherTest
                ? "NOT TESTED"
                : weatherTest.isSuccess
                ? "PASS"
                : "FAIL"}
            </StatusBadge>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: !enableForecastTest
                ? "#fff3cd"
                : forecastTest.isSuccess
                ? "#d4edda"
                : "#f8d7da",
              borderRadius: "4px",
            }}
          >
            <strong>Forecast Data</strong>
            <br />
            <StatusBadge
              status={
                !enableForecastTest
                  ? "idle"
                  : forecastTest.isSuccess
                  ? "success"
                  : "error"
              }
            >
              {!enableForecastTest
                ? "NOT TESTED"
                : forecastTest.isSuccess
                ? "PASS"
                : "FAIL"}
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

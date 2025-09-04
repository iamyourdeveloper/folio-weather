/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import WeatherProvider, { useWeatherContext } from '../../context/WeatherContext.jsx';
import { QueryProvider } from '../../context/QueryProvider.jsx';
import SettingsPage from '../SettingsPage.jsx';

function ReadUnits({ onReady }) {
  const { preferences } = useWeatherContext();
  React.useEffect(() => {
    onReady?.(preferences.units);
  }, [preferences.units, onReady]);
  return null;
}

describe('SettingsPage staged changes do not apply until Save', () => {
  it('changing radio does not mutate context until submit', async () => {
    localStorage.clear();
    localStorage.setItem('weatherAppPreferences', JSON.stringify({ units: 'metric' }));

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let currentUnits = null;
    root.render(
      <QueryProvider>
        <WeatherProvider>
          <SettingsPage />
          <ReadUnits onReady={(u) => (currentUnits = u)} />
        </WeatherProvider>
      </QueryProvider>
    );

    // Wait for initial
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (currentUnits !== null) return resolve();
        if (Date.now() - start > 1000) return reject(new Error('units not ready'));
        setTimeout(check, 10);
      };
      check();
    });
    expect(currentUnits).toBe('metric');

    // Change to imperial in the form (without submit)
    const imperialRadio = container.querySelector('input[type=\"radio\"][name=\"units\"][value=\"imperial\"]');
    imperialRadio.click();

    // Units in context should remain metric
    await new Promise((r) => setTimeout(r, 20));
    expect(currentUnits).toBe('metric');

    // Submit to apply
    const submitBtn = container.querySelector('form.settings-form button[type="submit"]');
    submitBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (currentUnits === 'imperial') return resolve();
        if (Date.now() - start > 1000) return reject(new Error('units did not update to imperial'));
        setTimeout(check, 10);
      };
      check();
    });
    expect(currentUnits).toBe('imperial');

    root.unmount();
    document.body.removeChild(container);
  });
});

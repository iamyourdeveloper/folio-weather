/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import WeatherProvider from '../../context/WeatherContext.jsx';
import { QueryProvider } from '../../context/QueryProvider.jsx';
import SettingsPage from '../SettingsPage.jsx';

describe('SettingsPage reset to defaults', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resets to Fahrenheit (imperial) and persists', async () => {
    // Start with metric stored
    localStorage.setItem('weatherAppPreferences', JSON.stringify({ units: 'metric' }));

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(
      <QueryProvider>
        <WeatherProvider>
          <SettingsPage />
        </WeatherProvider>
      </QueryProvider>
    );

    // Click reset
    const resetBtn = await new Promise((resolve, reject) => {
      const start = Date.now();
      const find = () => {
        const el = container.querySelector('[data-testid="reset-defaults"]');
        if (el) return resolve(el);
        if (Date.now() - start > 1000) return reject(new Error('reset button not found'));
        setTimeout(find, 10);
      };
      find();
    });
    resetBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Imperial radio should be checked
    const imperial = await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const el = container.querySelector('input[type="radio"][name="units"][value="imperial"]');
        if (el && el.checked) return resolve(el);
        if (Date.now() - start > 1000) return reject(new Error('imperial not checked'));
        setTimeout(check, 10);
      };
      check();
    });
    expect(imperial.checked).toBe(true);

    // Persisted
    const saved = JSON.parse(localStorage.getItem('weatherAppPreferences'));
    expect(saved.units).toBe('imperial');

    root.unmount();
    document.body.removeChild(container);
  });
});


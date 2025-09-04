/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import WeatherProvider from '../../context/WeatherContext.jsx';
import { QueryProvider } from '../../context/QueryProvider.jsx';
import SettingsPage from '../SettingsPage.jsx';

describe('SettingsPage persisted units', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses saved imperial units on initial render', async () => {
    localStorage.setItem(
      'weatherAppPreferences',
      JSON.stringify({ units: 'imperial' })
    );

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

    // Find radios
    const imperial = await new Promise((resolve, reject) => {
      const start = Date.now();
      const find = () => {
        const el = container.querySelector('input[type="radio"][name="units"][value="imperial"]');
        if (el) return resolve(el);
        if (Date.now() - start > 1000) return reject(new Error('imperial radio not found'));
        setTimeout(find, 10);
      };
      find();
    });

    expect(imperial.checked).toBe(true);

    root.unmount();
    document.body.removeChild(container);
  });
});


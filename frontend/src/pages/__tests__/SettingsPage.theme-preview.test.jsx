/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import WeatherProvider from '../../context/WeatherContext.jsx';
import { QueryProvider } from '../../context/QueryProvider.jsx';
import SettingsPage from '../SettingsPage.jsx';

describe('Settings theme live preview', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    localStorage.clear();
    localStorage.setItem('weatherAppPreferences', JSON.stringify({ theme: 'light', units: 'imperial' }));
  });

  it('applies theme on selection before saving and restores on unmount', async () => {
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

    // Initially light (wait for context effect)
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const isLight = document.documentElement.classList.contains('theme-light');
        const isDark = document.documentElement.classList.contains('theme-dark');
        if (isLight || isDark) return resolve(null);
        if (Date.now() - start > 1000) return reject(new Error('theme not applied'));
        setTimeout(check, 10);
      };
      check();
    });
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);

    // Click dark radio (no save)
    const darkRadio = container.querySelector('input[type=\"radio\"][name=\"theme\"][value=\"dark\"]');
    darkRadio.click();
    await new Promise((r) => setTimeout(r, 10));
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);

    // Unmount should restore saved light
    root.unmount();
    await new Promise((r) => setTimeout(r, 10));
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);

    document.body.removeChild(container);
  });
});

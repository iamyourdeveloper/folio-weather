/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import WeatherProvider from '../../context/WeatherContext.jsx';
import { QueryProvider } from '../../context/QueryProvider.jsx';
import SettingsPage from '../SettingsPage.jsx';

describe('SettingsPage default highlight on refresh', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('highlights Fahrenheit (imperial) when no saved prefs exist', async () => {
    // No saved preferences -> defaults apply (imperial)
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(
      <MemoryRouter>
        <QueryProvider>
          <WeatherProvider>
            <SettingsPage />
          </WeatherProvider>
        </QueryProvider>
      </MemoryRouter>
    );

    const imperial = await new Promise((resolve, reject) => {
      const start = Date.now();
      const find = () => {
        const el = container.querySelector('input[type=\"radio\"][name=\"units\"][value=\"imperial\"]');
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

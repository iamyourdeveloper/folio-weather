/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import WeatherProvider from '../../context/WeatherContext.jsx';
import { QueryProvider } from '../../context/QueryProvider.jsx';
import SettingsPage from '../SettingsPage.jsx';

describe('SettingsPage toast', () => {
  it('shows a saved toast on submit after changing units', async () => {
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

    // Change units to imperial
    const imperialRadio = await new Promise((resolve, reject) => {
      const start = Date.now();
      const find = () => {
        const el = container.querySelector('input[type="radio"][name="units"][value="imperial"]');
        if (el) return resolve(el);
        if (Date.now() - start > 1000) return reject(new Error('radio not found'));
        setTimeout(find, 10);
      };
      find();
    });
    imperialRadio.checked = true;
    imperialRadio.dispatchEvent(new Event('change', { bubbles: true }));

    // Submit form
    const form = container.querySelector('form.settings-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Toast should appear (wait briefly for state update)
    const toast = await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const el = container.querySelector('.toast.toast--success');
        if (el) return resolve(el);
        if (Date.now() - start > 1000) return reject(new Error('toast not found'));
        setTimeout(check, 10);
      };
      check();
    });
    expect(toast).toBeTruthy();
    expect(toast.textContent).toMatch(/Settings saved/i);

    root.unmount();
    document.body.removeChild(container);
  });
});

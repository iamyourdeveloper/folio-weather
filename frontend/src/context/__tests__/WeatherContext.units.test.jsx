/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import WeatherProvider, { useWeatherContext } from '../WeatherContext.jsx';
import { queryClient } from '../../context/QueryProvider.jsx';

function Harness({ onReady }) {
  const ctx = useWeatherContext();
  React.useEffect(() => {
    onReady?.(ctx);
  }, [onReady, ctx]);
  return null;
}

describe('WeatherContext unit change invalidation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('invalidates weather queries when units change', async () => {
    const invalidateSpy = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let api;
    root.render(
      <MemoryRouter>
        <WeatherProvider>
          <Harness onReady={(ctx) => (api = ctx)} />
        </WeatherProvider>
      </MemoryRouter>
    );
    // Wait until context is ready
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (api != null) return resolve();
        if (Date.now() - start > 1000) return reject(new Error('timeout waiting for context'));
        setTimeout(check, 10);
      };
      check();
    });

    // Change units
    api.updatePreferences({ units: 'imperial' });

    // Allow effects to run
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (invalidateSpy.mock.calls.length > 0) return resolve();
        if (Date.now() - start > 1000) return reject(new Error('timeout waiting for invalidation'));
        setTimeout(check, 10);
      };
      check();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['weather'], refetchType: 'active' });

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
    invalidateSpy.mockRestore();
  });
});

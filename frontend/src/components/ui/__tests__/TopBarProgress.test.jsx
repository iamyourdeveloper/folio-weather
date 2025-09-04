/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import TopBarProgress from '../TopBarProgress.jsx';

function TriggerQuery() {
  // A short-lived query to flip fetching state
  useQuery({
    queryKey: ['test-fetch'],
    queryFn: () => new Promise((resolve) => setTimeout(() => resolve('ok'), 80)),
  });
  return null;
}

describe('TopBarProgress', () => {
  it('shows while queries are fetching and hides after', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const client = new QueryClient();

    root.render(
      <QueryClientProvider client={client}>
        <TopBarProgress />
        <TriggerQuery />
      </QueryClientProvider>
    );

    // Appears while fetching
    const appeared = await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const el = container.querySelector('.topbar-progress');
        if (el) return resolve(true);
        if (Date.now() - start > 500) return reject(new Error('indicator did not appear'));
        setTimeout(check, 10);
      };
      check();
    });
    expect(appeared).toBe(true);

    // Disappears after query resolves
    await new Promise((r) => setTimeout(r, 120));
    const gone = container.querySelector('.topbar-progress');
    expect(gone).toBeNull();

    root.unmount();
    document.body.removeChild(container);
  });
});


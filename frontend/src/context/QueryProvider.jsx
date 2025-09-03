import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client with custom default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for weather data
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay: exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect immediately
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Optional: Add global error handling for future mutations
queryClient.setMutationDefaults(['weather'], {
  mutationFn: async ({ endpoint, data, method = 'POST' }) => {
    // This would be used for any weather-related mutations
    // Currently we only have queries, but this is for future use
    if (import.meta.env.DEV) {
      console.log(`Weather mutation: ${method} ${endpoint}`, data);
    }
  },
});

/**
 * QueryProvider component that wraps the app with React Query
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Export the query client for use in hooks
export { queryClient };

// Default export for convenience
export default QueryProvider;

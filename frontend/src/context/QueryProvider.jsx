import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client with optimized default options for faster loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduced stale time for faster initial loads, but still cached
      staleTime: 2 * 60 * 1000, // 2 minutes (was 10)
      // Longer cache time to avoid refetches
      cacheTime: 30 * 60 * 1000, // 30 minutes (was 20)
      // Reduce retries for faster error handling
      retry: 1, // Reduced from 2
      // Faster retry delay for quicker recovery
      retryDelay: (attemptIndex) => Math.min(1000 * 1.5 ** attemptIndex, 15000),
      // Performance optimizations
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true, // Only refetch if data is stale
      // Enable background refetch for better UX
      refetchInterval: false, // Disable automatic background refetch
      // Network mode optimizations
      networkMode: 'online',
    },
    mutations: {
      // Faster mutation retry
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Optional: Add global error handling for future mutations
queryClient.setMutationDefaults(["weather"], {
  mutationFn: async ({ endpoint, data, method = "POST" }) => {
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

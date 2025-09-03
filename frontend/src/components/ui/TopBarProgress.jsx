import { useIsFetching } from '@tanstack/react-query';

/**
 * Global top bar progress indicator bound to React Query fetching state.
 * Shows whenever any query is in-flight.
 */
const TopBarProgress = ({ queryKey }) => {
  const fetching = useIsFetching(queryKey ? { queryKey } : undefined);

  if (!fetching) return null;

  return (
    <div className="topbar-progress" role="status" aria-live="polite" aria-label="Loading">
      <div className="topbar-progress__bar" />
    </div>
  );
};

export default TopBarProgress;


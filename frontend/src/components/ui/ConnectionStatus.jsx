import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show status initially if offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsConnecting(true);
    try {
      // Try to fetch the health endpoint
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-cache",
      });
      if (response.ok) {
        setIsOnline(true);
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    } catch (error) {
      console.log("Connection test failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!showStatus && isOnline) return null;

  return (
    <div className={`connection-status ${isOnline ? "online" : "offline"}`}>
      <div className="connection-status__content">
        <div className="connection-status__icon">
          {isConnecting ? (
            <RefreshCw className="icon--spinning" size={16} />
          ) : isOnline ? (
            <Wifi size={16} />
          ) : (
            <WifiOff size={16} />
          )}
        </div>
        <span className="connection-status__text">
          {isConnecting
            ? "Reconnecting..."
            : isOnline
            ? "Connection restored"
            : "Connection lost"}
        </span>
        {!isOnline && !isConnecting && (
          <button
            className="connection-status__retry"
            onClick={handleRetry}
            disabled={isConnecting}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;

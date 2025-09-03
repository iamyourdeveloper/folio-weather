import { AlertCircle, RefreshCw, X } from "lucide-react";

/**
 * ErrorMessage component for displaying error states
 * @param {Object} props - Component props
 * @param {Error|string} props.error - Error object or message
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {Function} props.onDismiss - Function to call when dismiss button is clicked
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Error variant ('default', 'compact', 'banner')
 */
const ErrorMessage = ({
  error,
  onRetry,
  onDismiss,
  className = "",
  variant = "default",
}) => {
  // Extract error message and status
  const errorMessage =
    error?.message || error || "An unexpected error occurred";
  const errorStatus = error?.status || 0;
  const errorType = error?.type || "UNKNOWN_ERROR";

  // Determine error type based on status code if not explicitly provided
  const getErrorTypeFromStatus = () => {
    if (errorType !== "UNKNOWN_ERROR") return errorType;

    switch (errorStatus) {
      case 0:
        return "NETWORK_ERROR";
      case 404:
        return "NOT_FOUND";
      case 429:
        return "RATE_LIMITED";
      case 500:
      case 502:
      case 503:
      case 504:
        return "SERVER_ERROR";
      default:
        return "UNKNOWN_ERROR";
    }
  };

  const resolvedErrorType = getErrorTypeFromStatus();

  // Determine error styling based on type
  const getErrorVariant = () => {
    switch (resolvedErrorType) {
      case "NETWORK_ERROR":
        return "error-message--network";
      case "NOT_FOUND":
        return "error-message--not-found";
      case "RATE_LIMITED":
        return "error-message--rate-limited";
      case "SERVER_ERROR":
        return "error-message--server";
      default:
        return "error-message--default";
    }
  };

  // Get user-friendly error title
  const getErrorTitle = () => {
    switch (resolvedErrorType) {
      case "NETWORK_ERROR":
        return "Connection Error";
      case "NOT_FOUND":
        return "Location Not Found";
      case "RATE_LIMITED":
        return "Too Many Requests";
      case "SERVER_ERROR":
        return "Server Error";
      default:
        return "Error";
    }
  };

  // Get helpful suggestions based on error type
  const getErrorSuggestion = () => {
    switch (resolvedErrorType) {
      case "NETWORK_ERROR":
        return "Please check your internet connection and try again.";
      case "NOT_FOUND":
        return "Please check the spelling and try searching for another location.";
      case "RATE_LIMITED":
        return "Please wait a moment before making another request.";
      case "SERVER_ERROR":
        return "Our servers are experiencing issues. Please try again later.";
      default:
        return "Please try again or contact support if the problem persists.";
    }
  };

  return (
    <div
      className={`error-message error-message--${variant} ${getErrorVariant()} ${className}`}
    >
      <div className="error-message__content">
        <div className="error-message__icon">
          <AlertCircle size={24} />
        </div>

        <div className="error-message__text">
          <h4 className="error-message__title">{getErrorTitle()}</h4>
          <p className="error-message__description">{errorMessage}</p>
          {variant !== "compact" && (
            <p className="error-message__suggestion">{getErrorSuggestion()}</p>
          )}
        </div>
      </div>

      <div className="error-message__actions">
        {onRetry && (
          <button
            onClick={onRetry}
            className="error-message__action error-message__retry"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="error-message__action error-message__dismiss"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

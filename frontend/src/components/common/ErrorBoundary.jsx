import { Component } from "react";
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from "lucide-react";

/**
 * Enhanced Error Boundary component to catch JavaScript errors anywhere in the component tree
 * Provides detailed error information and recovery options
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    const errorDetails = {
      error: error,
      errorInfo: errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem("userId") || "anonymous",
    };

    console.group("🔥 ErrorBoundary: Component Crash Detected");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Error Stack:", error.stack);
    console.error("Full Error Details:", errorDetails);
    console.groupEnd();

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Send error to monitoring service (if available)
    this.reportError(errorDetails);

    // Try to preserve app state
    this.preserveAppState();
  }

  reportError = (errorDetails) => {
    // In a real app, you would send this to an error reporting service
    // like Sentry, Bugsnag, or your own logging endpoint
    try {
      // Limit error reports to prevent localStorage overflow
      const maxReports = 5;
      const reportKey = `error-report-${errorDetails.timestamp}`;
      
      // Clean old reports
      const existingKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('error-report-')
      );
      
      if (existingKeys.length >= maxReports) {
        // Remove oldest reports
        existingKeys
          .sort()
          .slice(0, existingKeys.length - maxReports + 1)
          .forEach(key => localStorage.removeItem(key));
      }
      
      localStorage.setItem(reportKey, JSON.stringify(errorDetails));
    } catch (e) {
      console.warn("Could not save error report to localStorage:", e);
    }
  };

  preserveAppState = () => {
    try {
      const currentState = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
      };
      sessionStorage.setItem("app-crash-state", JSON.stringify(currentState));
    } catch (e) {
      console.warn("Could not preserve app state:", e);
    }
  };

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: true,
    }));

    // Clear recovery state after a delay
    setTimeout(() => {
      this.setState({ isRecovering: false });
    }, 1000);
  };

  handleReload = () => {
    // Clear any potentially corrupted state before reload
    try {
      sessionStorage.removeItem("app-crash-state");
      localStorage.removeItem("weatherAppRandomCityHistory");
    } catch (e) {
      console.warn("Could not clear storage:", e);
    }

    window.location.reload();
  };

  handleReportBug = () => {
    const errorReport = {
      error: this.state.error?.message || "Unknown error",
      stack: this.state.error?.stack || "No stack trace",
      componentStack:
        this.state.errorInfo?.componentStack || "No component stack",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const bugReportUrl = `mailto:support@example.com?subject=Weather App Error Report&body=${encodeURIComponent(
      JSON.stringify(errorReport, null, 2)
    )}`;
    window.open(bugReportUrl);
  };

  render() {
    if (this.state.hasError) {
      // Get error details for display
      const errorMessage =
        this.state.error?.message || "Unknown error occurred";
      const isNetworkError =
        errorMessage.includes("network") || errorMessage.includes("fetch");
      const isApiError = this.state.error?.isApiError;

      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <AlertTriangle size={48} color="#e74c3c" />
            </div>

            <h2 className="error-boundary__title">
              Oops! Something went wrong
            </h2>

            <p className="error-boundary__message">
              {isNetworkError
                ? "It looks like there's a network connectivity issue. Please check your internet connection and try again."
                : isApiError
                ? "There was an issue connecting to the weather service. The service may be temporarily unavailable."
                : "We're sorry, but something unexpected happened. This error has been logged and we're working to fix it."}
            </p>

            {this.state.retryCount > 0 && (
              <p className="error-boundary__retry-info">
                Retry attempt: {this.state.retryCount}
              </p>
            )}

            <div className="error-boundary__actions">
              <button
                className="error-boundary__retry-btn"
                onClick={this.handleRetry}
                disabled={this.state.isRecovering}
              >
                <RefreshCw size={16} />
                {this.state.isRecovering ? "Recovering..." : "Try Again"}
              </button>

              <button
                className="error-boundary__reload-btn"
                onClick={this.handleReload}
              >
                Reload Page
              </button>

              <button
                className="error-boundary__report-btn"
                onClick={this.handleReportBug}
                title="Report this error"
              >
                <Bug size={16} />
                Report Bug
              </button>
            </div>

            {/* Helpful suggestions */}
            <div className="error-boundary__suggestions">
              <h3>What you can try:</h3>
              <ul>
                <li>Check your internet connection</li>
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Try again in a few minutes</li>
              </ul>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary__error-info">
                  <div className="error-boundary__error-section">
                    <h4>Error ID:</h4>
                    <pre>{this.state.errorId}</pre>
                  </div>

                  <div className="error-boundary__error-section">
                    <h4>Error Message:</h4>
                    <pre>{this.state.error.toString()}</pre>
                  </div>

                  {this.state.error.stack && (
                    <div className="error-boundary__error-section">
                      <h4>Stack Trace:</h4>
                      <pre>{this.state.error.stack}</pre>
                    </div>
                  )}

                  {this.state.errorInfo && (
                    <div className="error-boundary__error-section">
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary component to catch JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You could also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <AlertTriangle size={48} />
            </div>
            
            <h2 className="error-boundary__title">
              Oops! Something went wrong
            </h2>
            
            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            <div className="error-boundary__actions">
              <button 
                className="error-boundary__retry-btn"
                onClick={this.handleRetry}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              
              <button 
                className="error-boundary__reload-btn"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary__error-info">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
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


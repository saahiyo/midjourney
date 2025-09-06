import React, { Component } from 'react';
import { gsap } from 'gsap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.errorContainerRef = React.createRef();
    this.refreshButtonRef = React.createRef();
    this.tryAgainButtonRef = React.createRef();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Animate error container when it appears
    if (this.state.hasError && !prevState.hasError && this.errorContainerRef.current) {
      gsap.fromTo(this.errorContainerRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }

  handleRefreshClick = () => {
    if (this.refreshButtonRef.current) {
      gsap.to(this.refreshButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    window.location.reload();
  };

  handleTryAgainClick = () => {
    if (this.tryAgainButtonRef.current) {
      gsap.to(this.tryAgainButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
          <div ref={this.errorContainerRef} className="max-w-md w-full bg-neutral-900 rounded-lg p-6 shadow-lg border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <i className="ri-error-warning-line text-red-400 text-2xl" aria-hidden="true"></i>
              <h2 className="text-lg font-semibold text-red-400">
                Something went wrong
              </h2>
            </div>
            
            <p className="text-neutral-300 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            <div className="flex gap-3">
              <button
                ref={this.refreshButtonRef}
                onClick={this.handleRefreshClick}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh Page
              </button>
              <button
                ref={this.tryAgainButtonRef}
                onClick={this.handleTryAgainClick}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-neutral-400 hover:text-white">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-neutral-800 rounded text-red-300 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
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

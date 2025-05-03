import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You could log the error to a service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="space-card p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold mb-4 text-red-500">Something went wrong</h1>
            <p className="text-gray-300 mb-6">
              We're sorry, but an error occurred while rendering this component.
            </p>
            
            {this.state.error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left overflow-auto max-h-64">
                <p className="font-mono text-sm text-red-400">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="font-mono text-sm text-gray-400 mt-2">
                    {this.state.errorInfo.componentStack.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
            
            <button 
              onClick={() => window.location.reload()} 
              className="space-button"
            >
              Reload Page
            </button>
            
            <button 
              onClick={() => window.location.href = '/'} 
              className="space-button !bg-gray-700 hover:!bg-gray-600 ml-4"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
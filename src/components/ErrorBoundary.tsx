import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zen-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-zen-gray-light">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zen-orange/10 rounded-full mb-6">
              <AlertTriangle className="w-10 h-10 text-zen-orange" />
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-zen-gray-dark mb-4">
              Something went wrong
            </h1>
            
            <p className="text-zen-gray mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, your progress is safe. Please try reloading the page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-4 bg-zen-orange hover:bg-zen-orange-light text-white rounded-2xl font-bold transition-all shadow-lg shadow-zen-orange/20 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full py-4 bg-white border-2 border-zen-gray-light text-zen-gray-dark rounded-2xl font-bold hover:bg-zen-cream transition-all flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

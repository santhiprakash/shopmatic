import React, { ReactNode, Component, ReactErrorInfo } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-2">An unexpected error occurred.</p>
          {this.state.error && (
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-w-xl text-destructive mb-4">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-4">
            <Button onClick={this.handleReset}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 
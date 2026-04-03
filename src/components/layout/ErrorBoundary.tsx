import React, { ReactNode, Component, ReactErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  errorInfo: ReactErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, errorId: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null, errorInfo: null });
  };

  handleCopyError = () => {
    const { error, errorId } = this.state;
    const errorText = `
Error ID: ${errorId}
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();
    
    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  handleReportIssue = () => {
    const { errorId } = this.state;
    const subject = encodeURIComponent(`Bug Report: Error ${errorId}`);
    const body = encodeURIComponent(`\n\nError ID: ${errorId}\n\nDescription of what you were doing:`);
    window.open(`mailto:support@shopmatic.cc?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We apologize for the inconvenience. The error has been logged.
          </p>
          
          {this.state.errorId && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Error Reference</p>
              <code className="text-xs text-muted-foreground">{this.state.errorId}</code>
            </div>
          )}
          
          {this.state.error && (
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-w-2xl text-destructive mb-6 max-h-48 overflow-y-auto">
              {this.state.error.message}
            </pre>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={this.handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={this.handleCopyError}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Error
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button variant="ghost" onClick={this.handleReportIssue}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 
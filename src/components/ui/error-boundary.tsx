import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield, Database, Clock } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class EnterpriseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `ERR_${Date.now()}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Enterprise error logging
    logger.error('ErrorBoundary caught critical error', {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(error, errorInfo, errorId);
    }
  }

  private sendErrorToMonitoring = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId: localStorage.getItem('userId'),
        sessionId: sessionStorage.getItem('sessionId')
      };

      // Send to Sentry (or console in dev) via utility wrapper
      const { captureException } = await import('@/utils/sentry');
      captureException(error, errorReport);

      logger.info('Error report sent to monitoring service', { errorId });
    } catch (monitoringError) {
      logger.error('Failed to send error to monitoring service', monitoringError as any);
    }
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalPatterns = [
      'ChunkLoadError',
      'SecurityError',
      'Database',
      'Auth',
      'Permission denied'
    ];
    
    const highPatterns = [
      'TypeError',
      'ReferenceError',
      'Network',
      'fetch'
    ];

    const errorString = error.toString();
    
    if (criticalPatterns.some(pattern => errorString.includes(pattern))) {
      return 'critical';
    }
    
    if (highPatterns.some(pattern => errorString.includes(pattern))) {
      return 'high';
    }
    
    return 'medium';
  };

  private getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Shield className="h-12 w-12 text-destructive" />;
      case 'high':
        return <Database className="h-12 w-12 text-orange-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  private getErrorAction = (error: Error) => {
    const errorString = error.toString();
    
    if (errorString.includes('ChunkLoadError')) {
      return {
        title: 'Application Update Required',
        description: 'A new version is available. Please refresh to continue.',
        action: () => window.location.reload()
      };
    }
    
    if (errorString.includes('Network')) {
      return {
        title: 'Connection Issue',
        description: 'Please check your internet connection and try again.',
        action: () => window.location.reload()
      };
    }
    
    return {
      title: 'Unexpected Error',
      description: 'An unexpected error occurred. Our team has been notified.',
      action: this.handleReset
    };
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity(this.state.error);
      const errorAction = this.getErrorAction(this.state.error);

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {this.getErrorIcon(severity)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'}>
                    {severity.toUpperCase()} ERROR
                  </Badge>
                </div>
                <CardTitle>{errorAction.title}</CardTitle>
                <CardDescription>{errorAction.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.errorId && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Error ID: <code className="font-mono">{this.state.errorId}</code>
                  </p>
                </div>
              )}
              
              <Button 
                onClick={errorAction.action}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {errorAction.title === 'Application Update Required' ? 'Refresh Now' : 'Try Again'}
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
                    const body = encodeURIComponent(`Error ID: ${this.state.errorId}\nError: ${this.state.error?.message}\nTimestamp: ${new Date().toISOString()}`);
                    window.open(`mailto:support@aitaskmanagerpro.com?subject=${subject}&body=${body}`);
                  }}
                >
                  Report Issue
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                    🔧 Developer Details
                  </summary>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="font-medium text-sm mb-2">Error Message:</h4>
                      <pre className="text-xs overflow-auto max-h-20 whitespace-pre-wrap">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="font-medium text-sm mb-2">Stack Trace:</h4>
                        <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="font-medium text-sm mb-2">Component Stack:</h4>
                        <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export const withEnterpriseErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P) => (
    <EnterpriseErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </EnterpriseErrorBoundary>
  );
};

// Simple error boundary for backward compatibility
export const ErrorBoundary = EnterpriseErrorBoundary;
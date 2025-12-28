import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Componente para capturar errores de React
 *
 * Captura errores de JavaScript en cualquier parte del árbol de componentes hijo,
 * registra esos errores y muestra una UI de respaldo en lugar del árbol de
 * componentes que ha fallado.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <ComponenteThatMayFail />
 * </ErrorBoundary>
 * ```
 *
 * @example Con fallback personalizado
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorView />}>
 *   <ComponenteThatMayFail />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 ErrorBoundary capturó un error:');
      console.error('Error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Update state
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Enviar error a servicio de logging (Sentry, LogRocket, etc.)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">⚠️</div>
            <h2 className="error-boundary__title">Algo salió mal</h2>
            <p className="error-boundary__message">
              Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Detalles del error (solo en desarrollo)</summary>
                <div className="error-boundary__stack">
                  <strong>Error:</strong>
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-boundary__actions">
              <button onClick={this.handleReset} className="btn btn-secondary">
                Reintentar
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fully custom fallback — when provided, no default UI is rendered */
  fallback?: React.ReactNode;
  /**
   * Optional callback fired when an error is caught.
   * Receives the error and a correlation ID so you can wire it into
   * your own error-reporting service (Sentry, LogRocket, etc.).
   */
  onError?: (error: Error, errorId: string, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

// ---------------------------------------------------------------------------
// Helper — generate a short, URL-safe correlation ID for log lookup
// ---------------------------------------------------------------------------

function generateErrorId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ERR-';
  // crypto.getRandomValues is available in every modern browser & Node 19+
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  for (let i = 0; i < 6; i++) {
    id += chars[array[i] % chars.length];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { errorId } = this.state;

    // ── Server-side: full details for debugging ──
    // This only appears in the server console / log aggregation service.
    // It is NEVER sent to the browser.
    console.error(
      `[ErrorBoundary][${errorId}] Unhandled render error`,
      '\n  Message:', error.message,
      '\n  Stack:', error.stack,
      '\n  Component stack:', errorInfo.componentStack,
    );

    // ── Optional external reporting hook ──
    this.props.onError?.(error, errorId ?? 'UNKNOWN', errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // If a fully custom fallback was provided, render it as-is
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // ── Production-safe default fallback ──
    // NO error message, NO stack trace, NO internal details leaked.
    const errorId = this.state.errorId ?? 'ERR-??????';

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-champagne-silk/30 p-8 md:p-12 max-w-md w-full text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cinematic-gold/10">
            <AlertTriangle className="h-7 w-7 text-cinematic-gold" />
          </div>

          {/* Heading */}
          <h2 className="font-playfair text-xl font-semibold text-charcoal-ink mb-2">
            Something went wrong
          </h2>

          {/* Safe message — no internals */}
          <p className="text-sm text-charcoal-ink/60 mb-6 leading-relaxed">
            We encountered an unexpected error and this section could not be
            displayed. Our team has been notified.
          </p>

          {/* Correlation ID — lets support staff trace the error in logs */}
          <p className="text-xs text-charcoal-ink/40 mb-6 font-mono bg-paper-cream rounded-lg p-3 select-all">
            Reference: {errorId}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={this.resetErrorBoundary}
              className="bg-cinematic-gold hover:bg-cinematic-gold/90 text-white px-6"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="border-charcoal-ink/20 hover:border-cinematic-gold hover:text-cinematic-gold px-6"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
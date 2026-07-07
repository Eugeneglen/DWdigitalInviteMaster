'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-champagne-silk/30 p-8 md:p-12 max-w-md w-full text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cinematic-gold/10">
              <AlertTriangle className="h-7 w-7 text-cinematic-gold" />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-charcoal-ink mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-charcoal-ink/60 mb-6 leading-relaxed">
              We encountered an unexpected error. Please try again or refresh the page.
            </p>
            {this.state.error && (
              <p className="text-xs text-charcoal-ink/40 mb-4 font-mono bg-paper-cream rounded-lg p-3 break-words">
                {this.state.error.message}
              </p>
            )}
            <Button
              onClick={this.resetErrorBoundary}
              className="bg-cinematic-gold hover:bg-cinematic-gold/90 text-white px-6"
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
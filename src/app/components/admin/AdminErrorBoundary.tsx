import React from 'react';
import { logger } from '../../../shared/logger';
import { Card, EmptyState } from '../library/ui';

interface AdminErrorBoundaryProps {
  /** Human label for the panel, used in the fallback message and the log entry. */
  label: string;
  children: React.ReactNode;
}

interface AdminErrorBoundaryState {
  error: Error | null;
}

/**
 * AdminErrorBoundary isolates a single admin panel so a render error in one tab
 * degrades to an inline, recoverable message instead of white-screening the
 * entire console (which is what happened when the users payload was malformed).
 */
export class AdminErrorBoundary extends React.Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  state: AdminErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    logger.error(`Admin panel "${this.props.label}" crashed`, error);
  }

  handleReset = (): void => this.setState({ error: null });

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <Card>
          <EmptyState
            title={`${this.props.label} failed to render`}
            description={this.state.error.message || 'An unexpected error occurred.'}
            actionLabel="Try Again"
            onAction={this.handleReset}
          />
        </Card>
      );
    }
    return this.props.children;
  }
}

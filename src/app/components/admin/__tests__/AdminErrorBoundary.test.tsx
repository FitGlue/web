import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { logger } from '../../../../shared/logger';
import { AdminErrorBoundary } from '../AdminErrorBoundary';

const Boom: React.FC<{ message?: string }> = ({ message }) => {
  throw new Error(message ?? 'kaboom');
};

describe('AdminErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <AdminErrorBoundary label="Users">
        <div>healthy content</div>
      </AdminErrorBoundary>,
    );
    expect(screen.getByText('healthy content')).toBeTruthy();
  });

  it('renders a recoverable fallback and logs when a child throws', () => {
    // Suppress React's expected error console noise for this assertion.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AdminErrorBoundary label="Pipeline Runs">
        <Boom message="boundary test error" />
      </AdminErrorBoundary>,
    );
    expect(screen.getByText('Pipeline Runs failed to render')).toBeTruthy();
    expect(screen.getByText('boundary test error')).toBeTruthy();
    expect(logger.error).toHaveBeenCalled();
    spy.mockRestore();
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../hooks/usePluginLookup', () => ({
  usePluginLookup: () => ({
    getSourceInfo: () => ({ id: 'hevy', name: 'Hevy', icon: '🏋️' }),
    getEnricherInfo: () => ({ id: 'weather', name: 'Weather', icon: '🌤️' }),
  }),
}));
vi.mock('../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [] }),
}));
vi.mock('../../services/InputsService', () => ({
  InputsService: {
    resolveInput: vi.fn().mockResolvedValue(true),
    dismissInput: vi.fn().mockResolvedValue(true),
  },
}));

import { ToastProvider } from '../library/ui/Toast';
import PendingInputCard, { isUrgent } from '../PendingInputCard';
import type { PendingInput } from '../../state/inputsState';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('isUrgent', () => {
  it('is false without a deadline', () => {
    expect(isUrgent(null)).toBe(false);
  });

  it('is true when the deadline is under an hour away', () => {
    expect(isUrgent(new Date(Date.now() + 60 * 1000))).toBe(true);
  });

  it('is false when the deadline is more than an hour away', () => {
    expect(isUrgent(new Date(Date.now() + 3 * 3600 * 1000))).toBe(false);
  });
});

describe('PendingInputCard', () => {
  it('renders the input form with its required fields', () => {
    const input = {
      activityId: 'hevy:abc',
      requiredFields: ['description'],
      displayConfig: { title: 'Add details' },
    } as unknown as PendingInput;
    render(<PendingInputCard input={input} onResolved={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByText('SUBMIT →')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});

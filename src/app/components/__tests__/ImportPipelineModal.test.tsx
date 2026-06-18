import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/usePluginRegistry', () => ({
  usePluginRegistry: () => ({ registry: {}, sources: [], enrichers: [], destinations: [] }),
}));
vi.mock('../../hooks/useRealtimeIntegrations', () => ({
  useRealtimeIntegrations: () => ({ integrations: {} }),
}));
vi.mock('../../shared/api/client', () => ({
  client: { POST: vi.fn() },
  default: { POST: vi.fn() },
}));

import { ToastProvider } from '../library/ui/Toast';
import { ImportPipelineModal } from '../ImportPipelineModal';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ToastProvider>{children}</ToastProvider>
    </MemoryRouter>
  );
}

describe('ImportPipelineModal', () => {
  it('renders the import title', () => {
    render(<ImportPipelineModal onClose={vi.fn()} onSuccess={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByText(/Import Pipeline/)).toBeInTheDocument();
  });
});

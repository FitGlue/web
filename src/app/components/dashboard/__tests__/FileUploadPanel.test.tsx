import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/client', () => ({
  client: { POST: vi.fn().mockResolvedValue({ data: null }) },
  default: { POST: vi.fn().mockResolvedValue({ data: null }) },
}));
vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => ({ pipelines: [], loading: false }),
}));
vi.mock('../../../hooks/useUser', () => ({ useUser: () => ({ user: {} }) }));

import { FileUploadPanel } from '../FileUploadPanel';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('FileUploadPanel', () => {
  it('renders without crashing when there is no file-upload pipeline', () => {
    const { container } = render(<FileUploadPanel />, { wrapper: Wrapper });
    expect(container).toBeTruthy();
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useRealtimePipelines = vi.fn();
const useUser = vi.fn();
vi.mock('../../../shared/api/client', () => ({
  client: { POST: vi.fn().mockResolvedValue({ data: null }) },
  default: { POST: vi.fn().mockResolvedValue({ data: null }) },
}));
vi.mock('../../../hooks/useRealtimePipelines', () => ({
  useRealtimePipelines: () => useRealtimePipelines(),
}));
vi.mock('../../../hooks/useUser', () => ({ useUser: () => useUser() }));

import { UploadSection } from '../UploadSection';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('UploadSection', () => {
  it('renders nothing without a file-upload pipeline', () => {
    useRealtimePipelines.mockReturnValue({ pipelines: [], loading: false });
    useUser.mockReturnValue({ user: {} });
    const { container } = render(<UploadSection />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the dropzone when a file-upload pipeline exists', () => {
    useRealtimePipelines.mockReturnValue({
      pipelines: [{ source: 'SOURCE_FILE_UPLOAD' }],
      loading: false,
    });
    useUser.mockReturnValue({ user: {} });
    render(<UploadSection />, { wrapper: Wrapper });
    expect(screen.getByText(/DROP .FIT FILES HERE/)).toBeInTheDocument();
  });
});

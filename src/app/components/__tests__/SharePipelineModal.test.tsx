import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { SharePipelineModal } from '../SharePipelineModal';

describe('SharePipelineModal', () => {
  it('renders the share title and the encoded code preview', () => {
    render(
      <SharePipelineModal encodedPipeline="ABC123" pipelineName="My Flow" onClose={vi.fn()} />
    );
    expect(screen.getByText(/Share "My Flow"/)).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('copies the code to the clipboard', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <SharePipelineModal encodedPipeline="ABC123" pipelineName="My Flow" onClose={vi.fn()} />
    );
    fireEvent.click(screen.getByText('⎘ COPY CODE'));
    expect(writeText).toHaveBeenCalledWith('ABC123');
  });

  it('fires onClose when cancelled', () => {
    const onClose = vi.fn();
    render(
      <SharePipelineModal encodedPipeline="ABC123" pipelineName="My Flow" onClose={onClose} />
    );
    fireEvent.click(screen.getByText('CANCEL'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

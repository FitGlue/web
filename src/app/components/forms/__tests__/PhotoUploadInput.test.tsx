import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../../shared/api/client', () => ({
  client: { POST: vi.fn().mockResolvedValue({ data: null, error: null }) },
  default: { POST: vi.fn().mockResolvedValue({ data: null, error: null }) },
}));
vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

import { PhotoUploadInput } from '../PhotoUploadInput';

describe('PhotoUploadInput', () => {
  it('renders the empty prompt and upload button', () => {
    render(<PhotoUploadInput activityId="a1" value="" onChange={vi.fn()} />);
    expect(screen.getByText(/Add up to 10 photos/)).toBeInTheDocument();
    expect(screen.getByText('Upload Photo')).toBeInTheDocument();
  });

  it('initialises the value to an empty array on mount', () => {
    const onChange = vi.fn();
    render(<PhotoUploadInput activityId="a1" value="" onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('[]');
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('react-easy-crop', () => ({
  __esModule: true,
  default: () => null,
}));

import { ImageCropModal } from '../ImageCropModal';

describe('ImageCropModal', () => {
  it('renders the crop modal title', () => {
    render(
      <ImageCropModal imageSrc="blob:abc" onCropComplete={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.getByText('Crop Profile Picture')).toBeInTheDocument();
  });
});

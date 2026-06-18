import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhotoGallery } from '../PhotoGallery';

describe('PhotoGallery', () => {
  it('renders nothing with no photos', () => {
    const { container } = render(<PhotoGallery photos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the feature layout with main + thumbnails', () => {
    const photos = ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg', '/6.jpg'];
    const { container } = render(<PhotoGallery photos={photos} title="📷 Photos" />);
    expect(container.querySelector('.photo-gallery-main')).toBeTruthy();
    expect(container.querySelector('.photo-gallery-thumbs')).toBeTruthy();
    // 6 photos: first + 5 rest, 3 visible thumbs, overflow => +2 more
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('renders the strip layout with a photo count', () => {
    const { container } = render(<PhotoGallery photos={['/1.jpg', '/2.jpg']} layout="strip" />);
    expect(container.querySelector('.photo-strip')).toBeTruthy();
    expect(screen.getByText('2 photos')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('shows the activity title and a clickable link in the lightbox', () => {
    const { container } = render(
      <PhotoGallery
        layout="strip"
        photos={[
          { url: '/1.jpg', activityTitle: 'Morning Run', activityHref: '/@alice/abc123' },
        ]}
      />,
    );
    // Open the lightbox by clicking the first photo.
    fireEvent.click(container.querySelector('.photo-strip__item')!);
    const link = screen.getByText('Morning Run').closest('a');
    expect(link).toBeTruthy();
    expect(link).toHaveAttribute('href', '/@alice/abc123');
    expect(screen.getByText('View activity →')).toBeInTheDocument();
  });

  it('shows the title without a link when no href is given', () => {
    const { container } = render(
      <PhotoGallery layout="strip" photos={[{ url: '/1.jpg', activityTitle: 'Untitled Ride' }]} />,
    );
    fireEvent.click(container.querySelector('.photo-strip__item')!);
    const title = screen.getByText('Untitled Ride');
    expect(title.closest('a')).toBeNull();
    expect(screen.queryByText('View activity →')).not.toBeInTheDocument();
  });

  it('accepts plain string photos for backward compatibility', () => {
    const { container } = render(<PhotoGallery layout="strip" photos={['/1.jpg']} />);
    fireEvent.click(container.querySelector('.photo-strip__item')!);
    expect(document.body.querySelector('.photo-lightbox-img')).toHaveAttribute('src', '/1.jpg');
    expect(document.body.querySelector('.photo-lightbox-caption')).toBeNull();
  });
});

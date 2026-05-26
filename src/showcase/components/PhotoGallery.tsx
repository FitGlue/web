import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, title = '📷 Photos' }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)), [photos.length]);
  const next = useCallback(() => setLightboxIdx((i) => (i === null ? null : (i + 1) % photos.length)), [photos.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxIdx, closeLightbox, prev, next]);

  if (photos.length === 0) return null;

  const [first, ...rest] = photos;
  const overflow = rest.length > 3 ? rest.length - 3 : 0;
  const visibleRest = rest.slice(0, 3);

  return (
    <div className="photo-gallery-section">
      <div className="photo-gallery__header"><span className="photo-gallery__label">{title}</span></div>

      <div className={`photo-gallery-grid photo-gallery-grid--${Math.min(photos.length, 4)}`}>
        <div className="photo-gallery-main" onClick={() => openLightbox(0)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}>
          <img src={first} alt="Activity photo 1" loading="lazy" />
        </div>
        {visibleRest.length > 0 && (
          <div className="photo-gallery-thumbs">
            {visibleRest.map((url, i) => (
              <div
                key={i}
                className={`photo-gallery-thumb${i === visibleRest.length - 1 && overflow > 0 ? ' photo-gallery-thumb--overflow' : ''}`}
                onClick={() => openLightbox(i + 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(i + 1)}
              >
                <img src={url} alt={`Activity photo ${i + 2}`} loading="lazy" />
                {i === visibleRest.length - 1 && overflow > 0 && (
                  <div className="photo-gallery-overflow-label">+{overflow} more</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIdx !== null && createPortal(
        <div className="photo-lightbox" onClick={closeLightbox}>
          <button className="photo-lightbox-close" onClick={closeLightbox} aria-label="Close">✕</button>
          {photos.length > 1 && (
            <button className="photo-lightbox-nav photo-lightbox-nav--prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          )}
          <img
            src={photos[lightboxIdx]}
            alt={`Photo ${lightboxIdx + 1} of ${photos.length}`}
            className="photo-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <button className="photo-lightbox-nav photo-lightbox-nav--next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
          )}
          <div className="photo-lightbox-counter">{lightboxIdx + 1} / {photos.length}</div>
        </div>,
        document.body
      )}
    </div>
  );
};

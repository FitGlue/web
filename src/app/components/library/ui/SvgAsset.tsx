import React, { useState, useEffect } from 'react';
import { MultiRingSpinner } from './MultiRingSpinner';

export interface SvgAssetProps {
    /** URL of the SVG asset to render */
    url: string;
    /** Alt text for accessibility */
    alt: string;
    /** Additional CSS class name */
    className?: string;
}

/**
 * SvgAsset - Renders external SVG content inline with fallback to img tag.
 * Fetches SVG content and injects it into the DOM for full CSS control.
 * Falls back to <img> on fetch failure (better CORS compatibility).
 */
export const SvgAsset: React.FC<SvgAssetProps> = ({ url, alt, className }) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const isThumbnail = className?.includes('asset-thumbnail');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setSvgContent(null);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch SVG');
                return res.text();
            })
            .then(text => {
                if (cancelled) return;
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svgElement = doc.querySelector('svg');
                if (svgElement) {
                    // Set responsive dimensions
                    svgElement.setAttribute('width', '100%');
                    svgElement.setAttribute('height', '100%');
                    svgElement.style.display = 'block';
                    svgElement.setAttribute('aria-label', alt);
                    svgElement.setAttribute('role', 'img');
                    if (className) {
                        svgElement.classList.add(...className.split(' '));
                    }
                    setSvgContent(svgElement.outerHTML);
                } else {
                    setError(true);
                }
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [url, alt, className]);

    // On error, fall back to img tag (works better with CORS)
    if (error) {
        const imgStyle = isThumbnail
            ? { width: '100%', height: '100%', objectFit: 'cover' as const }
            : { maxWidth: '100%', height: 'auto' };
        return <img src={url} alt={alt} className={className} style={imgStyle} />;
    }

    // Show loading placeholder with visible dimensions
    if (loading || !svgContent) {
        const loadingStyle = isThumbnail
            ? {
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px'
            }
            : {
                minWidth: '150px',
                minHeight: '150px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px'
            };
        return (
            <div
                className={className}
                style={loadingStyle}
                aria-label={`Loading ${alt}`}
            >
                <MultiRingSpinner size="sm" />
            </div>
        );
    }

    const renderStyle = isThumbnail
        ? { width: '100%', height: '100%' }
        : { width: '100%', maxWidth: '300px', height: 'auto', aspectRatio: '500 / 600' };

    // eslint-disable-next-line react/no-danger
    return (
        <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={renderStyle}
            className={className}
        />
    );
};

export default SvgAsset;

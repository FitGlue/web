import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface LatLng { lat: number; lng: number }

interface Props {
  points: LatLng[];
}

export const RouteMap: React.FC<Props> = ({ points }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;
    if (mapRef.current) return;

    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap ©CartoDB',
        maxZoom: 19,
      }).addTo(map);

      const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: 'var(--sc-accent, #FF1B8D)',
        weight: 3,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  if (points.length === 0) return null;

  return (
    <div className="showcase-section glass-card">
      <div className="section-header"><h2>🗺️ Route</h2></div>
      <div ref={containerRef} className="activity-map" style={{ height: '300px' }} />
    </div>
  );
};

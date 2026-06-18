import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RouteMap } from '../RouteMap';

// leaflet is dynamically imported inside an effect and touches the DOM/map APIs
// that jsdom doesn't fully support — stub it to a no-op map builder.
vi.mock('leaflet', () => {
  const chain = {
    addTo: () => chain,
    getBounds: () => ({}),
  };
  return {
    default: {
      map: () => ({ remove: () => {}, fitBounds: () => {} }),
      tileLayer: () => chain,
      polyline: () => chain,
    },
    map: () => ({ remove: () => {}, fitBounds: () => {} }),
    tileLayer: () => chain,
    polyline: () => chain,
  };
});

describe('RouteMap', () => {
  it('renders nothing with no points', () => {
    const { container } = render(<RouteMap points={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the route container with points', () => {
    const { getByText } = render(<RouteMap points={[{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }]} />);
    expect(getByText(/Route/)).toBeInTheDocument();
  });
});

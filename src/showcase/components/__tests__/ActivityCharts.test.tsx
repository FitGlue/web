import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ActivityCharts } from '../ActivityCharts';
import type { components } from '../../../shared/api/schema-public';

type Record = components['schemas']['Record'];

// chart.js/auto is dynamically imported inside an effect; stub it so jsdom's
// missing canvas context never matters.
vi.mock('chart.js/auto', () => ({
  default: class {
    destroy() {}
  },
}));

describe('ActivityCharts', () => {
  it('renders nothing with no records', () => {
    const { container } = render(<ActivityCharts records={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders chart sections for HR records', () => {
    const records: Record[] = [
      { timestamp: '2026-05-01T08:00:00Z', heartRate: 140, altitude: 10, speed: 3, power: 200, cadence: 80 },
      { timestamp: '2026-05-01T08:01:00Z', heartRate: 150, altitude: 12, speed: 3.2, power: 210, cadence: 82 },
    ] as unknown as Record[];
    const { container, getByText } = render(<ActivityCharts records={records} />);
    expect(container.querySelectorAll('canvas').length).toBeGreaterThan(0);
    expect(getByText(/Heart Rate/)).toBeInTheDocument();
  });
});

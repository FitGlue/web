import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  DonutChart,
  HRRingsChart,
  HRLegend,
  StackedDistance,
  ConsistencyCalendar,
  WeekStrip,
  MonthGrid,
  ConsistencyViz,
} from '../RoundupCharts';
import type { SportVM, CalDay } from '../../utils/roundup';

const sport = (over: Partial<SportVM> = {}): SportVM => ({
  type: 'ACTIVITY_TYPE_RUN',
  label: 'Run',
  glyph: '🏃',
  color: '#22d3ee',
  count: 10,
  distanceMeters: 50000,
  ...over,
});

// Build a contiguous run of days starting from a known Sunday (2026-01-04 = Sun).
function calDays(levels: number[], startTs = Date.UTC(2026, 0, 4)): CalDay[] {
  return levels.map((level, i) => {
    const ts = startTs + i * 86400000;
    return { ts, dow: new Date(ts).getUTCDay(), level };
  });
}

describe('DonutChart', () => {
  it('renders a segment with a title per sport', () => {
    const { container, getByText } = render(
      <DonutChart data={[sport(), sport({ type: 'ACTIVITY_TYPE_RIDE', label: 'Ride', count: 5 })]} total={15} />,
    );
    expect(container.querySelectorAll('circle').length).toBeGreaterThanOrEqual(3); // track + 2 segs
    expect(getByText('15')).toBeInTheDocument(); // center total
    expect(container.querySelector('title')?.textContent).toContain('Run');
  });

  it('handles a zero total without dividing by zero', () => {
    const { getByText } = render(<DonutChart data={[sport({ count: 0 })]} total={0} />);
    expect(getByText('0')).toBeInTheDocument();
  });

  it('uppercases a custom center sublabel', () => {
    const { getByText } = render(<DonutChart data={[]} total={3} centerSub="workouts" />);
    expect(getByText('WORKOUTS')).toBeInTheDocument();
  });
});

describe('HRRingsChart', () => {
  it('renders concentric rings with the tracked-hours label', () => {
    const { container, getByText } = render(<HRRingsChart minutes={[0, 60, 120, 90, 30, 10]} />);
    // 5 zone rings × (track + value) = 10 circles
    expect(container.querySelectorAll('circle').length).toBe(10);
    expect(getByText('HR TRACKED')).toBeInTheDocument();
  });

  it('survives all-zero zone minutes', () => {
    const { getByText } = render(<HRRingsChart minutes={[]} />);
    expect(getByText('0h')).toBeInTheDocument();
  });
});

describe('HRLegend', () => {
  it('renders a row per HR zone', () => {
    const { container } = render(<HRLegend minutes={[0, 60, 120, 90, 30, 10]} />);
    expect(container.querySelectorAll('.rp-hrlegend__row').length).toBe(5);
  });
});

describe('StackedDistance', () => {
  it('renders nothing when no sport has distance', () => {
    const { container } = render(<StackedDistance data={[sport({ distanceMeters: 0 })]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders segments and an inline label for large segments', () => {
    const { container } = render(
      <StackedDistance
        data={[sport({ distanceMeters: 90000 }), sport({ type: 'ACTIVITY_TYPE_RIDE', label: 'Ride', distanceMeters: 10000 })]}
      />,
    );
    expect(container.querySelectorAll('.rp-stack__seg').length).toBe(2);
    expect(container.querySelector('.rp-stack__total')?.textContent).toContain('km');
  });
});

describe('ConsistencyCalendar', () => {
  it('renders a heatmap with active-day stats', () => {
    const { container, getByText } = render(
      <ConsistencyCalendar days={calDays([0, 1, 2, 3, 4, 0, 5, 1, 0, 2])} yearLabel="2026" />,
    );
    // Active days carry a tooltip with their effort level.
    const titled = Array.from(container.querySelectorAll('div[title]')).filter((el) =>
      el.getAttribute('title')?.includes('·'),
    );
    expect(titled.length).toBeGreaterThan(0);
    expect(getByText('Active Days')).toBeInTheDocument();
  });

  it('renders empty when given no days', () => {
    const { container } = render(<ConsistencyCalendar days={[]} yearLabel="2026" showFoot={false} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('WeekStrip', () => {
  it('renders one column per day with a weekday label', () => {
    const { getByText } = render(<WeekStrip days={calDays([1, 2, 3, 4, 5, 0, 2])} yearLabel="wk" />);
    expect(getByText('SUN')).toBeInTheDocument();
    expect(getByText('Active Days')).toBeInTheDocument();
  });
});

describe('MonthGrid', () => {
  it('renders Monday-first weekday headers and the month footer', () => {
    const { getByText } = render(<MonthGrid days={calDays(new Array(28).fill(0).map((_, i) => i % 5))} yearLabel="mo" />);
    expect(getByText('MON')).toBeInTheDocument();
    expect(getByText('Of the month')).toBeInTheDocument();
  });
});

describe('ConsistencyViz', () => {
  const days = calDays([1, 2, 0, 3, 4, 0, 1]);

  it('selects the week strip for week periods', () => {
    const { getByText } = render(<ConsistencyViz periodType="ROUNDUP_PERIOD_TYPE_WEEK" days={days} yearLabel="wk" />);
    expect(getByText('Of the week')).toBeInTheDocument();
  });

  it('selects the month grid for month periods', () => {
    const { getByText } = render(<ConsistencyViz periodType="ROUNDUP_PERIOD_TYPE_MONTH" days={days} yearLabel="mo" />);
    expect(getByText('Of the month')).toBeInTheDocument();
  });

  it('falls back to the year heatmap otherwise', () => {
    const { getByText } = render(<ConsistencyViz periodType="ROUNDUP_PERIOD_TYPE_YEAR" days={days} yearLabel="2026" />);
    expect(getByText('Of 2026')).toBeInTheDocument();
  });
});

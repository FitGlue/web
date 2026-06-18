import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  PhotoWall,
  ChartCardFrame,
  EffortsCardFrame,
  MusclesCardFrame,
  PlacesCardFrame,
  WeatherCardFrame,
  ComparisonCardFrame,
  MediaCardFrame,
  cardColors,
  type CardConfig,
} from '../RoundupExportCards';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

const cfg: CardConfig = {
  bg: { id: 'dark', style: 'linear-gradient(#000,#111)' },
  shape: { id: 'square', ratio: '1/1' },
  accent: '#ff3da6',
  textColor: '#ffffff',
  showWatermark: true,
};

const roundup = {
  periodKey: 'month-05-2026',
  periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
  periodStart: '2026-05-01T00:00:00Z',
  periodEnd: '2026-06-01T00:00:00Z',
  activityTypeBreakdowns: [
    { activityType: 'ACTIVITY_TYPE_RUN', count: 8, totalDistanceMeters: 40000 },
  ],
  hrZoneMinutes: [0, 30, 60, 40, 20, 10],
  dayEntries: [{ date: '2026-05-02', effortLevel: 2 }],
  bestEfforts: [{ distanceKey: '5k', display: '5K', timeSeconds: 1200 }],
  muscles: [{ name: 'quads', count: 5 }],
  places: [{ name: 'Park', country: 'UK', activityCount: 3 }],
  weather: { rainCount: 2, coldestTempC: 3, hottestTempC: 25, sessionCount: 8 },
} as unknown as ShowcaseRoundup;

const previous = { ...roundup, periodKey: 'month-04-2026' } as ShowcaseRoundup;

describe('cardColors', () => {
  it('resolves aurora colours to dark text', () => {
    const colors = cardColors({ ...cfg, bg: { id: 'aurora', style: 'x' } });
    expect(colors.isAurora).toBe(true);
    expect(colors.text).toBe('#070710');
  });

  it('handles clear backgrounds as transparent', () => {
    const colors = cardColors({ ...cfg, bg: { id: 'clear', style: 'transparent' } });
    expect(colors.isClear).toBe(true);
    expect(colors.bg).toBe('transparent');
  });
});

describe('PhotoWall', () => {
  it('renders nothing without usable photos', () => {
    const { container } = render(<PhotoWall photos={[]} height={300} accent="#fff" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a figure per photo', () => {
    const { container } = render(
      <PhotoWall photos={[{ url: '/1.jpg', activityTitle: 'Run', date: '1 May' }]} height={300} accent="#fff" />,
    );
    expect(container.querySelectorAll('figure').length).toBe(1);
  });
});

describe('RoundupExportCards frames', () => {
  it('renders the sport chart card', () => {
    const { container } = render(<ChartCardFrame roundup={roundup} periodKey="month-05-2026" variant="sport" cfg={cfg} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the hr chart card', () => {
    const { container } = render(<ChartCardFrame roundup={roundup} periodKey="month-05-2026" variant="hr" cfg={cfg} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the calendar chart card', () => {
    const { container } = render(<ChartCardFrame roundup={roundup} periodKey="month-05-2026" variant="calendar" cfg={cfg} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders efforts / muscles / places / weather cards', () => {
    expect(render(<EffortsCardFrame roundup={roundup} periodKey="month-05-2026" cfg={cfg} />).container.firstChild).toBeTruthy();
    expect(render(<MusclesCardFrame roundup={roundup} periodKey="month-05-2026" cfg={cfg} />).container.firstChild).toBeTruthy();
    expect(render(<PlacesCardFrame roundup={roundup} periodKey="month-05-2026" cfg={cfg} />).container.firstChild).toBeTruthy();
    expect(render(<WeatherCardFrame roundup={roundup} periodKey="month-05-2026" cfg={cfg} />).container.firstChild).toBeTruthy();
  });

  it('renders the comparison card', () => {
    const { container } = render(
      <ComparisonCardFrame roundup={roundup} periodKey="month-05-2026" previousRoundup={previous} cfg={cfg} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the media (photo) card', () => {
    const { container } = render(
      <MediaCardFrame variant="photo" item={{ url: '/p.jpg', activityTitle: 'Run', date: '1 May' }} periodKey="month-05-2026" cfg={cfg} />,
    );
    expect(container.querySelector('img')).toBeTruthy();
  });
});

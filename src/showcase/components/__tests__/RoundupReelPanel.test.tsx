import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoundupReelPanel } from '../RoundupReelPanel';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

// Keep the reel utils light so no real canvas drawing/recording is attempted.
vi.mock('../../utils/roundupReel', () => ({
  REEL_W: 1080,
  REEL_H: 1920,
  buildReelData: () => ({ avatarUrl: undefined, photos: [] }),
  drawReelFrame: vi.fn(),
  recordReel: vi.fn().mockResolvedValue(new Blob()),
  planScenes: () => [],
  reelDuration: () => 12,
  SCENE_LABELS: {},
  LOCKED_SCENES: new Set(),
}));

const roundup = { periodKey: 'month-05-2026', totalActivities: 10 } as ShowcaseRoundup;

describe('RoundupReelPanel', () => {
  it('renders the preview canvas and download button', () => {
    const { container } = render(
      <RoundupReelPanel roundup={roundup} periodKey="month-05-2026" accent="#ff3da6" onAccent={() => {}} />,
    );
    expect(container.querySelector('canvas')).toBeTruthy();
    expect(screen.getByText(/Download Reel/)).toBeInTheDocument();
  });
});

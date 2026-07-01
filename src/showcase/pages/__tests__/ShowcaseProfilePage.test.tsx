import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ShowcaseProfilePage from '../ShowcaseProfilePage';
import publicClient from '../../../shared/api/public-client';

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../../shared/firebase', () => ({
  initFirebase: vi.fn().mockResolvedValue(null),
  getFirebaseAuth: () => ({ currentUser: null }),
  getFirebaseFirestore: () => ({}),
}));
vi.mock('../../utils/recordView', () => ({ recordShowcaseView: vi.fn() }));
vi.mock('../../utils/useShowcaseMeta', () => ({ useShowcaseMeta: vi.fn() }));
vi.mock('../../utils/useShowcaseOwner', () => ({ useShowcaseOwner: () => ({ isOwner: false, resolved: true }) }));

// Keep the test focused on the roundups band — stub the heavy layout tree.
vi.mock('../../components/layout/ProfileHero', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/LifetimeStats', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/MedalWall', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/ConsistencyHeatmap', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/ZoneBar', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/RouteMosaic', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/ActivityGrid', () => ({ default: () => <div /> }));
vi.mock('../../components/PhotoGallery', () => ({ PhotoGallery: () => <div /> }));

// Public client: profile is empty-but-valid; roundups endpoint returns as many
// as the requested limit (capped at TOTAL) so "load more" always has more.
vi.mock('../../../shared/api/public-client', () => {
  const TOTAL = 40;
  const makeRoundups = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      roundupId: `r${i}`,
      periodKey: `week-${String((i % 52) + 1).padStart(2, '0')}-2026`,
      totalActivities: 5,
      periodStart: '2026-05-01T00:00:00Z',
      periodEnd: '2026-05-08T00:00:00Z',
    }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GET = vi.fn((path: string, opts?: any) => {
    if (path === '/showcase/profile/{slug}') {
      return Promise.resolve({
        data: { profile: { displayName: 'Jane', entries: [], totalActivities: 0 }, currentPage: 1, totalPages: 1 },
      });
    }
    if (path === '/showcase/{slug}/roundups/recent') {
      const limit = opts?.params?.query?.limit ?? 3;
      return Promise.resolve({ data: { roundups: makeRoundups(Math.min(limit, TOTAL)) } });
    }
    return Promise.resolve({ data: {} });
  });
  const c = { GET };
  return { publicClient: c, default: c };
});
vi.mock('../../../shared/api/client', () => {
  const c = { GET: vi.fn(() => new Promise(() => {})) };
  return { client: c, default: c };
});

function Wrapper() {
  return (
    <MemoryRouter initialEntries={['/@jane']}>
      <Routes>
        <Route path="/:slug" element={<ShowcaseProfilePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ShowcaseProfilePage', () => {
  it('shows 12 roundups initially and reveals more via "load more"', async () => {
    render(<Wrapper />);

    // Initial page requests 12 roundups and renders a tile per roundup.
    expect(await screen.findByText('Load more roundups →')).toBeInTheDocument();
    expect(screen.getAllByText('WEEKLY ROUNDUP')).toHaveLength(12);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstRoundupCall = (publicClient.GET as any).mock.calls.find(
      (c: unknown[]) => c[0] === '/showcase/{slug}/roundups/recent',
    );
    expect(firstRoundupCall?.[1]?.params?.query?.limit).toBe(12);

    // Loading more bumps the limit by 12 and re-renders with more tiles.
    fireEvent.click(screen.getByText('Load more roundups →'));
    await waitFor(() => expect(screen.getAllByText('WEEKLY ROUNDUP')).toHaveLength(24));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limits = (publicClient.GET as any).mock.calls
      .filter((c: unknown[]) => c[0] === '/showcase/{slug}/roundups/recent')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => c[1]?.params?.query?.limit);
    expect(limits).toContain(24);
  });
});

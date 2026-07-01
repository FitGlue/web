import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ShowcaseRoundupPage from '../ShowcaseRoundupPage';

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../../shared/firebase', () => ({
  initFirebase: vi.fn().mockResolvedValue(null),
  getFirebaseAuth: () => ({ currentUser: null }),
  getFirebaseFirestore: () => ({}),
}));
vi.mock('../../utils/recordView', () => ({ recordShowcaseView: vi.fn() }));
vi.mock('../../utils/useShowcaseMeta', () => ({ useShowcaseMeta: vi.fn() }));

// Ownership is the single lever for share controls — mock it per test.
const ownership = { isOwner: false, resolved: true };
vi.mock('../../utils/useShowcaseOwner', () => ({ useShowcaseOwner: () => ownership }));

const ROUNDUP = {
  ownerDisplayName: 'Jane',
  ownerProfileSlug: 'jane',
  periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
  periodKey: 'month-05-2026',
  periodStart: '2026-05-01T00:00:00Z',
  periodEnd: '2026-06-01T00:00:00Z',
  totalActivities: 10,
  totalDurationSeconds: 3600,
  aiSummary: 'A strong month.',
};

vi.mock('../../../shared/api/public-client', () => {
  const c = { GET: vi.fn(() => Promise.resolve({ data: ROUNDUP })) };
  return { publicClient: c, default: c };
});
vi.mock('../../../shared/api/client', () => {
  const c = { GET: vi.fn(() => Promise.resolve({ data: undefined })) };
  return { client: c, default: c };
});

function Wrapper() {
  return (
    <MemoryRouter initialEntries={['/@jane/month-05-2026']}>
      <Routes>
        <Route path="/:slug/:id" element={<ShowcaseRoundupPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ShowcaseRoundupPage', () => {
  beforeEach(() => {
    ownership.isOwner = false;
    ownership.resolved = true;
  });

  it('renders the loading screen while data is pending', () => {
    ownership.resolved = false;
    render(<Wrapper />);
    expect(screen.getByText(/Loading roundup/)).toBeInTheDocument();
  });

  it('hides share controls and shows the "Try FitGlue" CTA for non-owners', async () => {
    ownership.isOwner = false;
    render(<Wrapper />);

    // Wait for the roundup to render past the loading screen.
    expect(await screen.findByText(/Try FitGlue/)).toBeInTheDocument();
    // No share affordance of any kind for a visitor.
    expect(screen.queryByText('↑ Share')).not.toBeInTheDocument();
    expect(screen.queryByText(/Share Card/)).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /^Share$/ })).toHaveLength(0);
  });

  it('shows share controls and hides the "Try FitGlue" CTA for the owner', async () => {
    ownership.isOwner = true;
    render(<Wrapper />);

    // Nav share button appears; owner never sees the "Try FitGlue" CTA.
    expect(await screen.findByText('↑ Share')).toBeInTheDocument();
    expect(screen.queryByText(/Try FitGlue/)).not.toBeInTheDocument();
    // Sticky share bar + per-section share affordances are present.
    expect(screen.getByText(/Share Card/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Share$/ }).length).toBeGreaterThan(0);
  });
});

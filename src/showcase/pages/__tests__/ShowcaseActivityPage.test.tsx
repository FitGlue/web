import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ShowcaseActivityPage from '../ShowcaseActivityPage';

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../utils/recordView', () => ({ recordShowcaseView: vi.fn() }));
vi.mock('../../utils/useShowcaseMeta', () => ({ useShowcaseMeta: vi.fn() }));

// Ownership is the single lever for share controls — mock it per test.
const ownership = { isOwner: false, resolved: true };
vi.mock('../../utils/useShowcaseOwner', () => ({ useShowcaseOwner: () => ownership }));

// Keep the test focused on the share/CTA nav logic — stub the heavy layout tree.
vi.mock('../../components/layout/ActivityHero', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/ModuleGrid', () => ({ default: () => <div /> }));
vi.mock('../../components/layout/BoosterTimeline', () => ({ default: () => <div /> }));
vi.mock('../../components/modules/PersonalRecordsCallout', () => ({ default: () => <div /> }));
vi.mock('../../components/ShowcaseExportModal', () => ({ ShowcaseExportModal: () => <div /> }));

const ACTIVITY = {
  showcaseId: 'abc',
  title: 'Morning Run',
  ownerDisplayName: 'Jane',
  ownerProfileSlug: 'jane',
  activityType: 'ACTIVITY_TYPE_RUN',
  appliedEnrichments: [],
  enrichments: {},
};

vi.mock('../../../shared/api/public-client', () => {
  const c = { GET: vi.fn(() => Promise.resolve({ data: ACTIVITY })) };
  return { publicClient: c, default: c };
});
vi.mock('../../../shared/api/client', () => {
  const c = { GET: vi.fn(() => Promise.resolve({ data: undefined })) };
  return { client: c, default: c };
});

function Wrapper() {
  return (
    <MemoryRouter initialEntries={['/@jane/abc']}>
      <Routes>
        <Route path="/:slug/:id" element={<ShowcaseActivityPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ShowcaseActivityPage', () => {
  beforeEach(() => {
    ownership.isOwner = false;
    ownership.resolved = true;
  });

  it('hides the share button and shows the "Try FitGlue" CTA for non-owners', async () => {
    ownership.isOwner = false;
    render(<Wrapper />);

    expect(await screen.findByText(/Try FitGlue/)).toBeInTheDocument();
    expect(screen.queryByText('↑ SHARE')).not.toBeInTheDocument();
  });

  it('shows the share button and hides the "Try FitGlue" CTA for the owner', async () => {
    ownership.isOwner = true;
    render(<Wrapper />);

    expect(await screen.findByText('↑ SHARE')).toBeInTheDocument();
    expect(screen.queryByText(/Try FitGlue/)).not.toBeInTheDocument();
  });
});

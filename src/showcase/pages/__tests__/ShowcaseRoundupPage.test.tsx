import { describe, it, expect, vi } from 'vitest';
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
vi.mock('../../utils/useShowcaseOwner', () => ({ useShowcaseOwner: () => ({ isOwner: false, resolved: true }) }));

vi.mock('../../../shared/api/public-client', () => {
  const c = { GET: vi.fn(() => new Promise(() => {})) };
  return { publicClient: c, default: c };
});
vi.mock('../../../shared/api/client', () => {
  const c = { GET: vi.fn(() => new Promise(() => {})) };
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
  it('renders the loading screen while data is pending', () => {
    render(<Wrapper />);
    expect(screen.getByText(/Loading roundup/)).toBeInTheDocument();
  });
});

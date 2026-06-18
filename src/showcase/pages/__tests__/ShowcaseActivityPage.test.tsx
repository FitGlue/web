import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ShowcaseActivityPage from '../ShowcaseActivityPage';

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../../shared/firebase', () => ({
  initFirebase: vi.fn().mockResolvedValue(null),
  getFirebaseAuth: () => ({ currentUser: null }),
  getFirebaseFirestore: () => ({}),
}));
vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn() }));
vi.mock('../../utils/recordView', () => ({ recordShowcaseView: vi.fn() }));
vi.mock('../../utils/useShowcaseMeta', () => ({ useShowcaseMeta: vi.fn() }));

// Keep both clients pending so the page renders its loading screen — a stable smoke target.
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
    <MemoryRouter initialEntries={['/@jane/abc']}>
      <Routes>
        <Route path="/:slug/:id" element={<ShowcaseActivityPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ShowcaseActivityPage', () => {
  it('renders the loading screen while data is pending', () => {
    render(<Wrapper />);
    expect(screen.getByText(/Loading activity/)).toBeInTheDocument();
  });
});

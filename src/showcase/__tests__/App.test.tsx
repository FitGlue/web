import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// The data pages pull in firebase / api clients; stub them so the catch-all
// route (ShowcaseNotFound) renders without their side effects. Default jsdom
// location is "/", which matches the "*" route.
vi.mock('../pages/ShowcaseActivityPage', () => ({ default: () => <div>activity page</div> }));
vi.mock('../pages/ShowcaseProfilePage', () => ({ default: () => <div>profile page</div> }));
vi.mock('../pages/ShowcaseRoundupPage', () => ({ default: () => <div>roundup page</div> }));

describe('Showcase App', () => {
  it('renders the not-found page for an unmatched route', () => {
    render(<App />);
    expect(screen.getByText(/PAGE NOT FOUND/)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoundupPRWall } from '../RoundupPRWall';
import type { PRGroupVM } from '../../utils/roundup';

const group = (over: Partial<PRGroupVM> = {}): PRGroupVM =>
  ({
    label: 'Bench Press',
    sport: 'Strength',
    glyph: '🏋️',
    color: '#ff3da6',
    date: '1 May',
    metrics: [{ type: '1RM', value: '100', unit: 'kg', delta: 'NEW' }],
    ...over,
  }) as PRGroupVM;

describe('RoundupPRWall', () => {
  it('renders an article per group with metrics', () => {
    const { container } = render(<RoundupPRWall groups={[group(), group({ label: 'Squat' })]} animate />);
    expect(container.querySelectorAll('.rp-pr').length).toBe(2);
    expect(screen.getByText('BENCH PRESS')).toBeInTheDocument();
    expect(screen.getAllByText('1RM').length).toBe(2);
    expect(screen.getAllByText('NEW').length).toBe(2);
  });

  it('renders empty wall with no groups', () => {
    const { container } = render(<RoundupPRWall groups={[]} />);
    expect(container.querySelectorAll('.rp-pr').length).toBe(0);
  });
});

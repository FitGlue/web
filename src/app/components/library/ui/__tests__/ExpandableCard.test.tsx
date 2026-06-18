import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpandableCard } from '../ExpandableCard';

describe('ExpandableCard', () => {
  it('renders header but hides body when collapsed', () => {
    render(<ExpandableCard header={<span>Head</span>}>Body</ExpandableCard>);
    expect(screen.getByText('Head')).toBeInTheDocument();
    expect(screen.queryByText('Body')).toBeNull();
  });

  it('shows body when defaultExpanded', () => {
    render(
      <ExpandableCard header={<span>Head</span>} defaultExpanded>
        Body
      </ExpandableCard>
    );
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('toggles body on header click', async () => {
    render(<ExpandableCard header={<span>Head</span>}>Body</ExpandableCard>);
    await userEvent.click(screen.getByText('Head'));
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});

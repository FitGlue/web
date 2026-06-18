import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataList } from '../DataList';

describe('DataList', () => {
  it('renders each item via renderItem', () => {
    render(
      <DataList
        items={['a', 'b', 'c']}
        renderItem={(item) => <span>{item.toUpperCase()}</span>}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('renders the empty state when there are no items', () => {
    render(
      <DataList
        items={[]}
        renderItem={() => null}
        emptyState={<span>Nothing here</span>}
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders skeletons when loading with no items', () => {
    const { container } = render(
      <DataList items={[]} renderItem={() => null} loading skeletonCount={2} />
    );
    expect(container.querySelectorAll('.ba-data-list__skeleton')).toHaveLength(2);
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangelogEntry, ChangelogTagRow } from '../ChangelogEntry';

describe('ChangelogEntry', () => {
  it('renders version, date and title', () => {
    render(
      <ChangelogEntry version="1.2.0" date="2026-01-01" title="New stuff" tags={[]}>
        body
      </ChangelogEntry>
    );
    expect(screen.getByText('1.2.0')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    expect(screen.getByText('New stuff')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <ChangelogEntry version="1" date="d" title="t" tags={[{ label: 'NEW', variant: 'new' }]}>
        b
      </ChangelogEntry>
    );
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });
});

describe('ChangelogTagRow', () => {
  it('renders each tag with its variant class', () => {
    const { container } = render(
      <ChangelogTagRow tags={[{ label: 'FIX', variant: 'fix' }]} />
    );
    expect(container.querySelector('.changelog-tag--fix')).not.toBeNull();
    expect(screen.getByText('FIX')).toBeInTheDocument();
  });
});

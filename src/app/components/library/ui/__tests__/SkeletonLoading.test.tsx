import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonLoading } from '../SkeletonLoading';

describe('SkeletonLoading', () => {
  it('shows skeleton when loading', () => {
    render(
      <SkeletonLoading loading skeleton={<span>SKELETON</span>}>
        <span>CONTENT</span>
      </SkeletonLoading>
    );
    expect(screen.getByText('SKELETON')).toBeInTheDocument();
    expect(screen.queryByText('CONTENT')).toBeNull();
  });

  it('shows content when not loading', () => {
    render(
      <SkeletonLoading loading={false} skeleton={<span>SKELETON</span>}>
        <span>CONTENT</span>
      </SkeletonLoading>
    );
    expect(screen.getByText('CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('SKELETON')).toBeNull();
  });
});

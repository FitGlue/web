import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineItem } from '../Timeline';

describe('Timeline', () => {
  it('renders children items', () => {
    render(
      <Timeline>
        <TimelineItem title="Step one" />
      </Timeline>,
    );
    expect(screen.getByText('Step one')).toBeInTheDocument();
  });
});

describe('TimelineItem', () => {
  it('renders title and subtitle', () => {
    render(<TimelineItem title="Title" subtitle="Sub" />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('applies default pending status class and icon', () => {
    const { container } = render(<TimelineItem title="t" />);
    expect(container.querySelector('.ui-timeline-item--pending')).toBeInTheDocument();
    expect(screen.getByText('○')).toBeInTheDocument();
  });

  it('applies the given status class and icon', () => {
    const { container } = render(<TimelineItem title="t" status="success" />);
    expect(container.querySelector('.ui-timeline-item--success')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders a custom icon over the status glyph', () => {
    render(<TimelineItem title="t" status="error" icon={<span>!</span>} />);
    expect(screen.getByText('!')).toBeInTheDocument();
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('renders nested children', () => {
    render(<TimelineItem title="t">detail content</TimelineItem>);
    expect(screen.getByText('detail content')).toBeInTheDocument();
  });
});

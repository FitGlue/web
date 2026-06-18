import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List, ListItem } from '../List';

describe('List', () => {
  it('renders a ul by default', () => {
    const { container } = render(<List><ListItem>one</ListItem></List>);
    expect(container.querySelector('ul.ui-list')).not.toBeNull();
  });

  it('renders an ol for ordered variant', () => {
    const { container } = render(<List variant="ordered"><ListItem>one</ListItem></List>);
    expect(container.querySelector('ol')).not.toBeNull();
  });

  it('renders list item content', () => {
    render(<List><ListItem>my item</ListItem></List>);
    expect(screen.getByText('my item')).toBeInTheDocument();
  });

  it('adds with-icon modifier when icon present', () => {
    const { container } = render(<List><ListItem icon="*">x</ListItem></List>);
    expect(container.querySelector('.ui-list-item--with-icon')).not.toBeNull();
  });
});

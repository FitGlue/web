import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccordionTrigger } from '../Accordion';

describe('AccordionTrigger', () => {
  it('renders children', () => {
    render(
      <AccordionTrigger isExpanded={false} onClick={() => {}}>
        Header content
      </AccordionTrigger>
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('chevron is not expanded when collapsed', () => {
    const { container } = render(
      <AccordionTrigger isExpanded={false} onClick={() => {}}>x</AccordionTrigger>
    );
    expect(container.querySelector('.accordion-trigger__chevron--expanded')).toBeNull();
  });

  it('chevron gets expanded modifier when expanded', () => {
    const { container } = render(
      <AccordionTrigger isExpanded={true} onClick={() => {}}>x</AccordionTrigger>
    );
    expect(container.querySelector('.accordion-trigger__chevron--expanded')).not.toBeNull();
  });

  it('calls onClick when clicked', async () => {
    const handler = vi.fn();
    render(<AccordionTrigger isExpanded={false} onClick={handler}>click</AccordionTrigger>);
    await userEvent.click(screen.getByText('click'));
    expect(handler).toHaveBeenCalledOnce();
  });
});

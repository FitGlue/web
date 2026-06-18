import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders the current page info', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('goes to previous page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByText('← Previous'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('goes to next page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByText('Next →'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('← Previous')).toBeDisabled();
  });

  it('shows total item count', () => {
    render(<Pagination currentPage={1} totalPages={1} totalItems={1} onPageChange={() => {}} />);
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });
});

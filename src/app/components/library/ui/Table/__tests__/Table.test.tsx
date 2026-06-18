import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from '../Table';

describe('Table', () => {
  it('renders a full table structure with content', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('applies variant and loading classes', () => {
    render(
      <Table variant="striped" loading>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table');
    expect(table).toHaveClass('ui-table--striped');
    expect(table).toHaveClass('ui-table-loading');
  });

  it('TableRow fires onClick and shows clickable/selected classes', async () => {
    const handler = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handler} selected>
            <TableCell>row</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByText('row').closest('tr') as HTMLElement;
    expect(row).toHaveClass('ui-table-row--clickable');
    expect(row).toHaveClass('ui-table-row--selected');
    await userEvent.click(row);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('TableHeaderCell shows a sort icon and calls onSort', async () => {
    const onSort = vi.fn();
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable sortDirection="asc" onSort={onSort}>
              Col
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(screen.getByText('↑')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Col'));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it('TableEmpty spans the given columns', () => {
    render(
      <Table>
        <TableBody>
          <TableEmpty colSpan={3}>Nothing here</TableEmpty>
        </TableBody>
      </Table>,
    );
    const cell = screen.getByText('Nothing here');
    expect(cell).toHaveAttribute('colspan', '3');
    expect(cell).toHaveClass('ui-table-empty');
  });
});

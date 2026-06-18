import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, DataTableColumn } from '../DataTable';

interface Row { id: string; name: string; }

const columns: DataTableColumn<Row>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name', sortable: true },
];

describe('DataTable', () => {
  it('renders headers', () => {
    render(<DataTable<Row> data={[]} columns={columns} rowKey="id" />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    const data: Row[] = [{ id: '1', name: 'Alice' }];
    render(<DataTable<Row> data={data} columns={columns} rowKey="id" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(
      <DataTable<Row> data={[]} columns={columns} rowKey="id" emptyTitle="Nothing here" />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('fires onRowClick', async () => {
    const onRowClick = vi.fn();
    const data: Row[] = [{ id: '1', name: 'Bob' }];
    render(<DataTable<Row> data={data} columns={columns} rowKey="id" onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText('Bob'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });
});

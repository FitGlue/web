import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ConfigFieldSchema } from '../../types/plugin';

vi.mock('../../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: [{ id: 'counter-a', count: 3 }] }) },
  default: { GET: vi.fn().mockResolvedValue({ data: [{ id: 'counter-a', count: 3 }] }) },
}));

import { DynamicSelectField } from '../DynamicSelectField';

const field = { key: 'counter', dynamicSource: 'counters' } as ConfigFieldSchema;

describe('DynamicSelectField', () => {
  it('shows a loading state then renders the select/create toggle', async () => {
    render(<DynamicSelectField field={field} value="" onChange={vi.fn()} />);
    expect(screen.getByText('Loading options...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Select Existing')).toBeInTheDocument());
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ConfigFieldSchema } from '../../types/plugin';

vi.mock('../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: [] }) },
  default: { GET: vi.fn().mockResolvedValue({ data: [] }) },
}));

import { EnricherConfigForm } from '../EnricherConfigForm';

const schema = [
  { key: 'title', label: 'Title', fieldType: 'CONFIG_FIELD_TYPE_STRING', defaultValue: '' },
] as unknown as ConfigFieldSchema[];

describe('EnricherConfigForm', () => {
  it('renders a labelled field from the schema', () => {
    render(<EnricherConfigForm schema={schema} onChange={vi.fn()} />);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('emits initial values through onChange', () => {
    const onChange = vi.fn();
    render(<EnricherConfigForm schema={schema} initialValues={{ title: 'Hello' }} onChange={onChange} />);
    expect(onChange).toHaveBeenCalled();
  });
});

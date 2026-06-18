import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Code, CodeBlock } from '../Code';

describe('Code', () => {
  it('renders inline code', () => {
    render(<Code>npm install</Code>);
    expect(screen.getByText('npm install')).toBeInTheDocument();
  });
});

describe('CodeBlock', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders code content', () => {
    render(<CodeBlock>const x = 1;</CodeBlock>);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('sets language attribute on pre', () => {
    const { container } = render(<CodeBlock language="ts">code</CodeBlock>);
    expect(container.querySelector('pre[data-language="ts"]')).not.toBeNull();
  });

  it('renders copy button and copies when clicked', async () => {
    render(<CodeBlock copyable>echo hi</CodeBlock>);
    const btn = screen.getByLabelText('Copy code');
    await userEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('echo hi');
  });
});

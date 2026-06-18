import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderInlineMarkdown, Markdown } from '../markdown';

describe('renderInlineMarkdown', () => {
  it('renders bold segments as <strong>', () => {
    const { container } = render(<>{renderInlineMarkdown('hello **world**')}</>);
    expect(container.querySelector('strong')?.textContent).toBe('world');
    expect(container.textContent).toBe('hello world');
  });

  it('renders italic segments as <em>', () => {
    const { container } = render(<>{renderInlineMarkdown('an *emphasised* word')}</>);
    expect(container.querySelector('em')?.textContent).toBe('emphasised');
  });

  it('leaves plain text untouched', () => {
    const { container } = render(<>{renderInlineMarkdown('just text')}</>);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('em')).toBeNull();
    expect(container.textContent).toBe('just text');
  });

  it('handles mixed bold and italic in one string', () => {
    const { container } = render(<>{renderInlineMarkdown('**b** and *i*')}</>);
    expect(container.querySelector('strong')?.textContent).toBe('b');
    expect(container.querySelector('em')?.textContent).toBe('i');
  });
});

describe('Markdown component', () => {
  it('renders its children with inline formatting', () => {
    const { container } = render(<Markdown>{'**bold**'}</Markdown>);
    expect(container.querySelector('strong')?.textContent).toBe('bold');
  });
});

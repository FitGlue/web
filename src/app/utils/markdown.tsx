import React from 'react';

/**
 * Render inline markdown-like formatting to React elements.
 * Supports **bold** and *italic* text.
 *
 * Note: For future enhancement, consider installing `marked` + `dompurify`
 * for full markdown support.
 */
export const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

/**
 * Markdown component for inline usage in JSX.
 * Wraps renderInlineMarkdown in a span for easy usage.
 */
export const Markdown: React.FC<{ children: string }> = ({ children }) => (
  <>{renderInlineMarkdown(children)}</>
);

export default Markdown;

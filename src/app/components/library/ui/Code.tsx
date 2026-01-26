import React, { ReactNode } from 'react';
import './Code.css';

export interface CodeProps {
  /** Inline code or code block */
  children: ReactNode;
}

export interface CodeBlockProps {
  /** Language for syntax highlighting hint */
  language?: string;
  /** Show copy button */
  copyable?: boolean;
  /** Code content */
  children: ReactNode;
}

/**
 * Code provides inline code styling.
 * Replaces bare <code> tags.
 */
export const Code: React.FC<CodeProps> = ({
  children,
}) => {
  return <code>{children}</code>;
};

/**
 * CodeBlock provides multi-line code display.
 * Replaces bare <pre><code> patterns.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  copyable = false,
  children,
}) => {

  const handleCopy = () => {
    const text = typeof children === 'string' ? children : '';
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      {copyable && (
        <button
          type="button"
         
          onClick={handleCopy}
          aria-label="Copy code"
        >
          📋
        </button>
      )}
      <pre data-language={language}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

import React, { ReactNode } from 'react';
import './Paragraph.css';

export type ParagraphSize = 'sm' | 'md' | 'lg';

export interface ParagraphProps {
  /** Text size */
  size?: ParagraphSize;
  /** Muted/secondary color */
  muted?: boolean;
  /** Centered text */
  centered?: boolean;
  /** Bold text */
  bold?: boolean;
  /** As a span instead of p (for inline usage) */
  inline?: boolean;
  /** Prevent text from wrapping */
  nowrap?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Child content */
  children?: React.ReactNode;
}

/**
 * Paragraph provides consistent text styling.
 * Replaces bare <p> and <span> tags.
 */
export const Paragraph: React.FC<ParagraphProps> = ({
  size = 'md',
  muted = false,
  centered = false,
  bold = false,
  inline = false,
  nowrap = false,
  className,
  style,
  children,
}) => {
  const Tag = inline ? 'span' : 'p';

  const classes = [
    'ui-paragraph',
    `ui-paragraph--${size}`,
    muted && 'ui-paragraph--muted',
    centered && 'ui-paragraph--centered',
    bold && 'ui-paragraph--bold',
    nowrap && 'ui-paragraph--nowrap',
    className,
  ].filter(Boolean).join(' ');

  return <Tag className={classes} style={style}>{children}</Tag>;
};

// Convenience alias for inline text
export const Text = Paragraph;


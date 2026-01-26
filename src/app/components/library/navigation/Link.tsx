import React, { ReactNode } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import './Link.css';

export type LinkVariant = 'default' | 'muted' | 'primary' | 'nav' | 'arrow';

export interface LinkProps extends Omit<RouterLinkProps, 'className'> {
  /** Visual variant */
  variant?: LinkVariant;
  /** External link (opens in new tab) */
  external?: boolean;
  /** Child content */
  children: ReactNode;
}

/**
 * Link provides consistent styled navigation.
 * Replaces bare <a> tags and unstyled router Links.
 */
export const Link: React.FC<LinkProps> = ({
  variant = 'default',
  external = false,
  children,
  to,
  ...props
}) => {
  const classes = [
    'ui-link',
    `ui-link--${variant}`,
  ].filter(Boolean).join(' ');

  if (external) {
    return (
      <a
        href={to as string}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={to} className={classes} {...props}>
      {children}
    </RouterLink>
  );
};

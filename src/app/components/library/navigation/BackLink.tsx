import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './BackLink.css';

export interface BackLinkProps {
  to: string;
  label?: string;
}

/**
 * BackLink — mono-caps navigation link with ← arrow prefix.
 * Brutal × Aurora: paper-dim at rest, aurora cyan on hover, no underline.
 */
export const BackLink: React.FC<BackLinkProps> = ({
  to,
  label = 'Back',
}) => {
  return (
    <RouterLink to={to} className="ui-back-link">
      <span className="ui-back-link__arrow">←</span>
      <span className="ui-back-link__label">{label}</span>
    </RouterLink>
  );
};

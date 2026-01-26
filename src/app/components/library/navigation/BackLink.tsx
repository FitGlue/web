import React from 'react';
import { Link } from './Link';
import { Stack } from '../layout';
import './BackLink.css';

export interface BackLinkProps {
  to: string;
  label?: string;
}

export const BackLink: React.FC<BackLinkProps> = ({
  to,
  label = 'Back',
}) => {
  return (
    <div>
      <Link to={to}>
        <Stack direction="horizontal" gap="xs" align="center">
          <span>←</span>
          <span>{label}</span>
        </Stack>
      </Link>
    </div>
  );
};

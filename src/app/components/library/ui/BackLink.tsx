import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackLink.css';

export interface BackLinkProps {
  /** Text to display (default: "Back") */
  label?: string;
  /** Target path (uses history.back() if not provided) */
  to?: string;
}

/**
 * BackLink - Navigation component for going back.
 * Uses router navigation if `to` is provided, otherwise uses browser history.
 */
export const BackLink: React.FC<BackLinkProps> = ({
  label = 'Back',
  to,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <a
      href={to || '#'}
      onClick={handleClick}
     
    >
      <span>←</span>
      <span>{label}</span>
    </a>
  );
};

export default BackLink;

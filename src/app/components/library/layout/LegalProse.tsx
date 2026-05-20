import React, { ReactNode } from 'react';
import './LegalProse.css';

export interface LegalProseProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export const LegalProse: React.FC<LegalProseProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  return (
    <div className="legal-prose">
      <h1 className="legal-prose__title">{title}</h1>
      {lastUpdated && (
        <span className="legal-prose__updated">Last updated: {lastUpdated}</span>
      )}
      <div className="legal-prose__body">{children}</div>
    </div>
  );
};

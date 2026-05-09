import React from 'react';
import type { DescriptionSection } from './DescriptionSections';

interface Props {
  section: DescriptionSection;
  idx: number;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<Props> = ({ section, idx, subtitle, className, headerClassName, children }) => (
  <div
    className={`showcase-section glass-card description-section-card${className ? ` ${className}` : ''}`}
    style={{ animationDelay: `${idx * 0.1}s` }}
  >
    <div className={`section-header${headerClassName ? ` ${headerClassName}` : ''}`}>
      <h2>{section.emoji} {section.title}</h2>
      {subtitle && <span className="section-subtitle">{subtitle}</span>}
    </div>
    {children}
  </div>
);

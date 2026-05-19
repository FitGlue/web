import React, { ReactNode } from 'react';
import './ChangelogEntry.css';

export type ChangelogTagVariant = 'new' | 'fix' | 'change' | 'deprecate';

export interface ChangelogTag {
  label: string;
  variant: ChangelogTagVariant;
}

export interface ChangelogEntryProps {
  version: string;
  date: string;
  title: string;
  tags: ChangelogTag[];
  children: ReactNode;
}

export interface ChangelogTagRowProps {
  tags: ChangelogTag[];
}

export const ChangelogTagRow: React.FC<ChangelogTagRowProps> = ({ tags }) => (
  <div className="changelog-entry__tags">
    {tags.map((tag, i) => (
      <span key={i} className={`changelog-tag changelog-tag--${tag.variant}`}>
        {tag.label}
      </span>
    ))}
  </div>
);

export const ChangelogEntry: React.FC<ChangelogEntryProps> = ({
  version,
  date,
  title,
  tags,
  children,
}) => {
  return (
    <div className="changelog-entry">
      <div className="changelog-entry__header">
        <span className="changelog-entry__version">{version}</span>
        <span className="changelog-entry__date">{date}</span>
      </div>
      <h3 className="changelog-entry__title">{title}</h3>
      {tags.length > 0 && <ChangelogTagRow tags={tags} />}
      <div className="changelog-entry__body">{children}</div>
    </div>
  );
};

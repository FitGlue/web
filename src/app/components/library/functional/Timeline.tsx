import React, { ReactNode } from 'react';
import { Stack } from '../layout';
import './Timeline.css';

export type TimelineItemStatus = 'pending' | 'active' | 'success' | 'error' | 'skipped';

export interface TimelineProps {
  children: ReactNode;
}

export interface TimelineItemProps {
  status?: TimelineItemStatus;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

const STATUS_ICONS: Record<TimelineItemStatus, string> = {
  pending: '○',
  active: '◉',
  success: '✓',
  error: '✕',
  skipped: '−',
};

export const Timeline: React.FC<TimelineProps> = ({
  children,
}) => {
  return <div><Stack gap="sm">{children}</Stack></div>;
};

export const TimelineItem: React.FC<TimelineItemProps> = ({
  status = 'pending',
  title,
  subtitle,
  icon,
  children,
}) => {
  const classes = [
    'ui-timeline-item',
    `ui-timeline-item--${status}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <Stack direction="horizontal" gap="sm">
        <div>
          <Stack align="center">
            <span>
              {icon || STATUS_ICONS[status]}
            </span>
            <span />
          </Stack>
        </div>
        <div>
          <Stack gap="xs">
            <div>
              <Stack direction="horizontal" gap="sm" align="center">
                <span>{title}</span>
                {subtitle && (
                  <span>{subtitle}</span>
                )}
              </Stack>
            </div>
            {children && (
              <div>
                <Stack gap="xs">{children}</Stack>
              </div>
            )}
          </Stack>
        </div>
      </Stack>
    </div>
  );
};

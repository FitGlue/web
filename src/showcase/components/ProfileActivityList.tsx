import React from 'react';
import type { components } from '../../shared/api/schema-public';
import { formatDistance, formatDuration, formatDateGroupHeader, getDateKey } from '../utils/format';
import { getActivityIcon, getActivityCategory } from '../utils/activityMeta';

type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];

interface DateGroup {
  key: string;
  header: string;
  entries: ShowcaseProfileEntry[];
}

function groupByDate(entries: ShowcaseProfileEntry[]): DateGroup[] {
  const groups: DateGroup[] = [];
  const keyMap = new Map<string, DateGroup>();
  for (const entry of entries) {
    const key = getDateKey(entry.startTime);
    if (!keyMap.has(key)) {
      const group: DateGroup = { key, header: formatDateGroupHeader(entry.startTime), entries: [] };
      keyMap.set(key, group);
      groups.push(group);
    }
    keyMap.get(key)!.entries.push(entry);
  }
  return groups;
}

interface Props {
  entries: ShowcaseProfileEntry[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  profileSlug?: string;
}

export const ProfileActivityList: React.FC<Props> = ({
  entries,
  hasMore,
  loadingMore,
  onLoadMore,
  profileSlug,
}) => {
  const groups = groupByDate(entries);

  return (
    <div className="profile-activities">
      <h2 className="section-title">Showcased Activities</h2>
      <div className="activity-list">
        {groups.map((group) => (
          <div key={group.key} className="activity-date-group">
            <div className="activity-date-header">{group.header}</div>
            <div className="activity-date-cards">
              {group.entries.map((entry, i) => {
                const icon = getActivityIcon(entry.activityType);
                const cat = getActivityCategory(entry.activityType);
                const metaParts: React.ReactNode[] = [];

                const dist = formatDistance(entry.distanceMeters);
                if (dist) metaParts.push(<span key="dist" className="activity-meta-item">📏 {dist}</span>);
                const dur = formatDuration(entry.durationSeconds);
                if (dur) metaParts.push(<span key="dur" className="activity-meta-item">⏱ {dur}</span>);
                if ((entry.totalSets ?? 0) > 0) {
                  metaParts.push(<span key="sets" className="activity-meta-item">🏋️ {entry.totalSets} sets</span>);
                }

                const delay = (i % 20) * 0.06;

                return (
                  <a
                    key={entry.showcaseId}
                    href={profileSlug ? `/@${profileSlug}/${entry.showcaseId}` : `/showcase/activity/${entry.showcaseId}`}
                    className={`activity-card cat-${cat}`}
                    style={{ animationDelay: `${delay}s` }}
                  >
                    {entry.routeThumbnailUrl ? (
                      <img
                        className="activity-thumbnail"
                        src={entry.routeThumbnailUrl}
                        alt="Route"
                      />
                    ) : (
                      <div className="activity-icon">{icon}</div>
                    )}
                    <div className="activity-info">
                      <div className="activity-title">{entry.title}</div>
                      <div className="activity-meta">{metaParts}</div>
                    </div>
                    <span className="activity-arrow">›</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More Activities'}
          </button>
        </div>
      )}
      {!hasMore && entries.length > 0 && (
        <div className="all-loaded">
          <span className="all-loaded-icon">✨</span>
          <span>That&apos;s all the activities!</span>
        </div>
      )}
    </div>
  );
};

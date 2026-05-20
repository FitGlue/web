import React from 'react';
import type { SpotifyTracksSummary } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

interface Props {
  data?: SpotifyTracksSummary;
}

export default function SpotifyModule({ data }: Props): React.ReactElement | null {
  if (!data || !data.tracks?.length) return null;

  const visible = data.tracks.slice(0, 8);
  const extra = data.totalCount > 8 ? data.totalCount - 8 : 0;

  return (
    <Module title="Spotify" span={6}>
      <div className="track-list">
        {visible.map((t, i) => (
          <div key={i} className="track-row">
            <span className="track-row__title">{t.title}</span>
            <span className="track-row__artist">{t.artist}</span>
          </div>
        ))}
      </div>
      {extra > 0 && (
        <div className="track-more">+{extra} more</div>
      )}
    </Module>
  );
}

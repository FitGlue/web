import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';

function parseSpotify(content: string) {
  const parts = content.split(' • ').map((p) => p.trim());
  let tracks = '', topPlayed = '', playlist = '';
  for (const p of parts) {
    const tracksM = p.match(/^(\d+)\s*tracks?/i);
    const topM = p.match(/^Top\s*played:\s*(.+)/i);
    const playlistM = p.match(/^From\s*playlist:\s*(.+)/i);
    if (tracksM) tracks = tracksM[1];
    if (topM) topPlayed = topM[1];
    if (playlistM) playlist = playlistM[1];
  }
  return { tracks, topPlayed, playlist };
}

export const SpotifySoundtrackSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const { tracks, topPlayed, playlist } = parseSpotify(section.content);

  return (
    <SectionCard section={section} idx={idx}>
      <div className="spotify-soundtrack">
        {tracks && (
          <div className="spotify-track-count">
            <span className="spotify-count-value">{tracks}</span>
            <span className="spotify-count-label">tracks played</span>
          </div>
        )}
        {topPlayed && (
          <div className="spotify-top-track">
            <span className="spotify-top-icon">🎵</span>
            <div className="spotify-top-text">
              <span className="spotify-top-label">Top track</span>
              <span className="spotify-top-name">{topPlayed}</span>
            </div>
          </div>
        )}
        {playlist && (
          <div className="spotify-playlist">
            <span className="spotify-playlist-icon">📋</span>
            <span className="spotify-playlist-name">{playlist}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

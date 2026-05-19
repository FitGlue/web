import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];

interface Props {
  profile: ShowcaseProfile;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileHero({ profile }: Props): React.ReactElement {
  const createdYear = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="profile-hero">
      {/* Avatar */}
      {profile.profilePictureUrl ? (
        <img
          className="profile-hero__avatar"
          src={profile.profilePictureUrl}
          alt={profile.displayName ?? 'Profile'}
        />
      ) : (
        <div className="profile-hero__avatar--initials">
          {initials(profile.displayName ?? '?')}
        </div>
      )}

      {/* Text */}
      <div>
        <h1 className="profile-hero__name">{profile.displayName ?? 'Athlete'}</h1>
        <div className="profile-hero__slug">@{profile.slug}</div>
        {profile.subtitle && (
          <div className="profile-hero__subtitle">{profile.subtitle}</div>
        )}
        <div
          className="activity-hero__meta-row"
          style={{ marginTop: 'var(--space-sm)' }}
        >
          {createdYear && <span>Since {createdYear}</span>}
          {(profile.totalActivities ?? 0) > 0 && (
            <span>{profile.totalActivities} activities</span>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function fmtDist(m: number): string {
  const km = m / 1000;
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k km` : `${Math.round(km).toLocaleString()} km`;
}

function fmtHours(s: number): string {
  return `${Math.round(s / 3600).toLocaleString()}h`;
}

interface Props {
  profile: ShowcaseProfile;
}

export default function ProfileHero({ profile }: Props): React.ReactElement {
  const since = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null;

  const handle = profile.slug ? `@${profile.slug}` : null;
  const activities = profile.totalActivities ?? 0;
  const dist = profile.totalDistanceMeters ? fmtDist(profile.totalDistanceMeters) : null;
  const hours = profile.totalDurationSeconds ? fmtHours(profile.totalDurationSeconds) : null;

  return (
    <section className="profile-hero-section">
      <div className="profile-hero__grain" aria-hidden="true" />
      <div className="profile-hero__inner">
        <div className="profile-hero__pic-spacer" />

        <div className="profile-hero__title">
          <h1 className="profile-hero__name">{profile.displayName ?? 'Athlete'}</h1>
          <div className="profile-hero__handle">
            {handle && <>{handle.replace('@', '@')}</>}
            {since && <>{handle ? ' · ' : ''}Since {since}</>}
            {profile.subtitle && <> · {profile.subtitle}</>}
          </div>
        </div>

        {activities > 0 && (
          <div className="profile-hero__meta">
            Lifetime
            <b>{activities.toLocaleString()} activities</b>
            {dist && hours ? `${dist} · ${hours} moving` : dist ?? hours ?? ''}
          </div>
        )}
      </div>

      {/* Profile picture — floats at hero/body boundary */}
      <div className="profile-pic">
        {profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt={profile.displayName ?? 'Profile'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="profile-pic__placeholder">
            {initials(profile.displayName ?? '?')}
          </div>
        )}
      </div>
    </section>
  );
}

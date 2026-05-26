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

function daysAgo(isoStr: string): string {
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function ProfileHero({ profile }: Props): React.ReactElement {
  const since = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null;

  const lastActive = profile.latestActivityAt ? daysAgo(profile.latestActivityAt) : null;

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
          {profile.subtitle && (
            <div className="profile-hero__subtitle">{profile.subtitle}</div>
          )}
          <div className="profile-hero__handle">
            {handle && <>{handle.replace('@', '@')}</>}
            {since && <>{handle ? ' · ' : ''}Since {since}</>}
            {lastActive && <> · Last active {lastActive}</>}
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

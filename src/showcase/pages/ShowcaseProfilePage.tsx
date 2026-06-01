import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import ProfileHero from '../components/layout/ProfileHero';
import LifetimeStats from '../components/layout/LifetimeStats';
import MedalWall from '../components/layout/MedalWall';
import ConsistencyHeatmap from '../components/layout/ConsistencyHeatmap';
import ZoneBar from '../components/layout/ZoneBar';
import RouteMosaic from '../components/layout/RouteMosaic';
import ActivityGrid from '../components/layout/ActivityGrid';
import { PhotoGallery } from '../components/PhotoGallery';
import { useShowcaseMeta } from '../utils/useShowcaseMeta';
import ShowcaseNotFound from '../components/ShowcaseNotFound';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];
type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];
type ShowcaseLink = components['schemas']['ShowcaseLink'];
type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

function roundupLabel(periodKey: string): string {
  if (periodKey.startsWith('week-')) {
    const [, week, year] = periodKey.split('-');
    return `Week ${parseInt(week, 10)}, ${year}`;
  }
  if (periodKey.startsWith('month-')) {
    const [, month, year] = periodKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
  if (periodKey.startsWith('year-')) return periodKey.replace('year-', '');
  return periodKey;
}

function roundupTypeLabel(periodKey: string): string {
  if (periodKey.startsWith('week-')) return 'Weekly Roundup';
  if (periodKey.startsWith('month-')) return 'Monthly Roundup';
  if (periodKey.startsWith('year-')) return 'Year in Review';
  return 'Roundup';
}

function getLinkIcon(url: string | undefined): string {
  if (!url) return '↗';
  if (url.includes('strava.com')) return '🚴';
  if (url.includes('instagram.com')) return '📷';
  if (url.includes('github.com')) return '🐙';
  if (url.includes('twitter.com') || url.includes('x.com')) return '🐦';
  if (url.includes('youtube.com')) return '📺';
  return '↗';
}

function LoadingScreen() {
  return (
    <div className="showcase-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Loading profile…
        </span>
      </div>
    </div>
  );
}


export default function ShowcaseProfilePage() {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = rawSlug?.startsWith('@') ? rawSlug.slice(1) : rawSlug;
  const [profile, setProfile] = useState<ShowcaseProfile | null>(null);
  const [entries, setEntries] = useState<ShowcaseProfileEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roundups, setRoundups] = useState<ShowcaseRoundup[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) { setError(true); setLoading(false); return; }
    publicClient
      .GET('/showcase/profile/{slug}', { params: { path: { slug }, query: { page: 1 } } })
      .then(({ data }) => {
        if (!data?.profile) { setError(true); return; }
        setProfile(data.profile);
        setEntries(data.profile.entries ?? []);
        setCurrentPage(data.currentPage ?? 1);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    publicClient
      .GET('/showcase/{slug}/roundups/recent', { params: { path: { slug }, query: { limit: 3 } } })
      .then(({ data }) => { if (data?.roundups) setRoundups(data.roundups); })
      .catch(() => {/* roundups optional — fail silently */});
  }, [slug]);

  const profileMeta = useMemo(() => profile ? ({
    type: 'profile' as const,
    displayName: profile.displayName ?? 'Athlete',
    avatarUrl: profile.profilePictureUrl ?? undefined,
    bio: profile.bio ?? undefined,
    url: window.location.href,
  }) : null, [profile]);

  useShowcaseMeta(profileMeta);

  const loadMore = useCallback(async () => {
    if (!slug || loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const { data } = await publicClient.GET('/showcase/profile/{slug}', {
        params: { path: { slug }, query: { page: nextPage } },
      });
      if (data?.profile?.entries) {
        setEntries((prev) => [...prev, ...(data.profile!.entries ?? [])]);
        setCurrentPage(data.currentPage ?? nextPage);
        setTotalPages(data.totalPages ?? totalPages);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [slug, currentPage, totalPages, loadingMore]);

  if (loading) return <LoadingScreen />;
  if (error || !profile) return <ShowcaseNotFound type="profile" />;

  const hasMore = currentPage < totalPages;
  const links = (profile.links ?? []).filter((l: ShowcaseLink) => l.url);
  const callouts = (profile.callouts ?? []).filter((c) => c.text);

  return (
    <div className="showcase-page">
      <div className="showcase-page-bg" aria-hidden="true" />
      <div className="showcase-page-wrap">

        {/* Sticky public nav bar */}
        <nav className="showcase-pubbar">
          <a className="showcase-pubbar__brand" href="/">
            <span className="showcase-pubbar__brand-icon" aria-hidden="true">FG</span>
            <span className="showcase-pubbar__brand-wordmark" aria-hidden="true">FITGLUE</span>
          </a>
          <div className="showcase-pubbar__actions">
            <a href="/" style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-cyan)', textDecoration: 'none' }}>
              TRY FITGLUE →
            </a>
          </div>
        </nav>

        {/* Full-bleed profile hero */}
        <ProfileHero profile={profile} />

        {/* Medal wall (110px top padding clears the floating avatar) */}
        <MedalWall profile={profile} />

        {/* Lifetime 4-up */}
        <LifetimeStats profile={profile} />

        {/* 52-week consistency heatmap */}
        <ConsistencyHeatmap streakHistory={profile.streakHistory} />

        {/* Lifetime HR zone distribution */}
        <ZoneBar zoneSplit={profile.zoneSplit} />

        {/* Recent roundups */}
        {roundups.length > 0 && (
          <div className="roundup-profile-band">
            <div className="roundup-profile-band__label">📅 ROUNDUPS</div>
            <div className="roundup-profile-band__cards">
              {roundups.map((r) => (
                <Link
                  key={r.roundupId}
                  to={`/@${slug}/${r.periodKey}`}
                  className="roundup-profile-card"
                >
                  <div className="roundup-profile-card__type">{roundupTypeLabel(r.periodKey ?? '')}</div>
                  <div className="roundup-profile-card__period">{roundupLabel(r.periodKey ?? '')}</div>
                  <div className="roundup-profile-card__stat">
                    {r.totalActivities} sessions
                    {r.totalDistanceMeters && r.totalDistanceMeters > 1000
                      ? ` · ${(r.totalDistanceMeters / 1000).toFixed(0)} km`
                      : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Activity photo gallery — aggregated from all entries with photos */}
        {profile.showPhotoGallery && (() => {
          const allPhotos = entries.flatMap((e) => e.photoUrls ?? []).slice(0, 30);
          return allPhotos.length > 0 ? <PhotoGallery photos={allPhotos} title="📷 Activity Photos" layout="strip" /> : null;
        })()}

        {/* 4px gradient strip */}
        <div className="profile-strip" />

        {/* Main: activity feed + bio sidebar */}
        <div className="profile-main">
          <div className="profile-feed">
            {/* Route thumbnail strip — only shown if ≥3 activities have map thumbnails */}
            <RouteMosaic entries={entries} profileSlug={slug!} />

            <ActivityGrid
              entries={entries}
              totalActivities={profile.totalActivities}
              profileSlug={slug!}
            />

            {/* Pagination */}
            {(hasMore || currentPage > 1) && (
              <div className="profile-pagi">
                <span className="profile-pagi__info" style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    style={{
                      fontFamily: 'var(--fg-font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: loadingMore ? 'var(--color-text-muted)' : 'var(--fg-paper)',
                      background: 'none',
                      border: 'none',
                      cursor: loadingMore ? 'default' : 'pointer',
                      padding: 0,
                    }}
                  >
                    {loadingMore ? 'Loading…' : 'NEXT →'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sticky bio sidebar */}
          <aside className="profile-bio">
            {profile.bio && (
              <p className="bio__about">{profile.bio}</p>
            )}

            {callouts.length > 0 && (
              <div className="bio__callouts">
                {callouts.map((c, i) => (
                  <div key={i} className="bio__callout">
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div className="bio__section">
                <div className="bio__section-label">LINKS</div>
                {links.map((link: ShowcaseLink, i: number) => (
                  <a
                    key={i}
                    href={link.url?.startsWith('https://') || link.url?.startsWith('http://') ? link.url : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bio__link"
                  >
                    <span>{getLinkIcon(link.url)}</span>
                    <span>{link.label ?? link.url}</span>
                  </a>
                ))}
              </div>
            )}

            <a href="/" className="bio__cta">✦ START YOUR SHOWCASE</a>
          </aside>
        </div>

      </div>
    </div>
  );
}

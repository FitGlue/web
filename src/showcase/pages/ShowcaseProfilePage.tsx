import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import ProfileHero from '../components/layout/ProfileHero';
import LifetimeStats from '../components/layout/LifetimeStats';
import MedalWall from '../components/layout/MedalWall';
import ActivityGrid from '../components/layout/ActivityGrid';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];
type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];
type ShowcaseLink = components['schemas']['ShowcaseLink'];

function getLinkIcon(url: string | undefined): string {
  if (!url) return '↗';
  if (url.includes('strava.com')) return '↗';
  if (url.includes('instagram.com')) return '↗';
  if (url.includes('github.com')) return '↗';
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

function ErrorScreen() {
  return (
    <div className="showcase-page">
      <div style={{ padding: 'var(--space-xl) var(--space-md)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--fg-font-display)', fontSize: '2rem', textTransform: 'uppercase' }}>
          Profile not found
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
          This athlete profile doesn&apos;t exist or hasn&apos;t been created yet.
        </p>
        <a href="/" style={{ display: 'inline-block', marginTop: 'var(--space-md)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-cyan)' }}>
          ← Explore FitGlue
        </a>
      </div>
    </div>
  );
}

export default function ShowcaseProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ShowcaseProfile | null>(null);
  const [entries, setEntries] = useState<ShowcaseProfileEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
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
        if (data.profile.displayName) {
          document.title = `${data.profile.displayName} — FitGlue`;
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

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
  if (error || !profile) return <ErrorScreen />;

  const hasMore = currentPage < totalPages;
  const hasLinks = (profile.links ?? []).filter((l: ShowcaseLink) => l.url).length > 0;
  const hasCallouts = (profile.callouts ?? []).filter((c) => c.text).length > 0;
  const hasBio = !!profile.bio;
  const hasSidebar = hasBio || hasCallouts || hasLinks;

  return (
    <div className="showcase-page">
      <div className="showcase-layout">
        {/* Main content column */}
        <main className="showcase-main">
          <ProfileHero profile={profile} />
          <LifetimeStats profile={profile} />
          <MedalWall profile={profile} />

          <div style={{ borderTop: 'var(--fg-rule-thin)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <p className="showcase-section-title">Activities</p>
            <ActivityGrid entries={entries} />

            {hasMore && (
              <div style={{ paddingTop: 'var(--space-md)' }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    fontFamily: 'var(--fg-font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: loadingMore ? 'var(--color-text-muted)' : 'var(--fg-cyan)',
                    background: 'none',
                    border: 'none',
                    cursor: loadingMore ? 'default' : 'pointer',
                    padding: 0,
                  }}
                >
                  {loadingMore ? 'Loading…' : 'Load more →'}
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        {hasSidebar && (
          <aside className="profile-sidebar">
            {hasBio && (
              <div className="sidebar-section">
                <p className="sidebar-section__title">About</p>
                <div className="sidebar-section__bio">
                  {profile.bio!.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '0 0 0.4em' }}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {hasCallouts && (
              <div className="sidebar-section">
                <p className="sidebar-section__title">Highlights</p>
                {(profile.callouts ?? []).filter((c) => c.text).map((c, i) => (
                  <div key={i} className="sidebar-callout">
                    <span>→</span>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            )}

            {hasLinks && (
              <div className="sidebar-section">
                <p className="sidebar-section__title">Links</p>
                {(profile.links ?? []).filter((l: ShowcaseLink) => l.url).map((link: ShowcaseLink, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-link"
                  >
                    <span>{getLinkIcon(link.url)}</span>
                    <span>{link.label ?? link.url}</span>
                  </a>
                ))}
              </div>
            )}

            <a href="/" className="sidebar-cta">
              Start your showcase →
            </a>
          </aside>
        )}
      </div>
    </div>
  );
}

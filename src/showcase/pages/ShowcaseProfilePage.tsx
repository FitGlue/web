import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import { ThemeProvider } from '../components/ThemeProvider';
import { ProfileActivityList } from '../components/ProfileActivityList';
import {
  formatDistance,
  formatDurationLong,
  formatWeight,
  formatNumber,
} from '../utils/format';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];
type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];
type ShowcaseLink = components['schemas']['ShowcaseLink'];

function getLinkEmoji(url: string | undefined): string {
  if (!url) return '🔗';
  if (url.includes('strava.com')) return '🏃';
  if (url.includes('instagram.com')) return '📸';
  if (url.includes('twitter.com') || url.includes('x.com')) return '𝕏';
  if (url.includes('github.com')) return '🐙';
  if (url.includes('youtube.com')) return '▶️';
  if (url.includes('tiktok.com')) return '🎵';
  if (url.includes('facebook.com')) return '👥';
  return '🔗';
}

function ProfileLinks({ links }: { links: ShowcaseLink[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="profile-links">
      {links.filter(link => link.url).map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link-chip"
        >
          {getLinkEmoji(link.url)} {link.label}
        </a>
      ))}
    </div>
  );
}

interface StatCard { value: string | number; label: string; gradient: string }

function buildProfileStats(profile: ShowcaseProfile): StatCard[] {
  const stats: StatCard[] = [];
  stats.push({ value: profile.totalActivities ?? 0, label: 'Activities', gradient: 'pink' });
  const dist = formatDistance(profile.totalDistanceMeters);
  if (dist) stats.push({ value: dist, label: 'Distance', gradient: 'purple' });
  const dur = formatDurationLong(profile.totalDurationSeconds);
  if (dur) stats.push({ value: dur, label: 'Active Time', gradient: 'blue' });
  const sets = formatNumber(profile.totalSets);
  if (sets) stats.push({ value: sets, label: 'Sets', gradient: 'orange' });
  const reps = formatNumber(profile.totalReps);
  if (reps) stats.push({ value: reps, label: 'Reps', gradient: 'green' });
  const weight = formatWeight(profile.totalWeightKg);
  if (weight) stats.push({ value: weight, label: 'Volume Lifted', gradient: 'orange' });
  return stats;
}

function renderBio(bio: string): React.ReactNode {
  const lines = bio.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('> ')) {
      return (
        <blockquote key={i} className="profile-bio-pullquote">
          {line.slice(2)}
        </blockquote>
      );
    }
    return <p key={i} className="profile-bio-line">{line}</p>;
  });
}

function LoadingScreen() {
  return (
    <div className="showcase-page">
      <div className="showcase-loading">
        <div className="loading-bg-gradient" />
        <div className="loading-content">
          <div className="loading-logo">
            <span className="loading-logo-fit">Fit</span>
            <span className="loading-logo-glue">Glue</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="showcase-page">
      <div className="showcase-error" style={{ display: 'block' }}>
        <div className="error-icon">🔍</div>
        <h2 className="error-title">Profile not found</h2>
        <p className="error-subtitle">This athlete profile doesn&apos;t exist or hasn&apos;t been created yet.</p>
        <a href="/" className="btn btn-primary">Explore FitGlue</a>
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxSrc(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (loading) return <LoadingScreen />;
  if (error || !profile) return <ErrorScreen />;

  const stats = buildProfileStats(profile);
  const hasMore = currentPage < totalPages;
  const displayName = profile.displayName ?? 'Unknown Athlete';
  const initial = displayName.charAt(0).toUpperCase();

  const sideStats = stats.slice(0, 4);
  const summaryStats = stats;

  return (
    <div className="showcase-page">
      <ThemeProvider theme={profile.theme} />
      <canvas className="showcase-particles" id="showcase-particles" />

      {/* ── Top bar ── */}
      <div className="sp-bar">
        <a href="/" className="sp-bar__logo">
          <span style={{ background: 'linear-gradient(135deg,#ff3da6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fit</span>Glue
        </a>
        <div className="sp-bar__crumb">SHOWCASE · <b>{displayName.toUpperCase()}</b></div>
        <div className="sp-bar__actions">
          <button
            className="fg-button fg-button--ghost fg-button--sm"
            onClick={() => navigator.share?.({ title: displayName, url: window.location.href }).catch(() => {})}
          >
            SHARE PROFILE
          </button>
        </div>
      </div>

      {/* ── Hero 2-column ── */}
      <section className="sp-hero">
        {/* Main: avatar + name + bio + links */}
        <div className="sp-hero__main">
          {profile.profilePictureUrl ? (
            <div
              className="sp-avatar-sq"
              onClick={() => setLightboxSrc(profile.profilePictureUrl!)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setLightboxSrc(profile.profilePictureUrl!)}
              aria-label={`View ${displayName}'s photo`}
            >
              <img src={profile.profilePictureUrl} alt={displayName} />
            </div>
          ) : (
            <div className="sp-avatar-sq">{initial}</div>
          )}

          <h1 className="sp-name">{displayName}</h1>
          {profile.subtitle && (
            <div className="sp-name__handle">{profile.subtitle}</div>
          )}

          {profile.bio && (
            <div className="sp-bio">{renderBio(profile.bio)}</div>
          )}

          {profile.callouts && profile.callouts.length > 0 && (
            <div className="sp-stamps">
              {profile.callouts.filter(c => c.text).map((c, i) => (
                <span key={i} className="sp-stamp">{c.text}</span>
              ))}
            </div>
          )}

          {profile.links && profile.links.length > 0 && (
            <div className="sp-actions">
              <ProfileLinks links={profile.links} />
            </div>
          )}
        </div>

        {/* Sidebar: mini stats 2×2 */}
        {sideStats.length > 0 && (
          <div className="sp-hero__side">
            <div className="sp-mini-stats">
              {sideStats.map((s, i) => (
                <div key={i} className="sp-mini-stat">
                  <div className="sp-mini-stat__n">{s.value}</div>
                  <div className="sp-mini-stat__l">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Summary stat bar ── */}
      {summaryStats.length > 0 && (
        <div className="sp-summary" style={{ gridTemplateColumns: `repeat(${Math.min(summaryStats.length, 5)}, 1fr)` }}>
          {summaryStats.map((s, i) => (
            <div key={i}>
              <div className="sp-summary__n">{s.value}</div>
              <div className="sp-summary__l">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Photo gallery ── */}
      {profile.showPhotoGallery && (() => {
        const thumbEntries = entries.filter((e) => e.routeThumbnailUrl);
        if (thumbEntries.length === 0) return null;
        return (
          <>
            <div className="sp-section-head">
              <h2>📷 Activity Gallery</h2>
              <span className="sp-section-head__right">{thumbEntries.length} PHOTOS</span>
            </div>
            <div className="sp-acts">
              {thumbEntries.slice(0, 12).map((entry) => (
                <a
                  key={entry.showcaseId}
                  href={`/showcase/activity/${entry.showcaseId}`}
                  className="sp-act"
                >
                  <img
                    src={entry.routeThumbnailUrl!}
                    alt={entry.title ?? 'Activity'}
                    loading="lazy"
                    className="sp-act__thumb"
                  />
                  <div className="sp-act__title">{entry.title}</div>
                </a>
              ))}
            </div>
          </>
        );
      })()}

      {/* ── Activity list ── */}
      <div className="sp-section-head">
        <h2>🏆 Activities</h2>
        <span className="sp-section-head__right">{profile.totalActivities ?? 0} TOTAL</span>
      </div>
      <ProfileActivityList
        entries={entries}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />

      {/* ── CTA ── */}
      <div className="sp-cta">
        <div>
          <h3>Want to enhance your own activities?</h3>
          <p>FitGlue automatically enriches your workouts with AI banners, heart rate analysis, and beautiful shareable summaries.</p>
        </div>
        <a href="/" className="sp-cta__btn">START YOUR SHOWCASE →</a>
      </div>

      {/* ── Attribution ── */}
      <div className="sp-attr">
        <span>Powered by</span>
        <a href="/">FitGlue</a>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="profile-lightbox"
          style={{ display: 'flex' }}
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="lightbox-close"
            aria-label="Close"
            onClick={() => setLightboxSrc(null)}
          >
            ✕
          </button>
          <img
            className="lightbox-image"
            src={lightboxSrc}
            alt={displayName}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

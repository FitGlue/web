import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import type { ActivityEnrichments } from '../../types/pb/models/activity/enrichments';
import { initFirebase } from '../../shared/firebase';
import { resolveCategory } from '../utils/activityCategory';
import { buildModuleOrder } from '../utils/enricherModules';
import { getActivityIcon } from '../utils/activityMeta';
import { useShowcaseMeta } from '../utils/useShowcaseMeta';
import ActivityHero from '../components/layout/ActivityHero';
import ModuleGrid from '../components/layout/ModuleGrid';
import BoosterTimeline from '../components/layout/BoosterTimeline';
import PersonalRecordsCallout from '../components/modules/PersonalRecordsCallout';
import { ShowcaseExportModal } from '../components/ShowcaseExportModal';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

function LoadingScreen() {
  return (
    <div className="showcase-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Loading activity…
        </span>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="showcase-page">
      <div style={{ padding: 'var(--space-xl) var(--space-md)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--fg-font-display)', fontSize: '2rem', textTransform: 'uppercase' }}>
          Activity not found
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>{message}</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 'var(--space-md)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-cyan)' }}>
          ← Explore FitGlue
        </a>
      </div>
    </div>
  );
}

export default function ShowcaseActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ShowcasedActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No activity ID provided.');
      setLoading(false);
      return;
    }

    const showcaseId = id;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        const fb = await initFirebase();
        if (!fb) {
          // No firebase — fetch without auth
          const { data, error: apiError } = await publicClient.GET('/showcase/{id}', {
            params: { path: { id: showcaseId } },
          });
          if (apiError || !data) {
            setError('This activity is not available or has expired.');
          } else {
            setActivity(data);
          }
          setLoading(false);
          return;
        }

        unsubscribe = onAuthStateChanged(fb.auth, async (user) => {
          try {
            const { data, error: apiError } = await publicClient.GET('/showcase/{id}', {
              params: { path: { id: showcaseId } },
            });

            if (apiError || !data) {
              setError('This activity is not available or has expired.');
            } else {
              setActivity(data);
              if (user && data.userId === user.uid) setIsOwner(true);
            }
          } catch {
            setError('Failed to load activity.');
          } finally {
            setLoading(false);
          }
        });
      } catch {
        setError('Failed to load activity.');
        setLoading(false);
      }
    }

    init();

    return () => unsubscribe?.();
  }, [id]);

  const { moduleOrder, appliedSet } = useMemo(() => {
    if (!activity) return { moduleOrder: [], appliedSet: new Set<string>() };
    const cat = resolveCategory(activity);
    const applied = new Set(activity.appliedEnrichments ?? []);
    const order = buildModuleOrder(activity, cat, applied);
    return { moduleOrder: order, appliedSet: applied };
  }, [activity]);

  const enrichmentsForMeta = activity?.enrichments as ActivityEnrichments | undefined;
  const aiSummaryForMeta = enrichmentsForMeta?.aiSummary?.html
    ? enrichmentsForMeta.aiSummary.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : undefined;

  useShowcaseMeta(activity ? {
    type: 'activity',
    title: activity.title ?? 'Activity',
    ownerName: activity.ownerDisplayName ?? undefined,
    emoji: getActivityIcon(activity.activityType),
    photoUrl: activity.photoUrls?.[0] ?? undefined,
    bannerUrl: enrichmentsForMeta?.aiBanner?.imageUrl ?? undefined,
    description: activity.description ?? undefined,
    aiSummary: aiSummaryForMeta,
    url: window.location.href,
  } : null);

  if (loading) return <LoadingScreen />;
  if (error || !activity) return <ErrorScreen message={error ?? 'Unknown error'} />;

  const enrichments = activity.enrichments as ActivityEnrichments | undefined;
  const appliedEnrichments = activity.appliedEnrichments ?? [];
  const appliedSet2 = new Set(appliedEnrichments);

  // Suppress unused variable warning
  void appliedSet;

  const parkrunData = appliedSet2.has('ENRICHER_PROVIDER_PARKRUN') ? enrichments?.parkrun : undefined;
  const milestoneData = enrichments?.distanceMilestone?.milestoneKm ? enrichments.distanceMilestone : undefined;
  const prData = appliedSet2.has('ENRICHER_PROVIDER_PERSONAL_RECORDS') ? enrichments?.personalRecords : undefined;

  const ownerProfileHref = activity.ownerProfileSlug
    ? `/showcase/profile/${activity.ownerProfileSlug}`
    : null;

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
          <span className="showcase-pubbar__crumb">
            {ownerProfileHref ? (
              <a href={ownerProfileHref}>{activity.ownerDisplayName?.toUpperCase() ?? 'PROFILE'}</a>
            ) : (
              <span>{activity.ownerDisplayName?.toUpperCase() ?? ''}</span>
            )}
          </span>
          <div className="showcase-pubbar__actions">
            <button
              className="showcase-pubbar__share-btn"
              onClick={() => setShareOpen(true)}
              aria-label="Share activity"
            >
              ↑ SHARE
            </button>
            <a
              href="/"
              style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-cyan)', textDecoration: 'none' }}
            >
              Try FitGlue →
            </a>
          </div>
        </nav>

        {/* Full-bleed hero — outside the layout grid */}
        <ActivityHero activity={activity} />

        {/* Full-bleed parkrun band (only when enricher ran and data present) */}
        {parkrunData?.eventName && (
          <div className="parkrun-full-band">
            <div className="parkrun-full-band__inner">
              <div className="parkrun-full-band__cell">
                {(parkrunData.isTimePb || parkrunData.isAgeGradePb) && (
                  <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
                    {parkrunData.isTimePb && <span className="stamp stamp--pb">TIME PB</span>}
                    {parkrunData.isAgeGradePb && <span className="stamp stamp--pb">AG PB</span>}
                  </div>
                )}
                <div className="parkrun-full-band__n">{parkrunData.finishTime ?? '—'}</div>
                <div className="parkrun-full-band__l">Finish Time · 🎽 {parkrunData.eventName}</div>
              </div>
              <div className="parkrun-full-band__cell">
                <div className="parkrun-full-band__n">#{parkrunData.position ?? '—'}</div>
                <div className="parkrun-full-band__l">Position</div>
              </div>
              <div className="parkrun-full-band__cell">
                <div className="parkrun-full-band__n">{parkrunData.ageGrade ?? '—'}</div>
                <div className="parkrun-full-band__l">Age Grade</div>
              </div>
              <div className="parkrun-full-band__cell">
                <div className="parkrun-full-band__n">{parkrunData.totalParkruns ?? '—'}</div>
                <div className="parkrun-full-band__l">Total Parkruns</div>
              </div>
            </div>
          </div>
        )}

        {/* Full-bleed milestone band */}
        {milestoneData && (
          <div className="milestone-full-band">
            <div className="milestone-full-band__inner">
              <span className="milestone-full-band__icon">🏅</span>
              <div>
                <div className="milestone-full-band__title">
                  {milestoneData.milestoneKm.toLocaleString()} KM LIFETIME
                </div>
                <div className="milestone-full-band__sub">
                  Total: {milestoneData.lifetimeDistanceKm.toFixed(1)} km · crossed today
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full-bleed PR band (strength activities with personal records) */}
        {prData?.records?.length ? <PersonalRecordsCallout data={prData} /> : null}

        {/* Layout grid: modules + booster timeline */}
        <div className="showcase-layout">
          <main className="showcase-main">
            <ModuleGrid
              moduleOrder={moduleOrder}
              enrichments={enrichments}
              activity={activity}
            />

            {isOwner && (
              <div style={{ borderTop: 'var(--fg-rule-thin)', padding: 'var(--space-md) 0', display: 'flex', gap: 'var(--space-sm)' }}>
                <a
                  href="/app/settings/showcase"
                  style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-cyan)' }}
                >
                  Manage showcase →
                </a>
              </div>
            )}
          </main>

          <aside>
            <BoosterTimeline appliedEnrichments={appliedEnrichments} />
          </aside>
        </div>
      </div>

      {shareOpen && (
        <ShowcaseExportModal
          data={activity}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

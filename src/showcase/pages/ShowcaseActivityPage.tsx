import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import publicClient from '../../shared/api/public-client';
import client from '../../shared/api/client';
import type { components } from '../../shared/api/schema-public';
import type { components as clientComponents } from '../../shared/api/schema-client';
import type { ActivityEnrichments } from '../../types/pb/models/activity/enrichments';
import { isNativeApp } from '../../shared/nativeBridge';
import { resolveCategory } from '../utils/activityCategory';
import { buildModuleOrder } from '../utils/enricherModules';
import { getActivityIcon } from '../utils/activityMeta';
import { useShowcaseMeta } from '../utils/useShowcaseMeta';
import { useShowcaseOwner } from '../utils/useShowcaseOwner';
import ShowcaseNotFound from '../components/ShowcaseNotFound';
import { ViewCountBadge } from '../components/ViewCountBadge';
import { recordShowcaseView } from '../utils/recordView';
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


export default function ShowcaseActivityPage() {
  const { slug: rawSlug, id } = useParams<{ slug?: string; id: string }>();
  const slugFromUrl = rawSlug?.startsWith('@') ? rawSlug.slice(1) : rawSlug;
  const [activity, setActivity] = useState<ShowcasedActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [viewStats, setViewStats] = useState<clientComponents['schemas']['ShowcaseViewStats'] | null>(null);

  // Single source of truth for "the logged-in user owns this showcase" — shared
  // with the roundup page. Resolves once the activity's owner slug is known.
  const { isOwner, resolved: ownershipResolved } = useShowcaseOwner(activity?.ownerProfileSlug ?? undefined);

  useEffect(() => {
    if (!id) {
      setError('No activity ID provided.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error: apiError } = await publicClient.GET('/showcase/{id}', {
          params: { path: { id } },
        });
        if (cancelled) return;
        if (apiError || !data) {
          setError('This activity is not available or has expired.');
        } else {
          setActivity(data);
        }
      } catch {
        if (!cancelled) setError('Failed to load activity.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  // Record a view once loading and ownership settle — but never for the owner's
  // own visits.
  useEffect(() => {
    if (loading || error || !activity || !ownershipResolved || isOwner) return;
    const showcaseId = activity.showcaseId ?? id;
    if (showcaseId) recordShowcaseView({ kind: 'activity', id: showcaseId });
  }, [loading, error, activity, ownershipResolved, isOwner, id]);

  // Owner-only: fetch de-duplicated view metrics for the inline badge.
  useEffect(() => {
    if (!isOwner) { setViewStats(null); return; }
    const showcaseId = activity?.showcaseId ?? id;
    if (!showcaseId) return;
    let cancelled = false;
    client
      .GET('/users/me/showcases/{id}/views', { params: { path: { id: showcaseId } } })
      .then(({ data }) => { if (!cancelled && data) setViewStats(data); })
      .catch(() => { /* not the owner / unauthenticated — leave badge hidden */ });
    return () => { cancelled = true; };
  }, [isOwner, activity, id]);

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
  if (error || !activity) return <ShowcaseNotFound type="activity" />;

  const enrichments = activity.enrichments as ActivityEnrichments | undefined;
  const appliedEnrichments = activity.appliedEnrichments ?? [];
  const appliedSet2 = new Set(appliedEnrichments);

  // Suppress unused variable warning
  void appliedSet;

  const parkrunData = appliedSet2.has('ENRICHER_PROVIDER_PARKRUN') ? enrichments?.parkrun : undefined;
  const milestoneData = enrichments?.distanceMilestone?.milestoneKm ? enrichments.distanceMilestone : undefined;
  const prData = appliedSet2.has('ENRICHER_PROVIDER_PERSONAL_RECORDS') ? enrichments?.personalRecords : undefined;

  const resolvedOwnerSlug = activity.ownerProfileSlug || slugFromUrl;
  const ownerProfileHref = resolvedOwnerSlug
    ? `/@${resolvedOwnerSlug}`
    : null;

  return (
    <div className="showcase-page">
      <div className="showcase-page-bg" aria-hidden="true" />
      <div className="showcase-page-wrap">
        {/* Sticky public nav bar — hidden entirely inside the native app */}
        {!isNativeApp && (
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
              {isOwner && <ViewCountBadge stats={viewStats} />}
              {isOwner ? (
                <button
                  className="showcase-pubbar__share-btn"
                  onClick={() => setShareOpen(true)}
                  aria-label="Share activity"
                >
                  ↑ SHARE
                </button>
              ) : (
                <a
                  href="/"
                  style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-cyan)', textDecoration: 'none' }}
                >
                  Try FitGlue →
                </a>
              )}
            </div>
          </nav>
        )}

        {/* Full-bleed hero — outside the layout grid */}
        <ActivityHero activity={activity} ownerProfileSlug={resolvedOwnerSlug} />

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


          </main>

          <aside>
            <BoosterTimeline appliedEnrichments={appliedEnrichments} />
          </aside>
        </div>
      </div>

      {isNativeApp && isOwner && (
        <button
          className="showcase-fab-share"
          onClick={() => setShareOpen(true)}
          aria-label="Share activity"
        >
          ↑ SHARE
        </button>
      )}

      {shareOpen && (
        <ShowcaseExportModal
          data={activity}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import { ThemeProvider } from '../components/ThemeProvider';
import { ActivityStats } from '../components/ActivityStats';
import { RouteMap } from '../components/RouteMap';
import { ActivityCharts } from '../components/ActivityCharts';
import {
  DescriptionSections,
  AISummaryCard,
  parseDescriptionSections,
} from '../components/DescriptionSections';
import { formatActivityType, formatSource, formatDateFull, getEnricherInfo } from '../utils/format';
import { PhotoGallery } from '../components/PhotoGallery';
import { ShowcaseExportModal } from '../components/ShowcaseExportModal';
import { initFirebase } from '../../shared/firebase';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];
type Record = components['schemas']['Record'];

const LOADING_MESSAGES = [
  'Loading activity...',
  'Fetching your data...',
  'Almost there...',
  'Preparing your showcase...',
  'Crunching the numbers...',
];

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="showcase-page">
      <div className="showcase-loading">
        <div className="loading-bg-gradient" />
        <div className="loading-content">
          <div className="loading-logo">
            <span className="loading-logo-fit">Fit</span>
            <span className="loading-logo-glue">Glue</span>
          </div>
          <div className="loading-spinner-container">
            <div className="loading-spinner-ring" />
            <div className="loading-spinner-ring loading-spinner-ring-2" />
            <div className="loading-spinner-ring loading-spinner-ring-3" />
          </div>
          <p className="loading-message">{LOADING_MESSAGES[msgIdx]}</p>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="showcase-page">
      <div className="showcase-error" style={{ display: 'block' }}>
        <div className="error-icon">🏃🏃‍♂️🏃‍♀️</div>
        <h1>This Activity Got Away!</h1>
        <p id="error-message">{message}</p>
        <p className="error-subtitle">It may have expired, or perhaps the link has a typo.</p>
        <a href="/" className="btn btn-primary">Explore FitGlue</a>
      </div>
    </div>
  );
}

export default function ShowcaseActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ShowcasedActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('No showcase ID provided.');
      setLoading(false);
      return;
    }
    publicClient
      .GET('/showcase/{id}', { params: { path: { id } } })
      .then(({ data: d }) => {
        setData(d ?? null);
        if (!d) setError('Showcase not found.');
        if (d?.title) document.title = `${d.title} | FitGlue`;
      })
      .catch(() => setError('Failed to load showcase.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen message={error ?? 'Failed to load showcase.'} />;

  return <ShowcaseContent data={data} />;
}

const ShowcaseContent: React.FC<{ data: ShowcasedActivity }> = ({ data }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    initFirebase().then((fb) => {
      if (!fb) return;
      const unsub = onAuthStateChanged(fb.auth, (user) => {
        setIsOwner(Boolean(user && data.userId && user.uid === data.userId));
      });
      return unsub;
    }).catch(() => { /* Firebase unavailable */ });
  }, [data.userId]);

  const activity = data.activityData;
  const session = activity?.sessions?.[0];
  const allRecords: Record[] = useMemo(
    () => session?.laps?.flatMap((l) => l.records ?? []) ?? [],
    [session]
  );
  const gpsRecords = useMemo(
    () => allRecords
      .filter((r) => r.positionLat !== undefined && r.positionLong !== undefined)
      .map((r) => ({ lat: r.positionLat!, lng: r.positionLong! })),
    [allRecords]
  );

  const bannerUrl = data.enrichmentMetadata?.['asset_ai_banner'];
  const routeThumbnailUrl = data.enrichmentMetadata?.['asset_route_thumbnail'];
  const heatmapImageUrl = data.enrichmentMetadata?.['asset_muscle_heatmap'];

  const description = data.description ?? activity?.description ?? '';
  const sections = parseDescriptionSections(description);
  const userDescSection = sections.find((s) => s.title === 'Description');
  const aiSummarySection = sections.find((s) => s.title === 'AI Summary');

  const hasGraphs = useMemo(() => {
    const set = new Set<string>();
    if (allRecords.some((r) => (r.heartRate ?? 0) > 0)) set.add('Heart Rate');
    if (allRecords.some((r) => r.altitude !== undefined)) set.add('Elevation');
    if (allRecords.some((r) => (r.speed ?? 0) > 0)) {
      set.add('Pace');
      set.add('Speed');
    }
    if (allRecords.some((r) => (r.power ?? 0) > 0)) set.add('Power');
    if (allRecords.some((r) => (r.cadence ?? 0) > 0)) set.add('Cadence');
    return set;
  }, [allRecords]);

  const hybridRace = activity?.hybridRaceSummary;
  const hasHybridRace = Boolean(hybridRace?.segments?.length);

  const ownerSlug = data.ownerProfileSlug;

  return (
    <div className="showcase-page">
      <ThemeProvider theme={data.enrichmentMetadata?.['theme'] as never} />
      <canvas className="showcase-particles" id="showcase-particles" />

      <div className="showcase-content">
        {/* Hero */}
        <div
          className={`showcase-hero${bannerUrl ? ' has-banner' : ''}`}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
        >
          <h1 className="showcase-title">{data.title ?? 'Activity'}</h1>
          {data.ownerDisplayName && (
            <div className="owner-attribution">
              {data.ownerProfilePictureUrl && (
                <span className="owner-avatar">
                  <img src={data.ownerProfilePictureUrl} alt={data.ownerDisplayName} />
                </span>
              )}
              by{' '}
              {ownerSlug ? (
                <a href={`/showcase/profile/${ownerSlug}`} className="owner-name owner-link">
                  {data.ownerDisplayName}
                </a>
              ) : (
                <span className="owner-name">{data.ownerDisplayName}</span>
              )}
            </div>
          )}
          <div className="showcase-meta">
            <span className="activity-type-badge">{formatActivityType(data.activityType)}</span>
            <span className="activity-source">from {formatSource(data.source)}</span>
            {data.startTime && (
              <span className="activity-date">{formatDateFull(data.startTime)}</span>
            )}
          </div>
          {userDescSection?.content && (
            <div className="user-description">{userDescSection.content}</div>
          )}
          {isOwner && (
            <button className="showcase-share-btn" onClick={() => setShowExport(true)}>
              ✦ Share
            </button>
          )}
        </div>

        {/* AI Summary */}
        {aiSummarySection && <AISummaryCard section={aiSummarySection} idx={0} />}

        {/* Photo Gallery */}
        {(data.photoUrls ?? []).length > 0 && (
          <PhotoGallery photos={data.photoUrls!} />
        )}

        {/* Stats */}
        {session && <ActivityStats session={session} />}

        {/* Hybrid Race Breakdown */}
        {hasHybridRace && hybridRace?.segments && (
          <div className="showcase-section glass-card">
            <div className="section-header">
              <h2>🏁 Race Breakdown</h2>
            </div>
            <div className="hybrid-race-bars">
              {hybridRace.segments.map((seg, i) => (
                <div key={i} className="hybrid-race-segment">
                  <span className="hybrid-race-seg-icon">{seg.icon ?? (seg.isRun ? '🏃' : '💪')}</span>
                  <span className="hybrid-race-seg-label">{seg.label}</span>
                  {seg.durationSeconds && (
                    <span className="hybrid-race-seg-time">
                      {Math.floor(seg.durationSeconds / 60)}:{String(seg.durationSeconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Thumbnail or Map */}
        {routeThumbnailUrl && (
          <div className="showcase-section glass-card">
            <div className="section-header"><h2>🗺️ Route</h2></div>
            <div className="route-thumbnail-container">
              <img
                src={routeThumbnailUrl}
                alt="Route map"
                className="route-thumbnail-image"
                style={{ width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        )}
        {!routeThumbnailUrl && gpsRecords.length > 10 && (
          <RouteMap points={gpsRecords} />
        )}

        {/* Charts */}
        {allRecords.length > 0 && (
          <ActivityCharts records={allRecords} timeMarkers={activity?.timeMarkers} descriptionSections={sections} />
        )}

        {/* Enricher Description Sections */}
        {description && (
          <DescriptionSections
            text={description}
            hasGraphs={hasGraphs}
            hasHybridRace={hasHybridRace}
          />
        )}

        {/* Muscle Heatmap Image (from metadata) */}
        {heatmapImageUrl && (
          <div className="showcase-section glass-card">
            <div className="section-header">
              <h2>🔥 Muscle Activation</h2>
              <span className="section-subtitle">Visual breakdown of muscle engagement</span>
            </div>
            <div className="muscle-heatmap-container">
              <img
                src={heatmapImageUrl}
                alt="Muscle Heatmap"
                className="muscle-heatmap-image"
                style={{ width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {(data.tags ?? activity?.tags ?? []).length > 0 && (
          <div className="showcase-section">
            <div className="activity-tags">
              {(data.tags ?? activity?.tags ?? []).map((tag) => (
                <span key={tag} className="activity-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Enrichments Applied */}
        {(data.appliedEnrichments ?? []).length > 0 && (
          <div className="showcase-section">
            <div className="section-header">
              <h2>🚀 Boosters Applied</h2>
              <span className="section-subtitle">FitGlue Boosters applied to this activity</span>
            </div>
            <div className="enrichment-list">
              {(data.appliedEnrichments ?? []).map((key) => {
                const info = getEnricherInfo(key);
                return (
                  <div key={key} className="enrichment-item">
                    <span className="enrichment-icon">{info.icon}</span>
                    <div className="enrichment-info">
                      <span className="enrichment-name">{info.name}</span>
                      <span className="enrichment-desc">{info.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="showcase-cta glass-card">
          <div className="cta-content">
            <h3>Want to enhance your own activities?</h3>
            <p>FitGlue automatically enriches your workouts with muscle heatmaps, heart rate data, and beautiful summaries.</p>
          </div>
          <a href="/" className="btn btn-primary btn-lg btn-glow">Try FitGlue Free</a>
        </div>

        {/* Attribution */}
        <div className="showcase-attribution">
          <span>Powered by</span>
          <a href="/" className="fitglue-logo">
            <span className="fit">Fit</span><span className="glue">Glue</span>
          </a>
        </div>
      </div>

      {showExport && (
        <ShowcaseExportModal data={data} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
};

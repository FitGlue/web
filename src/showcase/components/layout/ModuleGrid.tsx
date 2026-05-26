import React from 'react';
import type { ModuleKey } from '../../utils/enricherModules';
import type { components } from '../../../shared/api/schema-public';
import type { ActivityEnrichments } from '../../../types/pb/models/activity/enrichments';
import { parseDescriptionSections } from '../DescriptionSections';
import { formatSource } from '../../utils/format';
import { RouteMap } from '../RouteMap';

// Lazy imports for each module — only import what's needed
import HeartRateModule from '../modules/HeartRateModule';
import HRZonesModule from '../modules/HRZonesModule';
import PaceModule from '../modules/PaceModule';
import SpeedModule from '../modules/SpeedModule';
import CadenceModule from '../modules/CadenceModule';
import PowerModule from '../modules/PowerModule';
import ElevationModule from '../modules/ElevationModule';
import EffortModule from '../modules/EffortModule';
import CaloriesModule from '../modules/CaloriesModule';
import TrainingLoadModule from '../modules/TrainingLoadModule';
import RecoveryModule from '../modules/RecoveryModule';
import StreakModule from '../modules/StreakModule';
import WeatherModule from '../modules/WeatherModule';
import IntervalsModule from '../modules/IntervalsModule';
import RunningDynamicsModule from '../modules/RunningDynamicsModule';
import SpotifyModule from '../modules/SpotifyModule';
import GoalTrackerModule from '../modules/GoalTrackerModule';
import MuscleHeatmapModule from '../modules/MuscleHeatmapModule';
import SetListModule from '../modules/SetListModule';
import PersonalRecordsCallout from '../modules/PersonalRecordsCallout';
import { PhotoGallery } from '../PhotoGallery';

type Session = components['schemas']['Session'];
type Rec = components['schemas']['Record'];

function formatSegmentDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Props {
  moduleOrder: ModuleKey[];
  enrichments: ActivityEnrichments | undefined;
  activity: components['schemas']['ShowcasedActivity'];
}

export default function ModuleGrid({ moduleOrder, enrichments, activity }: Props): React.ReactElement {
  const sessions = activity.activityData?.sessions as Session[] | undefined;

  // Flat records for sparkline charts
  const flatRecords: Rec[] = [];
  for (const s of sessions ?? []) {
    for (const lap of s.laps ?? []) {
      for (const r of lap.records ?? []) flatRecords.push(r);
    }
  }

  // Extract user-written description preamble (text before any AI-generated emoji: sections)
  const userDescription = activity.description
    ? parseDescriptionSections(activity.description).find((s) => s.title === 'Description')?.content ?? null
    : null;

  // Strip leading heading tag and any "AI Summary:" label from AI summary HTML
  const aiSummaryHtml = enrichments?.aiSummary?.html
    ? enrichments.aiSummary.html
        .replace(/^<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*/i, '')
        .replace(/\bAI\s*Summary\s*:\s*/i, '')
    : null;

  const photoUrls = activity.photoUrls ?? [];
  const tags = activity.tags ?? [];
  // Build a set of exercise names that have PRs by stripping known strength suffixes.
  // The server stores recordType as e.g. "Bench Press_1rm", "Bench Press_set_volume" — we
  // strip the suffix so we can match against the raw exerciseName from StrengthSet.
  const PR_SUFFIXES = ['_1rm', '_set_volume', '_volume', '_reps'];
  const prTypes = new Set(
    (enrichments?.personalRecords?.records ?? []).map((r) => {
      const rt = r.recordType ?? '';
      for (const suffix of PR_SUFFIXES) {
        if (rt.endsWith(suffix)) return rt.slice(0, rt.length - suffix.length);
      }
      return rt;
    })
  );
  const gpsPoints = flatRecords
    .filter((r) => r.positionLat !== undefined && r.positionLat !== 0 && r.positionLong !== undefined && r.positionLong !== 0)
    .map((r) => ({ lat: r.positionLat!, lng: r.positionLong! }));

  const preGridModules = new Set<ModuleKey>(['hybrid-race-segments', 'ai-story', 'milestone-callout', 'pr-callout', 'description', 'tags', 'photos', 'map']);
  const footerModules = new Set<ModuleKey>(['auto-increment-footer', 'source-link-footer']);

  // Pre-grid (full-width, before the 12-col grid)
  const preGrid = moduleOrder.filter((k) => preGridModules.has(k));
  // Grid modules
  const gridModules = moduleOrder.filter((k) => !preGridModules.has(k) && !footerModules.has(k));
  // Footer
  const footer = moduleOrder.filter((k) => footerModules.has(k));

  return (
    <>
      {/* Pre-grid modules */}
      {preGrid.map((key) => {
        switch (key) {
          case 'ai-story':
            return aiSummaryHtml ? (
              <div key={key} className="ai-story">
                <span className="ai-story__label">✨ AI SUMMARY</span>
                <p
                  className="ai-story__quote"
                  dangerouslySetInnerHTML={{ __html: aiSummaryHtml }}
                />
              </div>
            ) : null;
          case 'milestone-callout': {
            const ms = enrichments?.distanceMilestone;
            if (!ms || ms.lifetimeDistanceKm === 0) return null;
            const toGo = ms.nextMilestoneKm ? ms.nextMilestoneKm - ms.lifetimeDistanceKm : null;
            return (
              <div key={key} className="milestone-callout">
                <span className="milestone-callout__label">
                  📊 Lifetime {ms.activityTypeLabel}
                </span>
                <span className="milestone-callout__value">
                  {ms.lifetimeDistanceKm.toFixed(1)} km
                </span>
                {ms.nextMilestoneKm && toGo !== null && toGo > 0 && (
                  <span className="milestone-callout__next">
                    Next milestone: {ms.nextMilestoneKm} km · {toGo.toFixed(1)} km to go
                  </span>
                )}
                {ms.milestoneKm > 0 && (
                  <span className="milestone-callout__achieved">
                    🎉 {ms.milestoneKm} km milestone reached!
                  </span>
                )}
              </div>
            );
          }
          case 'pr-callout':
            return <PersonalRecordsCallout key={key} data={enrichments?.personalRecords} />;
          case 'description':
            return userDescription ? (
              <div key={key} className="activity-description">
                <span className="activity-description__label">FROM THE ATHLETE</span>
                <p className="activity-description__body">{userDescription}</p>
              </div>
            ) : null;
          case 'tags':
            return tags.length > 0 ? (
              <div key={key} className="activity-tags">
                {tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
              </div>
            ) : null;
          case 'photos':
            return photoUrls.length > 0 ? (
              <PhotoGallery key={key} photos={photoUrls} layout="strip" />
            ) : null;
          case 'map':
            return gpsPoints.length >= 10 ? (
              <RouteMap key={key} points={gpsPoints} />
            ) : null;
          case 'hybrid-race-segments': {
            const segments = activity.activityData?.hybridRaceSummary?.segments ?? [];
            if (segments.length === 0) return null;
            const totalSeconds = segments.reduce((acc, seg) => acc + (seg.durationSeconds ?? 0), 0);
            const totalDur = formatSegmentDuration(totalSeconds);
            return (
              <div key={key} className="hybrid-race">
                <div className="hybrid-race__header">
                  <span className="hybrid-race__label">🏁 RACE BREAKDOWN</span>
                  <span className="hybrid-race__total">{totalDur} total</span>
                </div>
                <div className="hybrid-race__segments">
                  {segments.map((seg, i) => (
                    <div
                      key={i}
                      className={`hybrid-race__seg${seg.isRun ? ' hybrid-race__seg--run' : ''}`}
                    >
                      <span className="hybrid-race__seg-icon">{seg.icon}</span>
                      <span className="hybrid-race__seg-label">{seg.label}</span>
                      <span className="hybrid-race__seg-dur">{formatSegmentDuration(seg.durationSeconds)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          default:
            return null;
        }
      })}

      {/* 12-col module grid */}
      {gridModules.length > 0 && (
        <div className="module-grid">
          {gridModules.map((key) => {
            switch (key) {
              case 'heart-rate':
                return <HeartRateModule key={key} data={enrichments?.heartRate} records={flatRecords} />;
              case 'zones':
                return <HRZonesModule key={key} data={enrichments?.heartRateZones} />;
              case 'pace':
                return <PaceModule key={key} data={enrichments?.pace} records={flatRecords} />;
              case 'speed':
                return <SpeedModule key={key} data={enrichments?.speed} />;
              case 'cadence':
                return <CadenceModule key={key} data={enrichments?.cadence} records={flatRecords} />;
              case 'power':
                return <PowerModule key={key} data={enrichments?.power} />;
              case 'elevation':
                return <ElevationModule key={key} data={enrichments?.elevation} records={flatRecords} />;
              case 'effort':
                return <EffortModule key={key} data={enrichments?.effort} />;
              case 'calories':
                return <CaloriesModule key={key} data={enrichments?.calories} />;
              case 'training-load':
                return <TrainingLoadModule key={key} data={enrichments?.trainingLoad} />;
              case 'recovery':
                return <RecoveryModule key={key} data={enrichments?.recovery} />;
              case 'streak':
                return <StreakModule key={key} data={enrichments?.streak} />;
              case 'weather':
                return <WeatherModule key={key} data={enrichments?.weather} />;
              case 'intervals':
                return <IntervalsModule key={key} data={enrichments?.intervals} />;
              case 'running-dynamics':
                return <RunningDynamicsModule key={key} data={enrichments?.runningDynamics} />;
              case 'muscle-heatmap':
                return (
                  <MuscleHeatmapModule
                    key={key}
                    data={enrichments?.muscleHeatmap}
                  />
                );
              case 'set-list':
                return <SetListModule key={key} sessions={sessions} prTypes={prTypes} />;
              case 'goals':
                return <GoalTrackerModule key={key} data={enrichments?.goalTracker} />;
              case 'spotify':
                return <SpotifyModule key={key} data={enrichments?.spotify} />;
              default:
                return null;
            }
          })}
        </div>
      )}

      {/* Footer enrichers */}
      {footer.length > 0 && (
        <div className="enricher-footer">
          {footer.map((key) => {
            switch (key) {
              case 'auto-increment-footer':
                return (
                  <span key={key} className="enricher-footer__item">
                    📈 Series activity
                  </span>
                );
              case 'source-link-footer':
                return (
                  <span key={key} className="enricher-footer__item">
                    ↗ View on {formatSource(activity.source)}
                  </span>
                );
              default:
                return null;
            }
          })}
        </div>
      )}

      {/* No enrichments fallback */}
      {!enrichments && (
        <div style={{ padding: 'var(--space-md) 0' }}>
          <span className="no-enrichments-stamp">⚙ Boosters didn&apos;t run on this activity</span>
        </div>
      )}
    </>
  );
}

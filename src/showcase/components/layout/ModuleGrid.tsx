import React from 'react';
import type { ModuleKey } from '../../utils/enricherModules';
import type { components } from '../../../shared/api/schema-public';
import type { ActivityEnrichments } from '../../../types/pb/models/activity/enrichments';
import { parseDescriptionSections } from '../DescriptionSections';

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
import ParkrunModule from '../modules/ParkrunModule';
import SpotifyModule from '../modules/SpotifyModule';
import GoalTrackerModule from '../modules/GoalTrackerModule';
import MuscleHeatmapModule from '../modules/MuscleHeatmapModule';
import SetListModule from '../modules/SetListModule';
import PersonalRecordsCallout from '../modules/PersonalRecordsCallout';
import MilestoneCallout from '../modules/MilestoneCallout';

type Session = components['schemas']['Session'];
type Rec = components['schemas']['Record'];

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

  // Strip leading heading tag from AI summary HTML (e.g. <h2>AI Summary</h2>)
  const aiSummaryHtml = enrichments?.aiSummary?.html
    ? enrichments.aiSummary.html.replace(/^<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*/i, '')
    : null;

  const photoUrls = activity.photoUrls ?? [];
  const tags = activity.tags ?? [];
  const prTypes = new Set(
    (enrichments?.personalRecords?.records ?? []).map((r) => r.recordType ?? '')
  );
  const hasGps = sessions?.some((s) =>
    s.laps?.some((l) => l.records?.some((r) => r.positionLat !== 0 || r.positionLong !== 0))
  );
  const routeThumbUrl = enrichments?.aiBanner?.imageUrl; // placeholder — route thumb would come from metadata

  const preGridModules = new Set<ModuleKey>(['parkrun', 'hybrid-race-segments', 'ai-story', 'milestone-callout', 'pr-callout', 'description', 'tags', 'photos', 'map']);
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
          case 'parkrun':
            return <ParkrunModule key={key} data={enrichments?.parkrun} />;
          case 'ai-story':
            return aiSummaryHtml ? (
              <div key={key} className="ai-story">
                <p
                  className="ai-story__quote"
                  dangerouslySetInnerHTML={{ __html: aiSummaryHtml }}
                />
              </div>
            ) : null;
          case 'milestone-callout':
            return <MilestoneCallout key={key} data={enrichments?.distanceMilestone} />;
          case 'pr-callout':
            return <PersonalRecordsCallout key={key} data={enrichments?.personalRecords} />;
          case 'description':
            return userDescription ? (
              <div key={key} className="activity-description">{userDescription}</div>
            ) : null;
          case 'tags':
            return tags.length > 0 ? (
              <div key={key} className="activity-tags">
                {tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
              </div>
            ) : null;
          case 'photos':
            return photoUrls.length > 0 ? (
              <div key={key} className="photo-grid">
                {photoUrls.slice(0, 4).map((url) => (
                  <img key={url} src={url} alt="Activity photo" />
                ))}
              </div>
            ) : null;
          case 'map':
            return hasGps ? (
              <div key={key} className="map-module">
                {routeThumbUrl ? (
                  <img src={routeThumbUrl} alt="Route map" />
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem' }}>
                    🗺️ GPS ROUTE
                  </span>
                )}
              </div>
            ) : null;
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
                return <PaceModule key={key} data={enrichments?.pace} />;
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
                    ↗ View on source
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

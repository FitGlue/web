import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import publicClient from '../../shared/api/public-client';
import type { components } from '../../shared/api/schema-public';
import type { ActivityEnrichments } from '../../types/pb/models/activity/enrichments';
import { initFirebase } from '../../shared/firebase';
import { resolveCategory } from '../utils/activityCategory';
import { buildModuleOrder } from '../utils/enricherModules';
import ActivityHero from '../components/layout/ActivityHero';
import ModuleGrid from '../components/layout/ModuleGrid';
import BoosterTimeline from '../components/layout/BoosterTimeline';

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

  if (loading) return <LoadingScreen />;
  if (error || !activity) return <ErrorScreen message={error ?? 'Unknown error'} />;

  const enrichments = activity.enrichments as ActivityEnrichments | undefined;
  const appliedEnrichments = activity.appliedEnrichments ?? [];

  // Suppress unused variable warning
  void appliedSet;

  return (
    <div className="showcase-page">
      <div className="showcase-layout">
        {/* Main content column */}
        <main className="showcase-main">
          <ActivityHero activity={activity} />

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

        {/* Right-rail booster timeline */}
        <aside>
          <BoosterTimeline appliedEnrichments={appliedEnrichments} />
        </aside>
      </div>
    </div>
  );
}

export function formatDuration(seconds: number | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatDurationLong(seconds: number | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

export function formatDistance(meters: number | undefined): string | null {
  if (!meters || meters <= 0) return null;
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

export function formatWeight(kg: number | undefined): string | null {
  if (!kg || kg <= 0) return null;
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg).toLocaleString()} kg`;
}

export function formatNumber(n: number | undefined): string | null {
  if (!n || n <= 0) return null;
  return n.toLocaleString();
}

export function formatActivityType(type: string | undefined): string {
  if (!type) return 'Activity';
  if (type.startsWith('ACTIVITY_TYPE_')) {
    return type
      .replace('ACTIVITY_TYPE_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return type;
}

export function formatSource(source: string | undefined): string {
  if (!source) return 'Unknown';
  if (source.startsWith('SOURCE_')) {
    const name = source
      .replace('SOURCE_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (name === 'File Upload') return 'FIT Upload';
    return name;
  }
  return source;
}

export function formatDate(isoStr: string | undefined): string {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateFull(isoStr: string | undefined): string {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateGroupHeader(isoStr: string | undefined): string {
  if (!isoStr) return 'Unknown Date';
  const d = new Date(isoStr);
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  return `${weekday}, ${day}${suffix} ${month} ${d.getFullYear()}`;
}

export function getDateKey(isoStr: string | undefined): string {
  if (!isoStr) return 'unknown';
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getEnricherInfo(key: string): { icon: string; name: string; description: string } {
  const REGISTRY: Record<string, { icon: string; name: string; description: string }> = {
    ENRICHER_PROVIDER_FITBIT_HEART_RATE:   { icon: '❤️',    name: 'Fitbit Heart Rate',       description: 'Heart rate data from Fitbit' },
    ENRICHER_PROVIDER_WORKOUT_SUMMARY:     { icon: '📋',    name: 'Workout Summary',          description: 'AI-generated workout overview' },
    ENRICHER_PROVIDER_MUSCLE_HEATMAP:      { icon: '🔥',    name: 'Muscle Heatmap',           description: 'Visual muscle activation analysis' },
    ENRICHER_PROVIDER_AI_COMPANION:        { icon: '🤖',    name: 'AI Companion',             description: 'AI-powered activity insights' },
    ENRICHER_PROVIDER_HEART_RATE_SUMMARY:  { icon: '💓',    name: 'Heart Rate Summary',       description: 'Detailed HR zone analysis' },
    ENRICHER_PROVIDER_PACE_SUMMARY:        { icon: '⚡',    name: 'Pace Summary',             description: 'Detailed pace breakdown' },
    ENRICHER_PROVIDER_CADENCE_SUMMARY:     { icon: '🦶',    name: 'Cadence Summary',          description: 'Step cadence analysis' },
    ENRICHER_PROVIDER_POWER_SUMMARY:       { icon: '💪',    name: 'Power Summary',            description: 'Power output analysis' },
    ENRICHER_PROVIDER_SPEED_SUMMARY:       { icon: '🚀',    name: 'Speed Summary',            description: 'Speed and velocity analysis' },
    ENRICHER_PROVIDER_PERSONAL_RECORDS:    { icon: '🏆',    name: 'Personal Records',         description: 'Best performance tracking' },
    ENRICHER_PROVIDER_TRAINING_LOAD:       { icon: '📊',    name: 'Training Load',            description: 'Cumulative training stress' },
    ENRICHER_PROVIDER_WEATHER:             { icon: '🌤️',   name: 'Weather',                  description: 'Weather conditions during activity' },
    ENRICHER_PROVIDER_ELEVATION_SUMMARY:   { icon: '⛰️',   name: 'Elevation Summary',        description: 'Elevation gain and profile' },
    ENRICHER_PROVIDER_LOCATION_NAMING:     { icon: '📍',    name: 'Location Naming',          description: 'Automatic location tagging' },
    ENRICHER_PROVIDER_MUSCLE_HEATMAP_IMAGE:{ icon: '🔥',    name: 'Muscle Heatmap Image',     description: 'Visual muscle activation map' },
    ENRICHER_PROVIDER_ROUTE_THUMBNAIL:     { icon: '🗺️',   name: 'Route Thumbnail',          description: 'Route map preview image' },
    ENRICHER_PROVIDER_AI_BANNER:           { icon: '🎨',    name: 'AI Banner',                description: 'AI-generated activity artwork' },
    ENRICHER_PROVIDER_HEART_RATE_ZONES:    { icon: '❤️‍🔥', name: 'Heart Rate Zones',         description: 'Training zone distribution' },
    ENRICHER_PROVIDER_CALORIES_BURNED:     { icon: '🔥',    name: 'Calories Burned',          description: 'Energy expenditure estimate' },
    ENRICHER_PROVIDER_GOAL_TRACKER:        { icon: '🎯',    name: 'Goal Tracker',             description: 'Goal progress tracking' },
    ENRICHER_PROVIDER_STREAK_TRACKER:      { icon: '🔥',    name: 'Streak Tracker',           description: 'Consecutive activity streaks' },
    ENRICHER_PROVIDER_DISTANCE_MILESTONES: { icon: '🏅',    name: 'Distance Milestones',      description: 'Distance achievement tracking' },
    ENRICHER_PROVIDER_RECOVERY_ADVISOR:    { icon: '🛌',    name: 'Recovery Advisor',         description: 'Rest and recovery guidance' },
    ENRICHER_PROVIDER_EFFORT_SCORE:        { icon: '💯',    name: 'Effort Score',             description: 'Overall activity intensity rating' },
    ENRICHER_PROVIDER_INTERVALS:           { icon: '⏱️',   name: 'Intervals',                description: 'Interval training analysis' },
    ENRICHER_PROVIDER_RUNNING_DYNAMICS:    { icon: '🏃',    name: 'Running Dynamics',         description: 'Advanced running form metrics' },
    ENRICHER_PROVIDER_HYBRID_RACE_TAGGER:  { icon: '🏁',    name: 'Hybrid Race Tagger',       description: 'Multi-discipline race analysis' },
    ENRICHER_PROVIDER_PARKRUN:             { icon: '🏃',    name: 'Parkrun Results',           description: 'Official parkrun finish data' },
    ENRICHER_PROVIDER_SOURCE_LINK:         { icon: '🔗',    name: 'Source Link',              description: 'Link back to original platform' },
  };
  return REGISTRY[key] ?? {
    icon: '✨',
    name: key.replace('ENRICHER_PROVIDER_', '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    description: 'Activity data booster',
  };
}

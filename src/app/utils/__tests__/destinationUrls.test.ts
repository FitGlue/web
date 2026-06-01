import { describe, it, expect } from 'vitest';
import { buildDestinationUrl, getDestinationUrls } from '../destinationUrls';
import type { PluginManifest } from '../../types/plugin';

function makeDestination(id: string, urlTemplate?: string): PluginManifest {
  return {
    id,
    name: id,
    icon: '',
    description: '',
    enabled: true,
    externalUrlTemplate: urlTemplate,
  } as PluginManifest;
}

const destinations: PluginManifest[] = [
  makeDestination('strava', 'https://strava.com/activities/{id}'),
  makeDestination('googlesheets', 'https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit#gid=0&range={row_number}'),
  makeDestination('github', 'https://github.com/{repo}/blob/main/{file_path}'),
  makeDestination('notemplate'),
];

describe('buildDestinationUrl', () => {
  it('replaces {id} placeholder', () => {
    expect(buildDestinationUrl(destinations, 'strava', '12345')).toBe(
      'https://strava.com/activities/12345'
    );
  });

  it('replaces {row_number} with external ID', () => {
    expect(buildDestinationUrl(destinations, 'googlesheets', '42', { spreadsheet_id: 'abc123' })).toBe(
      'https://docs.google.com/spreadsheets/d/abc123/edit#gid=0&range=42'
    );
  });

  it('replaces config value placeholders', () => {
    expect(buildDestinationUrl(destinations, 'github', 'abc', { repo: 'myorg/myrepo', file_path: 'workouts.md' })).toBe(
      'https://github.com/myorg/myrepo/blob/main/workouts.md'
    );
  });

  it('returns null when destination not found', () => {
    expect(buildDestinationUrl(destinations, 'unknown', '123')).toBeNull();
  });

  it('returns null when no URL template on destination', () => {
    expect(buildDestinationUrl(destinations, 'notemplate', '123')).toBeNull();
  });

  it('returns null for empty destinationId', () => {
    expect(buildDestinationUrl(destinations, '', '123')).toBeNull();
  });

  it('returns null for empty externalId', () => {
    expect(buildDestinationUrl(destinations, 'strava', '')).toBeNull();
  });

  it('is case-insensitive for destination ID lookup', () => {
    expect(buildDestinationUrl(destinations, 'Strava', '99')).toBe(
      'https://strava.com/activities/99'
    );
  });
});

describe('getDestinationUrls', () => {
  it('returns empty object for undefined activityDestinations', () => {
    expect(getDestinationUrls(destinations, undefined)).toEqual({});
  });

  it('maps destination IDs to resolved URLs', () => {
    const result = getDestinationUrls(destinations, { strava: '12345' });
    expect(result).toEqual({ strava: 'https://strava.com/activities/12345' });
  });

  it('omits destinations with no template', () => {
    const result = getDestinationUrls(destinations, { notemplate: '1', strava: '2' });
    expect(result).not.toHaveProperty('notemplate');
    expect(result).toHaveProperty('strava');
  });

  it('handles multiple destinations', () => {
    const result = getDestinationUrls(destinations, { strava: 'abc', unknown: 'xyz' });
    expect(result).toEqual({ strava: 'https://strava.com/activities/abc' });
  });
});

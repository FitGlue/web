import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShowcaseMeta } from '../useShowcaseMeta';

function metaContent(nameOrProp: string, isProp = false): string | null {
  const attr = isProp ? 'property' : 'name';
  return document
    .querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProp}"]`)
    ?.getAttribute('content') ?? null;
}

beforeEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('useShowcaseMeta', () => {
  it('does nothing when meta is null', () => {
    renderHook(() => useShowcaseMeta(null));
    expect(document.title).toBe('');
  });

  it('sets the activity title with owner name', () => {
    renderHook(() => useShowcaseMeta({
      type: 'activity',
      title: 'Morning Run',
      ownerName: 'Jane',
      emoji: '🏃',
      url: 'https://fitglue.tech/@jane/abc',
    }));
    expect(document.title).toBe('Morning Run · Jane · FitGlue');
    expect(metaContent('og:title', true)).toBe('Morning Run · Jane · FitGlue');
  });

  it('sets the profile title', () => {
    renderHook(() => useShowcaseMeta({
      type: 'profile',
      displayName: 'Jane Doe',
      url: 'https://fitglue.tech/@jane',
    }));
    expect(document.title).toBe('Jane Doe · FitGlue');
  });

  describe('roundup', () => {
    it('sets a title-cased period title with owner name', () => {
      renderHook(() => useShowcaseMeta({
        type: 'roundup',
        periodLabel: 'Week 24 · 2025',
        ownerName: 'Jane',
        url: 'https://fitglue.tech/@jane/roundup/week-24-2025',
      }));
      expect(document.title).toBe('Week 24 · 2025 Roundup · Jane · FitGlue');
      expect(metaContent('og:title', true)).toBe('Week 24 · 2025 Roundup · Jane · FitGlue');
      expect(metaContent('og:type', true)).toBe('article');
    });

    it('omits the owner segment when no name is known', () => {
      renderHook(() => useShowcaseMeta({
        type: 'roundup',
        periodLabel: 'June 2025',
        url: 'https://fitglue.tech/@jane/roundup/month-6-2025',
      }));
      expect(document.title).toBe('June 2025 Roundup · FitGlue');
    });

    it('prefers the AI summary for the description', () => {
      renderHook(() => useShowcaseMeta({
        type: 'roundup',
        periodLabel: '2025',
        ownerName: 'Jane',
        aiSummary: 'A huge year of climbing and running.',
        url: 'https://fitglue.tech/@jane/roundup/year-2025',
      }));
      expect(metaContent('description')).toBe('A huge year of climbing and running.');
      expect(metaContent('og:description', true)).toBe('A huge year of climbing and running.');
    });

    it('falls back to a generated description when there is no AI summary', () => {
      renderHook(() => useShowcaseMeta({
        type: 'roundup',
        periodLabel: 'June 2025',
        ownerName: 'Jane',
        url: 'https://fitglue.tech/@jane/roundup/month-6-2025',
      }));
      expect(metaContent('description')).toBe("Jane's June 2025 in sport on FitGlue.");
    });
  });
});

import publicClient from '../../shared/api/public-client';

/**
 * A public showcase surface that can be view-tracked. The server resolves these
 * into de-duplicated counters; see `pkg/domain/showcaseview` on the backend.
 */
export type ViewTarget =
  | { kind: 'activity'; id: string }
  | { kind: 'profile'; slug: string }
  | { kind: 'roundup'; slug: string; periodKey: string };

function sessionKey(target: ViewTarget): string {
  switch (target.kind) {
    case 'activity':
      return `fg_view_activity_${target.id}`;
    case 'profile':
      return `fg_view_profile_${target.slug}`;
    case 'roundup':
      return `fg_view_roundup_${target.slug}_${target.periodKey}`;
  }
}

/** alreadyViewedThisSession returns true (and marks) if this target was already
 * beaconed in this browser session. Debouncing here stops refreshes from
 * inflating total views; the server's daily-salted hash handles cross-session
 * unique-visitor de-duplication. */
function alreadyViewedThisSession(target: ViewTarget): boolean {
  try {
    if (typeof sessionStorage === 'undefined') return false;
    const key = sessionKey(target);
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, '1');
    return false;
  } catch {
    // Private mode / disabled storage — proceed without debounce.
    return false;
  }
}

/**
 * Fire a fire-and-forget view beacon for a showcase surface. Never throws and
 * never blocks rendering — tracking must not disrupt the page. Callers should
 * skip this for the logged-in owner so their own visits aren't counted.
 */
export async function recordShowcaseView(target: ViewTarget): Promise<void> {
  if (alreadyViewedThisSession(target)) return;

  try {
    switch (target.kind) {
      case 'activity':
        await publicClient.POST('/showcase/{id}/view', { params: { path: { id: target.id } } });
        break;
      case 'profile':
        await publicClient.POST('/showcase/profile/{slug}/view', { params: { path: { slug: target.slug } } });
        break;
      case 'roundup':
        await publicClient.POST('/showcase/{slug}/roundup/{periodKey}/view', {
          params: { path: { slug: target.slug, periodKey: target.periodKey } },
        });
        break;
    }
  } catch {
    // Fire-and-forget: swallow all errors.
  }
}

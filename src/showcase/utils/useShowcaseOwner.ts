import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import client from '../../shared/api/client';
import { initFirebase } from '../../shared/firebase';

export interface ShowcaseOwnership {
  /** True when the logged-in user owns the showcase surface for `ownerSlug`. */
  isOwner: boolean;
  /** True once ownership has been determined (auth + profile check settled).
   * Callers should wait for this before counting a view, so the owner's own
   * visits are never recorded. */
  resolved: boolean;
}

/**
 * Determines whether the current user owns the profile identified by `ownerSlug`,
 * by comparing it to their own showcase-management profile slug. Resolves to
 * not-owner for anonymous visitors and when Firebase is unavailable.
 */
export function useShowcaseOwner(ownerSlug?: string): ShowcaseOwnership {
  const [state, setState] = useState<ShowcaseOwnership>({ isOwner: false, resolved: false });

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    const settle = (isOwner: boolean) => {
      if (!cancelled) setState({ isOwner, resolved: true });
    };

    if (!ownerSlug) {
      settle(false);
      return;
    }

    setState({ isOwner: false, resolved: false });

    (async () => {
      const fb = await initFirebase();
      if (!fb) {
        settle(false);
        return;
      }
      unsubscribe = onAuthStateChanged(fb.auth, async (user) => {
        if (!user) {
          settle(false);
          return;
        }
        try {
          const { data } = await client.GET('/users/me/showcase-management/profile');
          const mySlug = (data as { profile?: { slug?: string } | null })?.profile?.slug;
          settle(!!mySlug && mySlug === ownerSlug);
        } catch {
          settle(false);
        }
      });
    })();

    return () => { cancelled = true; unsubscribe?.(); };
  }, [ownerSlug]);

  return state;
}

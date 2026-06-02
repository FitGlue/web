import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { client } from '../../shared/api/client';

// Module-level atom so the slug is fetched once per session across all consumers.
const showcaseSlugAtom = atom<string | null>(null);
const showcaseSlugFetchedAtom = atom<boolean>(false);

/**
 * Returns the authenticated user's showcase profile slug, fetching it once
 * per session. Returns null while loading or if the user has no showcase profile.
 */
export function useShowcaseSlug(): string | null {
    const [slug, setSlug] = useAtom(showcaseSlugAtom);
    const [fetched, setFetched] = useAtom(showcaseSlugFetchedAtom);

    useEffect(() => {
        if (fetched) return;
        setFetched(true);
        client.GET('/users/me/showcase-management/profile')
            .then(({ data }) => {
                const profile = (data as { profile?: { slug?: string } | null })?.profile;
                setSlug(profile?.slug ?? null);
            })
            .catch(() => setSlug(null));
    }, [fetched, setFetched, setSlug]);

    return slug;
}

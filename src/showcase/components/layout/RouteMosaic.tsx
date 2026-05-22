import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];

interface Props {
  entries: ShowcaseProfileEntry[];
}

export default function RouteMosaic({ entries }: Props): React.ReactElement | null {
  const withPhotos = entries.filter((e) => e.routeThumbnailUrl);
  if (withPhotos.length < 3) return null;

  const show = withPhotos.slice(0, 10);

  return (
    <div className="route-mosaic">
      {show.map((e, i) => (
        <a
          key={i}
          href={`/showcase/activity/${e.showcaseId}`}
          className="route-mosaic__item"
          title={e.title ?? 'Activity'}
        >
          <img
            src={e.routeThumbnailUrl!}
            alt={e.title ?? 'Route map'}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

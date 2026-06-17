import { useEffect } from 'react';

function setMetaTag(nameOrProp: string, content: string, isProp = false) {
  const attr = isProp ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setEmojiCfavicon(emoji: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

interface ActivityMeta {
  type: 'activity';
  title: string;
  ownerName?: string;
  emoji: string;
  /** User-uploaded photo — highest priority */
  photoUrl?: string;
  /** AI-generated banner — second priority */
  bannerUrl?: string;
  /** User-written description — highest priority */
  description?: string;
  /** AI summary — second priority */
  aiSummary?: string;
  url: string;
}

interface ProfileMeta {
  type: 'profile';
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  url: string;
}

interface RoundupMeta {
  type: 'roundup';
  /** Human period label, e.g. "Week 24 · 2025" or "June 2025". */
  periodLabel: string;
  ownerName?: string;
  avatarUrl?: string;
  /** AI-written recap — preferred description. */
  aiSummary?: string;
  url: string;
}

type ShowcaseMeta = ActivityMeta | ProfileMeta | RoundupMeta;

export function useShowcaseMeta(meta: ShowcaseMeta | null) {
  useEffect(() => {
    if (!meta) return;

    const siteName = 'FitGlue';

    if (meta.type === 'activity') {
      const pageTitle = meta.ownerName
        ? `${meta.title} · ${meta.ownerName} · ${siteName}`
        : `${meta.title} · ${siteName}`;
      document.title = pageTitle;

      const ogImage = meta.photoUrl || meta.bannerUrl || '';
      const ogDesc = (meta.description || meta.aiSummary || `A workout shared on ${siteName}.`).slice(0, 200);

      setMetaTag('description', ogDesc);
      setMetaTag('og:title', pageTitle, true);
      setMetaTag('og:description', ogDesc, true);
      setMetaTag('og:url', meta.url, true);
      setMetaTag('og:type', 'article', true);
      setMetaTag('og:site_name', siteName, true);
      if (ogImage) setMetaTag('og:image', ogImage, true);

      setMetaTag('twitter:card', ogImage ? 'summary_large_image' : 'summary');
      setMetaTag('twitter:title', pageTitle);
      if (ogImage) setMetaTag('twitter:image', ogImage);
      setMetaTag('twitter:description', ogDesc);

      setEmojiCfavicon(meta.emoji);
    } else if (meta.type === 'profile') {
      const pageTitle = `${meta.displayName} · ${siteName}`;
      document.title = pageTitle;

      const ogDesc = meta.bio || `${meta.displayName}'s fitness profile on ${siteName}.`;
      const ogImage = meta.avatarUrl || '';

      setMetaTag('description', ogDesc);
      setMetaTag('og:title', pageTitle, true);
      setMetaTag('og:description', ogDesc, true);
      setMetaTag('og:url', meta.url, true);
      setMetaTag('og:type', 'profile', true);
      setMetaTag('og:site_name', siteName, true);
      if (ogImage) setMetaTag('og:image', ogImage, true);

      setMetaTag('twitter:card', ogImage ? 'summary' : 'summary');
      setMetaTag('twitter:title', pageTitle);
      setMetaTag('twitter:description', ogDesc);
      if (ogImage) setMetaTag('twitter:image', ogImage);

      setEmojiCfavicon('🏅');
    } else {
      const pageTitle = meta.ownerName
        ? `${meta.periodLabel} Roundup · ${meta.ownerName} · ${siteName}`
        : `${meta.periodLabel} Roundup · ${siteName}`;
      document.title = pageTitle;

      const owner = meta.ownerName ?? 'An athlete';
      const ogDesc = (meta.aiSummary || `${owner}'s ${meta.periodLabel} in sport on ${siteName}.`).slice(0, 200);
      const ogImage = meta.avatarUrl || '';

      setMetaTag('description', ogDesc);
      setMetaTag('og:title', pageTitle, true);
      setMetaTag('og:description', ogDesc, true);
      setMetaTag('og:url', meta.url, true);
      setMetaTag('og:type', 'article', true);
      setMetaTag('og:site_name', siteName, true);
      if (ogImage) setMetaTag('og:image', ogImage, true);

      setMetaTag('twitter:card', ogImage ? 'summary' : 'summary');
      setMetaTag('twitter:title', pageTitle);
      setMetaTag('twitter:description', ogDesc);
      if (ogImage) setMetaTag('twitter:image', ogImage);

      setEmojiCfavicon('📊');
    }
  }, [meta]);
}

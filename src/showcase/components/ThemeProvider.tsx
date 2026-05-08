/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import type { components } from '../../shared/api/schema-public';

type ShowcaseTheme = components['schemas']['ShowcaseTheme'];

interface Props {
  theme: ShowcaseTheme | undefined;
}

export const ThemeProvider: React.FC<Props> = ({ theme }) => {
  useEffect(() => {
    if (!theme) return;
    const page = document.querySelector('.showcase-page') as HTMLElement | null;
    if (!page) return;

    if (theme.themeId && theme.themeId !== 'default') {
      page.setAttribute('data-theme', theme.themeId);
    }
    if (theme.cardStyle && theme.cardStyle !== 'glass') {
      page.setAttribute('data-card-style', theme.cardStyle);
    }
    if (theme.customAccentColor) {
      page.style.setProperty('--sc-accent', theme.customAccentColor);
    }

    const existing = document.getElementById('theme-overrides');
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = 'theme-overrides';
    style.textContent = [
      '.showcase-title { background: linear-gradient(135deg, var(--sc-accent) 0%, var(--sc-accent-alt) 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; -webkit-text-fill-color: transparent !important; }',
      '.loading-logo-fit { background: linear-gradient(135deg, var(--sc-accent) 0%, color-mix(in srgb, var(--sc-accent) 70%, white) 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; }',
      '.loading-logo-glue { background: linear-gradient(135deg, var(--sc-accent-alt) 0%, color-mix(in srgb, var(--sc-accent-alt) 70%, white) 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; }',
      '.fitglue-logo .fit { background: linear-gradient(135deg, var(--sc-accent) 0%, color-mix(in srgb, var(--sc-accent) 70%, white) 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; }',
      '.fitglue-logo .glue { background: linear-gradient(135deg, var(--sc-accent-alt) 0%, color-mix(in srgb, var(--sc-accent-alt) 70%, white) 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; }',
      '.profile-display-name { background: linear-gradient(135deg, var(--sc-accent) 0%, var(--sc-accent-alt) 50%, color-mix(in srgb, var(--sc-accent-alt) 70%, white) 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; }',
      '.profile-avatar-wrapper { border-color: color-mix(in srgb, var(--sc-accent) 40%, transparent) !important; }',
      '.load-more-btn { background: linear-gradient(135deg, color-mix(in srgb, var(--sc-accent) 15%, transparent), color-mix(in srgb, var(--sc-accent-alt) 15%, transparent)) !important; border-color: color-mix(in srgb, var(--sc-accent) 30%, transparent) !important; }',
      '.showcase-cta::before { background: linear-gradient(135deg, color-mix(in srgb, var(--sc-accent) 30%, transparent), color-mix(in srgb, var(--sc-accent-alt) 30%, transparent)) !important; }',
      '.btn-gradient { background: linear-gradient(135deg, var(--sc-accent) 0%, var(--sc-accent-alt) 100%) !important; }',
    ].join('\n');
    document.head.appendChild(style);

    return () => {
      document.getElementById('theme-overrides')?.remove();
    };
  }, [theme]);

  return null;
};

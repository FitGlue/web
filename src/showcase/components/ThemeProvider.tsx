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

  useEffect(() => {
    const animId = theme?.animationId ?? 'particles';
    if (animId === 'none') return;

    const canvas = document.getElementById('showcase-particles') as HTMLCanvasElement | null;
    if (!canvas || !canvas.parentElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    let raf: number;

    type Dot = { x: number; y: number; vx: number; vy: number; r: number };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      dots = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0) dot.x = w;
        if (dot.x > w) dot.x = 0;
        if (dot.y < 0) dot.y = h;
        if (dot.y > h) dot.y = 0;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.12 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [theme?.animationId]);

  return null;
};

import React from 'react';

interface Props {
  type: 'profile' | 'activity' | 'page';
}

const COPY = {
  profile: {
    heading: "No showcase here.",
    body: "This athlete hasn't set up their FitGlue showcase yet — or the link may have changed. FitGlue automatically tracks, enriches, and shares every workout you do.",
    label: "PROFILE NOT FOUND",
  },
  activity: {
    heading: "Gone dark.",
    body: "This activity showcase doesn't exist or has been removed. FitGlue creates beautiful, shareable pages for every workout — automatically.",
    label: "ACTIVITY NOT FOUND",
  },
  page: {
    heading: "Lost the thread.",
    body: "This page doesn't exist. Either way, let's get you somewhere useful.",
    label: "PAGE NOT FOUND",
  },
};

export default function ShowcaseNotFound({ type }: Props): React.ReactElement {
  const { heading, body, label } = COPY[type];

  return (
    <div className="showcase-page">
      <div className="showcase-page-bg" aria-hidden="true" />
      <div className="showcase-page-wrap">

        <nav className="showcase-pubbar">
          <a className="showcase-pubbar__brand" href="/">
            <span className="showcase-pubbar__brand-icon" aria-hidden="true">FG</span>
            <span className="showcase-pubbar__brand-wordmark" aria-hidden="true">FITGLUE</span>
          </a>
          <div className="showcase-pubbar__actions">
            <a
              href="/"
              style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-cyan)', textDecoration: 'none' }}
            >
              TRY FITGLUE →
            </a>
          </div>
        </nav>

        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)' }}>

          <div style={{
            fontFamily: 'var(--fg-font-display)',
            fontSize: 'clamp(7rem, 20vw, 18rem)',
            lineHeight: 0.85,
            letterSpacing: '-0.06em',
            textTransform: 'uppercase',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            userSelect: 'none',
          }}>
            404
          </div>

          <h1 style={{
            fontFamily: 'var(--fg-font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            letterSpacing: '-0.025em',
            textTransform: 'uppercase',
            color: 'var(--fg-paper)',
            margin: '16px 0 20px',
            lineHeight: 1,
          }}>
            {heading}
          </h1>

          <p style={{
            fontFamily: 'var(--fg-font-body)',
            fontSize: '1.0625rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            maxWidth: '460px',
            marginBottom: '40px',
          }}>
            {body}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: 'var(--gradient-primary)',
                color: 'var(--fg-ink)',
                fontFamily: 'var(--fg-font-display)',
                fontSize: '0.875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              → START YOUR SHOWCASE
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.history.back(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: 'transparent',
                color: 'var(--fg-paper)',
                boxShadow: 'inset 0 0 0 1.5px var(--fg-paper)',
                fontFamily: 'var(--fg-font-display)',
                fontSize: '0.875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              ← BACK
            </a>
          </div>

          <p style={{
            fontFamily: 'var(--fg-font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-text-subtle)',
            textTransform: 'uppercase',
            marginTop: '48px',
          }}>
            HTTP 404 · {label}
          </p>

        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="nf-scene">
      <div className="nf__big">404</div>
      <h1 className="nf__h">
        Lost the{' '}
        <span className="nf__h-gr">thread.</span>
      </h1>
      <p className="nf__sub">
        The page you wanted isn&apos;t here. Either it was glued somewhere else, the URL has a
        typo, or you&apos;re chasing a link that aged out. Either way — back to dashboard, or
        pick a familiar room.
      </p>
      <div className="nf__cta">
        <Link to="/" className="fg-button">→ DASHBOARD</Link>
        <a href="/" className="fg-button fg-button--ghost">← MARKETING SITE</a>
      </div>
      <div className="nf__hint">
        REPORT THIS @ /APP/HELP/FEEDBACK · WE&apos;LL LOOK AT IT
      </div>
    </div>
  );
};

export default NotFoundPage;

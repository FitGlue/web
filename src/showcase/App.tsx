import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import ShowcaseNotFound from './components/ShowcaseNotFound';
import ShowcaseActivityPage from './pages/ShowcaseActivityPage';
import ShowcaseProfilePage from './pages/ShowcaseProfilePage';
// Roundup is WIP — keep lazy so its unresolved schema types don't block the main bundle
const ShowcaseRoundupPage = React.lazy(() => import('./pages/ShowcaseRoundupPage'));

const ROUNDUP_PERIOD_RE = /^(week|month|year)-/;

function ShowcaseSlugRouter() {
  const { id } = useParams<{ id: string }>();
  if (id && ROUNDUP_PERIOD_RE.test(id)) return <ShowcaseRoundupPage />;
  return <ShowcaseActivityPage />;
}

const Fallback: React.FC = () => (
  <div className="showcase-page">
    <div className="showcase-loading">
      <div className="loading-bg-gradient" />
      <div className="loading-content">
        <div className="loading-logo">
          <span className="loading-logo-fit">Fit</span>
          <span className="loading-logo-glue">Glue</span>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/:slug/:id" element={<Suspense fallback={<Fallback />}><ShowcaseSlugRouter /></Suspense>} />
      <Route path="/:slug" element={<ShowcaseProfilePage />} />
      <Route path="*" element={<ShowcaseNotFound type="page" />} />
    </Routes>
  </BrowserRouter>
);

export default App;

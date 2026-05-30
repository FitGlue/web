import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import publicClient from '../shared/api/public-client';
import ShowcaseNotFound from './components/ShowcaseNotFound';
import ShowcaseActivityPage from './pages/ShowcaseActivityPage';
import ShowcaseProfilePage from './pages/ShowcaseProfilePage';
import ShowcaseRoundupPage from './pages/ShowcaseRoundupPage';

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

function LegacyProfileRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/@${slug}`} replace />;
}

function LegacyActivityRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/', { replace: true }); return; }
    publicClient.GET('/showcase/{id}', { params: { path: { id } } })
      .then(({ data }) => {
        if (data?.ownerProfileSlug) {
          navigate(`/@${data.ownerProfileSlug}/${id}`, { replace: true });
        } else {
          setShowActivity(true);
        }
      })
      .catch(() => setShowActivity(true));
  }, [id, navigate]);

  if (showActivity) return <ShowcaseActivityPage />;
  return <Fallback />;
}

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/:slug/:id" element={<ShowcaseSlugRouter />} />
      <Route path="/:slug" element={<ShowcaseProfilePage />} />
      <Route path="/showcase/profile/:slug" element={<LegacyProfileRedirect />} />
      <Route path="/showcase/activity/:id" element={<LegacyActivityRedirect />} />
      <Route path="*" element={<ShowcaseNotFound type="page" />} />
    </Routes>
  </BrowserRouter>
);

export default App;

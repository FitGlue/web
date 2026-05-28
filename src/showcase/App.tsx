import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import publicClient from '../shared/api/public-client';

const ShowcaseActivityPage = React.lazy(() => import('./pages/ShowcaseActivityPage'));
const ShowcaseProfilePage = React.lazy(() => import('./pages/ShowcaseProfilePage'));

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
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/@:slug/:id" element={<ShowcaseActivityPage />} />
        <Route path="/@:slug" element={<ShowcaseProfilePage />} />
        <Route path="/showcase/profile/:slug" element={<LegacyProfileRedirect />} />
        <Route path="/showcase/activity/:id" element={<LegacyActivityRedirect />} />
        <Route path="*" element={
          <div className="showcase-page">
            <div className="showcase-error" style={{ display: 'block' }}>
              <div className="error-icon">🔍</div>
              <h1>Page Not Found</h1>
              <p className="error-subtitle">This showcase page doesn&apos;t exist.</p>
              <a href="/" className="btn btn-primary">Explore FitGlue</a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;

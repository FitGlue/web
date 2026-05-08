import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/showcase/activity/:id" element={<ShowcaseActivityPage />} />
        <Route path="/showcase/profile/:slug" element={<ShowcaseProfilePage />} />
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

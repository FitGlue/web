import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../shared/firebase';
import { userAtom, authLoadingAtom } from './state/authState';
import DashboardPage from './pages/DashboardPage';
import PendingInputsPage from './pages/PendingInputsPage';
import { useFCM } from './hooks/useFCM';

const App: React.FC = () => {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(authLoadingAtom);

  useFCM();

  useEffect(() => {
    const setup = async () => {
      const fb = await initFirebase();
      if (!fb) {
        setLoading(false);
        return;
      }

      onAuthStateChanged(fb.auth, (u) => {
        setUser(u);
        setLoading(false);

        if (!u && !window.location.pathname.includes('login')) {
          // If not logged in, redirect to static login page
          window.location.href = '/login';
        }
      });
    };

    setup();
  }, [setUser, setLoading]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <Router basename="/app">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/inputs" element={<PendingInputsPage />} />
      </Routes>
    </Router>
  );
};

export default App;

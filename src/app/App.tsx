import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PendingInputsPage from './pages/PendingInputsPage';

const App: React.FC = () => {
  return (
    <Router basename="/app">
      <Routes>
        <Route path="/" element={<Navigate to="/inputs" replace />} />
        <Route path="/inputs" element={<PendingInputsPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;

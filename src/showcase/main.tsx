import React from 'react';
import ReactDOM from 'react-dom/client';
import './tokens.css';
import './showcase.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('showcase-root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

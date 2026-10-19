import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import Leaderboard from './pages/Leaderboard';
import Game from './pages/Game';
import AuthProvider from './context/AuthProvider';
import { MOCK_USERS } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* TEMPORARY AuthProvider: replace with the real one when login is done */}
    <AuthProvider initialUser={MOCK_USERS.player}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

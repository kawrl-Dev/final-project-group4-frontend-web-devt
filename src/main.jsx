import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import App from './App';
import Game from './pages/Game'
import Register from './pages/Register'
import Load from './pages/Load'
import Login from './pages/Login';
import Menu from './pages/Menu';
import Skip from './components/Skip';
import Leaderboard from './pages/Leaderboard'
import AdminUsers from './pages/AdminUsers'
import AuthProvider from './context/AuthProvider';
import { applySettings } from './lib/settings';

applySettings();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Skip><App /></Skip>} />
          <Route path="/game" element={<RequireAuth><Game/></RequireAuth>} />
          <Route path="/register" element={<Skip><Register /></Skip>} />
          <Route path="/login" element={<Skip><Login /></Skip>} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/load" element={<Load />} />
          <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
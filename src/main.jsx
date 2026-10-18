import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import Register from './pages/Register'
import Leaderboard from './pages/Leaderboard';
import AuthProvider from './context/AuthProvider';
import { MOCK_USERS } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider initialUser={MOCK_USERS.player}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path='/leaderboard' element={<Leaderboard/>}/>
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

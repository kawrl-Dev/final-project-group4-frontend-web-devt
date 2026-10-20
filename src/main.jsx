import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import Register from './pages/Register'
import Login from './pages/Login';
import Menu from './pages/Menu';
import Skip from './components/Skip';
import Leaderboard from './pages/Leaderboard';
import AuthProvider from './context/AuthProvider';
import { MOCK_USERS } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider initialUser={MOCK_USERS.player}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Skip><App /></Skip>} />
          <Route path="/register" element={<Skip><Register /></Skip>} />
          <Route path="/login" element={<Skip><Login /></Skip>} />
          <Route path="/menu" element={<Menu />} />
          <Route path='/leaderboard' element={<Leaderboard/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

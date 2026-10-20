import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import Register from './pages/Register';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Skip from './components/Skip';
import Load from './pages/Load';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Skip><App /></Skip>} />
        <Route path="/register" element={<Skip><Register /></Skip>} />
        <Route path="/login" element={<Skip><Login /></Skip>} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/load" element={<Load />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
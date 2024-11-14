import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Game from './Game';
import Menu from './Menu';
import Matchmaking from './Matchmaking';
import OAuthCallback from './OAuthCallback';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log("No token found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matchmaking"
        element={
          <ProtectedRoute>
            <Matchmaking />
          </ProtectedRoute>
        }
      />
      <Route path="/register42" element={<OAuthCallback />} /> {/* OAuth callback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Game from './Game';
import Menu from './Menu';
import Matchmaking from './Matchmaking';

const ProtectedRoute = ({ children }) => {
  
  const isAuthenticated = !!localStorage.getItem('authToken');
  console.log("Authenticated:", isAuthenticated); // Debugging output

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* Register route */}
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
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;

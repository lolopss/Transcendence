import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Game from './Game';
import Menu from './Menu';
import Matchmaking from './Matchmaking';

const ProtectedRoute = ({ children }) => {
  
  const token = localStorage.getItem('authToken');
  if (!token) {
      console.log("No token found. Redirecting to login.");
      return <Navigate to="/login" replace />;
  }
  else
  {
    console.log("token found : ", token);
  }
  const isAuthenticated = !!localStorage.getItem('authToken');
  console.log("Authenticated:", isAuthenticated); // Debugging output

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const validateToken = async () => { // To check if the token is still valid when reloading the page
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
        const response = await fetch("/api/validate-token/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            localStorage.removeItem("authToken");
            window.location.href = "/login";  // Redirect to login
        }
    } catch (error) {
        console.error("Token validation error:", error);
        localStorage.removeItem("authToken");
        window.location.href = "/login";
    }
  };

  useEffect(() => {
      validateToken();
  }, []);
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

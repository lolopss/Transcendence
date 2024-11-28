import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Game from './Game';
import AIGame from './AIGame';
import Menu from './Menu';
import Matchmaking from './Matchmaking';
import OAuthCallback from './OAuthCallback';
import Verify2FA from './Verify2FA';
import EditAccount from './EditAccount.jsx';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log("No token found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }
  return children;
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
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-2fa" element={<Verify2FA />} />
      <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="/ai-game" element={<ProtectedRoute><AIGame /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
      <Route path="/edit-account" element={<EditAccount />} />
      <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
      <Route path="/register42" element={<OAuthCallback />} /> {/* OAuth callback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;

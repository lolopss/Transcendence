import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Game from './Game';
import TournamentGame from './TournamentGame.jsx';
import Multiplayer from './Multiplayer';
import AIGame from './AIGame';
import Menu from './Menu';
import GameMenu from './GameMenu';
import Matchmaking from './Matchmaking';
import OAuthCallback from './OAuthCallback';
import Verify2FA from './Verify2FA';
import EditAccount from './EditAccount.jsx';
import Profile from './Profile';
import FriendProfile from './FriendProfile';
import FriendList from './FriendList';  // Import FriendList
import Tournament from './Tournament';
import './FriendList.css';  // Ensure the CSS file is imported

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log("No token found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const [showFriendList, setShowFriendList] = useState(false);

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

  useEffect(() => {
    // Update the showFriendList state based on the current route
    if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/register42') {
      setShowFriendList(true);
    } else {
      setShowFriendList(false);
    }
  }, [location.pathname]);

  return (
    <>
      {showFriendList && <FriendList />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/register" element={<RegisterPage />} /> */}
        <Route path="/verify-2fa" element={<Verify2FA />} />
        <Route path="/game-menu" element={<ProtectedRoute><GameMenu /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/ai-game" element={<ProtectedRoute><AIGame /></ProtectedRoute>} />
        <Route path="/multiplayer" element={<ProtectedRoute><Multiplayer /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/edit-account" element={<ProtectedRoute><EditAccount /></ProtectedRoute>} />
        <Route path="/register42" element={<OAuthCallback />} /> {/* OAuth callback route */}
        <Route path="/profile/:username" element={<ProtectedRoute><FriendProfile /></ProtectedRoute>} />
        <Route path="/profile/" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

//   return (
  //     <>
  //       {showFriendList && <FriendList />}
  //       <Routes>
  //         <Route path="/login" element={<LoginPage />} />
  //         {/* <Route path="/register" element={<RegisterPage />} /> */}
//         <Route path="/verify-2fa" element={<Verify2FA />} />
//         <Route path="/game-menu" element={<GameMenu />} />
//         <Route path="/game" element={<Game />} />
//         <Route path="/ai-game" element={<AIGame />} />
//         <Route path="/multiplayer" element={<Multiplayer />} />
//         <Route path="/menu" element={<Menu />} />
//         <Route path="/edit-account" element={<EditAccount />} />
//         {/* <Route path="/matchmaking" element={<Matchmaking />} /> */}
//         <Route path="/register42" element={<OAuthCallback />} /> {/* OAuth callback route */}
//         <Route path="/profile/:username" element={<FriendProfile />} />
//         <Route path="/profile/" element={<Profile />} />
//         <Route path="/tournament" element={<Tournament />} />
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     </>
//   );
// };

export default App;
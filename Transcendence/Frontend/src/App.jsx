<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
=======
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Game from './Game';
import AIGame from './AIGame';
import Menu from './Menu';
import Matchmaking from './Matchmaking';
import OAuthCallback from './OAuthCallback';
import Verify2FA from './Verify2FA';
import EditAccount from './EditAccount.jsx';
import Profile from './Profile';
import FriendProfile from './FriendProfile';
import FriendList from './FriendList';  // Import FriendList
import './FriendList.css';  // Ensure the CSS file is imported
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<<<<<<< Updated upstream
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => {
          if (count === 0)
          {
            return count + 1;
          } else
          {
            return count * 50;
          }
          })}>
          Number is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
=======
      {showFriendList && <FriendList />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/edit-account" element={<EditAccount />} />
        <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
        <Route path="/register42" element={<OAuthCallback />} /> {/* OAuth callback route */}
        <Route path="/profile/:username" element={<ProtectedRoute><FriendProfile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};
export default App;
>>>>>>> Stashed changes

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [clientId, setClientId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/menu');
    }

    // Fetch client ID for OAuth from Django
    const fetchClientId = async () => {
      try {
        const response = await fetch('/api/client-id/');
        const data = await response.json();
        setClientId(data.client_id);
      } catch (error) {
        console.error("Failed to load client ID:", error);
      }
    };

    fetchClientId();
  }, [navigate]);

  const handleLogin = async () => {
    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.requires_2fa) {
                localStorage.setItem('userId', data.user_id);
                localStorage.setItem('isVerifying2FA', 'true'); // Set flag
                navigate('/verify-2fa');
            } else {
                localStorage.setItem('authToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                navigate('/menu');
            }
        } else {
            const errorData = await response.json();
            setError(errorData.error);
        }
    } catch (error) {
        console.error('Error during login:', error);
        setError('Login failed');
    }
};

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  const handleOAuthLogin = () => {
    if (!clientId) {
      setError('Unable to load OAuth client ID.');
      return;
    }

    const redirectUri = encodeURIComponent('https://localhost:8000/register42');  // Ensure this matches the backend
    const state = encodeURIComponent(Math.random().toString(36).substring(2));
    const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public&state=${state}`;

    localStorage.setItem('oauthState', state);  // Save the state to validate on callback
    window.location.href = oauthUrl;  // Redirect to the OAuth provider
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleLogin}>Login</button>

      <button onClick={handleOAuthLogin}>Login with 42</button>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to /menu if already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/menu');
    }
  }, [navigate]);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Redirect to the main page if already logged in
      navigate('/menu');
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        console.log('Login successful!');
        navigate('/menu');
      } else {
        setError(data.error || 'An error occurred during login.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred during login.');
    }
  };

  // Function to handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown} // Add onKeyDown to trigger Enter
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown} // Add onKeyDown to trigger Enter
      />
      <button onClick={handleLogin}>Login</button>

      {/* Link to the registration page */}
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');  // Changed to `identifier` to accept username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
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
        body: JSON.stringify({ identifier, password }),  // Use `identifier`
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.access);
        navigate('/menu');
      } else {
        setError(data.error || 'An error occurred during login.');
      }
    } catch (error) {
      setError('An error occurred during login.');
    }
  };

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
        placeholder="Username or Email"  // Updated placeholder
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}  // Updated to `setIdentifier`
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

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;

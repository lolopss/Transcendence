import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(null);
  const [csrftoken, setCsrfToken] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    // Get CSRF token from cookies when component mounts
    const getCookie = (name) => {
      const cookieValue = `; ${document.cookie}`;
      const parts = cookieValue.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = getCookie('csrftoken');
    setCsrfToken(token);
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken, // Ensure this is set
        },
        body: JSON.stringify({
          username,
          email,
          password1,
          password2,
          nickname,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful!');
        navigate('/login'); // Ensure `navigate` is defined or imported if using react-router
      } else {
        console.error(data);
        setError(data.error || 'An error occurred during registration.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError('An error occurred during registration.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password1}
        onChange={(e) => setPassword1(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
      />
      <input
        type="text"
        placeholder="Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegistrationPage;

import React, { useState } from 'react';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState(''); // Changed to password1
  const [password2, setPassword2] = useState(''); // Added password2
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password1, // Use password1 here
          password2, // Use password2 here
          nickname,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful!');
        navigate('/login');
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
        onChange={(e) => setPassword1(e.target.value)} // Update password1
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)} // Update password2
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

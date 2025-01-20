import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'

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

    let redirectUri;
    if (window.location.hostname === 'localhost') {
        redirectUri = encodeURIComponent('https://localhost:8000/register42');
    } else {
        redirectUri = encodeURIComponent('https://10.12.7.5:8000/register42');
    }
    const state = encodeURIComponent(Math.random().toString(36).substring(2));
    const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public&state=${state}`;

    localStorage.setItem('oauthState', state);  // Save the state to validate on callback
    window.location.href = oauthUrl;  // Redirect to the OAuth provider
  };

  /* ------------------- Frontend ------------------- */

  const [isWrapperActive, setIsWrapperActive] = useState(false);
  const [isPopupActive, setIsPopupActive] = useState(true);

  const handleRegisterClick = ()=> {
    navigate('/register');
  }

  const handleLoginClick = ()=> {
      setIsWrapperActive(false);
  }

  const handleBtnPopupClick = ()=> {
      setIsPopupActive(true);
  }

  const handleIconCloseClick = ()=> {
      setIsPopupActive(false);
  }

  return (
      <div className="body">
        <header className='loginHeader'>
            <h2 className="logo">PONG</h2>
            <nav className="navigation">
                <button className="btnLogin-popup" onClick={handleBtnPopupClick}>Login</button>
            </nav>
        </header>

        <div className="overlay"></div>

        {error && <p className='error'>{error}</p>}

        <div className={`wrapper ${isPopupActive ? 'active-popup' : ''} ${isWrapperActive ? 'active' : ''}`}>
            <span className="icon-close" onClick={handleIconCloseClick}>
                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </span>
            <div className="form-box login">
                <h2>Login</h2>
                <form action="#">
                    <div className="input-box">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                        </span>
                        <input type="email"
                                placeholder=' '
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required/>
                        <label>Email</label>
                    </div>
                    <div className="input-box">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>
                        </span>
                        <input type="password"
                                placeholder=' '
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required/>
                        <label>Password</label>
                    </div>
                    <button type="submit" className="btn" onClick={handleLogin}>Login<i></i></button>
                    <div className="login-42">
                        <a onClick={handleOAuthLogin}>Login with 42</a>
                    </div>
                    <div className="login-register">
                        <p>Don't have an account ? <a href='?'
                            className="register-link" onClick={handleRegisterClick}> Register</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'

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
    event.preventDefault();
    if (email.endsWith('@student.42lehavre.fr')) {
        setError('Emails from @student.42lehavre.fr are not allowed for registration.');
        return;
    }

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
            // console.log('Registration successful!');
            navigate('/login'); // Ensure `navigate` is defined or imported if using react-router
        } else {
            // console.error(data);
            setError(data.error || data.message || 'An error occurred during registration.');
        }
    } catch (error) {
        setError(error || 'An error occurred during registration.');
    }
}

  // Function to handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleRegister();
    }
  };

  /* ------------------- Frontend ------------------- */

  const [isWrapperActive, setIsWrapperActive] = useState(true);
  const [isPopupActive, setIsPopupActive] = useState(true);

  const handleLoginClick = ()=> {
      // setIsWrapperActive(false);
      navigate('/login');
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
                <button className="btnLogin-popup" onClick={handleBtnPopupClick}>Register</button>
            </nav>
        </header>

        <div className="overlay"></div>

        {error && <p className='error'>{error}</p>}

        <div className={`wrapper ${isPopupActive ? 'active-popup' : ''} ${isWrapperActive ? 'active' : ''}`}>
            <span className="icon-close" onClick={handleIconCloseClick}>
                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </span>

            <div className="form-box register">
                <h2>Registration</h2>
                <form action='#'>
                    <div className="input-box">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                        </span>
                        <input type="text"
                                placeholder=' '
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required/>
                        <label>Username</label>
                    </div>
                    <div className="input-box">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                        </span>
                        <input type="email"
                                placeholder=' '
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password1}
                                onChange={(e) => setPassword1(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required/>
                        <label>Password</label>
                    </div>
                    <div className="input-box">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>
                        </span>
                        <input type="password"
                                placeholder=' '
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required/>
                        <label>Confirm password</label>
                    </div>
                    <div className="input-box">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                        </span>
                        <input type="text"
                                placeholder=' '
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required/>
                        <label>Nickname</label>
                    </div>
                    <button type="submit" className="btn" onClick={handleRegister}>Register<i></i></button>
                    <div className="login-register">
                        <p>Already have an account ? <a
                            className="login-link" onClick={handleLoginClick}> Login</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default RegistrationPage;

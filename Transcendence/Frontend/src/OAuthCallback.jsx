import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./OAuthCallback.css"

const OAuthCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/menu');
    }

    const isVerif = localStorage.getItem('isVerifying2FA');
    if (isVerif) {
      navigate('/verify-2fa');
    }

    const processOAuthCallback = async () => {
      // Get query parameters from the URL
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');

      // Retrieve the saved state from localStorage
      const savedState = localStorage.getItem('oauthState');

      // Validate the state to prevent CSRF
      if (state !== savedState) {
        setError('State mismatch. Possible CSRF attack.');
        return;
      }

      if (code) {
        try {

          // Make a request to the backend to exchange the code for tokens
          const response = await fetch(`/api/callback?code=${code}&state=${state}`);
          const data = await response.json();

          if (response.ok) {
            if (data.requires_2fa) {
              localStorage.setItem('userId', data.user_id);
              localStorage.setItem('isVerifying2FA', 'true'); // Set flag
              navigate('/verify-2fa');
          } else {
              // Store the tokens in localStorage
              localStorage.setItem('authToken', data.access);
              localStorage.setItem('refreshToken', data.refresh);

              // Redirect to the appropriate page (default: /menu)
              navigate(data.redirect || '/menu');
          }
          } else {
            console.error('Error during token exchange:', data.error || 'An error occurred during OAuth login.');
            setError(data.error || 'An error occurred during OAuth login.');
          }
        } catch (error) {
          console.error('Error during OAuth login:', error);
          setError('Error during OAuth login.');
        }
      } else {
        console.error('No code found in the OAuth callback.');
        setError('No code found in the OAuth callback.');
      }
    };

    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="authBody">
      <div className='oAuth'>
        <h2 className='oAuthText'>Processing OAuth...</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default OAuthCallback;

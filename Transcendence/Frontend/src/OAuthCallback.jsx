import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log('OAuth callback process started.');

      // Get query parameters from the URL
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');

      console.log('Received query parameters:', { code, state });

      // Retrieve the saved state from localStorage
      const savedState = localStorage.getItem('oauthState');
      console.log('Saved state from localStorage:', savedState);

      // Validate the state to prevent CSRF
      if (state !== savedState) {
        console.error('State mismatch. Potential CSRF attack.');
        setError('State mismatch. Possible CSRF attack.');
        return;
      }

      if (code) {
        try {
          console.log('Code received, attempting to exchange it for tokens...');

          // Make a request to the backend to exchange the code for tokens
          const response = await fetch(`/api/callback?code=${code}&state=${state}`);
          const data = await response.json();

          console.log('Response from backend:', data);

          if (response.ok) {
            console.log('Token exchange successful. Storing tokens.');

            // Store the tokens in localStorage
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // Redirect to the appropriate page (default: /menu)
            console.log('Redirecting to:', data.redirect || '/menu');
            navigate(data.redirect || '/menu');
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
    <div>
      <h2>Processing OAuth...</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default OAuthCallback;

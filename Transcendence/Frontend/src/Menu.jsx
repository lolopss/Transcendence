import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GameMenu() {
    const navigate = useNavigate();
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFASecret, setTwoFASecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [showVerify2FA, setShowVerify2FA] = useState(false); // Add state to control visibility

    useEffect(() => {
        const fetch2FAStatus = async () => {
            try {
                const response = await fetch('/api/user-details/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });

                if (response.ok) {
                    const userDetails = await response.json();
                    setIs2FAEnabled(userDetails.is_2fa_enabled);
                    setTwoFASecret(userDetails.two_fa_secret);
                    setProvisioningUri(userDetails.provisioning_uri);
                } else {
                    console.error('Failed to fetch 2FA status');
                }
            } catch (error) {
                console.error('Error fetching 2FA status:', error);
            }
        };

        fetch2FAStatus();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('oauthState');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                console.error('Logout failed.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const printUserDetails = async () => {
        try {
            const response = await fetch('/api/user-details/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (response.ok) {
                const userDetails = await response.json();
                console.log('User Details:', userDetails);
            } else {
                console.error('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const toggle2FA = async () => {
        try {
            const response = await fetch('/api/toggle-2fa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIs2FAEnabled(data.is_2fa_enabled);
                setTwoFASecret(data.two_fa_secret);
                setProvisioningUri(data.provisioning_uri);
            } else {
                console.error('Failed to toggle 2FA');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
        }
    };

    return (
        <div>
            <h2>THE PONG</h2>
            <GameButton usage="Start the game" name="Start" onClick={() => navigate('/game')} />
            <GameButton usage="See the options" name="Option" />
            <GameButton usage="Quit the game" name="Quit" />
            <GameButton usage="Find a match" name="Matchmaking" onClick={() => navigate('/matchmaking')} />
            <GameButton usage="Logout from your account" name="Logout" onClick={handleLogout} />
            <GameButton usage="Print User Details" name="Print Details" onClick={printUserDetails} />
            <GameButton usage="Toggle 2FA" name={`2FA is ${is2FAEnabled ? 'Enabled' : 'Disabled'}`} onClick={toggle2FA} />
            {is2FAEnabled && (
                <div>
                    <p>2FA Secret: {twoFASecret}</p>
                    <p>Scan this QR code with Google Authenticator:</p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(provisioningUri)}&size=200x200`} alt="QR Code" />
                </div>
            )}
        </div>
    );
}

function GameButton({ usage, name, onClick }) {
    return (
        <div className="GameButton">
            <p>{usage}</p>
            <button onClick={onClick}>{name}</button>
        </div>
    );
}

export default GameMenu;

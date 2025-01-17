import React, {useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameButton from './GameButton.jsx';
import './Security.css';

const Security = () => {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFASecret, setTwoFASecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
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
                    setLanguage(userDetails.language);
                    loadTranslations(userDetails.language);
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };
        fetchUserDetails();
    }, []);

    const loadTranslations = async (language) => {
        try {
            const response = await fetch(`/api/translations/${language}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            const data = await response.json();
            setTranslations(data);
        } catch (error) {
            console.error('Error loading translations:', error);
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

    const deleteAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/delete-account/', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            if (response.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('oauthState');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                console.error('Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const anonymizeAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to anonymize your account? This action is irreversible.");
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/anonymize-account/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            if (response.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('oauthState');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                console.error('Failed to anonymize account');
            }
        } catch (error) {
            console.error('Error anonymizing account:', error);
        }
    };

    return (
        <div className='securityBody'>
            <header className='securityHeader'>
                <h2 className='securityLogo' onClick={()=>navigate('/menu')}>Pong</h2>
                <nav className='securityNav'>
                    <div className="navProfile" onClick={()=>navigate('/profile')}>{translations.profile}</div>
                    <div className="navAccount" onClick={()=>navigate('/edit-account')}>{translations.account}</div>
                    <div className="navSecurity" onClick={()=>navigate('/security')}>{translations.security}</div>
                </nav>
            </header>
            <div className="security-container">
                <GameButton usage={translations.toggle_2fa} name={`${translations.toggle_2fa} ${is2FAEnabled ? 'Enabled' : 'Disabled'}`} onClick={toggle2FA} />
                {is2FAEnabled && (
                    <div>
                        <p>{translations.scan_qr}</p>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(provisioningUri)}&size=200x200`} alt="QR Code" />
                    </div>
                )}
                <div>
                    <h3>Account</h3>
                    <GameButton usage="Edit your account" name="Edit Account" onClick={() => navigate('/edit-account')} />
                    <div className="data-privacy">
                        <h3>Data Privacy Rights</h3>
                        <p>You have the right to delete or anonymize your account. Please use the buttons below to exercise these rights.</p>
                        <GameButton usage="Anonymize your account" name="Anonymize Account" onClick={anonymizeAccount} />
                        <GameButton usage="Delete your account" name="Delete Account" onClick={deleteAccount} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
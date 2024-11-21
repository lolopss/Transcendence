import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GameMenu() {
    const navigate = useNavigate();
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFASecret, setTwoFASecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});

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

    const updateLanguage = async (newLanguage) => {
        try {
            const response = await fetch('/api/update-language/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ language: newLanguage }),
            });
            if (response.ok) {
                setLanguage(newLanguage);
                loadTranslations(newLanguage);
            } else {
                console.error('Failed to update language');
            }
        } catch (error) {
            console.error('Error updating language:', error);
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
            <h2>{translations.title}</h2>
            <GameButton usage={translations.start_game} name={translations.start_btn} onClick={() => navigate('/game')} />
            <GameButton usage={translations.see_options} name={translations.options_btn} />
            <GameButton usage={translations.quit_game} name={translations.quit_btn} />
            <GameButton usage={translations.find_match} name={translations.find_btn} onClick={() => navigate('/matchmaking')} />
            <GameButton usage={translations.logout} name={translations.logout} onClick={handleLogout} />
            <GameButton usage={translations.print_details} name={translations.print_btn} onClick={printUserDetails} />
            <GameButton usage={translations.toggle_2fa} name={`${translations.toggle_2fa} ${is2FAEnabled ? 'Enabled' : 'Disabled'}`} onClick={toggle2FA} />
            {is2FAEnabled && (
                <div>
                    <p>{translations.scan_qr}</p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(provisioningUri)}&size=200x200`} alt="QR Code" />
                </div>
            )}
            <div>
                <h3>{translations.language_preference}</h3>
                <button onClick={() => updateLanguage('en')} disabled={language === 'en'}>{translations.english}</button>
                <button onClick={() => updateLanguage('es')} disabled={language === 'es'}>{translations.spanish}</button>
                <button onClick={() => updateLanguage('fr')} disabled={language === 'fr'}>{translations.french}</button>
            </div>
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

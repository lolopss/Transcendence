import './Menu.css'

<<<<<<< Updated upstream
function GameButton(props) {
=======
function GameMenu() {
    const navigate = useNavigate();
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFASecret, setTwoFASecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [profilePicture, setProfilePicture] = useState('/media/profile_pictures/pepe.png');

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

    useEffect(() => {
        const fetchProfilePicture = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            try {
                const response = await fetch('/api/user-details/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProfilePicture(data.profile_picture); // Assuming the backend returns the profile picture URL in this field
                }
            } catch (error) {
                console.error('Error fetching profile picture:', error);
            }
        };

        fetchProfilePicture();
    }, []);

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

    const handleProfileClick = () => {
        navigate('/Profile');
    };
    

    return (
        <div>
            <h2>{translations.title}</h2>
            <GameButton usage={translations.start_game} name={translations.start_btn} onClick={() => navigate('/game')} />
            <GameButton usage={translations.start_game_ai} name={translations.start_btn} onClick={() => navigate('/ai-game')} />
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
            <div className="profile-picture" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                {profilePicture && <img src={profilePicture} alt="Profile" />}
            </div>
        </div>
    );
}

function GameButton({ usage, name, onClick }) {
>>>>>>> Stashed changes
    return (
        <div className="GameButton">
            <p>{props.usage}</p>
            <button>{props.name}</button>
        </div>
    );
}

function GameMenu() {
    return (
        <div>
            <h2>THE PONG</h2>
            <GameButton usage="start the game" name="Start"></GameButton>
            <GameButton usage="see the option" name="Option"></GameButton>
            <GameButton usage="quit the game" name="Quit"></GameButton>
        </div>
    );
}

export default GameMenu
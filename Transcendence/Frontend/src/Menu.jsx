import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GameButton from './GameButton.jsx';
import './FriendList.css';
import './Menu.css';

function Menu() {
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

    /* ------------------- Frontend ------------------- */

    const menu = useRef(null);
    const overlay = useRef(null);
    const buttonStart = useRef(null);
    const buttonOptions = useRef(null);
    const buttonProfile = useRef(null);
    const buttonLogout = useRef(null);
    const border1 = useRef(null);
    const border2 = useRef(null);
    const borderAnim = useRef(null);
    const borderAnim2 = useRef(null);
    const body = useRef(null);
    const pongTitle = useRef(null);
    const translateIcon = useRef(null);
    const [isTranslateActive, setIsTranslateActive] = useState(false);

    const applyEvent = (refBtn, backImage) => {
        if (refBtn.current) {
            refBtn.current.addEventListener('mousedown', () => {
                refBtn.current.style.transition="none";
                refBtn.current.style.border="solid 2px violet";
                refBtn.current.style.background="rgb(187, 0, 255)";
                refBtn.current.style.boxShadow="0 0 10px rgb(187, 0, 255), 0 0 50px rgb(187, 0, 255), 0 0 100px rgb(187, 0, 255)";
            })
            refBtn.current.addEventListener('mouseup', () => {
                refBtn.current.style.transition="";
                refBtn.current.style.border="";
                refBtn.current.style.background="";
                refBtn.current.style.boxShadow="";
            })
            refBtn.current.addEventListener('mouseover', () => {
                body.current.style.backgroundImage=backImage;
                body.current.style.backgroundSize="cover";
                body.current.style.background="black";
                body.current.style.boxShadow="inset 0 0 50px black,inset 0 0 100px black,inset 0 0 150px black,inset 0 0 270px black,inset 0 0 400px black";
                border1.current.style.opacity=0;
                border2.current.style.opacity=0;
                borderAnim.current.style.opacity=1;
                borderAnim.current.classList.add('border-is-animate');
                borderAnim2.current.style.opacity=1;
                borderAnim2.current.classList.add('border2-is-animate');
            })
            refBtn.current.addEventListener('mouseout', () => {
                body.current.style.backgroundImage="";
                body.current.style.background="";
                border1.current.style.opacity=1;
                border2.current.style.opacity=1;
                borderAnim.current.style.opacity=0;
                borderAnim.current.classList.remove('border-is-animate');
                borderAnim2.current.style.opacity=0;
                borderAnim2.current.classList.remove('border2-is-animate');
                refBtn.current.style.transition="";
                refBtn.current.style.border="";
                refBtn.current.style.background="";
                refBtn.current.style.boxShadow="";
            })
        }
    }

    useEffect(() => {
        menu.current.addEventListener('mouseover', () => {
            menu.current.style.transition = 'all .5s ease-in-out';
            menu.current.style.background='none';
        })

        menu.current.addEventListener('mouseout', () => {
            menu.current.style.background='';
            menu.current.style.boxShadow='';
        })

        applyEvent(buttonStart, "");
        applyEvent(buttonOptions, "");
        applyEvent(buttonProfile, "");
        applyEvent(buttonLogout, "");

        pongTitle.current.addEventListener('mousedown', () => {
            pongTitle.current.style.transition="none";
            pongTitle.current.style.border="solid 3px violet";
            pongTitle.current.style.background="rgb(187, 0, 255)";
            pongTitle.current.style.boxShadow="0 0 10px rgb(187, 0, 255), 0 0 50px rgb(187, 0, 255), 0 0 100px rgb(187, 0, 255)";
        })
        pongTitle.current.addEventListener('mouseup', () => {
            pongTitle.current.style.transition="";
            pongTitle.current.style.border="";
            pongTitle.current.style.background="";
            pongTitle.current.style.boxShadow="";
        })

        translateIcon.current.addEventListener('mouseover', () => {
            setIsTranslateActive(true);
        })
    
        translateIcon.current.addEventListener('mouseout', () => {
            setIsTranslateActive(false);
        })

    },[]);

    return (
        <div className='menu-body' ref={body}>
            <span className="border" ref={border1}></span>
            <span className="border" ref={border2}></span>
            <span id="borderAnim" ref={borderAnim}></span>
            <span id="borderAnim2" ref={borderAnim2}></span>
            <div className="centerMenu" ref={menu}>
                <h1 onClick={()=>navigate('/menu')} ref={pongTitle}>{translations.title}</h1>
                <div className="menuButton">
                    <GameButton name={translations.start_btn} onClick={() => navigate('/game-menu')} refbtn={buttonStart}/>
                    <GameButton name={translations.options_btn} onClick={() => navigate('/edit-account')} refbtn={buttonOptions}/>
                    <GameButton name={translations.logout_btn} onClick={handleLogout} refbtn={buttonLogout}/>
                </div>
            </div>
            <div className="menuProfilePicture" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                {profilePicture && <img src={profilePicture}/>}
            </div>
            <div className='menuLanguage' ref={translateIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"/></svg>
                <div className={`languageButton ${isTranslateActive ? 'active' : ''}`}>
                    <button className='langBtn' onClick={() => updateLanguage('en')} disabled={language === 'en'}>{translations.english}</button>
                    <button className='langBtn' onClick={() => updateLanguage('es')} disabled={language === 'es'}>{translations.spanish}</button>
                    <button className='langBtn' onClick={() => updateLanguage('fr')} disabled={language === 'fr'}>{translations.french}</button>
                </div>
            </div>
        </div>
    );
}

export default Menu;

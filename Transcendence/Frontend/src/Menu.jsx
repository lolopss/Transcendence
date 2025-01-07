import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FriendList.css';
import './Menu.css';

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
                border1.current.style.opacity=1;
                border2.current.style.opacity=1;
                borderAnim.current.style.opacity=0;
                borderAnim.current.classList.remove('border-is-animate');
                borderAnim2.current.style.opacity=0;
                borderAnim2.current.classList.remove('border2-is-animate');
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

        applyEvent(buttonStart, "url('../Icons/Capture d’écran du 2024-11-18 15-19-32.png')");
        applyEvent(buttonOptions, "url('../Icons/04-1920x1080-93bc8f9277c05c92d97d689c2088150f.png')");
        applyEvent(buttonProfile, "url('../Icons/Capture d’écran du 2024-11-18 15-42-04.png')");
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

    },[]);

    return (
        // <div>
        //     <h2>{translations.title}</h2>
        //     <GameButton usage={translations.start_game} name={translations.start_btn} onClick={() => navigate('/game')} />
        //     <GameButton usage={translations.start_game_ai} name={translations.start_btn} onClick={() => navigate('/ai-game')} />
        //     <GameButton usage={translations.see_options} name={translations.options_btn} />
        //     {/* <GameButton usage={translations.quit_game} name={translations.quit_btn} /> */}
        //     {/* <GameButton usage={translations.find_match} name={translations.find_btn} onClick={() => navigate('/matchmaking')} /> */}
        //     <GameButton usage={translations.logout} name={translations.logout} onClick={handleLogout} />
        //     {/* <GameButton usage={translations.print_details} name={translations.print_btn} onClick={printUserDetails} /> */}
        //     {/* <GameButton usage={translations.toggle_2fa} name={`${translations.toggle_2fa} ${is2FAEnabled ? 'Enabled' : 'Disabled'}`} onClick={toggle2FA} /> */}
        //     {is2FAEnabled && (
        //         <div>
        //             <p>{translations.scan_qr}</p>
        //             <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(provisioningUri)}&size=200x200`} alt="QR Code" />
        //         </div>
        //     )}
        //     <div>
        //         <h3>{translations.language_preference}</h3>
        //         <button onClick={() => updateLanguage('en')} disabled={language === 'en'}>{translations.english}</button>
        //         <button onClick={() => updateLanguage('es')} disabled={language === 'es'}>{translations.spanish}</button>
        //         <button onClick={() => updateLanguage('fr')} disabled={language === 'fr'}>{translations.french}</button>
        //     </div>
        //     <div>
        //         <h3>Account</h3>
        //         <GameButton usage="Edit your account" name="Edit Account" onClick={() => navigate('/edit-account')} />
        //         <div className="data-privacy">
        //             <h3>Data Privacy Rights</h3>
        //             <p>You have the right to delete or anonymize your account. Please use the buttons below to exercise these rights.</p>
        //             <GameButton usage="Anonymize your account" name="Anonymize Account" onClick={anonymizeAccount} />
        //             <GameButton usage="Delete your account" name="Delete Account" onClick={deleteAccount} />
        //         </div>
        //     </div>
        //     <div className="profile-picture" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
        //         {profilePicture && <img src={profilePicture} alt="Profile" />}
        //     </div>
        // </div>

        <div className='menu-body' ref={body}>
            <span className="border" ref={border1}></span>
            <span className="border" ref={border2}></span>
            <span id="borderAnim" ref={borderAnim}></span>
            <span id="borderAnim2" ref={borderAnim2}></span>
            <div className="menu-overlay" ref={overlay}></div>
            <div className="centerMenu" ref={menu}>
                <div className="hoverText">
                    <svg width="325" height="250" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.26 0.948C4.26 0.628 4.42 0.468 4.74 0.468H4.872C5.192 0.468 5.352 0.628 5.352 0.948V8.628C5.352 8.948 5.192 9.108 4.872 9.108H4.74C4.42 9.108 4.26 8.948 4.26 8.628V5.496C4.26 5.176 4.1 5.016 3.78 5.016H2.172C1.852 5.016 1.692 5.176 1.692 5.496V8.628C1.692 8.948 1.532 9.108 1.212 9.108H1.08C0.76 9.108 0.6 8.948 0.6 8.628V0.948C0.6 0.628 0.76 0.468 1.08 0.468H1.212C1.532 0.468 1.692 0.628 1.692 0.948V3.444C1.692 3.764 1.852 3.924 2.172 3.924H3.78C4.1 3.924 4.26 3.764 4.26 3.444V0.948ZM11.3051 7.884C11.3051 8.116 11.2251 8.316 11.0651 8.484L10.6811 8.868C10.5211 9.028 10.3251 9.108 10.0931 9.108H7.77713C7.54513 9.108 7.34913 9.028 7.18913 8.868L6.79313 8.472C6.63313 8.312 6.55313 8.116 6.55313 7.884V1.692C6.55313 1.46 6.63313 1.26 6.79313 1.092L7.17713 0.707999C7.33713 0.548 7.53313 0.468 7.76513 0.468H10.0931C10.3251 0.468 10.5211 0.552 10.6811 0.719999L11.0651 1.104C11.2251 1.264 11.3051 1.46 11.3051 1.692V7.884ZM9.73313 8.016C10.0531 8.016 10.2131 7.856 10.2131 7.536V2.04C10.2131 1.72 10.0531 1.56 9.73313 1.56H8.12513C7.80513 1.56 7.64513 1.72 7.64513 2.04V7.536C7.64513 7.856 7.80513 8.016 8.12513 8.016H9.73313ZM12.4823 0.48C12.7703 0.48 12.9463 0.62 13.0103 0.9L14.5823 7.596C14.6463 7.876 14.7023 8.016 14.7503 8.016C14.7983 8.016 14.8543 7.876 14.9183 7.596L16.4543 0.9C16.5183 0.62 16.6943 0.48 16.9823 0.48H17.1263C17.4143 0.48 17.5583 0.608 17.5583 0.864C17.5583 0.928 17.5543 0.976 17.5463 1.008L15.7223 8.688C15.6583 8.968 15.4823 9.108 15.1943 9.108H14.3183C14.0383 9.108 13.8623 8.968 13.7903 8.688L11.9303 1.008C11.9143 0.927999 11.9062 0.875999 11.9062 0.852C11.9062 0.74 11.9463 0.652 12.0263 0.588C12.1063 0.516 12.2143 0.48 12.3503 0.48H12.4823ZM22.4147 7.992C22.7347 7.992 22.8947 8.152 22.8947 8.472V8.604C22.8947 8.924 22.7347 9.084 22.4147 9.084H19.3667C19.1347 9.084 18.9387 9 18.7787 8.832L18.3947 8.448C18.2347 8.288 18.1547 8.092 18.1547 7.86V0.948C18.1547 0.628 18.3147 0.468 18.6347 0.468H22.4147C22.7347 0.468 22.8947 0.628 22.8947 0.948V1.08C22.8947 1.4 22.7347 1.56 22.4147 1.56H19.7147C19.3947 1.56 19.2347 1.72 19.2347 2.04V3.648C19.2347 3.968 19.3947 4.128 19.7147 4.128H22.4147C22.7347 4.128 22.8947 4.288 22.8947 4.608V4.74C22.8947 5.06 22.7347 5.22 22.4147 5.22H19.7147C19.3947 5.22 19.2347 5.38 19.2347 5.7V7.512C19.2347 7.832 19.3947 7.992 19.7147 7.992H22.4147ZM28.2389 8.016C28.5589 8.016 28.7189 8.176 28.7189 8.496V8.628C28.7189 8.948 28.5589 9.108 28.2389 9.108H27.8069C27.5749 9.108 27.3789 9.028 27.2189 8.868L26.8229 8.472C26.6629 8.312 26.5829 8.116 26.5829 7.884V6.42C26.5829 6.1 26.4229 5.94 26.1029 5.94H25.5509C25.2309 5.94 25.0709 6.1 25.0709 6.42V8.616C25.0709 8.936 24.9109 9.096 24.5909 9.096H24.4589C24.1389 9.096 23.9789 8.936 23.9789 8.616V0.972C23.9789 0.651999 24.1389 0.491999 24.4589 0.491999H27.4949C27.7269 0.491999 27.9229 0.572 28.0829 0.732L28.4789 1.128C28.6389 1.288 28.7189 1.484 28.7189 1.716V4.728C28.7189 4.848 28.6989 4.956 28.6589 5.052C28.6189 5.14 28.5549 5.228 28.4669 5.316L28.0829 5.7C27.9229 5.86 27.8149 5.94 27.7589 5.94C27.7029 5.94 27.6749 6.1 27.6749 6.42V7.536C27.6749 7.856 27.8349 8.016 28.1549 8.016H28.2389ZM27.6269 2.064C27.6269 1.744 27.4669 1.584 27.1469 1.584H25.5509C25.2309 1.584 25.0709 1.744 25.0709 2.064V4.38C25.0709 4.7 25.2309 4.86 25.5509 4.86H27.1469C27.4669 4.86 27.6269 4.7 27.6269 4.38V2.064ZM35.8954 7.944C35.8074 8.216 35.6274 8.352 35.3554 8.352H34.8874C34.5994 8.352 34.4154 8.22 34.3354 7.956L33.5794 5.556C33.5474 5.468 33.5034 5.4 33.4474 5.352C33.3994 5.304 33.3474 5.28 33.2914 5.28C33.2194 5.28 33.1594 5.312 33.1114 5.376C33.0634 5.44 33.0394 5.528 33.0394 5.64V8.616C33.0394 8.936 32.8794 9.096 32.5594 9.096H32.4394C32.1194 9.096 31.9594 8.936 31.9594 8.616V0.972C31.9594 0.651999 32.1194 0.491999 32.4394 0.491999H32.6194C32.8994 0.491999 33.0794 0.623999 33.1594 0.887999L34.7914 6.108C34.8234 6.22 34.8674 6.304 34.9234 6.36C34.9794 6.416 35.0354 6.444 35.0914 6.444C35.1554 6.444 35.2154 6.416 35.2714 6.36C35.3274 6.296 35.3714 6.208 35.4034 6.096L36.9394 0.9C37.0274 0.628 37.2074 0.491999 37.4794 0.491999H37.6834C38.0034 0.491999 38.1634 0.651999 38.1634 0.972V8.616C38.1634 8.936 38.0034 9.096 37.6834 9.096H37.5634C37.2434 9.096 37.0834 8.936 37.0834 8.616V5.772C37.0834 5.66 37.0594 5.576 37.0114 5.52C36.9634 5.456 36.9034 5.424 36.8314 5.424C36.7034 5.424 36.6114 5.512 36.5554 5.688L35.8954 7.944ZM43.6256 7.992C43.9456 7.992 44.1056 8.152 44.1056 8.472V8.604C44.1056 8.924 43.9456 9.084 43.6256 9.084H40.5776C40.3456 9.084 40.1496 9 39.9896 8.832L39.6056 8.448C39.4456 8.288 39.3656 8.092 39.3656 7.86V0.948C39.3656 0.628 39.5256 0.468 39.8456 0.468H43.6256C43.9456 0.468 44.1056 0.628 44.1056 0.948V1.08C44.1056 1.4 43.9456 1.56 43.6256 1.56H40.9256C40.6056 1.56 40.4456 1.72 40.4456 2.04V3.648C40.4456 3.968 40.6056 4.128 40.9256 4.128H43.6256C43.9456 4.128 44.1056 4.288 44.1056 4.608V4.74C44.1056 5.06 43.9456 5.22 43.6256 5.22H40.9256C40.6056 5.22 40.4456 5.38 40.4456 5.7V7.512C40.4456 7.832 40.6056 7.992 40.9256 7.992H43.6256Z" fill="black"/>
                        </svg>
                </div>
                <h1 onClick={()=>navigate('/menu')} ref={pongTitle}>The Pong</h1>
                <div className="menuButton">
                    <GameButton name="Start" onClick={() => navigate('/game')} refbtn={buttonStart}/>
                    <GameButton name="Options" onClick={() => navigate('/edit-account')} refbtn={buttonOptions}/>
                    <GameButton name="Profile" onClick={() => navigate('/profile')} refbtn={buttonProfile}/>
                    <GameButton name="Logout" onClick={handleLogout} refbtn={buttonLogout}/>
                </div>
            </div>
        </div>
    );

    // return (
    //     <div>
    //         <h2>{translations.title}</h2>
    //         <GameButton usage={translations.start_game} name={translations.start_btn} onClick={() => navigate('/game')} />
    //         <GameButton usage={translations.start_multiplayer} name={translations.start_btn} onClick={() => navigate('/multiplayer')} />
    //         <GameButton usage={translations.start_game_ai} name={translations.start_btn} onClick={() => navigate('/ai-game')} />
    //         <GameButton usage={translations.tournament} name={translations.start_btn} onClick={() => navigate('/tournament')} />
    //         <GameButton usage={translations.see_options} name={translations.options_btn} />
    //         <GameButton usage={translations.quit_game} name={translations.quit_btn} />
    //         <GameButton usage={translations.find_match} name={translations.find_btn} onClick={() => navigate('/matchmaking')} />
    //         <GameButton usage={translations.logout} name={translations.logout} onClick={handleLogout} />
    //         <GameButton usage={translations.print_details} name={translations.print_btn} onClick={printUserDetails} />
    //         <GameButton usage={translations.toggle_2fa} name={`${translations.toggle_2fa} ${is2FAEnabled ? 'Enabled' : 'Disabled'}`} onClick={toggle2FA} />
    //         {is2FAEnabled && (
    //             <div>
    //                 <p>{translations.scan_qr}</p>
    //                 <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(provisioningUri)}&size=200x200`} alt="QR Code" />
    //             </div>
    //         )}
    //         <div>
    //             <h3>{translations.language_preference}</h3>
    //             <button onClick={() => updateLanguage('en')} disabled={language === 'en'}>{translations.english}</button>
    //             <button onClick={() => updateLanguage('es')} disabled={language === 'es'}>{translations.spanish}</button>
    //             <button onClick={() => updateLanguage('fr')} disabled={language === 'fr'}>{translations.french}</button>
    //         </div>
    //         <div>
    //             <h3>Account</h3>
    //             <GameButton usage="Edit your account" name="Edit Account" onClick={() => navigate('/edit-account')} />
    //             <div className="data-privacy">
    //                 <h3>Data Privacy Rights</h3>
    //                 <p>You have the right to delete or anonymize your account. Please use the buttons below to exercise these rights.</p>
    //                 <GameButton usage="Anonymize your account" name="Anonymize Account" onClick={anonymizeAccount} />
    //                 <GameButton usage="Delete your account" name="Delete Account" onClick={deleteAccount} />
    //             </div>
    //         </div>
    //         <div className="profile-picture" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
    //             {profilePicture && <img src={profilePicture} alt="Profile" />}
    //         </div>
    //     </div>
    // );
}

function GameButton({ name, onClick, refbtn }) {
    return (
        <button className="btn" ref={refbtn} onClick={onClick}>{name}</button>
    );
}

export default GameMenu;
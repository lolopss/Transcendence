import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import './Profile.css'; // Ensure you have a CSS file for styling

// Register the ArcElement
Chart.register(ArcElement);

const Profile = () => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        nickname: '',
        username: '',
        email: '',
        profilePicture: '',
        wins: 0,
        losses: 0,
        goals: 0,
        goals_taken: 0,
        longuest_exchange: 0,
        ace: 0,
        winrate: 0,
        matchHistory: [],
    });

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
                    const data = await response.json();
                    setUserDetails({
                        nickname: data.nickname || '',
                        username: data.username || '',
                        email: data.email || '',
                        profilePicture: data.profile_picture || '',
                        wins: data.wins || 0,
                        losses: data.losses || 0,
                        goals: data.goals || 0,
                        goals_taken: data.goals_taken || 0,
                        longuest_exchange: data.longuest_exchange || 0,
                        ace: data.ace || 0,
                        winrate: data.winrate || 0,
                        total_time_spent: data.total_time_spent || 0,  // Set total_time_spent
                        matchHistory: data.match_history || [],
                    });
                    setLanguage(data.language);
                    loadTranslations(data.language);
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    };

    const winrateData = {
        labels: ['Wins', 'Losses'],
        datasets: [
            {
                data: userDetails.wins === 0 && userDetails.losses === 0 ? [1] : [userDetails.wins, userDetails.losses],
                backgroundColor: userDetails.wins === 0 && userDetails.losses === 0 ? ['#d3d3d3'] : ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: userDetails.wins === 0 && userDetails.losses === 0 ? ['#d3d3d3'] : ['#36A2EB', '#FF6384'],
            },
        ],
    };

    const [isShrink, setIsShrink] = useState(false);
    useEffect(()=>{
        if (window.innerWidth <= 920) {
            setIsShrink(true);
        }
        else {
            setIsShrink(false);
        }
    },[])
    const handleResize = () => {
        if (window.innerWidth <= 920) {
            setIsShrink(true);
        }
        else {
            setIsShrink(false);
        }
    }

    window.addEventListener("resize", handleResize);

    return (
        <div className="profileBody">
            <header className={`profileHeader ${isShrink ? 'shrink' : ''}`}>
                <h2 className='profileLogo' onClick={()=>navigate('/menu')}>
                    {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>)
                    : (<span>Pong</span>)}
                </h2>
                <nav className='profileNav'>
                    <div className="navProfile" onClick={()=>navigate('/profile')}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>)
                        : (<span>{translations.profile}</span>)}
                    </div>
                    <div className="navAccount" onClick={()=>navigate('/edit-account')}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z"/></svg>)
                        : (<span>{translations.account}</span>)}
                    </div>
                    <div className="navSecurity" onClick={()=>navigate('/security')}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>)
                        : (<span>{translations.security}</span>)}
                    </div>
                </nav>
            </header>
            <div className="profile-container">
                <div className="profile-image">
                    <img src={userDetails.profilePicture} className="profile-picture" />
                </div>
                <div className="profile-header">
                    <h1>{userDetails.nickname}</h1>
                    <h2>@{userDetails.username}</h2>
                </div>
                <div className="profile-stats">
                    <h3>{translations.stats}</h3>
                    <p>{translations.totalgames}: {userDetails.wins + userDetails.losses}</p>
                    <p>{translations.wins}: {userDetails.wins}</p>
                    <p>{translations.losses}: {userDetails.losses}</p>
                    <p>{translations.goals}: {userDetails.goals}</p>
                    <p>{translations.goalsTaken}: {userDetails.goals_taken}</p>
                    <p>{translations.longestExchange}: {userDetails.longuest_exchange}</p>
                    <p>{translations.aces}: {userDetails.ace}</p>
                    <div className="winrate-container">
                        <p>{translations.winrate}: {userDetails.winrate.toFixed(2)}%</p>
                        <div className="winrate-chart">
                            <Doughnut data={winrateData} />
                        </div>
                    </div>
                    <p>{translations.totalTimeSpent}: {formatTime(userDetails.total_time_spent)}</p>
                </div>
                <div className="match-history">
                    <h3>{translations.matchHistory}</h3>
                    <ul>
                        {userDetails.matchHistory.map((match, index) => (
                            <li key={index} className="match-entry">
                                <div className="match-date">{formatDate(match.date)}</div>
                                <div className="match-details">
                                    <span className="match-players">{match.player1} vs {match.player2}</span>
                                    <span className="match-score"> ({match.score_player1} - {match.score_player2}) </span>
                                    <span className="match-winner">{translations.winner} : {match.winner}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Profile;
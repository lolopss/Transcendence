import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import './FriendProfile.css';

// Register the ArcElement
Chart.register(ArcElement);

const FriendProfile = () => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const navigate = useNavigate();
    const { username } = useParams();
    const [friendDetails, setFriendDetails] = useState({
        nickname: '',
        username: '',
        email: '',
        profilePicture: '',
        wins: 0,
        losses: 0,
        goals: 0,
        goals_taken: 0,
        longest_exchange: 0,
        ace: 0,
        winrate: 0,
        total_time_spent: 0,  // Initialize total_time_spent
        matchHistory: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriendDetails = async () => {
            try {
                const response = await fetch(`/api/user-details/${username}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setFriendDetails({
                        nickname: data.nickname || '',
                        username: data.username || '',
                        email: data.email || '',
                        profilePicture: data.profile_picture || '',
                        wins: data.wins || 0,
                        losses: data.losses || 0,
                        goals: data.goals || 0,
                        goals_taken: data.goals_taken || 0,
                        longest_exchange: data.longest_exchange || 0,
                        ace: data.ace || 0,
                        winrate: data.winrate || 0,
                        total_time_spent: data.total_time_spent || 0,  // Set total_time_spent
                        matchHistory: data.match_history || [],
                    });
                    setLoading(false);
                } else {
                    console.error('Failed to fetch friend details');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching friend details:', error);
                setLoading(false);
            }
        };

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

        fetchFriendDetails();
    }, [username]);

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
                data: friendDetails.wins === 0 && friendDetails.losses === 0 ? [1] : [friendDetails.wins, friendDetails.losses],
                backgroundColor: friendDetails.wins === 0 && friendDetails.losses === 0 ? ['#d3d3d3'] : ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: friendDetails.wins === 0 && friendDetails.losses === 0 ? ['#d3d3d3'] : ['#36A2EB', '#FF6384'],
            },
        ],
    };

    const [isShrink, setIsShrink] = useState(false);
    const handleResize = () => {
        if (window.innerWidth <= 920) {
            setIsShrink(true);
        }
        else {
            setIsShrink(false);
        }
    }

    window.addEventListener("resize", handleResize);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="friendProfileBody">
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
                    <div className="navFriendProfile" onClick={()=>navigate(`/profile/${friendDetails.username}`)}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/></svg>)
                        : (<span>{translations.friendprofile}</span>)}
                    </div>
                </nav>
            </header>
            <div className="friend-profile-container">
                <div className="friend-profile-image">
                    <img src={friendDetails.profilePicture} alt="Profile" className="friend-profile-picture" />
                </div>
                <div className="friend-profile-header">
                    <h1>{friendDetails.nickname}</h1>
                    <h2>@{friendDetails.username}</h2>
                </div>
                <div className="friend-profile-stats">
                    <h3>{translations.stats}</h3>
                    <p>{translations.totalgames}: {friendDetails.wins + friendDetails.losses}</p>
                    <p>{translations.wins}: {friendDetails.wins}</p>
                    <p>{translations.losses}: {friendDetails.losses}</p>
                    <p>{translations.goals}: {friendDetails.goals}</p>
                    <p>{translations.goalsTaken}: {friendDetails.goals_taken}</p>
                    <p>{translations.longestExchange}: {friendDetails.longest_exchange}</p>
                    <p>{translations.aces}: {friendDetails.ace}</p>
                    <div className="winrate-container">
                        <p>{translations.winrate}: {friendDetails.winrate.toFixed(2)}%</p>
                        <div className="winrate-chart">
                            <Doughnut data={winrateData} />
                        </div>
                    </div>
                    <p>{translations.totalTimeSpent}: {formatTime(friendDetails.total_time_spent)}</p>
                </div>
                <div className="match-history">
                    <h3>Match History</h3>
                    <ul>
                        {friendDetails.matchHistory.map((match, index) => (
                            <li key={index} className="match-entry">
                                <div className="match-date">{formatDate(match.date)}</div>
                                <div className="match-details">
                                    <span className="match-players">{match.player1} vs {match.player2}</span>
                                    <span className="match-score">({match.score_player1} - {match.score_player2})</span>
                                    <span className="match-winner">Winner: {match.winner}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FriendProfile;
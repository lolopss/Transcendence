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

    return (
        <div className="profileBody">
            <header className='profileHeader'>
                <h2 className='profileLogo' onClick={()=>navigate('/menu')}>Pong</h2>
                <nav className='profileNav'>
                    <div className="navProfile" onClick={()=>navigate('/profile')}>{translations.profile}</div>
                    <div className="navAccount" onClick={()=>navigate('/edit-account')}>{translations.account}</div>
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
                                    <span className="match-score">({match.score_player1} - {match.score_player2})</span>
                                    <span className="match-winner">{translations.winner}: {match.winner}</span>
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
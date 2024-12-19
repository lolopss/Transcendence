import React, { useEffect, useState } from 'react';
import './Profile.css'; // Ensure you have a CSS file for styling

const Profile = () => {
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
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

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

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={userDetails.profilePicture} alt="Profile" className="profile-picture" />
                <h1>{userDetails.nickname}</h1>
                <h2>@{userDetails.username}</h2>
            </div>
            <div className="profile-stats">
                <h3>Stats</h3>
                <p>Total Games: {userDetails.wins + userDetails.losses}</p>
                <p>Wins: {userDetails.wins}</p>
                <p>Losses: {userDetails.losses}</p>
                <p>Goals: {userDetails.goals}</p>
                <p>Goals Taken: {userDetails.goals_taken}</p>
                <p>Longest Exchange: {userDetails.longuest_exchange}</p>
                <p>Aces: {userDetails.ace}</p>
                <p>Winrate: {userDetails.winrate.toFixed(2)}%</p>
                <p>Total Time Spent: {formatTime(userDetails.total_time_spent)}</p>
            </div>
            <div className="match-history">
                <h3>Match History</h3>
                <ul>
                    {userDetails.matchHistory.map((match, index) => (
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
    );
};

export default Profile;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';

const FriendProfile = () => {
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

        fetchFriendDetails();
    }, [username]);

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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-body">
            <div className="profile-container">
                <div className="profile-header">
                    <img src={friendDetails.profilePicture} alt="Profile" className="profile-picture" />
                    <h1>{friendDetails.nickname}</h1>
                    <h2>@{friendDetails.username}</h2>
                </div>
                <div className="profile-stats">
                    <h3>Stats</h3>
                    <p>Total Games: {friendDetails.wins + friendDetails.losses}</p>
                    <p>Wins: {friendDetails.wins}</p>
                    <p>Losses: {friendDetails.losses}</p>
                    <p>Goals: {friendDetails.goals}</p>
                    <p>Goals Taken: {friendDetails.goals_taken}</p>
                    <p>Longest Exchange: {friendDetails.longest_exchange}</p>
                    <p>Aces: {friendDetails.ace}</p>
                    <p>Winrate: {friendDetails.winrate.toFixed(2)}%</p>
                    <p>Total Time Spent: {formatTime(friendDetails.total_time_spent)}</p>
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
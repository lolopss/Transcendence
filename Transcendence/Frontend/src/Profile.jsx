import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // Import the CSS file

const Profile = () => {
    const [userDetails, setUserDetails] = useState({
        username: '',
        nickname: '',
        profilePicture: '',
        wins: 0,
        losses: 0,
        winrate: 0,
        matchHistory: [],
    });
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
                    const data = await response.json();
                    const winrate = data.wins + data.losses > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0;
                    setUserDetails({
                        username: data.username,
                        nickname: data.nickname,
                        profilePicture: data.profile_picture,
                        wins: data.wins,
                        losses: data.losses,
                        winrate: winrate,
                        matchHistory: data.match_history,
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

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={userDetails.profilePicture} alt="Profile" className="profile-picture" />
                <h1>{userDetails.nickname}</h1>
                <h2>@{userDetails.username}</h2>
            </div>
            <div className="profile-stats">
                <h3>Stats</h3>
                <p>Wins: {userDetails.wins}</p>
                <p>Losses: {userDetails.losses}</p>
                <p>Winrate: {userDetails.winrate.toFixed(2)}%</p>
            </div>
            <div className="match-history">
                <h3>Match History</h3>
                <ul>
                    {userDetails.matchHistory.map((match, index) => (
                        <li key={index}>
                            <p>{new Date(match.date).toLocaleString()}</p>
                            <p>{match.player1} vs {match.player2}</p>
                            <p>Winner: {match.winner}</p>
                            <p>Score: {match.score_player1} - {match.score_player2}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Profile;
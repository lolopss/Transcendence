import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';

const FriendProfile = () => {
    const { username } = useParams();
    const [friendDetails, setFriendDetails] = useState({
        username: '',
        nickname: '',
        profilePicture: '',
        wins: 0,
        losses: 0,
        winrate: 0,
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
                    const winrate = data.wins + data.losses > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0;
                    setFriendDetails({
                        username: data.username,
                        nickname: data.nickname,
                        profilePicture: data.profile_picture,
                        wins: data.wins,
                        losses: data.losses,
                        winrate: winrate,
                        matchHistory: data.match_history,
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

    if (loading) {
        return <div>Loading...</div>;
    }


    // useEffect(() => {
    //     fetchFriends();
    //     const interval = setInterval(() => {
    //         fetchFriends();
    //     }, 1000);  // Fetch friends every second
    //     return () => clearInterval(interval);  // Cleanup interval on component unmount
    // }, []);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={friendDetails.profilePicture} alt="Profile" className="profile-picture" />
                <h1>{friendDetails.nickname}</h1>
                <h2>@{friendDetails.username}</h2>
            </div>
            <div className="profile-stats">
                <h3>Stats</h3>
                <p>Wins: {friendDetails.wins}</p>
                <p>Losses: {friendDetails.losses}</p>
                <p>Winrate: {friendDetails.winrate.toFixed(2)}%</p>
            </div>
            <div className="match-history">
                <h3>Match History</h3>
                <ul>
                    {friendDetails.matchHistory.map((match, index) => (
                        <li key={index}>
                            {match.date}: {match.player1} vs {match.player2} - Winner: {match.winner} ({match.score_player1} - {match.score_player2})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FriendProfile;
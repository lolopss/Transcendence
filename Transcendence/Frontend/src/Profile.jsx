import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css'; // Ensure you have a CSS file for styling

const Profile = () => {
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
        <div className="profileBody">
            <header className='profileHeader'>
                <h2 className='profileLogo' onClick={()=>navigate('/menu')}>Pong</h2>
                <nav className='profileNav'>
                    <div className="navProfile" onClick={()=>navigate('/profile')}>Profile</div>
                    <div className="navAccount" onClick={()=>navigate('/edit-account')}>Account</div>
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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In semper massa eros, a feugiat nibh euismod sit amet. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi gravida tempor condimentum. Vestibulum eu quam in lorem cursus dignissim quis quis massa. Nullam et molestie turpis. Etiam vel lacus semper, vulputate metus a, efficitur leo. Aliquam turpis libero, lacinia id ligula nec, pretium fringilla nisi. Etiam eu gravida lacus, ac porttitor nisi.

Suspendisse bibendum urna nisi, vel semper tellus elementum vitae. Duis ut lacus vel nisi mattis bibendum id a nisi. Suspendisse potenti. Etiam pretium sapien at feugiat posuere. Morbi pharetra feugiat ante, nec sagittis mi. Donec consequat quis metus vitae hendrerit. Ut vitae pulvinar diam.

Cras ac leo vestibulum, bibendum elit sed, lobortis orci. Etiam at felis tincidunt, volutpat tellus id, tristique mauris. Sed dolor dolor, auctor sed cursus quis, pellentesque ac turpis. Mauris ut luctus nunc, a consequat massa. Suspendisse purus est, euismod ac lectus non, maximus hendrerit metus. Phasellus luctus, enim a rutrum fringilla, leo nisl vulputate elit, ornare eleifend eros tellus efficitur metus. Ut ac nisl sit amet ex auctor sollicitudin. Quisque sagittis ut enim vitae sodales. Sed rhoncus, sem ac aliquet molestie, sem erat molestie orci, ac malesuada leo nunc ac lorem. Aenean congue dolor id risus feugiat, nec pretium ante malesuada. Sed sapien libero, sollicitudin vitae fringilla eget, eleifend quis magna. Fusce consequat consectetur semper.

Nulla vestibulum bibendum sodales. In commodo iaculis dolor, a eleifend ex fringilla a. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec quis maximus augue, nec aliquam ex. Curabitur venenatis mi erat, in bibendum diam lacinia eget. Nam libero dui, lobortis at dui eu, dapibus condimentum augue. Aenean libero lacus, aliquet id tempus a, suscipit feugiat nisi. Phasellus accumsan tincidunt erat, sit amet laoreet odio scelerisque eget. In bibendum leo ut odio maximus, a sagittis nisi varius. In sollicitudin ultricies arcu, sed aliquet diam pulvinar nec. Sed interdum vestibulum tempus. Fusce ultricies dictum sem, vitae scelerisque justo auctor eget. Quisque at tempor erat, porta efficitur elit. Interdum et malesuada fames ac ante ipsum primis in faucibus.

Vivamus sed fringilla augue. Sed suscipit fermentum sem, a lacinia risus scelerisque at. Aliquam facilisis justo ipsum, vitae maximus velit egestas quis. Curabitur at semper enim, laoreet mattis est. Aenean suscipit, leo id gravida sagittis, felis enim pulvinar risus, vitae porta est erat quis nulla. Morbi lobortis quis enim sit amet lobortis. Donec non dictum nulla. Etiam convallis tincidunt felis nec vehicula. Phasellus feugiat neque at elit lobortis, eget semper risus blandit. Nunc tincidunt sem non nisl commodo, ac condimentum felis tristique. Phasellus faucibus luctus feugiat. Duis fermentum neque ipsum, congue ultrices lectus consequat in. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris a viverra erat. Fusce pharetra urna vel massa efficitur, sit amet aliquet enim ullamcorper. Nulla et dapibus eros.
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Profile;
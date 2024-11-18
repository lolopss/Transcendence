import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GameMenu() {
    const navigate = useNavigate(); // Ensure you have useNavigate for navigation
    const [showGame, setShowGame] = useState(false);

    function GameButton({ usage, name, onClick }) {
        return (
            <div className="GameButton">
                <p>{usage}</p>
                <button onClick={onClick}>{name}</button>
            </div>
        );
    }

    const handleStartGame = () => navigate('/game');

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

    const goToMatchmaking = () => {
        navigate('/matchmaking');
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

    return (
        <div>
            <h2>THE PONG</h2>
            <GameButton usage="Start the game" name="Start" onClick={handleStartGame} />
            <GameButton usage="See the options" name="Option" />
            <GameButton usage="Quit the game" name="Quit" />
            <GameButton usage="Find a match" name="Matchmaking" onClick={goToMatchmaking} />
            <GameButton usage="Logout from your account" name="Logout" onClick={handleLogout} />
            <GameButton usage="Print User Details" name="Print Details" onClick={printUserDetails} /> {/* New button */}
        </div>
    );
}

export default GameMenu;

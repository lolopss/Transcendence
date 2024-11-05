import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Game from './Game';

function GameMenu() {
    const navigate = useNavigate(); // Ensure you have useNavigate for navigation
    const handleStartGame = () => navigate('/game');
    const [showGame, setShowGame] = useState(false);

    function GameButton({ usage, name, onClick }) {
        return (
            <div className="GameButton">
                <p>{usage}</p>
                <button onClick={onClick}>{name}</button>
            </div>
        );
    }

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
                // Clear auth tokens from local storage
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken'); // Clear refresh token if you store it

                // Redirect to the login page
                navigate('/login');
            } else {
                console.error('Logout failed.');
                // Handle logout error if needed
            }
        } catch (error) {
            console.error('Error during logout:', error);
            // Handle any unexpected errors
        }
    };

    return (
        <div>
            <h2>THE PONG</h2>
            <GameButton usage="Start the game" name="Start" onClick={handleStartGame} />
            <GameButton usage="See the options" name="Option" />
            <GameButton usage="Quit the game" name="Quit" />
            <GameButton usage="Logout from your account" name="Logout" onClick={handleLogout} />
        </div>
    );
}

export default GameMenu;

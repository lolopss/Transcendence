import React from 'react';
import { useNavigate } from 'react-router-dom';

function GameMenu() {
    const navigate = useNavigate();

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
                localStorage.removeItem('authToken');
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

    return (
        <div>
            <h2>THE PONG</h2>
            <GameButton usage="Start the game" name="Start" onClick={handleStartGame} />
            <GameButton usage="See the options" name="Option" />
            <GameButton usage="Quit the game" name="Quit" />
            <GameButton usage="Find a match" name="Matchmaking" onClick={goToMatchmaking} /> {/* New Matchmaking button */}
            <GameButton usage="Logout from your account" name="Logout" onClick={handleLogout} />
        </div>
    );
}

export default GameMenu;

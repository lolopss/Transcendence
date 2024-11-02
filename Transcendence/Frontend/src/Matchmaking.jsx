import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Matchmaking = () => {
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleMatchmaking = async () => {
        const userId = localStorage.getItem('userId'); // Retrieve the user ID from local storage or context
        try {
            const response = await fetch('/api/matchmaking/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });

            const data = await response.json();
            setStatus(data.message);

            if (data.players) {
                // If a match is found, navigate to the game screen with player info
                navigate(`/game?players=${data.players.join(',')}`);
            }
        } catch (error) {
            console.error('Error during matchmaking:', error);
            setStatus('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <h2>Matchmaking</h2>
            <button onClick={handleMatchmaking}>Find Match</button>
            {status && <p>{status}</p>}
        </div>
    );
};

export default Matchmaking;

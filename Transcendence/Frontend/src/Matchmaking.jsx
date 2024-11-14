import React, { useState, useEffect } from 'react';

function Matchmaking() {
    const [status, setStatus] = useState(''); // Status message to display to the user
    const [intervalId, setIntervalId] = useState(null);

    // Function to join the queue
    const joinQueue = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setStatus('No valid token found');
            return;
        }
    
        try {
            const response = await fetch('/api/join-queue/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Add the token here
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error joining queue:', errorData);
                setStatus(errorData.detail || 'Failed to join queue');
                return;
            }
    
            const data = await response.json();
            setStatus(data.message);

            // Start polling for game status only after successfully joining the queue
            const id = setInterval(checkGameStatus, 5000);
            setIntervalId(id);

        } catch (error) {
            console.error('Error joining queue:', error);
            setStatus('Failed to join queue');
        }
    };

    // Function to check if a game has been created
    const checkGameStatus = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Ensure token is saved in localStorage
            const response = await fetch('/api/check-game/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Pass token in the Authorization header
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId'),  // Assuming userId is saved in localStorage
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to check game status');
            }

            const data = await response.json();
            setStatus(data.message);

            if (data.gameId) {
                // Wait until both players are in the game (i.e., game state is 'full')
                if (data.gameState === 'full') {
                    // Stop polling
                    clearInterval(intervalId);

                    // Redirect to game screen with gameId
                    window.location.href = `/game/${data.gameId}`;
                } else {
                    setStatus('Waiting for another player to join...');
                }
            }
        } catch (error) {
            console.error('Error checking game status:', error);
            setStatus('Failed to check game status');
        }
    };

    // Function to leave the queue
    const leaveQueue = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Ensure token is saved in localStorage
            const response = await fetch('/api/exit-queue/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Pass token in the Authorization header
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId'),  // Assuming userId is saved in localStorage
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to leave queue');
            }

            const data = await response.json();
            setStatus(data.message);

            // Stop polling when leaving the queue
            clearInterval(intervalId);
            setIntervalId(null);
        } catch (error) {
            console.error('Error leaving queue:', error);
            setStatus('Failed to leave queue');
        }
    };

    // Clean up polling interval on component unmount
    useEffect(() => {
        return () => clearInterval(intervalId);
    }, [intervalId]);

    return (
        <div>
            <h2>Matchmaking</h2>
            <button onClick={joinQueue}>Join Queue</button>
            <button onClick={leaveQueue}>Leave Queue</button>
            <p>{status}</p>
        </div>
    );
}

export default Matchmaking;

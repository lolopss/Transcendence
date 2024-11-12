import React, { useState, useEffect } from 'react';

function Matchmaking() {
    const [status, setStatus] = useState(''); // Status message to display to the user
    const [intervalId, setIntervalId] = useState(null);

    // Function to join the queue
    const joinQueue = async () => {
        try {
            const response = await fetch('/api/join-queue/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: localStorage.getItem('userId') }),
            });
            const data = await response.json();
            setStatus(data.message);

            // Start polling for game status
            const id = setInterval(checkGameStatus, 3000); // Poll every 3 seconds
            setIntervalId(id);
        } catch (error) {
            console.error('Error joining queue:', error);
            setStatus('Failed to join queue');
        }
    };

    // Function to check if a game has been created
    const checkGameStatus = async () => {
        try {
            const response = await fetch('/api/check-game/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: localStorage.getItem('userId') }),
            });
            const data = await response.json();
            setStatus(data.message);

            if (data.gameId) {
                // Stop polling
                clearInterval(intervalId);

                // Redirect to game screen with gameId
                window.location.href = `/game/${data.gameId}`;
            }
        } catch (error) {
            console.error('Error checking game status:', error);
            setStatus('Failed to check game status');
        }
    };

    // Function to leave the queue
    const leaveQueue = async () => {
        try {
            const response = await fetch('/api/exit-queue/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: localStorage.getItem('userId') }),
            });
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

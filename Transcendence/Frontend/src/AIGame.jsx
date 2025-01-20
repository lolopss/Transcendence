import React, { useEffect, useState } from 'react';
import Game from './Game';
import './Game.css'

function AIGame() {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});

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
                    setLanguage(data.language);
                    loadTranslations(data.language);
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

    const loadTranslations = async (language) => {
        try {
            const response = await fetch(`/api/translations/${language}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            const data = await response.json();
            setTranslations(data);
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    };

    return (
        <Game
            player2Nickname={translations.ai}
            aiStarted={true}
        />
    );
}

export default AIGame;

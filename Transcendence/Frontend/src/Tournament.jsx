import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Game from './Game';
import './Tournament.css'

const Tournament = () => {
    const [players, setPlayers] = useState(Array(8).fill({ id: null, nickname: '' }));
    const [currentMatch, setCurrentMatch] = useState(0);
    const [winners, setWinners] = useState(Array(7).fill(null));
    const [isTournamentStarted, setIsTournamentStarted] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [tournamentWinner, setTournamentWinner] = useState(null);
    const [nickname, setNickname] = useState('User');
    const [profilePicture, setProfilePicture] = useState('/default-profile.png');
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
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
                    setLanguage(data.language);
                    loadTranslations(data.language);
                    setNickname(data.nickname);
                    setProfilePicture(data.profile_picture);
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

    const handleInputChange = (index, value) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], nickname: value };
        setPlayers(newPlayers);
    };

    const startTournament = () => {
        if (players.some(player => player.nickname === '')) {
            alert('All player names must be entered to start the tournament.');
            return;
        }
        setIsTournamentStarted(true);
    };

    const handleGameEnd = (winner, player1, player2) => {
        const newWinners = [...winners];
        const winnerName = winner.nickname === player1.nickname ? player1 : player2;
        newWinners[currentMatch] = winnerName;
        setWinners(newWinners);
        setIsGameFinished(true);

        // Check if this is the final match
        if (currentMatch === 6) {
            setTournamentWinner(winnerName);
        }
    };

    const nextGame = () => {
        setCurrentMatch(currentMatch + 1);
        setIsGameFinished(false);
    };

    const logGameState = () => {
        console.log('Current Match:', currentMatch);
        console.log('Winners:', winners);
        console.log('Is Game Finished:', isGameFinished);
    };

    const renderBracket = () => {
        const matches = [];
        for (let i = 0; i < players.length; i += 2) {
            const player1 = players[i];
            const player2 = players[i + 1];
            if (player1.nickname && player2.nickname) {
                matches.push(`${player1.nickname} vs ${player2.nickname}`);
            }
        }

        // Add winners to the next round
        for (let i = 0; i < winners.length; i += 2) {
            const winner1 = winners[i];
            const winner2 = winners[i + 1];
            if (winner1 && winner2) {
                matches.push(`${winner1.nickname} vs ${winner2.nickname}`);
            } else if (winner1 && currentMatch != 6) {
                matches.push(`${winner1.nickname} vs ?`);
            }
        }

        return (
            <div className='bracketWrapper'>
                <h2 className='bracketTitle'>{translations.tournamentbracket}</h2>
                <div className='bracketContent'>
                    {matches.map((match, index) => (
                        <div className='bracketMatch' key={index}>{match}</div>
                    ))}
                </div>
            </div>
        );
    };

    const renderGame = () => {
        let player1, player2;
        if (currentMatch < 4) {
            player1 = players[currentMatch * 2];
            player2 = players[currentMatch * 2 + 1];
        } else if (currentMatch < 6) {
            player1 = winners[(currentMatch - 4) * 2];
            player2 = winners[(currentMatch - 4) * 2 + 1];
        } else {
            player1 = winners[4];
            player2 = winners[5];
        }

        return (
            <div>
                <h3 className='currentMatch'>{player1.nickname} vs {player2.nickname}</h3>
                <Game
                    key={`${player1.nickname}-${player2.nickname}`} // Ensure the Game component resets
                    player1Id={player1.id}
                    player1Nickname={player1.nickname}
                    player2Id={player2.id}
                    player2Nickname={player2.nickname}
                    tournamentStarted={true}
                    onGameEnd={(winner) => handleGameEnd(winner, player1, player2)}
                />
                {isGameFinished && !tournamentWinner && (
                    <div className="screenContainer">
                        <div className='endScreen'>
                            <div className='winnerName'>{winners[currentMatch].nickname} {translations.won} !</div>
                            <button className='gamebtn' onClick={nextGame}>{translations.nextgame}</button>
                            <button className='gamebtn' onClick={() => {
                                navigate('/menu');
                            }}>{translations.quitgame}</button>
                        </div>
                    </div>
                )}
                {tournamentWinner && (
                    <div className="screenContainer">
                        <div className='endScreen'>
                            <h2 className='winnerName'>{tournamentWinner.nickname} {translations.twon} !</h2>
                            <button className='gamebtn' onClick={() => {
                                navigate('/menu');
                            }}>{translations.quitgame}</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='tournamentContainer'>
            {!isTournamentStarted ? (
                <div className="tournamentContainer">
                    <h1 className='tournamentMenuReturn' onClick={()=>navigate('/menu')}>{translations.title}</h1>
                    <div className='tournamentInput'>
                        <h2 className='tournamentPlayerNames'>{translations.enterplnames}</h2>
                        {players.map((player, index) => (
                            <input
                                className='playerInput'
                                key={index}
                                type="text"
                                value={player.nickname}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                placeholder={`${translations.player} ${index + 1}`}
                            />
                        ))}
                        <button className='startTournamentBtn' onClick={startTournament}>START</button>
                        <div className="bracketContainer">
                            <span className='bracket'>START</span>
                            <span className='bracket2'></span>
                            <span className='bracket3'></span>
                            <span className='bracket4'></span>
                            <span className='bracket5'></span>
                            <span className='bracket6'></span>
                            <span className='bracket7'></span>
                            <span className='bracket8'></span>
                            <span className='bracket9'></span>
                            <span className='bracket10'></span>
                            <span className='bracket11'></span>
                            <span className='bracket12'></span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='bracketContainer'>
                    <div className="bracketRender">
                        {renderBracket()}
                    </div>
                    {renderGame()}
                </div>
            )}
        </div>
    );
};

export default Tournament;

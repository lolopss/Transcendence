import React from 'react';
import Game from './Game';
import './Game.css'

function AIGame() {
    return (
        <Game
            player2Nickname={translations.ai}
            aiStarted={true}
        />
    );
}

export default AIGame;

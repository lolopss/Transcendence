import React from 'react';
import Game from './Game';
import './Game.css'

function AIGame() {
    return (
        <Game
            player2Nickname={'AI'}
            aiStarted={true}
        />
    );
}

export default AIGame;
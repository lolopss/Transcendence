import './Menu.css'

function GameButton(props) {
    return (
        <div className="GameButton">
            <p>{props.usage}</p>
            <button>{props.name}</button>
        </div>
    );
}

function GameMenu() {
    return (
        <div>
            <h2>THE PONG</h2>
            <GameButton usage="start the game" name="Start"></GameButton>
            <GameButton usage="see the option" name="Option"></GameButton>
            <GameButton usage="quit the game" name="Quit"></GameButton>
        </div>
    );
}

export default GameMenu
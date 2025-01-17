function GameButton({ name, onClick, refbtn }) {
    return (
        <button className="btn" ref={refbtn} onClick={onClick}>{name}</button>
    );
}

export default GameButton;
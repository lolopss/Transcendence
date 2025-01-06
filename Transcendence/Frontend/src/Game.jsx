import { useEffect, useRef, useState } from 'react';
import './Game.css';

const width = 800;
const height = 400;
const ratio = width / height;
let shakeDuration = 10;
let shakeSpeed = 5;
let startTime; // Declare startTime globally


class Paddle {
    constructor(x, y, width, height, color) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.dy = 0;
        this.color = color;
    }
}

class Player {
    constructor(id, nickname, paddle) {
        this.id = id;
        this.nickname = nickname;
        this.paddle = paddle;
        this.point = 0;
    }
}

class Ball {
    constructor(size, speed, shakeSpeed) {
        this.size = size;
        this.initialSpeed = speed;
        this.speed = speed;
        this.x = width / 2;
        this.y = height / 2;
        this.dx = this.speed;
        this.dy = this.speed;
    }
}

function Game({ 
    player1Id = 1, 
    player1Nickname = 'Player1', 
    player2Id = 2, 
    player2Nickname = 'Player2', 
    onGameEnd = () => {} 
}) {
    const [nickname, setNickname] = useState(player1Nickname);
    const [profilePicture, setProfilePicture] = useState('/default-profile.png');
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState('');
    const pongCanvas = useRef(null);
    let limitHitbox = 25;       // Starting limitHitbox value
    let paddleHitCount = 0;     // Track paddle hits
    let animationFrameId = useRef(null);

    // Define player1 and player2 at the component level
    const player1 = new Player(player1Id, player1Nickname, new Paddle(15, height / 2 - 50, 10, 100, 'orange'));
    const player2 = new Player(player2Id, player2Nickname, new Paddle(width - 25, height / 2 - 50, 10, 100, 'violet'));

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/api/user-details/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });
                if (response.ok) {
                    const userDetails = await response.json();
                    setNickname(userDetails.nickname);
                    setProfilePicture(userDetails.profile_picture);
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const startGame = () => {
        console.log('yes');
        startTime = new Date();
    };

    useEffect(() => {
        if (isStarted) {
            console.log(`Animation running -> ${isStarted}`);
            pongCanvas.current.classList.add('is-animated');
            pongCanvas.current.addEventListener('animationend', () => {
                startGame();
                setIsReady(true);
            });
        } else {
            setIsReady(false);
        }
    }, [isStarted]);

    const handleResize = () => {
        if (!isStarted) return;
        const ctx = pongCanvas.current.getContext('2d');
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        let newHeight = windowHeight / ratio;
        let newWidth = windowWidth / ratio;

        const maxHeight = Math.min(newHeight, height);
        const maxWidth = Math.min(newWidth, width);

        ctx.canvas.height = maxHeight / ratio;
        ctx.canvas.width = maxWidth;
    };

    const saveMatch = async (player1, player2, winner, duration) => {
        try {
            const response = await fetch('/api/save-match-result/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    player1_nickname: player1.nickname,
                    player2_nickname: player2.nickname,
                    winner_nickname: winner.nickname,
                    score_player1: player1.point,
                    score_player2: player2.point,
                    duration: duration,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to save match');
            }
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error saving match:', error);
        }
    };

    const stopGame = (winningPlayer) => {
        console.log('Game Over');
        setIsReady(false); // Stop the game loop
        setIsGameOver(true);
        setWinner(winningPlayer);
        onGameEnd(winningPlayer); // Call the onGameEnd prop with the winner
    };

    useEffect(() => {
        if (!isReady) return;
        const canvas = pongCanvas.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        let textPoint = { x: canvas.width / 2, y: 30 };
        let paddle = new Paddle(0, 0, 10, 100, 'white');
        let middleBar = new Paddle(canvas.width / 2 - 2 / 2, 0, 2, canvas.height, 'white');
        let ball = new Ball(10, 4, 6);

        const handleKeyDown = (event) => {
            if (event.key === 'w') {
                player1.paddle.dy = -5;
            }
            if (event.key === 's') {
                player1.paddle.dy = 5;
            }
            if (event.key === 'ArrowUp') {
                player2.paddle.dy = -5;
            }
            if (event.key === 'ArrowDown') {
                player2.paddle.dy = 5;
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'w' || event.key === 's') {
                player1.paddle.dy = 0;
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                player2.paddle.dy = 0;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        const drawRect = (x, y, width, height, color) => {
            context.fillStyle = color;
            context.shadowBlur = 20;
            context.shadowColor = color;
            context.fillRect(x, y, width, height);
            context.shadowBlur = 0;
        };

        const drawBall = (x, y, size, color) => {
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2, true);
            context.fill();
        };

        const drawMiddleBar = (x, y, width, height, color) => {
            context.fillStyle = color;
            context.shadowBlur = 20;
            context.shadowColor = color;
            context.fillRect(x, y, width, height);
            context.shadowBlur = 0;
        };

        const drawPoints = (x, y) => {
            const textSize = context.measureText(player1.point.toString() + "   " + player2.point.toString());
            context.fillStyle = 'white';
            context.font = "25px arial";
            context.fillText(player1.point.toString() + "   " + player2.point.toString(), x - textSize.width / 2, y);
        };

        const draw = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawRect(player1.paddle.x, player1.paddle.y, player1.paddle.width, player1.paddle.height, player1.paddle.color);
            drawRect(player2.paddle.x, player2.paddle.y, player2.paddle.width, player2.paddle.height, player2.paddle.color);
            drawBall(ball.x, ball.y, ball.size, 'white');
            drawMiddleBar(middleBar.x, middleBar.y, middleBar.width, middleBar.height, 'white');
            drawPoints(textPoint.x, textPoint.y);
        };

        const playerDirection = (player) => {
            player.paddle.y += player.paddle.dy;
            if (player.paddle.y < 0) player.paddle.y = 0;
            if (player.paddle.y + paddle.height > canvas.height) player.paddle.y = canvas.height - paddle.height;
        };

        const resetBall = () => {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speed = ball.initialSpeed;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
            ball.dy = (Math.random() * 2 - 1) * ball.speed;
        };

        const ballMovement = () => {
            ball.x += ball.dx;
            ball.y += ball.dy;
            // Bounce off top and bottom edges
            if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
                ball.dy *= -1;
            }

            // Check if the ball passes the left or right limit hitbox
            if (ball.x < limitHitbox) {
                player2.point++;
                // updateGoalsInDatabase(0, 1, paddleHitCount, 0); // Increment goals taken for player 1
                paddleHitCount = 0;
                limitHitbox = 25;
                resetBall();
            } else if (ball.x > canvas.width - limitHitbox) {
                player1.point++;
                // updateGoalsInDatabase(1, 0, paddleHitCount, paddleHitCount); // Increment goals for player 1
                paddleHitCount = 0;
                limitHitbox = 25;
                resetBall();
            }
        };

        const ballToPaddleCheck = (playerN) => {
            let paddle, ballHitY;
            if (playerN === 1) {
                paddle = player1.paddle;
                ballHitY = ball.y - paddle.y;

                if (ball.x - ball.size < paddle.x + paddle.width && ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
                    handlePaddleHit(paddle.y);
                }
            } else if (playerN === 2) {
                paddle = player2.paddle;
                ballHitY = ball.y - paddle.y;

                if (ball.x + ball.size > paddle.x && ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
                    handlePaddleHit(paddle.y);
                }
            }
        };

        const handlePaddleHit = (paddleY) => {
            // Increase ball speed and adjust direction based on paddle hit location
            ball.dx *= -1.1;
            if (Math.abs(ball.dx) > 30) {
                ball.dx = 30 * Math.sign(ball.dx); // Keep the direction (positive or negative) of ball.dx
            }

            // Calculate relative hit position to adjust dy for angled bounce
            let relativeIntersectY = (ball.y - (paddleY + paddle.height / 2)) / (paddle.height / 2);
            ball.dy = relativeIntersectY * 5; // Adjust the multiplier to ensure a proper bounce angle

            // Clamp dy to avoid extreme angles
            if (ball.dy > 5) ball.dy = 5;
            if (ball.dy < -5) ball.dy = -5;

            triggerImpactEffect();

            // Increment paddle hit count and adjust limitHitbox
            paddleHitCount++;
            if (paddleHitCount % 2 === 0 && limitHitbox > 15) {
                limitHitbox--; // Reduce limitHitbox after every two paddle hits
            }
        };

        const shakeScreen = () => {
            if (shakeDuration > 0) {
                shakeDuration--;
                const shakeIntensity = shakeDuration * 3.5;
                const offsetX = Math.random() * shakeIntensity - shakeIntensity / 2;
                const offsetY = Math.random() * shakeIntensity - shakeIntensity / 2;
                canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            } else {
                canvas.style.transform = "translate(0, 0)";
            }
        };

        const triggerImpactEffect = () => {
            if (Math.abs(ball.dx) >= shakeSpeed) {
                shakeDuration = 5;
            }
        };

        const update = () => {
            playerDirection(player1);
            ballMovement();
            ballToPaddleCheck(1);
            ballToPaddleCheck(2);
            playerDirection(player2);
            shakeScreen();
        };

        const gameLoop = () => {
            if (player1.point >= 5) {
                if (player1.point === 5) {
                    const endTime = new Date();
                    const duration = (endTime - startTime) / 1000;
                    saveMatch(player1, player2, player1, duration);
                }
                stopGame(player1);
            } else if (player2.point >= 5) {
                if (player2.point === 5) {
                    const endTime = new Date();
                    const duration = (endTime - startTime) / 1000;
                    saveMatch(player1, player2, player2, duration);
                }
                stopGame(player2);
            }
            else {
                update();
                draw();
                if (isReady) animationFrameId.current = requestAnimationFrame(gameLoop);
            }
        };

        if (isReady) gameLoop();

        return () => {
            // Cleanup logic here...
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, [isReady]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return (
        <>
            {isStarted ? (
                <div>
                    <canvas ref={pongCanvas} id='gameCanvas' width={width} height={height}></canvas>
                    <div>
                        <button onClick={() => setIsStarted(false)}>Game = {isStarted ? 'On' : 'Off'}</button>
                    </div>
                </div>
            ) : (
                <div>
                    <h1>{nickname} vs {player2Nickname}</h1>
                    {player2Nickname === 'PaddleMan' && (
                        <div>
                            <img src={profilePicture} alt={`${nickname}'s profile`} width="50" height="50" />
                            <p>{nickname}</p>
                        </div>
                    )}
                    <button onClick={() => setIsStarted(true)}>Start Game</button>
                </div>
            )}
        </>
    );
}

export default Game;
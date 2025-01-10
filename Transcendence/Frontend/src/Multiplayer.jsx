import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Game.css';

const width = 800;
const height = 400;
const ratio = width / height;
let shakeDuration = 10;
let shakeSpeed = 5;

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
    constructor(paddle) {
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

const restartGame = () => {
    window.location.reload();
};

function Multiplayer() {
    // const [isStarted, setIsStarted] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState('');
    const [isReady, setIsReady] = useState(false);
    const pongCanvas = useRef(null);
    const canvasContainer = useRef(null);
    const navigate = useNavigate();
    let limitHitbox = 25;       // Starting limitHitbox value
    let paddleHitCount = 0;     // Track paddle hits

    const startGame = () => {
        // console.log('yes');
    }

    useEffect(() => {
        // console.log('Starting game...');
        canvasContainer.current.classList.add('is-animated');
        canvasContainer.current.addEventListener('animationend', () => {
            startGame();
            setIsReady(true);
        });
    }, []);

    // console.log(`is ready -> ${isReady}`);

    const updateGoalsInDatabase = async (goals, goals_taken, longuest_exchange, ace) => {
        try {
            const response = await fetch('/api/update-goals/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Assuming you use token-based authentication
                },
                body: JSON.stringify({ goals, goals_taken, longuest_exchange, ace }),
            });

            if (!response.ok) {
                throw new Error('Failed to update goals');
            }

            const data = await response.json();
            // console.log(data.message);
        } catch (error) {
            console.error('Error updating goals:', error);
        }
    };

    // const handleResize = () => {
    //     if (!isStarted)
    //         return ;
    //     const ctx = pongCanvas.current.getContext('2d');
    //     const windowHeight = window.innerHeight;
    //     const windowWidth = window.innerWidth;

    //     let newHeight = windowHeight / ratio;
    //     let newWidth = windowWidth / ratio;

    //     const maxHeight = Math.min(newHeight, height);
    //     const maxWidth = Math.min(newWidth, width);

    //     ctx.canvas.height = maxHeight / ratio;
    //     ctx.canvas.width = maxWidth;
    // };

    useEffect(() => {
        if (!isReady)
            return ;
        const canvas = pongCanvas.current;
        if (!canvas)
            return ;
        const context = canvas.getContext('2d');

        let textPoint = { x: canvas.width / 2, y: 30};
        let paddle = new Paddle(0, 0, 10, 100, 'white');
        let middleBar = new Paddle(canvas.width / 2 - 2 / 2
            , 0
            , 2
            , canvas.height
            , 'white');
			let player1 = new Player(new Paddle(15, canvas.height / 4 - paddle.height / 2, paddle.width, paddle.height, 'orange'));
            let player2 = new Player(new Paddle(15, (3 * canvas.height) / 4 - paddle.height / 2, paddle.width, paddle.height, 'red'));
            let player3 = new Player(new Paddle(canvas.width - paddle.width - 15, canvas.height / 4 - paddle.height / 2, paddle.width, paddle.height, 'violet'));
            let player4 = new Player(new Paddle(canvas.width - paddle.width - 15, (3 * canvas.height) / 4 - paddle.height / 2, paddle.width, paddle.height, 'blue'));
            let ball = new Ball(10, 4, 6);

        document.addEventListener('keydown', (event) => {
			if (event.key === 'w') player1.paddle.dy = -5;
			if (event.key === 's') player1.paddle.dy = 5;
			if (event.key === 'o') player2.paddle.dy = -5;
			if (event.key === 'l') player2.paddle.dy = 5;
			if (event.key === 'ArrowUp') player3.paddle.dy = -5;
			if (event.key === 'ArrowDown') player3.paddle.dy = 5;
			if (event.key === '8') player4.paddle.dy = -5;
			if (event.key === '5') player4.paddle.dy = 5;
		});

		document.addEventListener('keyup', (event) => {
			if (event.key === 'w' || event.key === 's') player1.paddle.dy = 0;
			if (event.key === 'o' || event.key === 'l') player2.paddle.dy = 0;
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown') player3.paddle.dy = 0;
			if (event.key === '8' || event.key === '5') player4.paddle.dy = 0;
		});

        const drawRect = (x, y, width, height, color) => {
            context.fillStyle = color;
            context.shadowBlur = 20;
            context.shadowColor = color;
            context.fillRect(x, y, width, height);
            context.shadowBlur = 0;
        }

        const drawBall = (x, y, size, color) => {
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2, true);
            context.fill();
        }

        const drawMiddleBar = (x, y, width, height, color) => {
            context.fillStyle = color;
            context.shadowBlur = 20;
            context.shadowColor = color;
            context.fillRect(x, y, width, height);
            context.shadowBlur = 0;
        }

        const drawPoints = (x, y) => {
            const textSize = context.measureText(player1.point.toString() + "   " + player2.point.toString());
            context.fillStyle = 'white';
            context.font = "25px arial";
            context.fillText(player1.point.toString() + "   " + player2.point.toString(), x - textSize.width / 2, y);
        }

        const draw = () => {
			context.clearRect(0, 0, canvas.width, canvas.height);
			drawRect(player1.paddle.x, player1.paddle.y, player1.paddle.width, player1.paddle.height, player1.paddle.color);
			drawRect(player2.paddle.x, player2.paddle.y, player2.paddle.width, player2.paddle.height, player2.paddle.color);
			drawRect(player3.paddle.x, player3.paddle.y, player3.paddle.width, player3.paddle.height, player3.paddle.color);
			drawRect(player4.paddle.x, player4.paddle.y, player4.paddle.width, player4.paddle.height, player4.paddle.color);
			drawBall(ball.x, ball.y, ball.size, 'white');
			drawMiddleBar(middleBar.x, middleBar.y, middleBar.width, middleBar.height, 'white');
			drawPoints(textPoint.x, textPoint.y);

            // Draw the middle line
            context.beginPath();
            context.setLineDash([5, 15]); // Dash pattern: 5px dash, 15px gap
            context.moveTo(0, canvas.height / 2);
            context.lineTo(canvas.width, canvas.height / 2);
            context.strokeStyle = 'white';
            context.lineWidth = 2;
            context.stroke();
            context.setLineDash([]);
		};

		// add the same logic for player 3 and player 4
        const playerDirection = (playerN1, playerN2) => {
            // Calculate the new positions
            const newY1 = playerN1.paddle.y + playerN1.paddle.dy;
            const newY2 = playerN2.paddle.y + playerN2.paddle.dy;

            // Ensure paddles stay within canvas bounds
            if (newY1 < 0) {
                playerN1.paddle.y = 0;
            } else if (newY1 + playerN1.paddle.height > canvas.height / 2) {
                playerN1.paddle.y = canvas.height / 2 - playerN1.paddle.height;
            } else {
                playerN1.paddle.y = newY1;
            }

            if (newY2 < canvas.height / 2) {
                playerN2.paddle.y = canvas.height / 2;
            } else if (newY2 + playerN2.paddle.height > canvas.height) {
                playerN2.paddle.y = canvas.height - playerN2.paddle.height;
            } else {
                playerN2.paddle.y = newY2;
            }
        };

        const resetBall = () => {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            if (player1.point >= 5 || player2.point >= 5) {
                return;
            }
            ball.speed = ball.initialSpeed;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
            ball.dy = (Math.random() * 2 - 1) * ball.speed;
        }

        const ballMovement = () => {
            ball.x += ball.dx;
            ball.y += ball.dy;
            // Bounce off top and bottom edges
            if (ball.y + ball.size > canvas.height) {
                ball.y = canvas.height - ball.size - 3; // Adjust position to prevent sticking
                ball.dy *= -1;
            } else if (ball.y - ball.size < 0) {
                ball.y = ball.size + 3; // Adjust position to prevent sticking
                ball.dy *= -1;
            }

            // Check if the ball passes the left or right limit hitbox
            if (ball.x < limitHitbox) {
                player2.point++;
                updateGoalsInDatabase(0, 1, paddleHitCount, 0); // Increment goals taken for player 1
                paddleHitCount = 0;
                limitHitbox = 25;
                resetBall();
            } else if (ball.x > canvas.width - limitHitbox) {
                player1.point++;
                updateGoalsInDatabase(1, 0, paddleHitCount, paddleHitCount); // Increment goals for player 1
                paddleHitCount = 0;
                limitHitbox = 25;
                resetBall();
            }

            if (player1.point >= 5) {
                stopGame('Left players');
            } else if (player2.point >= 5) {
                stopGame('Right players');
            }
        };

        const ballToPaddleCheck = (playerN) => {
			// Add the same logic for player 3 and player 4
            let paddle, ballHitY;

            // Log which player it hits
            if (playerN === 1) {
                paddle = player1.paddle;
                ballHitY = ball.y - paddle.y;

                if (ball.x - ball.size < paddle.x + paddle.width && ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
                    handlePaddleHit(paddle.y);
                }
            } else if (playerN === 2) {
                paddle = player2.paddle;
                ballHitY = ball.y - paddle.y;

                if (ball.x - ball.size < paddle.x + paddle.width && ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
                    handlePaddleHit(paddle.y);
                }
            } else if (playerN === 3) {
				paddle = player3.paddle;
				ballHitY = ball.y - paddle.y;

				if (ball.x + ball.size > paddle.x && ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
					handlePaddleHit(paddle.y);
				}
			} else if (playerN === 4) {
				paddle = player4.paddle;
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
        }

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
        }

        const triggerImpactEffect = () => {
            if (Math.abs(ball.dx) >= shakeSpeed) {
                shakeDuration = 5;
            }
        }

        const update = () => {
			playerDirection(player1, player2);
			playerDirection(player3, player4);
			ballMovement();
			ballToPaddleCheck(1);
			ballToPaddleCheck(2);
			ballToPaddleCheck(3);
			ballToPaddleCheck(4);
			shakeScreen();
		};

        const stopGame = (winningPlayer) => {
            // console.log('Game Finished');
            setIsReady(false); // Stop the game loop
            setIsGameOver(true);
            setWinner(winningPlayer);
        };

        const gameLoop = () => {
        if (player1.point >= 5 || player2.point >= 5) {
            return;
        }
            update();
            draw();

            if (isReady)
                requestAnimationFrame(gameLoop);
            else
                return ;
        }
        if (isReady)
            gameLoop();

    }, [isReady]);
    // window.addEventListener('resize', handleResize);

    return (
        <div className='gameContainer'>
            <div className="canvasContainer" ref={canvasContainer}>
                <canvas ref={pongCanvas} className={isReady ? 'gameCanvas' : 'animateCanvas'} width={width} height={height}></canvas>
            </div>
            {isGameOver && (
                <div className="screenContainer">
                    <div className='endScreen'>
                        <div className='winnerName'>{winner} won !</div>
                        <button className='gamebtn' onClick={restartGame}>Restart Game</button>
                        <button className='gamebtn' onClick={() => {
                            setIsReady(false);
                            navigate('/menu');
                        }}>Quit Game</button>
                    </div>
                </div>
            )}
        </div>
    );
    // return (
    //     <>
    //         {isStarted ?
    //             (
    //                 <div>
    //                     <canvas ref={pongCanvas} id='gameCanvas' width={width} height={height}></canvas>
    //                     <div>
    //                         <button onClick={() => {setIsStarted(isStarted => !isStarted)}}>Game = {isStarted ? 'On' : 'Off'}</button>
    //                     </div>
    //                 </div>
    //             )
    //             :
    //             (<div>
    //                 <h1>
    //                     Game Menu
    //                 </h1>
    //                 <div>
    //                     <button onClick={() => {setIsStarted(isStarted => !isStarted)}}>Game = {isStarted ? 'On' : 'Off'}</button>
    //                 </div>
    //             </div>)
    //         }
    //     </>
    // )
}

export default Multiplayer

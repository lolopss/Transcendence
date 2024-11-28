import { useEffect, useRef, useState } from 'react'
import './Game.css'

const width = 800;
const height = 400;
const ratio = width / height;
let shakeDuration = 10;
let shakeSpeed = 5;
let aiInterval = null; // Declare aiInterval globally
let currentStopInterval = null; // Declare currentStopInterval globally
let lastAiMoveCall = Date.now(); // Track the last time aiMove was called

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

function AIGame() {
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const pongCanvas = useRef(null);
    let limitHitbox = 25;       // Starting limitHitbox value
    let paddleHitCount = 0;     // Track paddle hits

    const startGame = () => {
        console.log('yes');
    }
    useEffect(() => {
        if (isStarted)
        {
            console.log(`Animation running -> ${isStarted}`);
            pongCanvas.current.classList.add('is-animated');
            pongCanvas.current.addEventListener('animationend', () => {
                startGame();
                setIsReady(true);
            })
        }
        else
            setIsReady(false);
    }, [isStarted]);
    console.log(`is started2 -> ${isStarted}`);

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
        } catch (error) {
            console.error('Error updating goals:', error);
        }
    };

    const handleResize = () => {
        if (!isStarted)
            return ;
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
        let player1 = new Player(new Paddle(15
            , canvas.height / 2 - paddle.height / 2
            , paddle.width
            , paddle.height
            , 'orange'));
        let player2 = new Player(new Paddle(canvas.width - paddle.width - 15
            , canvas.height / 2 - paddle.height / 2
            , paddle.width
            , paddle.height
            , 'violet'));
        let ball = new Ball(10, 4, 6);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'w') {
                player1.paddle.dy = -5;
            }
            if (event.key === 's') {
                player1.paddle.dy = 5;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'w' || event.key === 's') {
                player1.paddle.dy = 0;
            }
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
            drawBall(ball.x, ball.y, ball.size, 'white');
            drawMiddleBar(middleBar.x, middleBar.y, middleBar.width, middleBar.height, 'white')
            drawPoints(textPoint.x, textPoint.y);
        }

        const playerDirection = (player) => {
            player.paddle.y += player.paddle.dy;
            if (player.paddle.y < 0)
                player.paddle.y = 0;
            if (player.paddle.y + paddle.height > canvas.height)
                player.paddle.y = canvas.height - paddle.height;
        }

        const resetBall = () => {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speed = ball.initialSpeed;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
            ball.dy = (Math.random() * 2 - 1) * ball.speed;

            // Clear existing AI interval
            if (currentStopInterval) {
                clearInterval(currentStopInterval);
                currentStopInterval = null;
            }

            // Clear existing AI move interval
            clearInterval(aiInterval);
            aiInterval = setInterval(() => {
                aiMove();
            }, 1000);
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
        }

        let lastAiMoveCall = Date.now(); // Track the last time aiMove was called

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

            if (ball.dx > 0) {
                const now = Date.now();
                const timeSinceLastCall = now - lastAiMoveCall;

                if (timeSinceLastCall >= 1000) {
                    clearInterval(aiInterval);
                    aiMove();
                    lastAiMoveCall = now;
                } else {
                    clearInterval(aiInterval);
                    // wait for 1000 - timeSinceLastCall before calling aiMove
                    console.log(`Waiting for ${1000 - timeSinceLastCall} milliseconds`);
                    setTimeout(() => {
                        aiMove();
                        lastAiMoveCall = now;
                    }, 1000 - timeSinceLastCall);
                }
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
        }

        const triggerImpactEffect = () => {
            if (Math.abs(ball.dx) >= shakeSpeed) {
                shakeDuration = 5;
            }
        }

        const predictBallPosition = () => {
            let predictedY = ball.y;
            let predictedDy = ball.dy;
            let predictedX = ball.x;
            let predictedDx = ball.dx;

            // Predict the ball's position considering bounces
            while (predictedX < canvas.width - limitHitbox) {
                predictedY += predictedDy;
                predictedX += predictedDx;

                // Bounce off top and bottom edges
                if (predictedY + ball.size > canvas.height - 5|| predictedY - ball.size < 5) {
                    predictedDy *= -1;
                }
            }

            return predictedY;
        };

        let currentStopInterval = null; // Variable to keep track of the current interval

        const aiMove = () => {
            const now = Date.now();

            const speed = 5; // Paddle speed
            const paddleCenterY = player2.paddle.y + player2.paddle.height / 2;

            // log the ball's speed
            console.log(`Ball speed: ${ball.dx.toFixed(2)}`);

            if (ball.dx < 0 ) {
                // if absolute speed of the ball is more than 15, do not go to the middle
                if (Math.abs(ball.dx) < 12) {
                const timeSinceLastCall = (now - lastAiMoveCall) / 1000; // Convert to seconds
                console.log(`Time since last aiMove middle call: ${timeSinceLastCall.toFixed(2)} seconds`);
                // Ball is moving towards the left, move paddle to the middle of the board
                lastAiMoveCall = now; // Update the last call time
                const middleY = canvas.height / 2;
                const distance = middleY - paddleCenterY;

                if (Math.abs(distance) > 30) {
                    if (distance < 0) {
                        player2.paddle.dy = -speed; // Move up with a speed of 5
                    } else if (distance > 0) {
                        player2.paddle.dy = speed; // Move down with a speed of 5
                    }
                } else {
                    player2.paddle.dy = 0; // Stop if already aligned
                }
                // Calculate the time it will take to reach the middle position with a random offset
                const timeToReach = Math.abs(distance) / speed * Math.floor(Math.random() * 8 + 12);

                // Clear any existing interval
                if (currentStopInterval) {
                    clearInterval(currentStopInterval);
                }

                clearInterval(aiInterval);
                // Set an interval to stop the paddle's movement after the calculated time
                currentStopInterval = setInterval(() => {
                    player2.paddle.dy = 0;
                    clearInterval(currentStopInterval);
                    currentStopInterval = null;
                }, timeToReach);
                }
            } else {
                const timeSinceLastCall = (now - lastAiMoveCall) / 1000; // Convert to seconds
                console.log(`Time since last predict aiMove call: ${timeSinceLastCall.toFixed(2)} seconds`);
                // Ball is moving towards the right, predict the ball's position
                lastAiMoveCall = now; // Update the last call time
                const targetY = predictBallPosition(); // Get the predicted position of the ball
                const distance = targetY - paddleCenterY;

                if (Math.abs(distance) > 30) {
                    if (distance < 0) {
                        player2.paddle.dy = -speed; // Move up with a speed of 5
                    } else if (distance > 0) {
                        player2.paddle.dy = speed; // Move down with a speed of 5
                    }
                } else {
                    player2.paddle.dy = 0; // Stop if already aligned
                }

                // Calculate the time it will take to reach the target position
                const timeToReach = Math.abs(distance) / speed * Math.floor(Math.random() * 8 + 12);// Convert to milliseconds

                // Clear any existing interval
                if (currentStopInterval) {
                    clearInterval(currentStopInterval);
                }

                // Set an interval to stop the paddle's movement after the calculated time
                currentStopInterval = setInterval(() => {
                    player2.paddle.dy = 0;
                    clearInterval(currentStopInterval);
                    currentStopInterval = null;
                    clearInterval(aiInterval);
                    aiInterval = setInterval(() => {
                        aiMove();
                    }, 1000);
                    lastAiMoveCall = now;
                }, timeToReach * 1.10);
            }
        };

        aiInterval = setInterval(() => {
            aiMove();
        }, 1000);

        const update = () => {
            playerDirection(player1);
            ballMovement();

            ballToPaddleCheck(1);
            ballToPaddleCheck(2);

            playerDirection(player2);

            //updatePaddleColors();
            shakeScreen();
        }
        const gameLoop = () => {
            update();
            draw();
            if (isReady)
                requestAnimationFrame(gameLoop);
            else
                return ;
        }
        if (isReady)
            gameLoop();

        return () => {
            clearInterval(aiInterval);
        };
    }, [isReady]);

    window.addEventListener('resize', handleResize);

    return (
        <>
            {isStarted ?
                (
                    <div>
                        <canvas ref={pongCanvas} id='gameCanvas' width={width} height={height}></canvas>
                        <div>
                            <button onClick={() => {setIsStarted(isStarted => !isStarted)}}>Game = {isStarted ? 'On' : 'Off'}</button>
                        </div>
                    </div>
                )
                :
                (<div>
                    <h1>
                        Game Menu
                    </h1>
                    <div>
                        <button onClick={() => {setIsStarted(isStarted => !isStarted)}}>Game = {isStarted ? 'On' : 'Off'}</button>
                    </div>
                </div>)
            }
        </>
    )
}

export default AIGame

import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paddle, Player, Ball, width, height, ratio } from './GameComponents';
import './Game.css';

let shakeDuration = 10;
let shakeSpeed = 5;
let startTime; // Declare startTime globally
let aiInterval = null; // Declare aiInterval globally
let currentStopInterval = null; // Declare currentStopInterval globally

function Game({
    player1Id = 1,
    player1Nickname = 'Player1',
    player2Id = 2,
    player2Nickname = 'Player2',
    tournamentStarted = false,
    aiStarted = false,
    onGameEnd = () => {}
}) {
    const [nickname, setNickname] = useState(player1Nickname);
    const [profilePicture, setProfilePicture] = useState('/default-profile.png');
    const [profilePictureIA, setProfilePictureIA] = useState('/media/profile_pictures/pepe-ia2.gif');
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [gameOption, setGameOption] = useState('Invisibility');
    const [powerUpsEnabled, setPowerUpsEnabled] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState('');
    const pongCanvas = useRef(null);
    const canvasContainer = useRef(null);
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const navigate = useNavigate();
    let limitHitbox = 25;       // Starting limitHitbox value
    let paddleHitCount = 0;     // Track paddle hits
    let animationFrameId = useRef(null);




    /* ==================== UserDetails + Translations ==================== */




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




    /* ==================== Game Started ==================== */




    const startGame = () => {
        // console.log('Game started');
        startTime = new Date();
    };
    
    // Define player1 and player2 at the component level
    const player1 = new Player(player1Id, nickname, new Paddle(15, height / 2 - 50, 10, 100, 'orange'));
    const player2 = new Player(player2Id, player2Nickname, new Paddle(width - 25, height / 2 - 50, 10, 100, 'violet'));

    /* ---------- Canvas Animation ---------- */
    useEffect(() => {
        if (isStarted) {
            // console.log(`Animation running -> ${isStarted}`);
            canvasContainer.current.classList.add('is-animated');
            canvasContainer.current.addEventListener('animationend', () => {
                startGame();
                setIsReady(true);
            });
 
            // Cleanup function
            return () => {
                // console.log("Cleaning up ...");
                if (canvasContainer.current) {
                    canvasContainer.current.removeEventListener('animationend', () => {
                        startGame();
                        setIsReady(true);
                    });
                }
                clearInterval(aiInterval);
                clearInterval(currentStopInterval);
            };
        } else {
            setIsReady(false);
        }
    }, [isStarted]);

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
            // console.log(data.message);
        } catch (error) {
            console.error('Error saving match:', error);
        }
    };

    const stopGame = (winningPlayer) => {
        // console.log('Game Over');
        if (aiStarted){
            clearInterval(aiInterval);
            clearInterval(currentStopInterval);
        }
        setIsReady(false); // Stop the game loop
        setIsGameOver(true);
        setWinner(winningPlayer);
        onGameEnd(winningPlayer); // Call the onGameEnd prop with the winner
    };




    /* ==================== Game Mechanics ==================== */




    useEffect(() => {
        if (!isReady) return;
        const canvas = pongCanvas.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        let textPoint = { x: canvas.width / 2, y: 30 };
        let paddle = new Paddle(0, 0, 10, 100, 'white');
        let middleBar = new Paddle(canvas.width / 2 - 2 / 2, 0, 2, canvas.height, 'white');
        let ball = new Ball(10, 4, 6);
        let player1UsedPowerUp = false;
        let player2UsedPowerUp = false;

        const handleKeyDown = (event) => {
            if (event.key === 'w') {player1.paddle.dy = -5;}
            if (event.key === 's') {player1.paddle.dy = 5;}
            if (event.key === 'ArrowUp' && aiStarted === false) {player2.paddle.dy = -5;}
            if (event.key === 'ArrowDown' && aiStarted === false) {player2.paddle.dy = 5;}
            if (powerUpsEnabled) {
                if (gameOption === 'Invisibility') {
                    if (event.key === ' ' && !player2UsedPowerUp) {
                        player2.paddle.color = 'black';
                        player2UsedPowerUp = true;
                        setTimeout(() => {
                            player2.paddle.color = 'violet';
                        }, 5000);
                    }
                    if (event.key === 'Enter' && !player1UsedPowerUp && aiStarted === false) {
                        player1.paddle.color = 'black';
                        player1UsedPowerUp = true;
                        setTimeout(() => {
                            player1.paddle.color = 'orange';
                        }, 5000);
                    }
                } else if (gameOption === 'Teleportation') {
                    if (event.key === ' ' && !player2UsedPowerUp) {
                        ball.y = height - ball.y;
                        player2UsedPowerUp = true;
                    }
                    if (event.key === 'Enter' && !player1UsedPowerUp && aiStarted === false) {
                        ball.y = height - ball.y;
                        player1UsedPowerUp = true;
                    }
                }
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'w' || event.key === 's') {
                player1.paddle.dy = 0;
            }
            if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && aiStarted === false) {
                player2.paddle.dy = 0;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        /* ---------- render canvas component ---------- */

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

            // console log the player1 and player2 invsiibility status
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
            if (player1.point >= 5 || player2.point >= 5) {
                return;
            }
            ball.speed = ball.initialSpeed;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
            ball.dy = (Math.random() * 2 - 1) * ball.speed;

            if (aiStarted === true) {
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

            /* ---------- Ai gesture ---------- */

            if (ball.dx > 0 && aiStarted === true) {
                const now = Date.now();
                const timeSinceLastCall = now - lastAiMoveCall;

                if (timeSinceLastCall >= 1000) {
                    clearInterval(aiInterval);
                    aiMove();
                    lastAiMoveCall = now;
                } else {
                    clearInterval(aiInterval);
                    // wait for 1000 - timeSinceLastCall before calling aiMove
                    // console.log(`Waiting for ${1000 - timeSinceLastCall} milliseconds`);
                    setTimeout(() => {
                        aiMove();
                        lastAiMoveCall = now;
                    }, 1000 - timeSinceLastCall);
                }
            }
        };



        /* ==================== AI Mechanics ==================== */



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
        let aiUsedPowerUp = false;

        const aiMove = () => {
            const now = Date.now();

            const speed = 5; // Paddle speed
            const paddleCenterY = player2.paddle.y + player2.paddle.height / 2;

            if (!aiUsedPowerUp && powerUpsEnabled && (player1.point > 0 || player2.point > 0)) {
                // Ball is moving towards the AI's side and a point has already been scored
                // Check if the ball is on the player's side and moving towards the player
                if (ball.x < width / 2 && ball.dx < 0) {
                    // Add a random chance to use the power-up, half the time
                    const usePowerUp = Math.random() > 0.5;
                    if (usePowerUp) {
                        if (gameOption === 'Teleportation') {
                            ball.y = height - ball.y;
                        } else if (gameOption === 'Invisibility') {
                            player1.paddle.color = 'black';
                            setTimeout(() => {
                                player1.paddle.color = 'orange';
                            }, 5000);
                        }
                        aiUsedPowerUp = true;
                    }
                }
            }

            if (ball.dx < 0) {
                if (ball.dy > 15) return; // Prevent the AI from moving to the middle if the ball is moving too fast
                const timeSinceLastCall = (now - lastAiMoveCall) / 1000; // Convert to seconds
                // console.log(`Time since last aiMove middle call: ${timeSinceLastCall.toFixed(2)} seconds`);
                // Ball is moving towards the left, move paddle to the middle of the board
                lastAiMoveCall = now; // Update the last call time
                const middleY = canvas.height / 2;
                let distance = middleY - paddleCenterY;

                // console logs every variable of the if statement
                if (Math.abs(distance) > 30) {
                    if (distance < 0) {
                        player2.paddle.dy = -speed; // Move up with a speed of 5
                    } else if (distance > 0) {
                        player2.paddle.dy = speed; // Move down with a speed of 5
                    }
                }else {
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
            else {
                const timeSinceLastCall = (now - lastAiMoveCall) / 1000; // Convert to seconds
                // console.log(`Time since last predict aiMove call: ${timeSinceLastCall.toFixed(2)} seconds`);
                // Ball is moving towards the right, predict the ball's position
                lastAiMoveCall = now; // Update the last call time
                const targetY = predictBallPosition(); // Get the predicted position of the ball
                let distance = targetY - paddleCenterY;

                // check if invisibility is used and ai paddle is black
                if (player2.paddle.color === 'black') {
                    distance += (Math.random() - 0.5) * 50; // Random adjustment between -25 and 25
                }

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

        if (aiStarted === true) {
            aiInterval = setInterval(() => {
                aiMove();
            }, 1000);
        }




        /* ==================== Game Loop ==================== */




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
                    if (tournamentStarted === false) {
                        saveMatch(player1, player2, player1, duration);
                    }
                }
                stopGame(player1);
            } else if (player2.point >= 5) {
                if (player2.point === 5) {
                    const endTime = new Date();
                    const duration = (endTime - startTime) / 1000;
                    if (tournamentStarted === false) {
                        saveMatch(player1, player2, player2, duration);
                    }
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




    /* ==================== Front ==================== */




    return (
        <>
            {isStarted ? (
                <div className='gameContainer'>
                    <div className="canvasContainer" ref={canvasContainer}>
                        <p className='p1controles'>Controls Player 1 <br/>
                            Up : 'W' <br/>
                            Down : 'S'
                        </p>
                        <p className='p2controles'>Controls Player 2 <br/>
                            Up : 'ArrowUp' <br/>
                            Down : 'ArrowDown'
                        </p>
                        <p className='p1power'>Power UP <br/>
                            Key : 'Space'
                        </p>
                        <p className='p2power'>Power UP <br/>
                            Key : 'Enter'
                        </p>
                        <canvas ref={pongCanvas} className={isStarted ? 'gameCanvas' : 'animateCanvas'} width={width} height={height}></canvas>
                    </div>
                    {isGameOver && tournamentStarted === false && (
                        <div className="screenContainer">
                            <div className='endScreen'>
                                <div className='winnerName'>{winner.nickname} {translations.won} !</div>
                                <button className='gamebtn' onClick={() => {
                                    setIsStarted(false);
                                    setIsGameOver(false);
                                }}>{translations.restartGame}</button>
                                <button className='gamebtn' onClick={() => {
                                    setIsStarted(false);
                                    navigate('/menu');
                                }}>{translations.quit_game}</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='vsMenu'>
                    <h1 className='vsMenuReturn' onClick={()=>navigate('/menu')}>{translations.title}</h1>
                    <div className="vsTitles">
                        <h1 className='vsPl1'>{nickname}
                            <div className="pl1-profile-image">
                                <img src={profilePicture} className="profile-picture" />
                                <p className='p1controlesMenu'>Controls Player 1 <br/>
                                    Up : 'W' <br/>
                                    Down : 'S'
                                </p>
                                <p className='p1powerMenu'>Power UP <br/>
                                    Key : 'Space'
                                </p>
                            </div>
                        </h1>
                        <h1 className='vsVs'> vs </h1>
                        <h1 className='vsPl2'>{player2Nickname}
                            <div className="pl2-profile-image">
                                <img src={aiStarted ? profilePictureIA : '/media/profile_pictures/pepe_boxe.png'} className="profile-picture" />
                                <p className='p2controlesMenu'>Controls Player 2 <br/>
                                    Up : 'ArrowUp' <br/>
                                    Down : 'ArrowDown'
                                </p>
                                <p className='p2powerMenu'>Power UP <br/>
                                    Key : 'Enter'
                                </p>
                            </div>
                        </h1>
                    </div>
                    {player2Nickname === 'PaddleMan' && (
                        <div>
                            <img src={profilePicture} alt={`${nickname}'s profile`} width="50" height="50" />
                            <p>{nickname}</p>
                        </div>
                    )}
                    <div className="vsBtnContainer">
                        <button className='vsBtn' onClick={() => setIsStarted(true)}>{translations.start_game}</button>
                        <div>
                            <button className='vsBtn' onClick={() => setPowerUpsEnabled(!powerUpsEnabled)}>
                                {translations.powerUps} {powerUpsEnabled ? 'On' : 'Off'}
                            </button>
                        </div>
                        {powerUpsEnabled && (
                            <div className='vsPowerUps'>
                                <h3 className={`vsInv ${gameOption}`}>{translations.invisibility}</h3>
                                <button className='vsBtn' onClick={() => setGameOption(gameOption === 'Invisibility' ? 'Teleportation' : 'Invisibility')}>
                                    {translations.switch}
                                </button>
                                <h3 className={`vsTel ${gameOption}`}>{translations.teleportation}</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Game;

const canvas = document.getElementById('pongCanvas');
const fx = document.getElementById('fxCanvas');
const button = document.getElementById('menu');
const context = canvas.getContext('2d');
const fxContext = fx.getContext('2d');

// ---------------------------------------------------------//

class Ball {
    constructor(size, speed, shakeSpeed) {
        this.size = size;
        this.initialSpeed = speed;
        this.speed = speed;
        this.x = canvas.width / 2 - size / 2;
        this.y = canvas.height / 2 - size / 2;
        this.dx = this.speed;
        this.dy = this.speed;
    }
}
let ball = new Ball(10, 4, 6);

// ---------------------------------------------------------//

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

let paddle = new Paddle(0, 0, 10, 100, 'white');
let middleBar = new Paddle(canvas.width / 2 - 2 / 2
    , 0
    , 2
    , canvas.height
    , 'white');

// ---------------------------------------------------------//

class Player {
    constructor(paddle) {
        this.paddle = paddle;
        this.point = 0;
    }
}

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

// ---------------------------------------------------------//

let textPoint = { x: canvas.width / 2, y: 30}

let hue1 = 0;
let hue2 = 180;
let shakeDuration = 0;
let shakeSpeed = 6

document.addEventListener('keydown', (event) => {
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
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 's') {
        player1.paddle.dy = 0;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        player2.paddle.dy = 0;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const modeButtons = document.getElementById('modeButtons');
    const normalModeButton = document.getElementById('normalModeButton');
    const dodgeballModeButton = document.getElementById('dodgeballModeButton');

    // Initially hide the game canvas
    const pongCanvas = document.getElementById('pongCanvas');
    const fxCanvas = document.getElementById('fxCanvas');

    startButton.addEventListener('click', () => {
        // Hide the start button
        startButton.style.display = 'none';
        // Show the mode selection buttons
        modeButtons.style.display = 'flex';
    });

    normalModeButton.addEventListener('click', () => {
        // Start the game in normal mode
        startNormalMode();
    });

    dodgeballModeButton.addEventListener('click', () => {
        // Start the game in dodgeball mode
        startDodgeballMode();
    });

    function startNormalMode() {
        // Hide the mode selection buttons
        modeButtons.style.display = 'none';
        // Show the canvas
        pongCanvas.style.display = 'block';
        fxCanvas.style.display = 'block';
        // Start normal game mode logic here
        console.log("Normal mode started");
        // You can call any function that starts the normal mode game
    }

    function startDodgeballMode() {
        // Hide the mode selection buttons
        modeButtons.style.display = 'none';
        // Show the canvas
        pongCanvas.style.display = 'block';
        fxCanvas.style.display = 'block';
        // Start dodgeball game mode logic here
        console.log("Dodgeball mode started");
        // You can call any function that starts the dodgeball mode game
    }
});



function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.shadowBlur = 20;
    context.shadowColor = color;
    context.fillRect(x, y, width, height);
    context.shadowBlur = 0;
}

function drawBall(x, y, size, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2, true);
    context.fill();
}

function drawMiddleBar(x, y, width, height, color) {
    context.fillStyle = color;
    context.shadowBlur = 20;
    context.shadowColor = color;
    context.fillRect(x, y, width, height);
    context.shadowBlur = 0;
}

function drawPoints(x, y) {
    const textSize = context.measureText(player1.point.toString() + "   " + player2.point.toString());
    context.fillStyle = 'white';
    context.font = "25px arial";
    context.fillText(player1.point.toString() + "   " + player2.point.toString(), x - textSize.width / 2, y);
}

function ballToPaddleCheck(playerN)
{
    if (playerN === 1)
    {
        if (ball.x - ball.size < player1.paddle.x + player1.paddle.width &&
            ball.y > player1.paddle.y &&
            ball.y < player1.paddle.y + player1.paddle.height) {
            ball.dx *= -1.1;
            ball.dy += player1.paddle.dy / 2;
            triggerImpactEffect();
        }
    }
    if (playerN === 2)
    {
        if (ball.x + ball.size > player2.paddle.x &&
            ball.y > player2.paddle.y &&
            ball.y < player2.paddle.y + player2.paddle.height)
        {
            ball.dx *= -1.1;
            ball.dy += player2.paddle.dy / 2;
            triggerImpactEffect();
        }
    }
}

function playerDirection(player)
{
    player.paddle.y += player.paddle.dy;
    if (player.paddle.y < 0)
        player.paddle.y = 0;
    if (player.paddle.y + paddle.height > canvas.height)
        player.paddle.y = canvas.height - paddle.height;
}

function ballMovement()
{
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    if (ball.x < 0) {
        player2.point++;
        resetBall();
    }
    else if (ball.x > canvas.width) {
        player1.point++;
        resetBall();
    }
}

function update() {
    playerDirection(player1);
    ballMovement();

    ballToPaddleCheck(1);
    ballToPaddleCheck(2);

    playerDirection(player2);

    //updatePaddleColors();
    shakeScreen();
}

function updatePaddleColors() {
    hue1 = (hue1 + 1) % 360;
    hue2 = (hue2 + 1) % 360;

    player1.paddle.color = `hsl(${hue1}, 100%, 50%)`;
    player2.paddle.color = `hsl(${hue2}, 100%, 50%)`;
}

function shakeScreen()
{
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

function triggerImpactEffect() {
    if (Math.abs(ball.dx) >= shakeSpeed) {
        shakeDuration = 5;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = ball.initialSpeed;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawRect(player1.paddle.x, player1.paddle.y, player1.paddle.width, player1.paddle.height, player1.paddle.color);
    drawRect(player2.paddle.x, player2.paddle.y, player2.paddle.width, player2.paddle.height, player2.paddle.color);
    drawBall(ball.x, ball.y, ball.size, 'white');
    drawMiddleBar(middleBar.x, middleBar.y, middleBar.width, middleBar.height, 'white')
    drawPoints(textPoint.x, textPoint.y);
}

function drawFxLine(x, y, width, height, color) {
    fxContext.clearRect(0, 0, fx.width, fx.height); // Clear previous frame
    fxContext.strokeStyle = color; // Use color for line
    fxContext.lineWidth = 5; // Adjust thickness of the line
    fxContext.shadowBlur = 20; // Increase blur for luminous effect
    fxContext.shadowColor = color; // Glow color matches line color
    fxContext.beginPath();
    fxContext.moveTo(x, y); // Start the line
    fxContext.lineTo(x + width, y + height); // End the line
    fxContext.stroke(); // Draw the line
    fxContext.shadowBlur = 0; // Remove shadow for next frame
}

// Variables for line position and size
let fxPosX = 5;
let fxPosY = 5;
let fxLineLength = 50; // Length of the line

let fxBlock = {
    x: fxPosX,
    y: fxPosY,
    lineLength: fxLineLength,
    color: 'white'
};

function fxUpdate() {
    // Determine the line color based on the score
    if (player1.point === player2.point) {
        fxBlock.color = 'white';
    } else if (player1.point > player2.point) {
        fxBlock.color = player1.paddle.color;
    } else if (player1.point < player2.point) {
        fxBlock.color = player2.paddle.color;
    }

    // Draw the luminous line
    // drawFxLine(fxBlock.x, fxBlock.y, fxBlock.lineLength, 0, fxBlock.color);

    // Move the line around the edges
    if (fxBlock.x < fx.width - fxLineLength && fxBlock.y === 5) {
        // Move right along the top edge
        fxBlock.x += 5;
    } else if (fxBlock.y < fx.height - 5 && fxBlock.x === fx.width - fxLineLength) {
        // Move down along the right edge
        fxBlock.y += 5;
    } else if (fxBlock.x > 5 && fxBlock.y === fx.height - 5) {
        // Move left along the bottom edge
        fxBlock.x -= 5;
    } else if (fxBlock.y > 5 && fxBlock.x === 5) {
        // Move up along the left edge
        fxBlock.y -= 5;
    }
}


function gameLoop() {
    update();
    draw();
    fxUpdate();
    if (player1.point === 10 || player2.point === 10)
        return;
    requestAnimationFrame(gameLoop);
}

canvas.style.display = 'none';
fx.style.display = 'none';

const startButton = document.getElementById('startButton')
startButton.addEventListener('click', () => {
    button.style.display = 'none';
    canvas.style.display = 'block';
    fx.style.display = 'block';
    document.getElementById('pongCanvas').classList.add('is-animated');
    document.getElementById('fxCanvas').classList.add('is-animated');
    canvas.addEventListener('animationend', () => {
        document.getElementById('pongCanvas').classList.remove('is-animated');
        document.getElementById('fxCanvas').classList.remove('is-animated');
        startGame();
    })
});

function startGame() {
    canvas.style.display = 'block';
    gameLoop();
}
// Game Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const leftPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const rightPaddle = {
    x: canvas.width - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    radius: ballSize,
    speed: 4
};

// Game State
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;
const maxScore = 11;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Start/Pause with spacebar
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenter() {
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas with black background
    drawRect(0, 0, canvas.width, canvas.height, '#000000');
    
    // Draw center line
    drawCenter();
    
    // Draw paddles
    drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#00ff88');
    drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#ff0088');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffffff');
}

// Update functions
function updatePaddles() {
    // Left paddle - Player controlled by mouse and arrow keys
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        leftPaddle.y -= leftPaddle.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        leftPaddle.y += leftPaddle.speed;
    }
    
    // Also allow mouse control
    const mouseControlSensitivity = 0.5;
    const targetY = mouseY - leftPaddle.height / 2;
    leftPaddle.y += (targetY - leftPaddle.y) * mouseControlSensitivity;
    
    // Constrain left paddle
    leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
    
    // Right paddle - AI controlled
    const rightPaddleCenter = rightPaddle.y + rightPaddle.height / 2;
    const ballCenter = ball.y;
    
    if (rightPaddleCenter < ballCenter - 35) {
        rightPaddle.y += rightPaddle.speed;
    } else if (rightPaddleCenter > ballCenter + 35) {
        rightPaddle.y -= rightPaddle.speed;
    }
    
    // Constrain right paddle
    rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function updateBall() {
    if (!gameRunning) return;
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle collision - Left paddle
    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height) {
        
        if (ball.dx < 0) {
            ball.dx = -ball.dx;
            ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
            
            // Add spin based on where ball hits paddle
            const collidePoint = ball.y - (leftPaddle.y + leftPaddle.height / 2);
            collidePoint /= (leftPaddle.height / 2);
            ball.dy = collidePoint * ball.speed;
        }
    }
    
    // Paddle collision - Right paddle
    if (ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + rightPaddle.height) {
        
        if (ball.dx > 0) {
            ball.dx = -ball.dx;
            ball.x = rightPaddle.x - ball.radius;
            
            // Add spin based on where ball hits paddle
            const collidePoint = ball.y - (rightPaddle.y + rightPaddle.height / 2);
            collidePoint /= (rightPaddle.height / 2);
            ball.dy = collidePoint * ball.speed;
        }
    }
    
    // Score points - Ball out of bounds
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
    }
    
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
    }
    
    // Update scores on display
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    
    // Check for game over
    if (playerScore >= maxScore || computerScore >= maxScore) {
        gameRunning = false;
        showGameOver();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
    gameRunning = false;
}

function showGameOver() {
    setTimeout(() => {
        const winner = playerScore >= maxScore ? 'PLAYER' : 'COMPUTER';
        alert(`Game Over! ${winner} Wins!\n\nPlayer: ${playerScore}\nComputer: ${computerScore}\n\nPress OK to restart.`);
        resetGame();
    }, 500);
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    resetBall();
    gameRunning = false;
}

// Game loop
function gameLoop() {
    drawGame();
    updatePaddles();
    updateBall();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

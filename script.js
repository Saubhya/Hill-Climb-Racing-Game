// Access canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjust canvas size for mobile responsiveness
function adjustCanvasSize() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
}

adjustCanvasSize();
window.addEventListener("resize", adjustCanvasSize);

// Game variables
let car = { x: 50, y: 300, width: 50, height: 30 };
let speed = 0;
let isAccelerating = false;
let isJumping = false;
let velocityY = 0;
let gravity = 0.5;
let fuel = 100;
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let obstacles = [];
let fuelPickups = [];

// Generate flat terrain
function generateTerrain() {
    return canvas.height - 100;
}

// Generate obstacles
function generateObstacles() {
    obstacles = [];
    for (let i = 300; i < 10000; i += Math.random() * 500 + 300) {
        obstacles.push({ x: i, y: generateTerrain(), width: 20, height: 20 });
    }
}

// Generate fuel pickups
function generateFuelPickups() {
    fuelPickups = [];
    for (let i = 500; i < 10000; i += Math.random() * 700 + 500) {
        fuelPickups.push({ x: i, y: generateTerrain() - 20 });
    }
}

// Draw flat path
function drawTerrain() {
    ctx.beginPath();
    ctx.moveTo(0, generateTerrain());
    ctx.lineTo(canvas.width, generateTerrain());
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw car
function drawCar() {
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width / 2 - car.width / 2, car.y - car.height / 2, car.width, car.height);
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = "red";
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x - car.x + canvas.width / 2, obstacle.y - 20, 20, 20);
    }
}

// Draw fuel pickups
function drawFuelPickups() {
    ctx.fillStyle = "green";
    for (let fuelPickup of fuelPickups) {
        ctx.fillRect(fuelPickup.x - car.x + canvas.width / 2, fuelPickup.y - 20, 15, 15);
    }
}

// Check collision with obstacles
function checkCollision() {
    for (let obstacle of obstacles) {
        let carFront = car.x + car.width / 2;
        let carBack = car.x - car.width / 2;
        let obstacleFront = obstacle.x + obstacle.width;
        let obstacleBack = obstacle.x;

        if (
            carFront > obstacleBack &&
            carBack < obstacleFront &&
            car.y + car.height / 2 >= obstacle.y
        ) {
            gameOver = true;
        }
    }
}

// Check fuel pickup
function checkFuelPickup() {
    for (let i = 0; i < fuelPickups.length; i++) {
        let fuelPickup = fuelPickups[i];
        if (Math.abs(car.x - fuelPickup.x) < 20) {
            fuel = Math.min(fuel + 50, 100);
            fuelPickups.splice(i, 1);
            break;
        }
    }
}

// Game loop
function gameLoop() {
    if (gameOver) {
        alert("Game Over! Your Score: " + score);
        location.reload();
        return;
    }

    if (isAccelerating) {
        speed = Math.min(speed + 0.2, 5);
        fuel -= 0.1;
    } else {
        speed = Math.max(speed - 0.05, 0);
    }

    car.x += speed;

    if (fuel <= 0) gameOver = true;

    // Jump physics
    if (isJumping) {
        velocityY -= gravity;
        car.y -= velocityY;
        if (car.y >= generateTerrain()) {
            car.y = generateTerrain();
            velocityY = 0;
            isJumping = false;
        }
    } else {
        car.y = generateTerrain();
    }

    // Update score
    score = Math.floor(car.x / 10);
    highScore = Math.max(highScore, score);

    checkCollision();
    checkFuelPickup();

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTerrain();
    drawCar();
    drawFuelPickups();
    drawObstacles();

    // Fuel bar
    ctx.fillStyle = "black";
    ctx.fillRect(20, 20, 100, 10);
    ctx.fillStyle = "green";
    ctx.fillRect(20, 20, fuel, 10);

    // Score and High Score
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 20, 50);
    ctx.fillText("High Score: " + highScore, 20, 70);

    requestAnimationFrame(gameLoop);
}

// Start game on touch or click
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        generateObstacles();
        generateFuelPickups();
        gameLoop();
    }
}

// Touch and click event listeners
canvas.addEventListener("touchstart", function (event) {
    startGame();
    isAccelerating = true;
});

canvas.addEventListener("mousedown", function () {
    startGame();
    isAccelerating = true;
});

// Stop accelerating on touchend or mouseup
canvas.addEventListener("touchend", function () {
    isAccelerating = false;
});

canvas.addEventListener("mouseup", function () {
    isAccelerating = false;
});

// Swipe up to jump
canvas.addEventListener("touchmove", function (event) {
    const touch = event.touches[0];
    if (touch.clientY < canvas.height / 2 && !isJumping) {
        isJumping = true;
        velocityY = 10;
    }
});

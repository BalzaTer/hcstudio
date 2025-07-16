const canvas = document.getElementById('dino');
const ctx = canvas.getContext('2d');
let dino = { x: 50, y: 150, w: 40, h: 40, vy: 0, jump: false };
let ground = 190;
let obstacles = [];
let score = 0;
let gameOver = false;
let speed = 5;
let lastObstacleX = 0;
let touchJump = false;

const dinoImg = new Image();
dinoImg.src = "dino.png";

const cactusImg = new Image();
cactusImg.src = "photo.png"; // Assurez-vous que le chemin est correct

function resetGame() {
    dino.y = 150;
    dino.vy = 0;
    dino.jump = false;
    obstacles = [];
    score = 0;
    gameOver = false;
    speed = 5;
    loop();
}

function drawDino() {
    if (dinoImg.complete) {
        ctx.drawImage(dinoImg, dino.x, dino.y, dino.w, dino.h);
    } else {
        dinoImg.onload = () => {
            ctx.drawImage(dinoImg, dino.x, dino.y, dino.w, dino.h);
        };
    }
}

function drawObstacles() {
    obstacles.forEach(o => {
        if (cactusImg.complete) {
            ctx.drawImage(cactusImg, o.x, o.y, o.w, o.h);
        }
    });
}

function drawGround() {
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(0, ground + dino.h);
    ctx.lineTo(canvas.width, ground + dino.h);
    ctx.stroke();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();

    // Dino saut
    if (dino.jump) {
        dino.vy += 1.5; // gravité
        dino.y += dino.vy;
        if (dino.y >= 150) {
            dino.y = 150;
            dino.vy = 0;
            dino.jump = false;
        }
    }

    // Obstacles
    if (
        obstacles.length === 0 ||
        (obstacles.length > 0 && obstacles[obstacles.length - 1].x < canvas.width - 200 - Math.random() * 100)
    ) {
        obstacles.push({
            x: canvas.width,
            y: 170,
            w: 12 + Math.random() * 10,
            h: 30
        });
    }

    obstacles.forEach(o => o.x -= speed);
    obstacles = obstacles.filter(o => o.x + o.w > 0);

    // Collision
    obstacles.forEach(o => {
        if (
            dino.x < o.x + o.w &&
            dino.x + dino.w > o.x &&
            dino.y + dino.h > o.y
        ) {
            gameOver = true;
        }
    });

    drawDino();
    drawObstacles();

    // Score
    if (!gameOver) {
        score++;
        document.getElementById('score').innerText = "Score : " + score;
        speed = 5 + Math.floor(score/500);
        requestAnimationFrame(loop);
    } else {
        ctx.fillStyle = "#cb4101";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", 220, 100);
        ctx.font = "18px Arial";
        ctx.fillText("Appuie sur Espace ou ↑ pour rejouer", 150, 130);
    }
}

// Contrôles clavier et tactile
document.addEventListener('keydown', e => {
    if ([" ", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
    }
    if (gameOver && (e.key === " " || e.key === "ArrowUp")) {
        resetGame();
    }
    if (!gameOver && !dino.jump && (e.key === " " || e.key === "ArrowUp")) {
        dino.vy = -18;
        dino.jump = true;
    }
});

// Touch (mobile) sur le canvas
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (gameOver) {
        resetGame();
    }
    if (!gameOver && !dino.jump) {
        dino.vy = -18;
        dino.jump = true;
    }
});

// Bouton tactile dédié
document.getElementById('jumpBtn').addEventListener('touchstart', function(e) {
    e.preventDefault();
    touchJump = true;
    if (gameOver) {
        resetGame();
    }
    if (!gameOver && !dino.jump) {
        dino.vy = -18;
        dino.jump = true;
    }
});

// Optionnel : pour desktop, saute au mousedown
document.getElementById('jumpBtn').addEventListener('mousedown', function(e) {
    if (gameOver) {
        resetGame();
    }
    if (!gameOver && !dino.jump) {
        dino.vy = -18;
        dino.jump = true;
    }
});

// Empêche le saut sur click si déjà touché
document.getElementById('jumpBtn').addEventListener('click', function(e) {
    if (touchJump) {
        touchJump = false;
        return;
    }
    if (gameOver) {
        resetGame();
    }
    if (!gameOver && !dino.jump) {
        dino.vy = -18;
        dino.jump = true;
    }
});

resetGame();

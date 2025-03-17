// ===================
// ELEMENTOS DO JOGO
// ===================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuContainer = document.getElementById("menuContainer");
const gameContainer = document.getElementById("gameContainer");

const startButton = document.getElementById("startButton");
const projectsButton = document.getElementById("projectsButton");
const restartButton = document.getElementById("restartButton");

const modal = document.getElementById("videoModal");
const closeModal = document.querySelector(".close");
const bgMusic = document.getElementById("bgMusic");

let startTime; // Agora é let, para reiniciar a cada jogo

// ===================
// VARIÁVEIS DO GAME
// ===================

const box = 20;
let snake = [];
let direction = null;
let gameLoopInterval = null;
let isPaused = false;
let score = 0;
let level = 1;
let speed = 150;

// ===================
// PROJETOS COM LINKS GOOGLE DRIVE EMBED (PREVIEW)
// ===================

const projects = [
    { x: 5 * box, y: 5 * box, video: "https://drive.google.com/file/d/14wcw00YqtMM4gtfd2-gbHAToIL0zBqEn/preview", name: "Projeto 1" },
    { x: 15 * box, y: 5 * box, video: "https://drive.google.com/file/d/1eagbdVzQGkxCNoIAb95jIlWrS495Aa3u/preview", name: "Projeto 2" },
    { x: 5 * box, y: 15 * box, video: "https://drive.google.com/file/d/14y_qxw0bHGBCZeWIY9eK0c1IuNdMouRQ/preview", name: "Projeto 3" },
    { x: 10 * box, y: 10 * box, video: "https://drive.google.com/file/d/17jx8eSaOcIMZXhYsC4DvQeWNLfU-4Xr6/preview", name: "Projeto 4" },
    { x: 15 * box, y: 15 * box, video: "https://drive.google.com/file/d/15ANpyz_SSAv1aEk7U4QphTIpstTVl3zu/preview", name: "Projeto 5" }
];

// ===================
// EVENTOS DO MENU
// ===================

// Exibe os controles no mobile
function showMobileControls() {
    if (window.innerWidth <= 768) {
        document.getElementById("mobileControls").style.display = "flex";
    } else {
        document.getElementById("mobileControls").style.display = "none";
    }
}

// Checa quando iniciar o jogo
startButton.addEventListener("click", () => {
    bgMusic.play();
    menuContainer.style.display = "none";
    gameContainer.style.display = "block";
    document.getElementById("hud").style.display = "block";

    showMobileControls(); // exibe controles mobile se necessário
    startGame();
});

restartButton.addEventListener("click", () => {
    menuContainer.style.display = "none";
    gameContainer.style.display = "block";
    document.getElementById("hud").style.display = "block";

    showMobileControls();
    startGame();
});

// Botões de controle de direção no mobile
document.getElementById("upBtn").addEventListener("click", () => {
    if (direction !== "DOWN") direction = "UP";
});
document.getElementById("downBtn").addEventListener("click", () => {
    if (direction !== "UP") direction = "DOWN";
});
document.getElementById("leftBtn").addEventListener("click", () => {
    if (direction !== "RIGHT") direction = "LEFT";
});
document.getElementById("rightBtn").addEventListener("click", () => {
    if (direction !== "LEFT") direction = "RIGHT";
});


projectsButton.addEventListener("click", () => {
    alert("Dentro do jogo, encoste nos quadrados brilhantes para ver os projetos!");
});


// ===================
// FECHAR MODAL
// ===================

closeModal.onclick = () => {
    modal.style.display = "none";
    // Remove iframe ao fechar o modal
    const iframe = document.querySelector("#videoModal iframe");
    if (iframe) iframe.remove();

    resumeGame();
};

// ===================
// CONTROLE DA SNAKE
// ===================

document.addEventListener("keydown", (event) => {
    if (!isPaused) {
        if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
        else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
        else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
        else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    }
});

// ===================
// DESENHAR SNAKE
// ===================

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#00ffff" : "#0055ff";
        ctx.fillRect(segment.x, segment.y, box, box);
    });
}

// ===================
// DESENHAR PROJETOS
// ===================

function drawProjects() {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#ff00ff";

    projects.forEach(p => {
        ctx.fillRect(p.x, p.y, box, box);
        ctx.fillText(p.name, p.x + box + 5, p.y + box / 2);
    });
}

// ===================
// ABRIR PROJETO (USANDO IFRAME DO GOOGLE DRIVE)
// ===================

function openProject(project) {
    pauseGame();
    modal.style.display = "block";

    const modalContent = document.querySelector(".modal-content");

    // Limpa o conteúdo anterior e insere o iframe do vídeo
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <iframe src="${project.video}" width="500" height="315" frameborder="0" allowfullscreen></iframe>
    `;

    document.querySelector(".close").onclick = () => {
        modal.style.display = "none";
        resumeGame();
    };

    score++;
    if (score % 1 === 0) {
        level++;
        speed = Math.max(50, speed - 20);
    }

    if (score === projects.length) {
        setTimeout(() => {
            endGame();
        }, 1000);
    }
}

// ===================
// LOOP PRINCIPAL DO GAME
// ===================

function gameLoop() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawProjects();
    drawSnake();

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    // COLISÃO COM BORDAS
    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height) {
        clearInterval(gameLoopInterval);
        alert("Game Over! Clique em Iniciar Jogo para tentar novamente.");
        showMenu();
        return;
    }

    // CHECAR PROJETOS
    projects.forEach(p => {
        if (snakeX === p.x && snakeY === p.y) {
            openProject(p);
        }
    });

    const newHead = { x: snakeX, y: snakeY };

    snake.unshift(newHead);
    snake.pop();

    document.getElementById("scoreDisplay").innerText = score;
    document.getElementById("levelDisplay").innerText = level;

    console.log("Snake head:", snake[0]);
}

// ===================
// PAUSAR E RESUMIR JOGO
// ===================

function pauseGame() {
    clearInterval(gameLoopInterval);
    isPaused = true;
}

function resumeGame() {
    clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, speed);
    isPaused = false;
}

// ===================
// START GAME
// ===================

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = "RIGHT";
    isPaused = false;
    score = 0;
    level = 1;
    speed = 150;

    clearInterval(gameLoopInterval);

    drawProjects();
    drawSnake();

    resumeGame();

    startTime = Date.now();
}

// ===================
// END GAME
// ===================

function endGame() {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    alert(`Você completou em ${totalTime} segundos!`);
    showMenu();
}

// ===================
// MOSTRAR MENU
// ===================

function showMenu() {
    clearInterval(gameLoopInterval);
    isPaused = false;
    gameContainer.style.display = "none";
    menuContainer.style.display = "flex";
    document.getElementById("hud").style.display = "none";

    if (score > 0) {
        restartButton.style.display = "inline-block";
    } else {
        restartButton.style.display = "none";
    }
}






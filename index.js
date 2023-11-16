const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let lastTick, currentTick, deltaTime, score, enemySpawnTimer, enemies

canvas.width = 512
canvas.height = 512

//Player spaceship

let player = {
    width: 40,
    height: 20,
    color: "red",
    x: canvas.width / 2 - 35,
    y: canvas.height / 2 -25,
    speed: 150,
    rotationSpeed: 15,
    angle: 0,
    acceleration: 200,
    vx: 0,
    vy: 0,
    va: 0
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.angle);
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

function updatePlayer() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // if (player.rotateLeft) {
    //     player.angle -= player.rotationSpeed * deltaTime;
    // }

    // if (player.rotateRight) {
    //     player.angle += player.rotationSpeed * deltaTime;
    // }

    // if (player.moveUp) {
    //     // player.y -= player.speed * deltaTime;
    //     player.y = Math.max(0, player.y - player.speed * deltaTime);
    // }

    // if (player.moveDown) {
    //     // player.y += player.speed * deltaTime;
    //     player.y = Math.min(canvas.height - player.height, player.y + player.speed * deltaTime)
    // }

    if (player.rotateLeft) {
        player.va -= player.rotationSpeed * deltaTime;
    }

    if (player.rotateRight) {
        player.va += player.rotationSpeed * deltaTime;
    }
    
    if (player.moveUp) {
        let ax = Math.cos(player.angle) * player.acceleration * deltaTime;
        let ay = Math.sin(player.angle) * player.acceleration * deltaTime;

        player.vx += ax
        player.vy += ay
    }

    if (player.moveDown) {
        let ax = Math.cos(player.angle) * player.acceleration * deltaTime;
        let ay = Math.sin(player.angle) * player.acceleration * deltaTime;

        player.vx -= ax
        player.vy -= ay
    }
    
    player.x += player.vx * deltaTime;
    player.y += player.vy * deltaTime;
    player.angle += player.va * deltaTime;

    player.vx *= 1 - deltaTime
    player.vy *= 1 - deltaTime
    player.va *= 1 - (deltaTime * 3)
}

function handleKeyDown(event) {
    if (event.key === "ArrowUp" || event.key === "Up") {
        player.moveUp = true;
    } else if (event.key === "ArrowDown" || event.key === "Down") {
        player.moveDown = true; 
    } else if (event.key === "ArrowLeft" || event.key === "Left") {
        player.rotateLeft = true;
    } else if (event.key === "ArrowRight" || event.key === "Right") {
        player.rotateRight = true;
    }
}

function handleKeyUp(event) {
    if (event.key === "ArrowUp" || event.key === "Up") {
        player.moveUp = false;
    } else if (event.key === "ArrowDown" || event.key === "Down") {
        player.moveDown = false; 
    } else if (event.key === "ArrowLeft" || event.key === "Left") {
        player.rotateLeft = false;
    } else if (event.key === "ArrowRight" || event.key === "Right") {
        player.rotateRight = false;
    }
}


//Enemy spaceships

function spawnEnemy() {
    const side = Math.random() < 0.5 ? "left" : "right"; 
    const enemy = {
        x: side === "left" ? 0 : canvas.width - 30,
        y: Math.random() * (canvas.height - 30),
        width: 50,
        height: 40,
        color: "#6600ff",
        speed: 100,
        direction: side
    };
    enemies.push(enemy)
}

const drawEnemies = () => {
    enemies.forEach((enemy) => {

        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)

        if (enemy.direction == "left") {
            enemy.x += enemy.speed * deltaTime;
        } else {
            enemy.x -= enemy.speed * deltaTime;
        }
    })
}



//Game logic

const startGame = () => {
    score = 0
    enemySpawnTimer = 1
    enemies = []
    
    // spawnEnemy();
    
    lastTick = Date.now();
    requestAnimationFrame(tick)
}

const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    currentTick = Date.now()
    deltaTime = (currentTick - lastTick) / 1000
    lastTick = currentTick
    
    enemySpawnTimer -= deltaTime

    if (enemySpawnTimer < 0 && enemies.length < 5) {
        spawnEnemy()
        enemySpawnTimer = Math.random() * 5 + 1; 
    }
    
    //TODO: ta bort fiender om de åker utanför canvas

    updatePlayer();
    drawPlayer()
    drawEnemies()
    
    requestAnimationFrame(tick)
}

startGame()
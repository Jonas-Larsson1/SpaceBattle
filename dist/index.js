const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const scoreElement = document.getElementById('score')
const highScoresElement = document.getElementById('high-scores')
const healthElement = document.getElementById('health')
const instructionsElement = document.getElementById('instructions')

const clearButton = document.getElementById('clear')
let confirmation = false

const startButton = document.getElementById('start')
startButton.addEventListener('click', () => {
  startGame()
})

let lastTick, 
currentTick, 
deltaTime, 
score, 
enemySpawnTimer, 
enemies, 
projectiles, 
isFiring,
hitEffects = [], 
playerFireDelay = 1,
enemyFireDelay = 1,
finalHit,
gameOverTimer

canvas.width = 640
canvas.height = 640

//Player spaceship

let player

function drawPlayer() {
    ctx.fillStyle = player.color
    ctx.save()
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2)
    ctx.rotate(player.angle + Math.PI)

    //Draw player as triangle
    ctx.beginPath()
    ctx.moveTo(player.height, player.width) //  left point
    ctx.lineTo(-player.height / 1, 0) // Middle point
    ctx.lineTo(player.height, -player.width) // right point
    ctx.closePath()
    
    ctx.fill()
    ctx.restore()
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
        width: 30,
        height: 20,
        color: "red",
        speed: 100,
        direction: side,
        fireDelay: 1,
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

// Projectiles

const updateProjectiles = () => {
    projectiles.forEach((projectile) => {
        projectile.x += projectile.vx * deltaTime
        projectile.y += projectile.vy * deltaTime

        // projectile.vx *= 1 - deltaTime
        // projectile.vy *= 1 - deltaTime
    })
}

const drawProjectiles = () => {
    projectiles.forEach((projectile) => {
        // ctx.save()
        // ctx.translate(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2)
        // ctx.rotate(projectile.angle + Math.PI)

        ctx.fillStyle = projectile.color
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height)

        // ctx.restore()
    })
}

class Projectile {
    constructor(x, y, width, height, angle, acceleration, color, origin) {
        this.x = x,
        this.y = y,
        this.width = width,
        this.height = height,
        this.angle = angle,
        this.acceleration = acceleration,
        this.color = color,
        this.origin = origin,

        this.vx = Math.cos(this.angle) * this.acceleration * deltaTime
        this.vy = Math.sin(this.angle) * this.acceleration * deltaTime
    }
}

const playerFire = () => {
    if (isFiring) {
        const playerProjectile = new Projectile(player.x, player.y + (player.height / 2), 5, 5, player.angle, 20000, 'green', 'player')
        projectiles.push(playerProjectile)
        playerFireDelay = 0.25
    }
}

const enemyFire = (enemy) => {
    const angleTowardsPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x)
    const enemyProjectile = new Projectile(enemy.x, enemy.y, 5, 5, angleTowardsPlayer, 10000, 'orange', 'enemy')
    projectiles.push(enemyProjectile)
    enemy.fireDelay = 1
}

document.addEventListener('keydown', event => {
    if (event.key === ' ') {
        isFiring = true 
    }
})

document.addEventListener('keyup', event => {
    if (event.key === ' ') {
        isFiring = false 
    }
})

const checkCollision = (rect1, rect2) => {
    if (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      ) {
        return true
    }
}

const addHitEffect = (x, y, color, radius) => {
    hitEffects.push({ x, y, color, radius, duration: 60 });
}

const drawHitEffects = () => {
    hitEffects.forEach((effect, index) => {
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        effect.radius *= 0.9 - deltaTime

        effect.duration -= deltaTime

        if (effect.duration <= 0) {
            hitEffects.splice(index, 1);
        }
    })
}

//Game logic

const startGame = () => {
    player = {
        width: 15,
        height: 25,
        color: "darkgreen",
        x: canvas.width / 2 - 35,
        y: canvas.height / 2 -25,
        speed: 150,
        rotationSpeed: 15,
        angle: 0,
        acceleration: 200,
        vx: 0,
        vy: 0,
        va: 0,
        health: 5
    }

    isFiring = false
    player.moveUp = false;
    player.moveDown = false; 
    player.rotateLeft = false;
    player.rotateRight = false;

    startButton.style.display = 'none'
    instructionsElement.style.display = 'none'
    healthElement.style.display = 'block'
    canvas.style.cursor = 'none'

    score = 0
    scoreElement.innerText = `Score: ${score}`

    healthElement.innerText = `Health: ${player.health}`

    enemySpawnTimer = 1
    gameOverTimer = 3
    finalHit = false

    enemies = []
    projectiles = []
    hitEffects = []

    lastTick = Date.now();
    requestAnimationFrame(tick)
}

const gameOver = () => {
    startButton.style.display = 'block'
    healthElement.style.display = 'none'
    instructionsElement.style.display = 'block'
    canvas.style.cursor = 'pointer'

    startButton.innerText = 'Gameover! Restart?'
    scoreElement.innerText = `Final score: ${score}`

    const playerName = prompt('Enter name').toUpperCase()

    if (playerName) {
        addScore(playerName, score)
    }
}

clearButton.addEventListener('click', event => {
    if (confirmation) {
        localStorage.removeItem('playerScores')
        getAndDisplayScores()
        clearButton.innerText = 'Clear scores'
        confirmation = false
    } else {
        clearButton.innerText = 'Are you sure?'
        confirmation = true
    }
})

const addScore = (playerName, playerScore) => {
    const playerScores = JSON.parse(localStorage.getItem('playerScores') || '[]')

    playerScores.push({playerName, playerScore})

    localStorage.setItem('playerScores', JSON.stringify(playerScores))
    getAndDisplayScores()
}

const getAndDisplayScores = () => {
    highScoresElement.innerHTML = ''

    const playerScores = JSON.parse(localStorage.getItem('playerScores') || '[]')

    playerScores.sort((a,b) => b.playerScore - a.playerScore)

    playerScores.forEach(element => {
        const row = document.createElement('tr')
        const playerCell = document.createElement('td')
        const scoreCell = document.createElement('td')

        playerCell.innerText = element.playerName 
        scoreCell.innerText = element.playerScore

        row.append(playerCell,scoreCell)

        highScoresElement.append(row)
    })
}

const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    currentTick = Date.now()
    deltaTime = (currentTick - lastTick) / 1000
    lastTick = currentTick

    if (player.health > 0) {
        
        enemySpawnTimer -= deltaTime
        playerFireDelay -= deltaTime
        
        if (enemySpawnTimer < 0 && enemies.length < 5) {
            spawnEnemy()
            enemySpawnTimer = Math.random() * 5 + 1; 
        }
        
        // if (enemyFireDelay < 0) {
            //     let randomEnemy = enemies[Math.floor((Math.random() * enemies.length))]
            //     if (randomEnemy) {
                //         enemyFire(randomEnemy)
                //     } else {
                    //         enemyFireDelay = 1
                    //     }
                    // }
                    
        if (playerFireDelay < 0) {
            playerFire()
        }
                    
                    
        enemies.forEach((enemy, index) => {
            enemy.fireDelay -= deltaTime
            if (enemy.fireDelay < 0) {
                enemyFire(enemy)
            }
            if (enemy.x > canvas.width || enemy.x + enemy.width < 0) {
                enemies.splice(index, 1)
            }
        })
    
        projectiles.forEach((projectile, projectileIndex) => {
            if (
                projectile.x > canvas.width || 
                projectile.x < 0 ||
                projectile.y > canvas.height ||
                projectile.y < 0
                ) {
                    projectiles.splice(projectileIndex, 1)
                }
            
            if (checkCollision(projectile, player) && projectile.origin === 'enemy') {
                addHitEffect(player.x, player.y + (player.height / 2), projectile.color, 10)
                
                projectiles.splice(projectileIndex, 1)
                
                player.health--
                healthElement.innerText = `Health: ${player.health}`
            }
            
            enemies.forEach((enemy, enemyIndex) => {
                if (checkCollision(projectile, enemy) && projectile.origin === 'player') {
                    addHitEffect(enemy.x + (enemy.width / 2), enemy.y + (enemy.height / 2), projectile.color, enemy.width)
                    
                    projectiles.splice(projectileIndex, 1)
                    enemies.splice(enemyIndex, 1)
                    
                    score++
                    scoreElement.innerText = `Score: ${score}`
                }
            })
        })
        
        updatePlayer()
        updateProjectiles()
        
        drawPlayer()
        drawEnemies()
        drawProjectiles()
        drawHitEffects()
        requestAnimationFrame(tick)

    } else {
        gameOverTimer -= deltaTime

        if (!finalHit) {
            addHitEffect(player.x, player.y + (player.height / 2), 'orange', 500)
            finalHit = true
        }

        drawHitEffects()
        requestAnimationFrame(tick)

        if (gameOverTimer < 0) {
            gameOver()
        }
    } 
}
    
getAndDisplayScores()
    
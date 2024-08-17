const windowWidth = 600;
const windowHeight = 400;

const rows = 6;
const cols = 10;

let rightDown = false;
let leftDown = false;
let alive = true; 

const brickWidth = Math.round(windowWidth / cols - 4);
const brickHeight = Math.round((windowHeight * 1/3) / rows - 10);
let bgMusic, hitSound, gameOverSound;

let bricks = [];
let bullets = [];
let powerups = [];
let score = 0;
let powerupActive = false;
let powerupTimer = 0;

let paddle = {
  x: windowWidth / 2 - 50,
  y: windowHeight - 15,
  width: 100,
  height: 10
}

let ball = {
  x: paddle.x - 25,
  y: paddle.y - 50,
  speedX: 6,
  speedY: 6,
  diameter: 15,
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  generateBricks(); 
  setInterval(generatePowerup, 10000);
}

function generateBricks() {
  for(let i = 0; i < rows; i++) { 
    for(let j = 0; j < cols; j++) { 
      let brickData = {
        x: j * (brickWidth + 2) + 10, 
        y: i * (brickHeight + 2) + 30, 
        width: brickWidth,
        height: brickHeight
      }
      bricks.push(brickData); 
    }
  }
}

function generatePowerup() {
  let powerup = {
    x: random(0, windowWidth - 20),
    y: 0,
    width: 20,
    height: 20,
    speedY: 2
  }
  powerups.push(powerup);
}

function drawBricks() {
  bricks.forEach(brick => {
    fill('red');
    rect(brick.x, brick.y, brick.width, brick.height);
    noStroke();
  })
}

function drawPowerups() {
  powerups.forEach(powerup => {
    fill('blue');
    rect(powerup.x, powerup.y, powerup.width, powerup.height);
    powerup.y += powerup.speedY;
  })
}

function drawBullets() {
  bullets.forEach((bullet, index) => {
    fill('yellow');
    rect(bullet.x, bullet.y, bullet.width, bullet.height);
    bullet.y -= bullet.speedY;
    if (bullet.y < 0) {
      bullets.splice(index, 1);
    }
  })
}

function draw() {
  background("black");
  if(bricks.length === 0) {
    endScreen("You Win!");
  }
  if(!alive && bricks.length != 0) endScreen("GAME OVER");
  if(alive) {
    drawBricks();
    drawPaddle();
    drawBall();
    drawPowerups();
    drawBullets();
    displayScore();
    checkBulletPowerupCollision();
    checkPowerupTimer();
  }
}

function keyPressed() {
  if(keyCode === RIGHT_ARROW) { 
    rightDown = true;
  }
  if(keyCode === LEFT_ARROW) { 
    leftDown = true;
  }
  if(keyCode === 32) { 
    if (!alive) {
      alive = true;
      paddle.x = windowWidth / 2 - 50;
      ball.x = paddle.x - 25;
      ball.y = paddle.y - 50;
      ball.speedX = 6;
      ball.speedY = 6;
      bricks.splice(0, bricks.length);     
      score = 0;
      generateBricks();
    } else {
      let bullet = {
        x: paddle.x + paddle.width / 2 - 2.5,
        y: paddle.y - 10,
        width: 5,
        height: 10,
        speedY: 5
      }
      bullets.push(bullet);
    }
  }
}

function keyReleased() {
  if(keyCode === RIGHT_ARROW) {
    rightDown = false;
  }
  if(keyCode === LEFT_ARROW) {
    leftDown = false;
  }
}

function drawPaddle() {
  fill('green');
  rect(paddle.x, paddle.y, paddle.width, paddle.height);
  if(rightDown && paddle.x + paddle.width < windowWidth) { 
    paddle.x += 10;
  }
  if(leftDown && paddle.x > 0) {
    paddle.x -= 10;
  }
}

function drawBall() {
  fill('white');
  circle(ball.x, ball.y, ball.diameter);
  if(ball.y - ball.diameter / 2 <= 0) { 
    ball.speedY = -ball.speedY; 
    randomizeBallSpeed();
  }
  if(ball.y + ball.diameter / 2 >= windowHeight) { 
    alive = false;  
  }
  if(ball.x - ball.diameter / 2 <= 0  || ball.x + ball.diameter / 2 >= windowWidth) {
    ball.speedX = -ball.speedX;
    randomizeBallSpeed();
  }
  if(ball.y + ball.diameter / 2 >= paddle.y && ball.x >= paddle.x && ball.x < paddle.x + paddle.width / 2) {
    ball.speedY = -ball.speedY;
    if(ball.speedX > 0) {
      ball.speedX = -ball.speedX;
    }    
  }
  if(ball.y + ball.diameter / 2 >= paddle.y && ball.x >= paddle.x + paddle.width / 2 && ball.x < paddle.x + paddle.width) {
    ball.speedY = -ball.speedY;
    if(ball.speedX < 0) {
      ball.speedX = -ball.speedX;
    }    
  }
  bricks.forEach((brick, index) => {
    if(ball.y - ball.diameter / 2 <= brick.y + brick.height && ball.x >= brick.x && ball.x <= brick.x + brick.width) {
      ball.speedY = -ball.speedY;
      bricks.splice(index, 1); 
      score++; 
      if(bricks.length === 0) alive = false; 
    }
  })
  ball.x += ball.speedX;
  ball.y += ball.speedY;
}

function randomizeBallSpeed() {
  ball.speedX = random([-6, -5, -4, 4, 5, 6]);
  ball.speedY = random([-6, -5, -4, 4, 5, 6]);
}

function checkBulletPowerupCollision() {
  bullets.forEach((bullet, bulletIndex) => {
    powerups.forEach((powerup, powerupIndex) => {
      if (bullet.x < powerup.x + powerup.width &&
          bullet.x + bullet.width > powerup.x &&
          bullet.y < powerup.y + powerup.height &&
          bullet.y + bullet.height > powerup.y) {
        bullets.splice(bulletIndex, 1);
        powerups.splice(powerupIndex, 1);
        activatePowerup();
      }
    });
  });
}

function activatePowerup() {
  powerupActive = true;
  powerupTimer = 540;
  paddle.width *= 2;
  ball.diameter *= 2;
}

function checkPowerupTimer() {
  if (powerupActive) {
    powerupTimer--;
    if (powerupTimer <= 0) {
      powerupActive = false;
      paddle.width /= 2;
      ball.diameter /= 2;
    }
  }
}

function displayScore() {
  fill("white");
  textAlign(CENTER);
  textSize(20)
  text(`Score: ${score}`, windowWidth / 2, 22); 
}

function endScreen(message) {
  fill('white');
  textAlign(CENTER);
  textSize(38);
  text(message, 300, 170);
  text('Press Spacebar To Restart Game', 300, 225);
  text(`Score: ${score}`, 300, 280);
}

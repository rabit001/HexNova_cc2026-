let lanes = [100, 200, 300];
let currentLane = 1;

let playerY = 500;

let obstacles = [];

let speed = 3;
let score = 0;
let lives = 3;
let gameOver = false;

function setup() {
  createCanvas(400, 600);
}

function draw() {
  background(20);

  if (!gameOver) {

    // smooth speed increase
    speed = min(3 + score * 0.01, 10);

    // score increase
    score++;

    // road lanes
    stroke(255);
    line(150, 0, 150, height);
    line(250, 0, 250, height);
    noStroke();

    // player car
    fill(255);
    rect(lanes[currentLane] - 15, playerY, 30, 40);

    // obstacle spawn (faster over time)
    let spawnRate = max(20, 60 - score * 0.2);
    if (frameCount % floor(spawnRate) === 0) {
      let lane = floor(random(0, 3));
      obstacles.push({
        x: lanes[lane],
        y: -50
      });
    }

    // move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let o = obstacles[i];
      o.y += speed;

      // draw obstacle
      fill(200);
      rect(o.x - 15, o.y, 30, 40);

      // collision
      if (
        abs(o.x - lanes[currentLane]) < 10 &&
        abs(o.y - playerY) < 30
      ) {
        lives--;
        obstacles.splice(i, 1);

        if (lives <= 0) {
          gameOver = true;
        }
      }

      // remove off screen
      if (o.y > height) {
        obstacles.splice(i, 1);
      }
    }

    // UI
    fill(255);
    textSize(16);
    text("Score: " + score, 10, 20);
    text("Lives: " + lives, 300, 20);
  }

  else {
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("Game Over", width / 2, height / 2);
    textSize(14);
    text("Click to Restart", width / 2, height / 2 + 30);
  }
}

function mousePressed() {
  if (gameOver) {
    resetGame();
    return;
  }

  currentLane++;
  if (currentLane > 2) currentLane = 0;
}

function resetGame() {
  currentLane = 1;
  obstacles = [];
  speed = 3;
  score = 0;
  lives = 3;
  gameOver = false;
}

let x = 200;
let y = 300;
let vx = 0;
let vy = 0;

let score = 0;
let gameOver = false;

function setup() {
  createCanvas(400, 600);
}

function draw() {
  background(30);

  if (!gameOver) {

    // gravity
    vy += 0.4;
    y += vy;

    // wind (simple left-right)
    vx = random(-1, 1);
    x += vx;

    // limits
    x = constrain(x, 20, width - 20);

    // draw kite (simple diamond)
    fill(255);
    noStroke();
    beginShape();
    vertex(x, y - 15);
    vertex(x + 15, y);
    vertex(x, y + 15);
    vertex(x - 15, y);
    endShape(CLOSE);

    // tail
    stroke(255);
    line(x, y + 15, x, y + 30);
    noStroke();

    // score
    score++;
    fill(255);
    textSize(16);
    text("Score: " + score, 10, 20);

    // ground hit
    if (y > height) {
      gameOver = true;
    }

    // top limit
    if (y < 0) {
      y = 0;
      vy = 0;
    }
  }

  else {
    fill(255);
    textSize(24);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2);
    textSize(14);
    text("Click to Restart", width / 2, height / 2 + 30);
  }
}

// click = go up
function mousePressed() {
  if (gameOver) {
    resetGame();
  } else {
    vy = -7;
  }
}

function resetGame() {
  x = 200;
  y = 300;
  vx = 0;
  vy = 0;
  score = 0;
  gameOver = false;
}

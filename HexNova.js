// =============================================
//  MULTI GAME PROJECT — sketch.js
//  Games: Kite | Cricket | Auto Rush
//  Press 1, 2, 3 to select | M = back to menu
// =============================================

const W = 400, H = 600;
let scene = 'menu'; // 'menu' | 'kite' | 'cricket' | 'auto'

// ── shared util ──────────────────────────────
function backHint() {
  fill(160);
  noStroke();
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text("Press M for menu", W / 2, H - 8);
}

// =============================================
//  KITE GAME STATE
// =============================================
let kite, kScore, kOver;

function kiteReset() {
  kite = { x: W / 2, y: H / 2, vx: 0, vy: 0, angle: 0, wind: 0, windTimer: 0, windTarget: 0 };
  kScore = 0;
  kOver = false;
}

function kiteUpdate() {
  if (kOver) return;
  kScore += 1 / 60;

  kite.windTimer++;
  if (kite.windTimer > random(60, 120)) { kite.windTarget = random(-1.5, 1.5); kite.windTimer = 0; }
  kite.wind = lerp(kite.wind, kite.windTarget, 0.03);

  kite.vy += 0.18;
  kite.vx += kite.wind * 0.07;
  kite.vx *= 0.97;
  kite.vy *= 0.97;
  kite.x += kite.vx;
  kite.y += kite.vy;
  kite.x = constrain(kite.x, 20, W - 20);
  kite.angle = lerp(kite.angle, kite.wind * 18, 0.07);

  if (kite.y >= H - 10) { kOver = true; kite.y = H - 10; }
  if (kite.y < 10)       { kite.y = 10; kite.vy = 0; }
}

function kiteDraw() {
  background(15, 15, 35);

  // score
  noStroke(); fill(255); textSize(16); textAlign(LEFT, TOP);
  text("Score: " + floor(kScore), 12, 12);
  backHint();

  if (!kOver) {
    kiteUpdateAndDraw();
  } else {
    kiteUpdateAndDraw();
    fill(0, 0, 0, 160); noStroke(); rect(0, 0, W, H);
    fill(255, 80, 100); textSize(38); textAlign(CENTER, CENTER);
    text("Game Over", W / 2, H / 2 - 40);
    fill(255); textSize(20);
    text("Score: " + floor(kScore), W / 2, H / 2 + 10);
    fill(180); textSize(13);
    text("Click to restart", W / 2, H / 2 + 50);
  }
}

function kiteUpdateAndDraw() {
  kiteUpdate();
  let x = kite.x, y = kite.y, a = kite.angle;
  push(); translate(x, y); rotate(radians(a));
  // tail
  noFill(); strokeWeight(1.5);
  let cx = 0, cy = 28;
  for (let i = 0; i < 7; i++) {
    let wave = sin(frameCount * 0.1 + i * 0.9) * (i * 1.8);
    let nx = cx + wave, ny = cy + 9;
    stroke(255, 140, 60, lerp(200, 30, i / 7));
    line(cx, cy, nx, ny); cx = nx; cy = ny;
  }
  // body
  noStroke(); fill(220, 60, 100);
  beginShape(); vertex(0,-28); vertex(20,0); vertex(0,28); vertex(-20,0); endShape(CLOSE);
  fill(255, 100, 140);
  beginShape(); vertex(0,-28); vertex(20,0); vertex(0,0); vertex(-20,0); endShape(CLOSE);
  stroke(255,255,255,60); strokeWeight(0.6);
  line(0,-28,0,28); line(-20,0,20,0);
  pop();
}

// =============================================
//  CRICKET GAME STATE
// =============================================
let cBall, cBat, cScore, cOver, cState;

function cricketReset() {
  cBat = { x: 340, y: H / 2, len: 80 };
  cScore = 0; cOver = false; cState = 'incoming';
  cricketNewBall();
}

function cricketNewBall() {
  cBall = { x: 0, y: random(H * 0.35, H * 0.65), vx: 4 + cScore * 0.25, vy: 0, r: 12 };
  cState = 'incoming';
}

function cricketUpdate() {
  if (cOver) return;
  if (cState === 'incoming') {
    cBall.x += cBall.vx;
    if (cBall.x > W + cBall.r) { cOver = true; }
  }
  if (cState === 'hit') {
    cBall.vy += 0.25;
    cBall.x += cBall.vx;
    cBall.y += cBall.vy;
    if (cBall.x > W + cBall.r || cBall.y > H + cBall.r) cricketNewBall();
  }
}

function cricketDraw() {
  background(245);
  cricketUpdate();

  // hit zone guide
  noFill(); stroke(100, 200, 100, 80); strokeWeight(1);
  rect(cBat.x - 45, cBat.y - cBat.len / 2, 45, cBat.len, 4);

  // bat
  stroke(80, 50, 20); strokeWeight(6);
  line(cBat.x, cBat.y - cBat.len / 2, cBat.x, cBat.y + cBat.len / 2);

  // ball
  noStroke(); fill(200, 30, 30);
  ellipse(cBall.x, cBall.y, cBall.r * 2);
  stroke(255, 180, 180); strokeWeight(1); noFill();
  arc(cBall.x, cBall.y, cBall.r * 1.2, cBall.r * 1.6, -PI / 2, PI / 2);
  arc(cBall.x, cBall.y, cBall.r * 1.2, cBall.r * 1.6, PI / 2, PI * 1.5);

  // score
  noStroke(); fill(30); textSize(20); textAlign(LEFT, TOP);
  text("Score: " + cScore, 12, 12);

  fill(150); textSize(11); textAlign(CENTER, BOTTOM);
  text("Click when ball enters green zone  |  M = menu", W / 2, H - 8);

  if (cOver) {
    fill(0, 0, 0, 150); noStroke(); rect(0, 0, W, H);
    fill(255); textSize(48); textAlign(CENTER, CENTER);
    text("OUT!", W / 2, H / 2 - 50);
    textSize(22); text("Score: " + cScore, W / 2, H / 2 + 8);
    fill(200); textSize(14); text("Click to restart", W / 2, H / 2 + 52);
  }
}

// =============================================
//  AUTO RUSH GAME STATE
// =============================================
const LANES = [100, 200, 300];
let aCar, aObs, aLives, aScore, aOver, aSpeed, aSpawnTimer;

function autoReset() {
  aCar = { lane: 1, y: H - 80, w: 36, h: 60, switching: false, targetX: LANES[1], x: LANES[1] };
  aObs = [];
  aLives = 3;
  aScore = 0;
  aOver = false;
  aSpeed = 3;
  aSpawnTimer = 0;
}

function autoUpdate() {
  if (aOver) return;
  aScore += 1 / 60;
  aSpeed = 3 + aScore * 0.04;

  // Smooth lane switch
  aCar.x = lerp(aCar.x, LANES[aCar.lane], 0.18);

  // Spawn obstacles
  aSpawnTimer++;
  if (aSpawnTimer > max(45, 90 - aScore * 0.5)) {
    let lane = floor(random(3));
    aObs.push({ x: LANES[lane], y: -40, w: 36, h: 56, lane });
    aSpawnTimer = 0;
  }

  // Move obstacles
  for (let o of aObs) o.y += aSpeed;

  // Collision check
  for (let i = aObs.length - 1; i >= 0; i--) {
    let o = aObs[i];
    if (
      abs(o.x - aCar.x) < 30 &&
      abs(o.y - aCar.y) < 50
    ) {
      aLives--;
      aObs.splice(i, 1);
      if (aLives <= 0) aOver = true;
    } else if (o.y > H + 60) {
      aObs.splice(i, 1);
    }
  }
}

function autoDraw() {
  background(30, 30, 30);
  autoUpdate();

  // Road
  stroke(60); strokeWeight(2);
  for (let lx of LANES) line(lx, 0, lx, H);
  // Lane dividers
  stroke(80); strokeWeight(1);
  line(LANES[0] + 50, 0, LANES[0] + 50, H);
  line(LANES[1] + 50, 0, LANES[1] + 50, H);

  // Obstacles (red cars)
  for (let o of aObs) {
    fill(220, 50, 50); noStroke();
    rect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h, 5);
    fill(180, 30, 30);
    rect(o.x - o.w / 2 + 4, o.y - o.h / 2 + 6, o.w - 8, 12, 3);
    rect(o.x - o.w / 2 + 4, o.y + o.h / 2 - 18, o.w - 8, 12, 3);
  }

  // Player car (blue)
  fill(60, 130, 255); noStroke();
  rect(aCar.x - aCar.w / 2, aCar.y - aCar.h / 2, aCar.w, aCar.h, 6);
  fill(30, 90, 200);
  rect(aCar.x - aCar.w / 2 + 4, aCar.y - aCar.h / 2 + 8, aCar.w - 8, 12, 3);
  rect(aCar.x - aCar.w / 2 + 4, aCar.y + aCar.h / 2 - 20, aCar.w - 8, 12, 3);
  // Headlights
  fill(255, 255, 180); noStroke();
  ellipse(aCar.x - 10, aCar.y - aCar.h / 2 + 4, 8, 5);
  ellipse(aCar.x + 10, aCar.y - aCar.h / 2 + 4, 8, 5);

  // HUD
  noStroke(); fill(255); textSize(16); textAlign(LEFT, TOP);
  text("Score: " + floor(aScore), 12, 12);
  textAlign(RIGHT, TOP);
  text("Lives: " + aLives, W - 12, 12);
  backHint();

  // Lives icons
  fill(255, 80, 80); noStroke();
  for (let i = 0; i < aLives; i++) {
    ellipse(W - 30 - i * 20, 38, 12, 12);
  }

  if (aOver) {
    fill(0, 0, 0, 160); noStroke(); rect(0, 0, W, H);
    fill(255, 80, 80); textSize(38); textAlign(CENTER, CENTER);
    text("Game Over", W / 2, H / 2 - 40);
    fill(255); textSize(20);
    text("Score: " + floor(aScore), W / 2, H / 2 + 10);
    fill(180); textSize(13);
    text("Click to restart", W / 2, H / 2 + 50);
  }
}

// =============================================
//  MENU
// =============================================
function menuDraw() {
  background(18, 18, 38);

  fill(255, 220, 80); textSize(32); textAlign(CENTER, CENTER); noStroke();
  text("🎮 Mini Games", W / 2, 120);

  let options = [
    { key: "1", label: "Kite Game",    color: [255, 80, 120] },
    { key: "2", label: "Cricket Game", color: [80, 200, 120] },
    { key: "3", label: "Auto Rush",    color: [80, 150, 255] },
  ];

  for (let i = 0; i < options.length; i++) {
    let o = options[i];
    let by = 240 + i * 90;
    fill(o.color[0], o.color[1], o.color[2], 40); noStroke();
    rect(80, by - 28, 240, 56, 12);
    stroke(o.color[0], o.color[1], o.color[2]); strokeWeight(1.5);
    rect(80, by - 28, 240, 56, 12);
    fill(o.color[0], o.color[1], o.color[2]); noStroke();
    textSize(11); textAlign(LEFT, CENTER);
    text("Press", 96, by);
    fill(255); textSize(22); textAlign(LEFT, CENTER);
    text(o.key, 130, by);
    textSize(18); textAlign(LEFT, CENTER);
    text(o.label, 156, by);
  }

  fill(120); textSize(11); textAlign(CENTER, BOTTOM);
  text("Press 1, 2 or 3 to start", W / 2, H - 20);
}

// =============================================
//  p5 LIFECYCLE
// =============================================
function setup() {
  createCanvas(W, H);
  textFont('monospace');
  kiteReset();
  cricketReset();
  autoReset();
}

function draw() {
  if      (scene === 'menu')    menuDraw();
  else if (scene === 'kite')    kiteDraw();
  else if (scene === 'cricket') cricketDraw();
  else if (scene === 'auto')    autoDraw();
}

function mousePressed() {
  if (scene === 'kite') {
    if (kOver) { kiteReset(); return; }
    kite.vy -= 5.5;
    kite.vy = max(kite.vy, -7);
  }

  if (scene === 'cricket') {
    if (cOver) { cricketReset(); return; }
    let hitLeft = cBat.x - 45, hitTop = cBat.y - cBat.len / 2, hitBot = cBat.y + cBat.len / 2;
    if (cState === 'incoming' && cBall.x >= hitLeft && cBall.x <= cBat.x + 10 && cBall.y >= hitTop && cBall.y <= hitBot) {
      cScore++;
      cState = 'hit';
      cBall.vx = random(3, 6);
      cBall.vy = random(-9, -6);
    }
  }

  if (scene === 'auto') {
    if (aOver) { autoReset(); return; }
    aCar.lane = (aCar.lane + 1) % 3;
  }
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    scene = 'menu';
    kiteReset(); cricketReset(); autoReset();
    return;
  }
  if (scene === 'menu') {
    if (key === '1') { kiteReset();    scene = 'kite'; }
    if (key === '2') { cricketReset(); scene = 'cricket'; }
    if (key === '3') { autoReset();    scene = 'auto'; }
  }
}
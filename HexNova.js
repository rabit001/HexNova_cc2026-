// ─────────────────────────────────────────────────────────
// 🎮 HEXNOVA ARCADE 
// (Audio Unlocker Fix + 10-Sec Loading + Indian Theme + All Songs)
// ─────────────────────────────────────────────────────────

let arcadeState = 'INIT'; 
let loadingTimer = 0;
let loadingDuration = 600; // 60 FPS * 10 Seconds = 10 seconds

// ==========================================
// AUDIO SYSTEM (Native JS)
// ==========================================
let themeSong = new Audio('sound/theme.mp3');
themeSong.loop = true;
themeSong.volume = 0.4;

let kiteSong = new Audio('sound/Udi Udi Jaaye.mp3');
kiteSong.loop = true;
kiteSong.volume = 0.5;

let rickshawSong = new Audio('sound/rikshaw.mp3');
rickshawSong.loop = true;
rickshawSong.volume = 0.5;

let kaataSound = new Audio('sound/kaata.mp3');
let fahhhSound = new Audio('sound/fahhh.mp3');

// ==========================================
// HIGH SCORE SYSTEM
// ==========================================
let highScores = { kite: 0, cricket: 0, rush: 0 };

try {
  let saved = localStorage.getItem('hexNovaHighScores');
  if (saved) { highScores = JSON.parse(saved); }
} catch (e) {
  console.log("Local storage not available");
}

function saveHighScores() {
  try { localStorage.setItem('hexNovaHighScores', JSON.stringify(highScores)); } catch (e) { }
}

// ==========================================
// 1. KITE DRIFT VARIABLES
// ==========================================
let k_W, k_H = 600, k_scaleF, k_wRatio, k_GROUND_Y = 510;
let k_player, k_enemies, k_score, k_gameOver, k_particles, k_flashTimer;

// ==========================================
// 2. CRICKET SIXER VARIABLES
// ==========================================
let c_state = 'START', c_score = 0, c_lastRuns = 0; 
let c_cx, c_H, c_W, c_pitchTop, c_pitchBottom, c_batsmanY, c_hitZoneStart, c_hitZoneEnd;
let c_ballY = 0, c_ballSpeed = 5, c_ballFlyY = 0, c_ballFlyX = 0, c_ballScale = 10;
let c_batAngle = 0, c_swingFrames = 0;
let hitSynth, crowdNoise, crowdEnv, soundInitialized = false;

// ==========================================
// 3. AUTO RUSH VARIABLES
// ==========================================
let r_W, r_H, r_cx, r_roadWidth;
let r_state = 'START', r_score = 0, r_lives = 3, r_speedMult = 1;
let r_player = { x: 0, y: 0, speed: 0, maxSpeed: 20, minSpeed: 4, w: 32, h: 54, invulnTimer: 0, scaleFactor: 1 };
let r_roadOffset = 0, r_obstacles = [], r_scenery = [], r_particles = [], r_shakeTimer = 0;

// ─── SETUP & WINDOW RESIZE ──────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  textAlign(CENTER, CENTER);
  updateAllLayouts();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateAllLayouts();
}

function updateAllLayouts() {
  k_scaleF = windowHeight / 600;
  k_W = windowWidth / k_scaleF;
  k_wRatio = k_W / 400;

  c_W = windowWidth; c_H = windowHeight; c_cx = c_W / 2;
  c_pitchTop = c_H * 0.25; c_pitchBottom = c_H; c_batsmanY = c_H * 0.80;
  c_hitZoneStart = c_H * 0.70; c_hitZoneEnd = c_H * 0.85;

  r_W = windowWidth; r_H = windowHeight; r_cx = r_W / 2;
  r_roadWidth = min(r_W * 0.85, 500); r_player.y = r_H * 0.85;
}

function initSound() {
  if (!soundInitialized && typeof p5.PolySynth !== 'undefined') {
    userStartAudio(); // p5.sound engine unlock
    hitSynth = new p5.MonoSynth();
    crowdNoise = new p5.Noise('pink'); crowdNoise.amp(0); crowdNoise.start();
    crowdEnv = new p5.Envelope(); crowdEnv.setADSR(0.5, 0.2, 0.8, 2.5); crowdEnv.setRange(0.6, 0); 
    soundInitialized = true;
  }
}

// ─── MAIN DRAW LOOP ────────────────────────────────────
function draw() {
  if (arcadeState === 'INIT') {
    drawInitScreen();
  } else if (arcadeState === 'LOADING') {
    drawLoadingScreen();
  } else if (arcadeState === 'MENU') {
    drawMenu();
  } else if (arcadeState === 'KITE') {
    drawKiteGame();
    drawBackButton();
  } else if (arcadeState === 'CRICKET') {
    drawCricketGame();
    drawBackButton();
  } else if (arcadeState === 'RUSH') {
    drawAutoRushGame();
    drawBackButton();
  }
}

// ─── AUDIO UNLOCK SCREEN ───────────────────────────────
function drawInitScreen() {
  background(15, 20, 35);
  fill(255, 204, 0);
  textSize(min(width * 0.08, 60));
  text("HEXNOVA ARCADE", width / 2, height / 2 - 40);
  
  fill(255);
  textSize(20);
  // Blink effect
  if (frameCount % 60 < 30) {
    text("CLICK ANYWHERE TO START", width / 2, height / 2 + 40);
  }
}

// ─── 10 SECONDS LOADING SCREEN ─────────────────────────
function drawLoadingScreen() {
  background(15, 20, 35);
  loadingTimer++;

  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(255, 204, 0);
  fill(255, 220, 50);
  textSize(min(width * 0.08, 80));
  text("HEXNOVA", width / 2, height / 2 - 60);

  drawingContext.shadowBlur = 0; 
  fill(180, 220, 255);
  textSize(min(width * 0.03, 20));
  text("The Ultimate Desi Arcade Experience", width / 2, height / 2 + 10);

  let barW = min(width * 0.6, 400);
  let barH = 20;
  let progress = min(loadingTimer / loadingDuration, 1);
  
  noFill(); stroke(255, 255, 255, 100); strokeWeight(2);
  rect(width / 2 - barW / 2, height / 2 + 80, barW, barH, 10);
  
  noStroke(); fill(222, 255, 154);
  rect(width / 2 - barW / 2 + 4, height / 2 + 84, (barW - 8) * progress, barH - 8, 10);
  
  fill(255); textSize(14);
  let dots = ".".repeat(floor(frameCount / 15) % 4);
  text("Loading Game Assets" + dots, width / 2, height / 2 + 130);

  if (loadingTimer >= loadingDuration) {
    arcadeState = 'MENU';
  }
}

// ─── PREMIUM MENU UI ───────────────────────────────────
let menuAnimTime = 0;
let menuCards = [];

function drawMenu() {
  menuAnimTime += 0.05;

  let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgb(15, 20, 35)");
  gradient.addColorStop(1, "rgb(45, 25, 60)");
  drawingContext.fillStyle = gradient;
  noStroke(); rect(0, 0, width, height);

  for (let i = 0; i < 25; i++) {
    let px = (noise(i, frameCount * 0.003) * width * 1.5) - width * 0.25;
    let py = (noise(i + 100, frameCount * 0.003) * height * 1.5) - height * 0.25;
    fill(255, 255, 255, 20 + sin(frameCount * 0.05 + i) * 30);
    ellipse(px, py, noise(i + 200) * 12);
  }

  let titleY = height * 0.12 + sin(menuAnimTime) * 8;
  drawingContext.shadowBlur = 25; drawingContext.shadowColor = color(255, 204, 0);
  fill(255, 220, 50); textSize(min(width * 0.08, 60)); text("HEXNOVA", width / 2, titleY);
  drawingContext.shadowBlur = 0; 
  fill(180, 220, 255); textSize(min(width * 0.035, 18)); text("Choose your flavor. Play to beat the High Score!", width / 2, titleY + 55);

  let cardW = min(width * 0.85, 420); let cardH = min(height * 0.2, 130);
  let startY = height * 0.30; let gap = cardH + 25;

  menuCards = [
    { id: 'KITE', icon: "🪁", title: "Kite Drift", subtitle: "Cut enemy manja from below!", col: [40, 140, 240], hs: highScores.kite, y: startY },
    { id: 'CRICKET', icon: "🏏", title: "Cricket Sixer", subtitle: "Hit Chakka & Chauka with perfect timing!", col: [60, 200, 100], hs: highScores.cricket, y: startY + gap },
    { id: 'RUSH', icon: "🛺", title: "Rickshaw Rush", subtitle: "Dodge traffic & Indian potholes!", col: [255, 90, 70], hs: highScores.rush, y: startY + gap * 2 }
  ];

  for (let card of menuCards) {
    let isHover = mouseX > width/2 - cardW/2 && mouseX < width/2 + cardW/2 && mouseY > card.y && mouseY < card.y + cardH;
    push(); translate(width / 2, card.y + cardH / 2); if (isHover) scale(1.05); 
    drawingContext.shadowBlur = isHover ? 30 : 15; drawingContext.shadowColor = color(card.col[0], card.col[1], card.col[2], isHover ? 200 : 80);
    fill(20, 25, 35, 220); strokeWeight(2); stroke(isHover ? color(card.col[0], card.col[1], card.col[2]) : color(card.col[0], card.col[1], card.col[2], 100)); rect(-cardW / 2, -cardH / 2, cardW, cardH, 18);
    noStroke(); drawingContext.shadowBlur = 0; 
    fill(card.col[0], card.col[1], card.col[2]); rect(-cardW / 2, -cardH / 2, 12, cardH, 18, 0, 0, 18);
    textSize(min(width * 0.1, 55)); textAlign(CENTER, CENTER); text(card.icon, -cardW / 2 + 55, 0);
    textAlign(LEFT, CENTER); fill(255); textSize(min(width * 0.06, 26)); text(card.title, -cardW / 2 + 100, -15);
    fill(180, 190, 200); textSize(min(width * 0.035, 14)); text(card.subtitle, -cardW / 2 + 100, 20);
    fill(10, 15, 25); stroke(card.col[0], card.col[1], card.col[2], 150); strokeWeight(1); rect(cardW / 2 - 105, -cardH / 2 + 15, 90, 28, 14); noStroke();
    fill(255, 220, 100); textSize(12); textAlign(CENTER, CENTER); text("Best: " + card.hs, cardW / 2 - 60, -cardH / 2 + 29);
    pop();
  }
}

function drawBackButton() {
  let isHover = mouseX > 10 && mouseX < 110 && mouseY > 10 && mouseY < 50;
  fill(isHover ? 200 : 255, 50, 50, 220); stroke(255); strokeWeight(2); rect(10, 10, 100, 40, 8); noStroke();
  fill(255); textSize(18); text("< MENU", 60, 30);
}

// ─── INPUT HANDLING ────────────────────────────────────
function mousePressed() {
  if (!soundInitialized) initSound();

  // 1. FIRST CLICK UNLOCKS AUDIO
  if (arcadeState === 'INIT') {
    themeSong.play().catch(e => console.log("Audio play allowed after interaction"));
    arcadeState = 'LOADING';
    return;
  }

  // Handle Back Button (Wapas Menu par aaye)
  if (arcadeState !== 'MENU' && arcadeState !== 'LOADING') {
    if (mouseX > 10 && mouseX < 110 && mouseY > 10 && mouseY < 50) {
      arcadeState = 'MENU';
      kiteSong.pause(); 
      rickshawSong.pause(); // Pause Rickshaw song
      if (themeSong.paused) themeSong.play().catch(e=>{});
      return; 
    }
  }

  // Handle Menu Card Selection
  if (arcadeState === 'MENU') {
    let cardW = min(width * 0.85, 420), cardH = min(height * 0.2, 130);
    for (let card of menuCards) {
      if (mouseX > width/2 - cardW/2 && mouseX < width/2 + cardW/2 && mouseY > card.y && mouseY < card.y + cardH) {
        arcadeState = card.id;
        themeSong.pause(); // Pause theme song when entering ANY game

        if (card.id === 'KITE') { 
          k_resetGame(); 
          kiteSong.currentTime = 0; 
          kiteSong.play().catch(e=>{}); 
        }
        if (card.id === 'CRICKET') { 
          c_enterGame(); 
        }
        if (card.id === 'RUSH') { 
          r_resetGame(); 
          r_state = 'START'; 
          rickshawSong.currentTime = 0; 
          rickshawSong.play().catch(e=>{}); // Play Rickshaw song
        }
        break;
      }
    }
  } 
  else if (arcadeState === 'KITE') {
    if (k_gameOver) { k_resetGame(); return; }
    k_player.vy -= 5.8; k_player.vy = max(k_player.vy, -7.5);
  } 
  else if (arcadeState === 'CRICKET') {
    if (c_state === 'START' || c_state === 'OVER') { c_resetGame(); return; }
    if (c_state === 'PLAY') {
      c_swingFrames = 12; 
      if (c_ballY > c_hitZoneStart && c_ballY < c_hitZoneEnd) {
        c_state = 'HIT';
        let acc = 1 - (abs(c_ballY - ((c_hitZoneStart + c_hitZoneEnd)/2)) / ((c_hitZoneEnd - c_hitZoneStart)/2)); 
        if (acc > 0.85) c_lastRuns = 6; else if (acc > 0.65) c_lastRuns = 4; else if (acc > 0.40) c_lastRuns = 3; else if (acc > 0.20) c_lastRuns = 2; else c_lastRuns = 1;
        c_score += c_lastRuns;
        if (c_score > highScores.cricket) { highScores.cricket = c_score; saveHighScores(); }
        c_ballFlyY = c_ballY; c_ballFlyX = 0;
        if (soundInitialized) { hitSynth.play('C5', 1, 0, 0.1); if (c_lastRuns >= 4) setTimeout(() => crowdEnv.play(crowdNoise), 200); }
      } else { 
        c_state = 'OVER'; // Out due to bad timing outside zone
        fahhhSound.currentTime = 0; fahhhSound.play().catch(e=>{}); // FAHH SOUND ON OUT
      }
    }
  } 
  else if (arcadeState === 'RUSH') {
    if (r_state === 'START' || r_state === 'OVER') { r_resetGame(); r_state = 'PLAY'; }
  }
}

// =========================================================================
// 1. KITE DRIFT 
// =========================================================================
function k_resetGame() {
  k_player = { x: k_W / 2, y: k_H / 2, vy: 0, vx: 0, angle: 0, wind: 0, windTimer: 0, windTarget: 0, string: [] };
  k_enemies = []; k_particles = []; k_score = 0; k_gameOver = false; k_flashTimer = 0;
  for (let i = 0; i < 3; i++) k_spawnEnemy(true);
}

function k_spawnEnemy(initial) {
  let side = random() > 0.5 ? 1 : -1; let x = side === 1 ? k_W + 30 : -30; let y = random(60, k_GROUND_Y - 60);
  let col = random([[80,200,120], [240,160,40], [60,160,255], [200,80,255], [255,200,40], [255,100,60]]);
  let baseVx = random(1.2, 2.2) * k_wRatio;
  k_enemies.push({ x: x, y: y, vx: side === -1 ? baseVx : -baseVx, vy: random(-0.4, 0.4), angle: 0, wind: 0, windTimer: 0, windTarget: random(-1, 1) * k_wRatio, hue: col, string: [], alive: true });
}

function k_burst(x, y, col) {
  for (let i = 0; i < 18; i++) {
    let a = random(TWO_PI); let spd = random(1.5, 5);
    k_particles.push({ x: x, y: y, vx: cos(a)*spd, vy: sin(a)*spd, life: 1, col: col, r: random(2, 5) });
  }
}

function k_drawScenery() {
  for (let i = 0; i <= 30; i++) { let t = i / 30; stroke(lerp(100,185,t), lerp(180,225,t), lerp(240,250,t)); strokeWeight(k_GROUND_Y / 30 + 1); line(0, (k_GROUND_Y / 30) * i, k_W, (k_GROUND_Y / 30) * i); } noStroke();
  fill(255, 230, 80, 70); ellipse(k_W * 0.82, 62, 72); fill(255, 225, 50, 90); ellipse(k_W * 0.82, 62, 54); fill(255, 215, 30); ellipse(k_W * 0.82, 62, 42);
  k_drawCloud(k_W * 0.15, 70, 1.0); k_drawCloud(k_W * 0.50, 50, 0.8); k_drawCloud(k_W * 0.77, 85, 0.7);
  stroke(50, 60, 90); strokeWeight(1.5); noFill();
  let birds = [[k_W*0.18, k_H*0.13], [k_W*0.22, k_H*0.12], [k_W*0.44, k_H*0.09], [k_W*0.48, k_H*0.095], [k_W*0.60, k_H*0.14]];
  for (let [bx, by] of birds) { let s = 7; arc(bx - s * 0.6, by, s * 1.1, s * 0.6, PI, TWO_PI); arc(bx + s * 0.6, by, s * 1.1, s * 0.6, PI, TWO_PI); } noStroke();
  fill(155, 195, 125, 180); ellipse(k_W * 0.15, k_GROUND_Y + 4, k_W * 0.44, 80); ellipse(k_W * 0.55, k_GROUND_Y + 4, k_W * 0.50, 70); ellipse(k_W * 0.88, k_GROUND_Y + 4, k_W * 0.38, 75);
  fill(95, 160, 65); rect(0, k_GROUND_Y, k_W, k_H - k_GROUND_Y); fill(125, 190, 80); rect(0, k_GROUND_Y, k_W, 8);
  fill(190, 162, 105, 210); beginShape(); vertex(k_W * 0.39, k_GROUND_Y); vertex(k_W * 0.61, k_GROUND_Y); vertex(k_W * 0.76, k_H); vertex(k_W * 0.24, k_H); endShape(CLOSE);
  k_drawTree(k_W * 0.05, k_GROUND_Y, 80); k_drawTree(k_W * 0.14, k_GROUND_Y, 65); k_drawTree(k_W * 0.76, k_GROUND_Y, 75); k_drawTree(k_W * 0.87, k_GROUND_Y, 85); k_drawTree(k_W * 0.94, k_GROUND_Y, 60);
  k_drawHouse(k_W * 0.27, k_GROUND_Y, 100, 62); k_drawHouse(k_W * 0.60, k_GROUND_Y, 90, 56);
}

function k_drawCloud(cx, cy, sc) { noStroke(); fill(255, 255, 255, 210); ellipse(cx, cy, 55 * sc, 30 * sc); ellipse(cx - 22 * sc, cy + 6 * sc, 38 * sc, 24 * sc); ellipse(cx + 22 * sc, cy + 6 * sc, 38 * sc, 24 * sc); ellipse(cx, cy + 10 * sc, 50 * sc, 22 * sc); }
function k_drawTree(x, gy, tH) { let tW = tH * 0.14; let trH = tH * 0.36; let cr = tH * 0.48; fill(115, 75, 35); noStroke(); rect(x - tW / 2, gy - trH, tW, trH, 3); fill(45, 135, 55); ellipse(x, gy - trH - cr * 0.5, cr * 1.9, cr * 1.4); fill(60, 160, 65); ellipse(x - cr * 0.18, gy - trH - cr * 0.85, cr * 1.5, cr * 1.2); fill(80, 185, 72); ellipse(x + cr * 0.1, gy - trH - cr * 1.1, cr * 1.1, cr); }
function k_drawHouse(cx, gy, hw, hh) { let wallH = hh * 0.60; let roofH = hh * 0.50; fill(240, 215, 170); noStroke(); rect(cx - hw / 2, gy - wallH, hw, wallH); fill(185, 65, 50); triangle(cx - hw / 2 - 6, gy - wallH, cx + hw / 2 + 6, gy - wallH, cx, gy - wallH - roofH); fill(170, 215, 235); stroke(150, 120, 70); strokeWeight(1); rect(cx - hw * 0.30, gy - wallH * 0.68, hw * 0.28, wallH * 0.28, 2); noStroke(); fill(130, 85, 45); let dw = hw * 0.20, dh = wallH * 0.44; rect(cx + hw * 0.10, gy - dh, dw, dh, dw * 0.35); }

function drawKiteGame() {
  push();
  scale(k_scaleF);
  k_drawScenery();

  if (k_flashTimer > 0) { noStroke(); fill(255, 255, 100, k_flashTimer * 4); rect(0, 0, k_W, k_H); k_flashTimer--; }

  if (!k_gameOver) {
    k_score += 1 / 60;
    if (floor(k_score) > highScores.kite) { highScores.kite = floor(k_score); saveHighScores(); }

    k_player.windTimer++; 
    if (k_player.windTimer > random(60, 120)) { k_player.windTarget = random(-0.7, 0.7) * k_wRatio; k_player.windTimer = 0; }
    
    k_player.wind = lerp(k_player.wind, k_player.windTarget, 0.02); 
    k_player.vy += 0.18; k_player.vx += k_player.wind * 0.07; k_player.vx *= 0.97; k_player.vy *= 0.97; k_player.x += k_player.vx; k_player.y += k_player.vy; k_player.x = constrain(k_player.x, 20, k_W - 20); k_player.angle = lerp(k_player.angle, k_player.wind * 18, 0.07);
    
    k_player.string.unshift({ x: k_player.x, y: k_player.y }); if (k_player.string.length > 22) k_player.string.pop();
    
    if (k_player.y >= k_GROUND_Y - 10) { 
      if (!k_gameOver) { fahhhSound.currentTime = 0; fahhhSound.play().catch(e=>{}); } // FAHH SOUND
      k_gameOver = true; k_player.y = k_GROUND_Y - 10; 
    } 
    if (k_player.y < 10) { k_player.y = 10; k_player.vy = 0; }

    for (let e of k_enemies) {
      if (!e.alive) continue;
      
      e.windTimer++; if (e.windTimer > random(80, 160)) { e.windTarget = random(-1, 1) * k_wRatio; e.windTimer = 0; }
      e.wind = lerp(e.wind, e.windTarget, 0.025); e.vy += e.wind * 0.05; e.vy *= 0.97; e.vx *= 0.995; e.x += e.vx; e.y += e.vy; e.y = constrain(e.y, 40, k_GROUND_Y - 50); e.angle = lerp(e.angle, e.wind * 15, 0.06);
      e.string.unshift({ x: e.x, y: e.y }); if (e.string.length > 20) e.string.pop();
      
      let dx = k_player.x - e.x; let dy = k_player.y - e.y; let dist = sqrt(dx * dx + dy * dy);
      
      if (dist < 38) {
        if (k_player.y > e.y) { 
          e.alive = false; k_flashTimer = 12; k_burst(e.x, e.y, e.hue); k_spawnEnemy(false); k_score += 10; 
          kaataSound.currentTime = 0; kaataSound.play().catch(e=>{});
        } 
        else if (e.y > k_player.y) { 
          k_gameOver = true; k_burst(k_player.x, k_player.y, [255, 60, 100]); k_flashTimer = 20; 
          fahhhSound.currentTime = 0; fahhhSound.play().catch(e=>{}); // FAHH SOUND
        } 
        else { k_player.vx -= dx * 0.05; k_player.vy -= dy * 0.05; } 
        continue;
      }
      
      for (let i = 0; i < e.string.length - 1; i++) {
        let mx = (e.string[i].x + e.string[i + 1].x) / 2; let my = (e.string[i].y + e.string[i + 1].y) / 2;
        let sdx = k_player.x - mx, sdy = k_player.y - my;
        if (sqrt(sdx * sdx + sdy * sdy) < 14) { 
          if (k_player.y > my) { 
            e.alive = false; k_flashTimer = 12; k_burst(e.x, e.y, e.hue); k_spawnEnemy(false); k_score += 5; 
            kaataSound.currentTime = 0; kaataSound.play().catch(e=>{});
          } 
          break; 
        }
      }
      
      if (e.y > k_player.y) {
        for (let i = 0; i < e.string.length - 1; i++) {
          let mx = (e.string[i].x + e.string[i + 1].x) / 2; let my = (e.string[i].y + e.string[i + 1].y) / 2;
          let sdx = k_player.x - mx, sdy = k_player.y - my;
          if (sqrt(sdx * sdx + sdy * sdy) < 14 && my < k_player.y) { 
            k_gameOver = true; k_burst(k_player.x, k_player.y, [255, 60, 100]); k_flashTimer = 20; 
            fahhhSound.currentTime = 0; fahhhSound.play().catch(e=>{}); // FAHH SOUND
            break; 
          }
        }
      }
    }
    
    k_enemies = k_enemies.filter(e => e.alive);
    if (k_enemies.length < min(3 + floor(k_score / 20), 7) && frameCount % 120 === 0) { k_spawnEnemy(false); }
    for (let pt of k_particles) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.1; pt.vx *= 0.95; pt.vy *= 0.95; pt.life -= 0.03; }
    k_particles = k_particles.filter(pt => pt.life > 0);
  }

  for (let e of k_enemies) {
    if (e.string.length < 2) continue; noFill(); strokeWeight(0.8); 
    for (let i = 0; i < e.string.length - 1; i++) { let t = 1 - i / e.string.length; stroke(e.hue[0], e.hue[1], e.hue[2], t * 180); line(e.string[i].x, e.string[i].y, e.string[i + 1].x, e.string[i + 1].y); }
  }
  
  if (k_player.string.length >= 2) {
    noFill(); strokeWeight(1.2); 
    for (let i = 0; i < k_player.string.length - 1; i++) { let t = 1 - i / k_player.string.length; stroke(180, 120, 40, t * 180); line(k_player.string[i].x, k_player.string[i].y, k_player.string[i + 1].x, k_player.string[i + 1].y); }
  }

  for (let e of k_enemies) k_drawKite(e.x, e.y, e.angle, e.hue, 20, 28, false);
  for (let pt of k_particles) { let [r, g, b] = pt.col; noStroke(); fill(r, g, b, pt.life * 220); ellipse(pt.x, pt.y, pt.r * pt.life * 2); }
  k_drawKite(k_player.x, k_player.y, k_player.angle, [220, 50, 20], 22, 32, true);

  noStroke(); fill(0, 0, 0, 80); rect(k_W / 2 - 120, 8, 240, 28, 14); fill(255, 250, 220); textSize(14); text("Score: " + floor(k_score) + "   |   High: " + highScores.kite, k_W / 2, 23);
  fill(60, 40, 10, 200); textSize(11); textAlign(LEFT, TOP); text("Rivals: " + k_enemies.length, 10, 12);
  fill(60, 40, 10, 150); textSize(10); textAlign(CENTER, BOTTOM); text("Go BELOW enemy to cut  •  Don't let them get below you!", k_W / 2, k_H - 6);

  if (k_gameOver) {
    fill(0, 0, 0, 160); noStroke(); rect(0, 0, k_W, k_H); 
    fill(255, 80, 40); textSize(38); textAlign(CENTER, CENTER); text("KITE CUT!", k_W / 2, k_H / 2 - 60);
    fill(255, 220, 80); textSize(15); text("An enemy got below and cut your string!", k_W / 2, k_H / 2 - 20);
    fill(255, 255, 255, 220); textSize(22); text("Score: " + floor(k_score), k_W / 2, k_H / 2 + 18);
    fill(200, 230, 255, 200); textSize(13); text("Click to fly again", k_W / 2, k_H / 2 + 60);
  }
  pop();
}

function k_drawKite(x, y, angleDeg, col, w, h, isPlayer) {
  push(); translate(x, y); rotate(radians(angleDeg)); let [r, g, b] = col; noFill(); strokeWeight(1.4); let cx = 0, cy = h;
  for (let i = 0; i < 7; i++) { let wave = sin(frameCount * 0.1 + i * 0.9) * (i * 1.8); let nx = cx + wave, ny = cy + 9; let t = i / 7; stroke(r, g, b, lerp(200, 30, t)); line(cx, cy, nx, ny); cx = nx; cy = ny; }
  noStroke(); fill(r, g, b, isPlayer ? 50 : 35); beginShape(); vertex(0, -(h + 3)); vertex(w + 3, 2); vertex(0, h + 3); vertex(-(w + 3), 2); endShape(CLOSE);
  fill(r * 0.85, g * 0.85, b * 0.85); beginShape(); vertex(0, -h); vertex(w, 0); vertex(0, h); vertex(-w, 0); endShape(CLOSE);
  fill(min(r + 40, 255), min(g + 40, 255), min(b + 40, 255)); beginShape(); vertex(0, -h); vertex(w, 0); vertex(0, 0); vertex(-w, 0); endShape(CLOSE);
  stroke(255, 255, 255, 80); strokeWeight(0.6); line(0, -h, 0, h); line(-w, 0, w, 0);
  if (isPlayer) { noFill(); stroke(255, 255, 255, 60); strokeWeight(0.5); ellipse(0, 0, (w + h) * 0.7); } pop();
}


// =========================================================================
// 2. CRICKET SIXER
// =========================================================================
function c_enterGame() { c_score = 0; c_state = 'START'; c_ballY = c_pitchTop; c_swingFrames = 0; c_batAngle = 0; }
function c_resetGame() { c_score = 0; c_nextBall(); }
function c_nextBall() { c_ballY = c_pitchTop; c_ballSpeed = random(c_H * 0.012, c_H * 0.018); c_state = 'PLAY'; }

function c_drawEnvironment() {
  background(60, 160, 60); 
  fill(255, 153, 51); arc(c_cx, c_pitchTop - 100, c_W * 1.5, c_H * 0.6, 0, PI); 
  fill(255, 255, 255); arc(c_cx, c_pitchTop - 100, c_W * 1.4, c_H * 0.5, 0, PI); 
  fill(19, 136, 8); arc(c_cx, c_pitchTop - 100, c_W * 1.2, c_H * 0.4, 0, PI);
  stroke(0, 0, 128, 100); noFill(); ellipse(c_cx, c_pitchTop - 100 + c_H * 0.23, 40, 40); noStroke();
  
  fill(210, 180, 140); stroke(255); strokeWeight(2); let pitchTopW = c_W * 0.15; let pitchBotW = c_W * 0.35;
  quad(c_cx - pitchTopW, c_pitchTop, c_cx + pitchTopW, c_pitchTop, c_cx + pitchBotW, c_pitchBottom, c_cx - pitchBotW, c_pitchBottom);
  line(c_cx - pitchBotW * 0.8, c_batsmanY, c_cx + pitchBotW * 0.8, c_batsmanY); line(c_cx - pitchTopW * 1.1, c_pitchTop + 30, c_cx + pitchTopW * 1.1, c_pitchTop + 30); noStroke();
}

function c_drawWickets() {
  push(); translate(c_cx, c_batsmanY + 30); fill(220, 180, 50);
  rect(-12, -45, 5, 45, 2); rect(-2.5, -45, 5, 45, 2); rect(7, -45, 5, 45, 2);
  fill(200, 150, 30); rect(-12, -47, 10, 3, 2); rect(-1, -47, 10, 3, 2); pop();
}

function c_drawBatsman() {
  push(); translate(c_cx, c_batsmanY); 
  fill(45, 136, 255); rect(-15, -40, 30, 40, 5); 
  fill(255, 204, 0); textSize(8); textAlign(CENTER, CENTER); text("INDIA", 0, -20);
  fill(255); rect(-15, 0, 10, 35); rect(5, 0, 10, 35); 
  fill(0, 51, 153); ellipse(0, -50, 26, 26);
  stroke(200); strokeWeight(2); line(-10, -45, 10, -45); noStroke(); 
  push(); translate(15, -30); rotate(c_batAngle); fill(50); rect(-3, 0, 6, 20); fill(200, 150, 50); rect(-6, 20, 12, 45, 2); pop(); pop();
}

function drawCricketGame() {
  c_drawEnvironment(); c_drawWickets(); c_drawBatsman();

  if (c_state === 'START') { 
    fill(0, 150); rect(0, 0, c_W, c_H); fill(255); stroke(0); strokeWeight(2); textSize(30); text("TAP TO START GAME", c_cx, c_H / 2); return; 
  }

  if (c_state === 'PLAY') {
    c_ballY += c_ballSpeed; c_ballScale = map(c_ballY, c_pitchTop, c_batsmanY, 8, 25);
    fill(200, 30, 30); stroke(255, 255, 255, 150); strokeWeight(1); ellipse(c_cx, c_ballY, c_ballScale, c_ballScale); noStroke();
    if (c_ballY > c_batsmanY + 40) {
      c_state = 'OVER';
      fahhhSound.currentTime = 0; fahhhSound.play().catch(e=>{}); // FAHH SOUND ON BALL MISS
    }
  } 
  else if (c_state === 'HIT') {
    c_ballFlyY -= (c_H * 0.02); c_ballFlyX += random(-3, 3); let flyScale = map(c_ballFlyY, c_batsmanY, 0, 25, 4); 
    fill(200, 30, 30); stroke(255, 255, 255, 150); strokeWeight(1); ellipse(c_cx + c_ballFlyX, c_ballFlyY, max(flyScale, 2)); noStroke();
    if (c_lastRuns === 6) fill(255, 204, 0); else if (c_lastRuns === 4) fill(100, 200, 255); else fill(255);
    stroke(0); strokeWeight(5); textSize(c_H * 0.08); 
    if (c_lastRuns === 6) text("CHAKKA (6)!", c_cx, c_H * 0.4); else if (c_lastRuns === 4) text("CHAUKA (4)!", c_cx, c_H * 0.4); else text(c_lastRuns + " RUNS", c_cx, c_H * 0.4);
    noStroke(); if (c_ballFlyY < -50) c_nextBall();
  } 
  else if (c_state === 'OVER') {
    fill(200, 30, 30); stroke(255, 255, 255, 150); strokeWeight(1); ellipse(c_cx, c_ballY, c_ballScale, c_ballScale); noStroke();
    fill(255, 50, 50); stroke(255); strokeWeight(4); textSize(c_H * 0.1); text("OUT!", c_cx, c_H * 0.4); fill(255); stroke(0); strokeWeight(2); textSize(c_H * 0.04); text("GAME OVER\nTap to Restart", c_cx, c_H * 0.55);
  }

  if (c_swingFrames > 0) { c_batAngle = lerp(c_batAngle, PI / 1.5, 0.3); c_swingFrames--; } else { c_batAngle = lerp(c_batAngle, 0, 0.2); }

  if (c_state === 'PLAY') { 
    let zoneW = c_W * 0.3; let zoneHeight = c_hitZoneEnd - c_hitZoneStart;
    stroke(0, 255, 0, 150); strokeWeight(3); let centerZone = c_hitZoneStart + (zoneHeight / 2); line(c_cx - zoneW, centerZone, c_cx + zoneW, centerZone);
    stroke(255, 50, 50, 150); strokeWeight(1); line(c_cx - zoneW, c_hitZoneStart, c_cx + zoneW, c_hitZoneStart); line(c_cx - zoneW, c_hitZoneEnd, c_cx + zoneW, c_hitZoneEnd); noStroke(); 
  }

  fill(0, 180); rect(0, 0, c_W, 60); fill(255); textSize(24); 
  textAlign(LEFT, CENTER); text("SCORE: " + c_score, 20, 30);
  textAlign(RIGHT, CENTER); text("HIGH SCORE: " + highScores.cricket, c_W - 20, 30); textAlign(CENTER, CENTER); 
}


// =========================================================================
// 3. AUTO RUSH 
// =========================================================================
function r_resetGame() {
  r_score = 0; r_lives = 3; r_speedMult = 1;
  r_player.x = r_cx; r_player.speed = r_player.minSpeed; r_player.scaleFactor = 1; 
  r_obstacles = []; r_scenery = []; r_particles = []; r_roadOffset = 0;
  for(let i = 0; i < 15; i++) { r_spawnScenery(random(r_H)); }
}

function r_spawnObstacle() {
  let laneBase = random([r_cx - r_roadWidth*0.28, r_cx, r_cx + r_roadWidth*0.28]);
  let obsX = laneBase + random(-40, 40); 
  let typeNum = random(); let type = typeNum > 0.85 ? 'POTHOLE' : (typeNum > 0.7 ? 'COW' : (typeNum > 0.45 ? 'TRUCK' : 'CAR'));
  let speed = 0; let w = 34, h = 64;
  if (type === 'CAR') { speed = random(6, 10); h = 64; } else if (type === 'TRUCK') { speed = random(4, 7); w = 46; h = 100; } else if (type === 'COW') { speed = 0; w = 25; h = 35; } else if (type === 'POTHOLE') { speed = 0; w = 45; h = 35; }
  r_obstacles.push({ x: obsX, y: -100, w: w, h: h, speed: speed, type: type, color: [random(100,255), random(100,255), random(100,255)], passed: false });
}

function r_spawnScenery(y) {
  let isLeft = random() > 0.5; let type = random() > 0.8 ? 'SHOP' : 'TREE';
  let x = isLeft ? random(0, r_cx - r_roadWidth/2 - 40) : random(r_cx + r_roadWidth/2 + 40, r_W);
  r_scenery.push({ x: x, y: y, type: type, isLeft: isLeft });
}

function r_spawnExplosion(x, y) {
  for (let i = 0; i < 20; i++) { r_particles.push({ x: x, y: y, vx: random(-8, 8), vy: random(-8, 8), life: 1, decay: 0.03, size: random(8, 20), color: random() > 0.5 ? [255, 100, 0] : [255, 200, 0] }); }
}

function r_drawPothole(x, y, w, h) { push(); translate(x, y); fill(20, 20, 22); ellipse(0, 0, w, h); fill(10, 10, 12); ellipse(-w * 0.1, 0, w * 0.7, h * 0.6); pop(); }

function r_drawAuto(x, y) {
  push(); translate(x, y); scale(r_player.scaleFactor || 1);
  fill(20); rect(-4, -26, 8, 12, 2); rect(-16, 12, 6, 14, 2); rect(10, 12, 6, 14, 2);
  fill(30, 150, 50); beginShape(); vertex(-12, -18); vertex(12, -18); vertex(16, 26); vertex(-16, 26); endShape(CLOSE);
  fill(255, 200, 0); rect(-14, -5, 28, 30, 6); fill(40, 50, 60); rect(-10, -16, 20, 10, 2); fill(255, 255, 200); ellipse(0, -20, 8, 8);
  if (mouseIsPressed || touches.length > 0) { fill(255, 255, 100, 80); beginShape(); vertex(-4, -22); vertex(4, -22); vertex(25, -65); vertex(-25, -65); endShape(CLOSE); }
  pop();
}

function r_drawCar(x, y, col, isObstacle) {
  push(); translate(x, y); if (isObstacle) rotate(PI); 
  fill(20); rect(-18, -20, 6, 12, 2); rect(12, -20, 6, 12, 2); rect(-18, 10, 6, 12, 2); rect(12, 10, 6, 12, 2); fill(col); rect(-16, -32, 32, 64, 8);
  fill(30, 40, 50); rect(-12, -15, 24, 18, 3); rect(-12, 15, 24, 10, 3); fill(max(col[0]-30,0), max(col[1]-30,0), max(col[2]-30,0)); rect(-14, -5, 28, 25, 4);
  fill(255, 240, 180); rect(-14, -31, 6, 4, 2); rect(8, -31, 6, 4, 2); fill(255, 0, 0); rect(-14, 28, 8, 4, 2); rect(6, 28, 8, 4, 2); pop();
}

function r_drawTruck(x, y, col) { push(); translate(x, y); rotate(PI); fill(col); rect(-22, -15, 44, 75, 4); fill(200); rect(-18, -40, 36, 25, 6); fill(30); rect(-14, -35, 28, 10, 2); fill(255, 255, 0); textSize(8); textAlign(CENTER, CENTER); text("HORN\nOK", 0, 10); pop(); }
function r_drawCow(x, y) { push(); translate(x, y); fill(240); rect(-10, -15, 20, 30, 8); fill(30); ellipse(-3, -5, 8, 10); fill(240); ellipse(0, 15, 14, 18); fill(200, 150, 150); ellipse(0, 22, 10, 6); fill(180); triangle(-6, 12, -12, 6, -4, 8); triangle(6, 12, 12, 6, 4, 8); pop(); }
function r_drawTree(x, y) { fill(90, 60, 40); rect(x - 5, y, 10, 30); fill(40, 130, 50); ellipse(x, y - 10, 60, 60); ellipse(x - 15, y + 5, 50, 50); ellipse(x + 15, y + 5, 50, 50); }
function r_drawShop(x, y, isLeft) { push(); translate(x, y); fill(200, 180, 150); rect(isLeft ? -20 : -40, -20, 60, 40); for(let i = 0; i < 6; i++) { fill(i%2==0 ? color(200,40,40) : color(240)); rect((isLeft ? -20 : -40) + i*10, -30, 10, 20); } fill(0); textSize(12); textAlign(CENTER); text(random() > 0.5 ? "CHAI" : "DHABA", isLeft ? 10 : -10, -5); pop(); }

function drawAutoRushGame() {
  push();
  if (r_shakeTimer > 0) { translate(random(-8, 8), random(-8, 8)); r_shakeTimer--; }
  
  background(85, 170, 75); fill(50, 50, 55); noStroke(); rect(r_cx - r_roadWidth/2, 0, r_roadWidth, r_H); 
  fill(240, 200, 50); rect(r_cx - r_roadWidth/2 + 5, 0, 5, r_H); rect(r_cx + r_roadWidth/2 - 10, 0, 5, r_H);
  stroke(255, 255, 255, 180); strokeWeight(4); drawingContext.setLineDash([30, 40]);
  let laneDiv1 = r_cx - r_roadWidth * 0.16; let laneDiv2 = r_cx + r_roadWidth * 0.16;
  line(laneDiv1, (r_roadOffset % 70) - 70, laneDiv1, r_H); line(laneDiv2, (r_roadOffset % 70) - 70, laneDiv2, r_H);
  drawingContext.setLineDash([]); noStroke();

  for (let s of r_scenery) { if (s.type === 'TREE') r_drawTree(s.x, s.y); if (s.type === 'SHOP') r_drawShop(s.x, s.y, s.isLeft); }

  if (r_player.scaleFactor < 1) { r_player.scaleFactor = lerp(r_player.scaleFactor, 1, 0.05); }

  if (r_state === 'START') {
    r_drawAuto(r_player.x, r_player.y);
    fill(0, 180); rect(0, 0, r_W, r_H); fill(255); textAlign(CENTER, CENTER);
    textSize(min(r_W * 0.1, 50)); fill(255, 200, 50); text("HEXNOVA RUSH", r_cx, r_H * 0.3);
    textSize(20); fill(255); text("DRAG LEFT/RIGHT to Steer\nHOLD SCREEN to Accelerate\nAVOID Traffic & Potholes!", r_cx, r_H * 0.55);
    textSize(24); fill(100, 255, 100); text("Tap to Start Racing", r_cx, r_H * 0.8);
  } 
  else if (r_state === 'PLAY' || r_state === 'OVER') {
    if (r_state === 'PLAY') {
      let isPressing = mouseIsPressed || touches.length > 0;
      let ignoringSteer = (mouseX > 10 && mouseX < 110 && mouseY > 10 && mouseY < 50); 
      if (isPressing && !ignoringSteer) { r_player.speed = lerp(r_player.speed, r_player.maxSpeed * r_speedMult, 0.05); if (frameCount % 4 === 0) { r_particles.push({x: r_player.x + random(-10, 10), y: r_player.y + 35, vx: random(-0.5, 0.5), vy: random(1, 3), life: 1, decay: 0.05, size: random(10, 20), color: [150, 150, 150]}); } } 
      else { r_player.speed = lerp(r_player.speed, r_player.minSpeed * r_speedMult, 0.03); }
      r_score += r_player.speed * 0.02; r_speedMult = 1 + (r_score / 1500);
      if (floor(r_score) > highScores.rush) { highScores.rush = floor(r_score); saveHighScores(); }
      if (isPressing && !ignoringSteer) { r_player.x = lerp(r_player.x, constrain(mouseX, r_cx - r_roadWidth/2 + 25, r_cx + r_roadWidth/2 - 25), 0.1); }
      
      if (r_player.invulnTimer > 0) r_player.invulnTimer--;
      r_roadOffset += r_player.speed;
      if (frameCount % max(22, floor(65 / r_speedMult)) === 0) r_spawnObstacle();
      if (frameCount % 15 === 0) r_spawnScenery(-50);
      for (let s of r_scenery) s.y += r_player.speed; r_scenery = r_scenery.filter(s => s.y < r_H + 100);

      for (let i = r_obstacles.length - 1; i >= 0; i--) {
        let obs = r_obstacles[i]; obs.y += (r_player.speed - obs.speed); 
        if (!obs.passed && obs.y > r_player.y && obs.type !== 'POTHOLE') { obs.passed = true; if (dist(r_player.x, r_player.y, obs.x, obs.y) < 70) { r_score += 20; r_particles.push({x: r_player.x, y: r_player.y - 50, vx: 0, vy: -1.5, life: 1, decay: 0.02, text: "+20 Near Miss!"}); } }
        let margin = 2; 
        if (r_player.invulnTimer === 0 && (r_player.x - r_player.w/2 + margin < obs.x + obs.w/2 - margin && r_player.x + r_player.w/2 - margin > obs.x - obs.w/2 + margin && r_player.y - r_player.h/2 + margin < obs.y + obs.h/2 - margin && r_player.y + r_player.h/2 - margin > obs.y - obs.h/2 + margin)) {
          r_lives--; r_shakeTimer = 20; r_player.invulnTimer = 60; 
          if (obs.type === 'POTHOLE') { r_player.scaleFactor = 0.1; } else { r_spawnExplosion(r_player.x, r_player.y - 20); }
          r_player.speed *= 0.3; 
          if (r_lives <= 0) {
            r_state = 'OVER';
            fahhhSound.currentTime = 0; fahhhSound.play().catch(e=>{}); // FAHH SOUND ON CRASH
          }
        }
        if (obs.y > r_H + 100) r_obstacles.splice(i, 1);
      }
      for (let p of r_particles) { p.x += p.vx; p.y += p.vy; p.life -= p.decay; } r_particles = r_particles.filter(p => p.life > 0);
    }
    
    for (let obs of r_obstacles) { if (obs.type === 'POTHOLE') r_drawPothole(obs.x, obs.y, obs.w, obs.h); }
    for (let obs of r_obstacles) { if (obs.type === 'CAR') r_drawCar(obs.x, obs.y, obs.color, true); if (obs.type === 'TRUCK') r_drawTruck(obs.x, obs.y, obs.color); if (obs.type === 'COW') r_drawCow(obs.x, obs.y); }
    if (r_player.invulnTimer % 10 < 5) r_drawAuto(r_player.x, r_player.y);
    for (let p of r_particles) { if (p.text) { fill(255, 255, 50, p.life * 255); textSize(18); textAlign(CENTER); text(p.text, p.x, p.y); } else { fill(p.color[0], p.color[1], p.color[2], p.life * 255); ellipse(p.x, p.y, p.size * p.life); } }

    fill(0, 150); rect(0, 0, r_W, 60); fill(255); textSize(24); textAlign(CENTER, CENTER); text(floor(r_score) + " M   |   High: " + highScores.rush, r_W / 2, 30); textAlign(LEFT, CENTER); text("LIVES: ", 20, 30); for (let i = 0; i < r_lives; i++) { fill(255, 50, 50); ellipse(110 + (i * 25), 30, 15, 15); }
    if (r_state === 'OVER') { fill(0, 200); rect(0, 0, r_W, r_H); fill(255, 50, 50); textAlign(CENTER, CENTER); textSize(min(r_W * 0.12, 60)); text("CRASHED!", r_cx, r_H * 0.35); fill(255); textSize(26); text("Final Distance: " + floor(r_score) + " M", r_cx, r_H * 0.48); textSize(24); fill(100, 255, 100); text("Tap to Restart", r_cx, r_H * 0.7); }
  }
  pop();
}
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const inputDisplay = document.getElementById('input-display');

context.scale(30, 30);

// 100+ CYBER SECURITY & SAT TERMS
const WORDS = [
  "PHISHING", "MALWARE", "FIREWALL", "ENCRYPT", "BOTNET", "ROOTKIT", "SPYWARE", "RANSOM", "BACKUP", "PATCH",
  "ZERO-DAY", "VPN", "PROXY", "INJECTION", "SPOOFING", "TROJAN", "KERBEROS", "HASHING", "TRAFFIC", "SYMMETRIC",
  "OBFUSCATION", "VULNERABILITY", "AUTHENTICATION", "SURVEILLANCE", "PERIMETER", "DECIPHER", "MITIGATION",
  "CRYPTOGRAPHY", "ANOMALY", "HEURISTICS", "LATENCY", "PROTOCOL", "REDUNDANCY", "ESCALATION", "EXFILTRATION",
  "PAYLOAD", "BACKDOOR", "BIOMETRICS", "TOKENIZATION", "SANDBOXING", "REMEDIATION", "FORENSICS", "GOVERNANCE",
  "COMPLIANCE", "STEGANOGRAPHY", "ENTROPY", "PHREAKING", "HONEYPOT", "INTRUSION", "TELEMETRY", "WHITELIST",
  "BLACKLIST", "QUARANTINE", "EXPLOITATION", "AUTHORIZATION", "INTEGRITY", "CONFIDENTIALITY", "AVAILABILITY",
  "VIRTUALIZATION", "CONTAINER", "ORCHESTRATION", "MICROSERVICES", "DECRYPTION", "KEYLOGGER", "ADWARE",
  "VISHING", "SMISHING", "PHARMING", "SNIFFING", "SALTING", "CERTIFICATE", "HANDSHAKE", "TUNNELING",
  "ENCAPSULATION", "FRAGMENTATION", "DATAGRAM", "ROUTING", "SUBNET", "HARDENING", "BASTION", "ENDPOINT",
  "GATEWAY", "MIDDLEWARE", "FIRMWARE", "BANDWIDTH", "THROUGHPUT", "TRACEROUTE", "WIRESHARK", "METASPLOIT",
  "NESSUS", "KIBANA", "DOCKER", "KUBERNETES", "ANSIBLE", "JENKINS", "PENETRATION", "RASHMON", "DEVOPS",
  "AIRGAP", "BRUTEFORCE", "CIPHERTEXT", "DEEPFAKE", "EPHEMERAL", "FUZZING", "GOSSIP", "IDENTITY", "K-ANONYMITY",
  "LOGGING", "MAN-IN-THE-MIDDLE", "NON-REPUDIATION", "OVERFLOW", "POLYMORPHIC", "QUANTUM", "RECONNAISSANCE"
];

function createPiece(type) {
  if (type === 'I') return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
  if (type === 'L') return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
  if (type === 'J') return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
  if (type === 'O') return [[4, 4], [4, 4]];
  if (type === 'Z') return [[5, 5, 0], [0, 5, 5], [0, 0, 0]];
  if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
  if (type === 'T') return [[0, 7, 0], [7, 7, 7], [0, 0, 0]];
}

const arena = Array.from({ length: 20 }, () => Array(10).fill(0));

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  word: "",
  typed: "",
  score: 0,
  lines: 0
};

function rotate(matrix, dir) {
  // Transpose
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  // Reverse rows to rotate clockwise, or reverse matrix for counter
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir); // Undo
      player.pos.x = pos;
      return;
    }
  }
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
  drawWord();
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = ['#ff0d72', '#0dc2ff', '#0dff72', '#f538ff', '#ff8e0d', '#ffe138', '#3877ff'][value - 1];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.lineWidth = 0.05;
        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function drawWord() {
  context.font = "0.7px 'Courier New'";
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.shadowBlur = 5;
  context.shadowColor = "#58a6ff";
  context.fillText(player.word, player.pos.x + (player.matrix[0].length / 2), player.pos.y - 0.4);
  context.shadowBlur = 0;
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 100;
    player.lines += 1;
    rowCount *= 2;
  }
  updateScore();
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  player.word = WORDS[Math.floor(Math.random() * WORDS.length)];
  player.typed = "";
  inputDisplay.innerText = "";

  if (collide(arena, player)) {
    document.getElementById('game-over').style.display = 'block';
    gameOver = true;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;

function update(time = 0) {
  if (gameOver) return;
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  scoreElement.innerText = player.score;
  linesElement.innerText = player.lines;
}

window.addEventListener('keydown', (event) => {
  if (gameOver) return;

  // Prevent browser scrolling for game keys
  if ([32, 37, 38, 39, 40].includes(event.keyCode)) {
    event.preventDefault();
  }
  if (event.keyCode === 38) { // Up Arrow
    playerRotate(-1); // Counter-Clockwise
  }
  else if (event.keyCode === 40) { // Down Arrow
    playerRotate(1); // Clockwise
  }
  else if (event.keyCode === 37) { // Left Arrow
    playerMove(-1);
  }
  else if (event.keyCode === 39) { // Right Arrow
    playerMove(1);
  }
  else if (event.keyCode === 32) { // Space Bar
    playerDrop(); // Soft Drop
  }

  const char = event.key.toUpperCase();
  if (/^[A-Z\-]$/.test(char)) {
    if (char === player.word[player.typed.length]) {
      player.typed += char;
      inputDisplay.innerText = player.typed;
      if (player.typed === player.word) {
        player.score += (player.word.length * 10);
        updateScore();
        playerReset();
      }
    } else {
      player.typed = "";
      inputDisplay.innerText = "";
    }
  }
});

playerReset();
updateScore();
update();

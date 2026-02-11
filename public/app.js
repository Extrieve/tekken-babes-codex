const arenaEl = document.getElementById("arena");
const championNameEl = document.getElementById("championName");
const streakCountEl = document.getElementById("streakCount");
const leaderboardEl = document.getElementById("leaderboard");
const celebrationScreenEl = document.getElementById("celebrationScreen");
const celebrationNameEl = document.getElementById("celebrationName");
const celebrationQuoteEl = document.getElementById("celebrationQuote");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const characterCardTemplate = document.getElementById("characterCardTemplate");
const confettiCanvasEl = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvasEl.getContext("2d");

const streakTarget = 5;
let characters = [];
let championId = null;
let streak = 0;
let roundPair = [];
let audioCtx = null;
let confettiAnimationFrame = null;

function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function playCelebrationSound() {
  const ctx = ensureAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 2 === 0 ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(freq, now + index * 0.08);
    gain.gain.setValueAtTime(0.0001, now + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.3);
  });
}

function resizeConfettiCanvas() {
  confettiCanvasEl.width = window.innerWidth;
  confettiCanvasEl.height = window.innerHeight;
}

function runConfettiBurst(colors) {
  resizeConfettiCanvas();
  if (confettiAnimationFrame) {
    cancelAnimationFrame(confettiAnimationFrame);
    confettiAnimationFrame = null;
  }

  const particles = Array.from({ length: 160 }, () => ({
    x: Math.random() * confettiCanvasEl.width,
    y: -Math.random() * confettiCanvasEl.height * 0.6,
    vx: (Math.random() - 0.5) * 5.2,
    vy: Math.random() * 2 + 2.2,
    gravity: 0.06 + Math.random() * 0.05,
    size: Math.random() * 8 + 4,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.28,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  const start = performance.now();
  const durationMs = 2500;

  function tick(timestamp) {
    const elapsed = timestamp - start;
    confettiCtx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.spin;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
      confettiCtx.restore();
    }

    if (elapsed < durationMs) {
      confettiAnimationFrame = requestAnimationFrame(tick);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);
      confettiAnimationFrame = null;
    }
  }

  confettiAnimationFrame = requestAnimationFrame(tick);
}

function randomCharacter(excludeIds = []) {
  const pool = characters.filter((character) => !excludeIds.includes(character.id));
  return pool[Math.floor(Math.random() * pool.length)];
}

function updateStatusText() {
  const champion = characters.find((character) => character.id === championId);
  championNameEl.textContent = champion ? champion.name : "No champion yet";
  streakCountEl.textContent = String(streak);
}

function pickRoundPair() {
  if (characters.length < 2) {
    throw new Error("At least 2 characters are required.");
  }

  if (!championId) {
    const first = randomCharacter();
    const second = randomCharacter([first.id]);
    roundPair = [first, second];
    return;
  }

  const champion = characters.find((character) => character.id === championId);
  const challenger = randomCharacter([championId]);
  roundPair = [champion, challenger];
}

function buildCard(character) {
  const card = characterCardTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.characterId = character.id;
  card.querySelector(".character-name").textContent = character.name;
  card.querySelector(".character-initial").textContent = character.name.slice(0, 1).toUpperCase();

  const art = card.querySelector(".character-art");
  const photo = card.querySelector(".character-photo");
  art.style.background = `linear-gradient(130deg, ${character.accentA}, ${character.accentB})`;
  if (character.imageUrl) {
    photo.src = character.imageUrl;
    photo.alt = `${character.name} portrait`;
    photo.addEventListener("error", () => {
      art.classList.add("image-fallback");
      photo.removeAttribute("src");
    });
  } else {
    art.classList.add("image-fallback");
  }

  card.addEventListener("click", () => onVote(character.id));
  return card;
}

function renderArena() {
  arenaEl.innerHTML = "";
  for (const character of roundPair) {
    arenaEl.appendChild(buildCard(character));
  }
}

async function loadLeaderboard() {
  const response = await fetch("/api/leaderboard");
  const data = await response.json();
  const top = data.leaderboard.slice(0, 12);
  leaderboardEl.innerHTML = "";

  for (const entry of top) {
    const item = document.createElement("li");
    item.innerHTML = `<span>${entry.name}</span><span class="wins">${entry.wins} crown${entry.wins === 1 ? "" : "s"}</span>`;
    leaderboardEl.appendChild(item);
  }
}

async function recordWin(characterId) {
  await fetch("/api/wins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterId })
  });
}

function openCelebration(character) {
  celebrationNameEl.textContent = `${character.name} Reigns Supreme`;
  celebrationQuoteEl.textContent = `"${character.quote}"`;
  celebrationScreenEl.classList.remove("hidden");
  celebrationScreenEl.style.background = `linear-gradient(140deg, ${character.accentA}cc, ${character.accentB}bb)`;
  celebrationScreenEl.querySelector(
    ".celebration-card"
  ).style.background = `linear-gradient(160deg, ${character.accentA}, ${character.accentB})`;
  runConfettiBurst([character.accentA, character.accentB, "#ffffff", "#ffe08c"]);
  playCelebrationSound();
}

function closeCelebration() {
  celebrationScreenEl.classList.add("hidden");
  if (confettiAnimationFrame) {
    cancelAnimationFrame(confettiAnimationFrame);
    confettiAnimationFrame = null;
  }
  confettiCtx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);
}

function resetRoundState() {
  championId = null;
  streak = 0;
  updateStatusText();
  pickRoundPair();
  renderArena();
}

async function onVote(characterId) {
  if (championId === characterId) {
    streak += 1;
  } else {
    championId = characterId;
    streak = 1;
  }

  updateStatusText();

  if (streak >= streakTarget) {
    const winner = characters.find((character) => character.id === championId);
    await recordWin(winner.id);
    await loadLeaderboard();
    openCelebration(winner);
    return;
  }

  pickRoundPair();
  renderArena();
}

nextRoundBtn.addEventListener("click", () => {
  closeCelebration();
  resetRoundState();
});

window.addEventListener("resize", resizeConfettiCanvas);

async function init() {
  const response = await fetch("/api/characters");
  const data = await response.json();
  characters = data.characters;
  resetRoundState();
  await loadLeaderboard();
}

init().catch((error) => {
  console.error(error);
  arenaEl.innerHTML = "<p>Failed to load game data. Refresh to try again.</p>";
});

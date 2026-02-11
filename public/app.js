const arenaEl = document.getElementById("arena");
const championNameEl = document.getElementById("championName");
const streakCountEl = document.getElementById("streakCount");
const leaderboardEl = document.getElementById("leaderboard");
const historyListEl = document.getElementById("historyList");
const modeFiltersEl = document.getElementById("modeFilters");
const sessionVotesEl = document.getElementById("sessionVotes");
const sessionBestStreakEl = document.getElementById("sessionBestStreak");
const celebrationScreenEl = document.getElementById("celebrationScreen");
const celebrationNameEl = document.getElementById("celebrationName");
const celebrationQuoteEl = document.getElementById("celebrationQuote");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const characterCardTemplate = document.getElementById("characterCardTemplate");
const confettiCanvasEl = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvasEl.getContext("2d");

const streakTarget = 5;
const MODES = [
  { id: "all", label: "All Roster", minGame: 1, maxGame: 8 },
  { id: "classic", label: "Classic 1-3", minGame: 1, maxGame: 3 },
  { id: "modern", label: "Modern 4-6", minGame: 4, maxGame: 6 },
  { id: "new-era", label: "New Era 7-8", minGame: 7, maxGame: 8 }
];

let characters = [];
let championId = null;
let streak = 0;
let roundPair = [];
let activeModeId = "all";
let sessionVotes = 0;
let sessionBestStreak = 0;
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

  const particles = Array.from({ length: 180 }, () => ({
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

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.rotation += particle.spin;

      confettiCtx.save();
      confettiCtx.translate(particle.x, particle.y);
      confettiCtx.rotate(particle.rotation);
      confettiCtx.fillStyle = particle.color;
      confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.62);
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

function getActiveMode() {
  return MODES.find((mode) => mode.id === activeModeId) || MODES[0];
}

function getModeRoster(modeId = activeModeId) {
  const mode = MODES.find((entry) => entry.id === modeId) || MODES[0];
  return characters.filter(
    (character) => character.debutGame >= mode.minGame && character.debutGame <= mode.maxGame
  );
}

function randomCharacter(pool, excludeIds = []) {
  const filtered = pool.filter((character) => !excludeIds.includes(character.id));
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function updateStatusText() {
  const champion = characters.find((character) => character.id === championId);
  championNameEl.textContent = champion ? champion.name : "No champion yet";
  streakCountEl.textContent = String(streak);
  sessionVotesEl.textContent = String(sessionVotes);
  sessionBestStreakEl.textContent = String(sessionBestStreak);
}

function pickRoundPair() {
  const roster = getModeRoster();
  if (roster.length < 2) {
    throw new Error("Need at least two characters in the selected roster mode.");
  }

  const champion = roster.find((character) => character.id === championId);
  if (!champion) {
    const first = randomCharacter(roster);
    const second = randomCharacter(roster, [first.id]);
    roundPair = [first, second];
    return;
  }

  const challenger = randomCharacter(roster, [champion.id]);
  roundPair = [champion, challenger];
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function makePosterDataUrl(character) {
  const title = escapeXml(character.name);
  const subtitle = escapeXml(`Tekken ${character.debutGame} debut`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${character.accentA}" />
        <stop offset="100%" stop-color="${character.accentB}" />
      </linearGradient>
      <linearGradient id="stripe" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff22" />
        <stop offset="100%" stop-color="#ffffff00" />
      </linearGradient>
    </defs>
    <rect width="700" height="900" fill="url(#bg)" />
    <rect y="540" width="700" height="360" fill="#00000055" />
    <rect y="0" width="700" height="160" fill="url(#stripe)" />
    <text x="50%" y="210" text-anchor="middle" fill="#ffffffcc" font-size="160" font-family="Racing Sans One, Arial">${escapeXml(
      character.name.slice(0, 1).toUpperCase()
    )}</text>
    <text x="50%" y="680" text-anchor="middle" fill="#fff" font-size="56" font-family="Space Grotesk, Arial" font-weight="700">${title}</text>
    <text x="50%" y="746" text-anchor="middle" fill="#f5f5f5" font-size="34" font-family="Space Grotesk, Arial">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildCard(character) {
  const card = characterCardTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.characterId = character.id;
  card.querySelector(".character-name").textContent = character.name;
  card.querySelector(".character-initial").textContent = character.name.slice(0, 1).toUpperCase();

  const art = card.querySelector(".character-art");
  const photo = card.querySelector(".character-photo");
  art.style.background = `linear-gradient(130deg, ${character.accentA}, ${character.accentB})`;
  photo.src = makePosterDataUrl(character);
  photo.alt = `${character.name} stylized portrait`;

  card.addEventListener("click", () => onVote(character.id));
  return card;
}

function renderArena() {
  arenaEl.innerHTML = "";
  for (const character of roundPair) {
    arenaEl.appendChild(buildCard(character));
  }
}

function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function loadLeaderboard() {
  const response = await fetch("/api/leaderboard");
  const data = await response.json();
  const top = data.leaderboard.slice(0, 16);
  leaderboardEl.innerHTML = "";

  for (const entry of top) {
    const item = document.createElement("li");
    item.innerHTML = `<span>${entry.name}</span><span class="wins">${entry.wins} crown${
      entry.wins === 1 ? "" : "s"
    }</span>`;
    leaderboardEl.appendChild(item);
  }
}

async function loadHistory() {
  const response = await fetch("/api/history?limit=10");
  const data = await response.json();
  historyListEl.innerHTML = "";

  if (!data.history.length) {
    const emptyItem = document.createElement("li");
    emptyItem.innerHTML = `<span>No crowns yet</span><span class="history-time">be the first</span>`;
    historyListEl.appendChild(emptyItem);
    return;
  }

  for (const entry of data.history) {
    const item = document.createElement("li");
    item.innerHTML = `<span>${entry.name}</span><span class="history-time">${formatRelativeTime(
      entry.createdAt
    )}</span>`;
    historyListEl.appendChild(item);
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

function renderModeFilters() {
  modeFiltersEl.innerHTML = "";
  for (const mode of MODES) {
    const button = document.createElement("button");
    button.className = `mode-chip${mode.id === activeModeId ? " active" : ""}`;
    button.type = "button";
    button.textContent = mode.label;
    button.addEventListener("click", () => {
      activeModeId = mode.id;
      resetRoundState();
      renderModeFilters();
    });
    modeFiltersEl.appendChild(button);
  }
}

function resetRoundState() {
  const roster = getModeRoster();
  const championStillInMode = roster.some((character) => character.id === championId);
  if (!championStillInMode) {
    championId = null;
    streak = 0;
  }
  updateStatusText();
  pickRoundPair();
  renderArena();
}

async function onVote(characterId) {
  sessionVotes += 1;
  if (championId === characterId) {
    streak += 1;
  } else {
    championId = characterId;
    streak = 1;
  }
  if (streak > sessionBestStreak) {
    sessionBestStreak = streak;
  }
  updateStatusText();

  if (streak >= streakTarget) {
    const winner = characters.find((character) => character.id === championId);
    await recordWin(winner.id);
    await Promise.all([loadLeaderboard(), loadHistory()]);
    openCelebration(winner);
    return;
  }

  pickRoundPair();
  renderArena();
}

nextRoundBtn.addEventListener("click", () => {
  closeCelebration();
  championId = null;
  streak = 0;
  updateStatusText();
  pickRoundPair();
  renderArena();
});

document.addEventListener("keydown", (event) => {
  if (!celebrationScreenEl.classList.contains("hidden")) {
    return;
  }
  if (event.key === "ArrowLeft" && roundPair[0]) {
    onVote(roundPair[0].id);
  }
  if (event.key === "ArrowRight" && roundPair[1]) {
    onVote(roundPair[1].id);
  }
});

window.addEventListener("resize", resizeConfettiCanvas);

async function init() {
  const response = await fetch("/api/characters");
  const data = await response.json();
  characters = data.characters;
  const activeMode = getActiveMode();
  if (getModeRoster(activeMode.id).length < 2) {
    throw new Error("Selected mode has fewer than two characters.");
  }
  renderModeFilters();
  resetRoundState();
  await Promise.all([loadLeaderboard(), loadHistory()]);
}

init().catch((error) => {
  console.error(error);
  arenaEl.innerHTML = "<p>Failed to load game data. Refresh to try again.</p>";
});

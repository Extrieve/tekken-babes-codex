const arenaEl = document.getElementById("arena");
const championNameEl = document.getElementById("championName");
const streakCountEl = document.getElementById("streakCount");
const leaderboardEl = document.getElementById("leaderboard");
const historyListEl = document.getElementById("historyList");
const modeFiltersEl = document.getElementById("modeFilters");
const modeFiltersCloneEl = document.getElementById("modeFiltersClone");
const sessionVotesEl = document.getElementById("sessionVotes");
const sessionBestStreakEl = document.getElementById("sessionBestStreak");
const searchInputEl = document.getElementById("searchInput");
const searchInputCloneEl = document.getElementById("searchInputClone");
const favoritesOnlyBtn = document.getElementById("favoritesOnlyBtn");
const favoritesOnlyBtnClone = document.getElementById("favoritesOnlyBtnClone");
const tournamentTargetEl = document.getElementById("tournamentTarget");
const resetTournamentBtn = document.getElementById("resetTournamentBtn");
const tournamentBoardEl = document.getElementById("tournamentBoard");
const tabArenaEl = document.getElementById("tabArena");
const tabRosterEl = document.getElementById("tabRoster");
const arenaViewEl = document.getElementById("arenaView");
const rosterViewEl = document.getElementById("rosterView");
const rosterGridEl = document.getElementById("rosterGrid");
const celebrationScreenEl = document.getElementById("celebrationScreen");
const celebrationNameEl = document.getElementById("celebrationName");
const celebrationQuoteEl = document.getElementById("celebrationQuote");
const celebrationSublineEl = document.getElementById("celebrationSubline");
const celebrationBadgeEl = document.getElementById("celebrationBadge");
const celebrationPortraitEl = document.getElementById("celebrationPortrait");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const downloadCardBtn = document.getElementById("downloadCardBtn");
const characterCardTemplate = document.getElementById("characterCardTemplate");
const confettiCanvasEl = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvasEl.getContext("2d");

const streakTarget = 5;
const favoritesStorageKey = "tekken-babes-favorites";
const MODES = [
  { id: "all", label: "All Roster", minGame: 1, maxGame: 8 },
  { id: "classic", label: "Classic 1-3", minGame: 1, maxGame: 3 },
  { id: "modern", label: "Modern 4-6", minGame: 4, maxGame: 6 },
  { id: "new-era", label: "New Era 7-8", minGame: 7, maxGame: 8 }
];

let characters = [];
let championId = null;
let championSide = "left";
let streak = 0;
let roundPair = [];
let activeModeId = "all";
let sessionVotes = 0;
let sessionBestStreak = 0;
let audioCtx = null;
let confettiAnimationFrame = null;
let searchTerm = "";
let favoritesOnly = false;
let favorites = new Set();
let tournamentTarget = 3;
let tournamentScores = {};
let lastCrownWinner = null;
const memeTags = ["SMASH", "RIZZ", "GYATT", "GOATED", "W PICK", "HEAT", "BADDIE"];
const winBadges = ["Main Slay Event", "Certified Serve", "Face Card Never Declined", "Sassy Sweep"];
const winSublines = [
  "Walked in, stole votes, left no crumbs.",
  "Charisma crit activated.",
  "This was not a close call.",
  "Zero effort, maximum slay."
];

function setText(el, value) {
  if (el) {
    el.textContent = value;
  }
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(favoritesStorageKey);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (_error) {
    return new Set();
  }
}

function persistFavorites() {
  localStorage.setItem(favoritesStorageKey, JSON.stringify(Array.from(favorites)));
}

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

function getModeRoster(modeId = activeModeId) {
  const mode = MODES.find((entry) => entry.id === modeId) || MODES[0];
  return characters.filter((character) => {
    const inEra = character.debutGame >= mode.minGame && character.debutGame <= mode.maxGame;
    if (!inEra) {
      return false;
    }
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    if (!matchesSearch) {
      return false;
    }
    if (favoritesOnly && !favorites.has(character.id)) {
      return false;
    }
    return true;
  });
}

function randomCharacter(pool, excludeIds = []) {
  const filtered = pool.filter((character) => !excludeIds.includes(character.id));
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function updateStatusText() {
  const champion = characters.find((character) => character.id === championId);
  setText(championNameEl, champion ? champion.name : "No champion yet");
  setText(streakCountEl, String(streak));
  setText(sessionVotesEl, String(sessionVotes));
  setText(sessionBestStreakEl, String(sessionBestStreak));
}

function pickRoundPair() {
  const roster = getModeRoster();
  if (roster.length < 2) {
    throw new Error("Need at least two characters in current filters.");
  }

  const champion = roster.find((character) => character.id === championId);
  if (!champion) {
    const first = randomCharacter(roster);
    const second = randomCharacter(roster, [first.id]);
    roundPair = [first, second];
    return;
  }

  const challenger = randomCharacter(roster, [champion.id]);
  if (championSide === "right") {
    roundPair = [challenger, champion];
  } else {
    roundPair = [champion, challenger];
  }
}

function toggleFavorite(characterId) {
  if (favorites.has(characterId)) {
    favorites.delete(characterId);
  } else {
    favorites.add(characterId);
  }
  persistFavorites();
  renderArena();
  renderRoster();
}

function buildCard(character, lane) {
  const card = characterCardTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.characterId = character.id;
  card.dataset.memeTag = memeTags[Math.floor(Math.random() * memeTags.length)];
  const nameEl = card.querySelector(".character-name");
  const initialEl = card.querySelector(".character-initial");
  const photo = card.querySelector(".character-photo");
  const favoriteBtn = card.querySelector(".favorite-btn");

  setText(nameEl, character.name);
  setText(initialEl, character.name.slice(0, 1).toUpperCase());

  if (photo) {
    photo.src = character.imageUrl;
    photo.alt = `${character.name} stylized portrait`;
    photo.addEventListener("error", () => {
      if (character.fallbackImageUrl && photo.src.indexOf(character.fallbackImageUrl) === -1) {
        photo.src = character.fallbackImageUrl;
      }
    });
  }
  if (favoriteBtn) {
    favoriteBtn.classList.toggle("is-favorite", favorites.has(character.id));
    favoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(character.id);
    });
  }

  card.addEventListener("click", () => onVote(character.id, lane));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onVote(character.id, lane);
    }
  });
  return card;
}

function renderArena() {
  arenaEl.innerHTML = "";
  const roster = getModeRoster();
  if (roster.length < 2) {
    arenaEl.innerHTML = "<p>Filters left fewer than two characters. Broaden search or disable Favorites Only.</p>";
    roundPair = [];
    return;
  }
  roundPair.forEach((character, index) => {
    arenaEl.appendChild(buildCard(character, index === 0 ? "left" : "right"));
  });
}

function renderRoster() {
  if (!rosterGridEl) {
    return;
  }
  const roster = getModeRoster().sort((a, b) => a.name.localeCompare(b.name));
  rosterGridEl.innerHTML = "";
  for (const character of roster) {
    const card = document.createElement("article");
    card.className = "roster-card";
    card.dataset.characterId = character.id;
    const fav = favorites.has(character.id) ? "x" : "+";
    card.innerHTML = `<img alt="${character.name}" src="${character.imageUrl}" /><div class="meta"><span>${character.name}</span><span>${fav}</span></div>`;
    const img = card.querySelector("img");
    img.addEventListener("error", () => {
      if (character.fallbackImageUrl && img.src.indexOf(character.fallbackImageUrl) === -1) {
        img.src = character.fallbackImageUrl;
      }
    });
    card.addEventListener("click", () => toggleFavorite(character.id));
    rosterGridEl.appendChild(card);
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
    emptyItem.innerHTML = '<span>No crowns yet</span><span class="history-time">be the first</span>';
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

function getCharacterById(id) {
  return characters.find((character) => character.id === id);
}

function renderTournamentBoard() {
  if (!tournamentBoardEl) {
    return;
  }
  tournamentBoardEl.innerHTML = "";
  const entries = Object.entries(tournamentScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  if (!entries.length) {
    const item = document.createElement("li");
    item.innerHTML = `<span>No crowns yet</span><span class="wins">0 / ${tournamentTarget}</span>`;
    tournamentBoardEl.appendChild(item);
    return;
  }
  for (const [characterId, score] of entries) {
    const character = getCharacterById(characterId);
    if (!character) {
      continue;
    }
    const item = document.createElement("li");
    item.innerHTML = `<span>${character.name}</span><span class="wins">${score} / ${tournamentTarget}</span>`;
    tournamentBoardEl.appendChild(item);
  }
}

function checkTournamentWinner() {
  const winnerEntry = Object.entries(tournamentScores).find((entry) => entry[1] >= tournamentTarget);
  if (!winnerEntry) {
    return null;
  }
  return getCharacterById(winnerEntry[0]);
}

function openCelebration(character, isTournamentWin = false) {
  celebrationNameEl.textContent = isTournamentWin
    ? `${character.name} Wins The Tournament`
    : `${character.name} Reigns Supreme`;
  celebrationQuoteEl.textContent = isTournamentWin
    ? `"${character.quote}" Tournament target reached: ${tournamentTarget} crowns.`
    : `"${character.quote}"`;
  if (celebrationSublineEl) {
    celebrationSublineEl.textContent = winSublines[Math.floor(Math.random() * winSublines.length)];
  }
  if (celebrationBadgeEl) {
    celebrationBadgeEl.textContent = winBadges[Math.floor(Math.random() * winBadges.length)];
  }
  if (celebrationPortraitEl) {
    celebrationPortraitEl.src = character.imageUrl;
    celebrationPortraitEl.alt = `${character.name} celebration portrait`;
    celebrationPortraitEl.onerror = () => {
      if (character.fallbackImageUrl && celebrationPortraitEl.src.indexOf(character.fallbackImageUrl) === -1) {
        celebrationPortraitEl.src = character.fallbackImageUrl;
      }
    };
  }
  celebrationScreenEl.classList.remove("hidden");
  celebrationScreenEl.style.background = `radial-gradient(circle at 20% 10%, ${character.accentA}88 0%, transparent 42%), radial-gradient(circle at 86% 0%, ${character.accentB}88 0%, transparent 42%), #090611d9`;
  const cardEl = celebrationScreenEl.querySelector(".celebration-card");
  if (cardEl) {
    cardEl.style.setProperty("--win-a", character.accentA);
    cardEl.style.setProperty("--win-b", character.accentB);
  }
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
  const containers = [modeFiltersEl, modeFiltersCloneEl].filter(Boolean);
  if (!containers.length) {
    return;
  }
  const onChangeMode = (modeId) => {
    activeModeId = modeId;
    resetRoundState(true);
    renderModeFilters();
    renderRoster();
  };

  for (const container of containers) {
    container.innerHTML = "";
    for (const mode of MODES) {
      const button = document.createElement("button");
      button.className = `mode-chip${mode.id === activeModeId ? " active" : ""}`;
      button.type = "button";
      button.textContent = mode.label;
      button.addEventListener("click", () => onChangeMode(mode.id));
      container.appendChild(button);
    }
  }
}

function resetRoundState(forceResetChampion = false) {
  const roster = getModeRoster();
  const championStillInMode = roster.some((character) => character.id === championId);
  if (forceResetChampion || !championStillInMode) {
    championId = null;
    championSide = "left";
    streak = 0;
  }
  updateStatusText();
  if (roster.length >= 2) {
    pickRoundPair();
  } else {
    roundPair = [];
  }
  renderArena();
  renderRoster();
}

function updateFavoritesOnlyLabel() {
  const buttons = [favoritesOnlyBtn, favoritesOnlyBtnClone].filter(Boolean);
  for (const button of buttons) {
    button.textContent = `Favorites Only: ${favoritesOnly ? "On" : "Off"}`;
    button.classList.toggle("active", favoritesOnly);
  }
}

function downloadWinnerCard(character) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, character.accentA);
  gradient.addColorStop(1, character.accentB);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.fillRect(0, 380, canvas.width, 250);

  ctx.fillStyle = "#fff";
  ctx.font = "700 62px Arial";
  ctx.fillText("Tekken Babes Champion", 60, 110);
  ctx.font = "700 84px Arial";
  ctx.fillText(character.name, 60, 220);
  ctx.font = "500 34px Arial";
  ctx.fillText(`"${character.quote}"`, 60, 450);
  ctx.fillText(`Tournament: ${tournamentScores[character.id] || 0}/${tournamentTarget} crowns`, 60, 520);

  const link = document.createElement("a");
  link.download = `${character.id}-champion-card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function onVote(characterId, lane = null) {
  sessionVotes += 1;
  if (championId === characterId) {
    streak += 1;
  } else {
    championId = characterId;
    if (lane) {
      championSide = lane;
    }
    streak = 1;
  }
  if (streak > sessionBestStreak) {
    sessionBestStreak = streak;
  }
  updateStatusText();

  if (streak >= streakTarget) {
    const winner = getCharacterById(championId);
    lastCrownWinner = winner;
    await recordWin(winner.id);
    tournamentScores[winner.id] = (tournamentScores[winner.id] || 0) + 1;
    renderTournamentBoard();
    await Promise.all([loadLeaderboard(), loadHistory()]);
    const tournamentWinner = checkTournamentWinner();
    openCelebration(tournamentWinner || winner, Boolean(tournamentWinner));
    return;
  }

  pickRoundPair();
  renderArena();
}

if (nextRoundBtn) {
  nextRoundBtn.addEventListener("click", () => {
    closeCelebration();
    championId = null;
    championSide = "left";
    streak = 0;
    updateStatusText();
    const winner = checkTournamentWinner();
    if (winner) {
      tournamentScores = {};
      renderTournamentBoard();
    }
    pickRoundPair();
    renderArena();
  });
}

if (downloadCardBtn) {
  downloadCardBtn.addEventListener("click", () => {
    if (lastCrownWinner) {
      downloadWinnerCard(lastCrownWinner);
    }
  });
}

if (searchInputEl) {
  searchInputEl.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    if (searchInputCloneEl && searchInputCloneEl.value !== searchTerm) {
      searchInputCloneEl.value = searchTerm;
    }
    resetRoundState(true);
  });
}

const onToggleFavoritesOnly = () => {
  favoritesOnly = !favoritesOnly;
  updateFavoritesOnlyLabel();
  resetRoundState(true);
};

if (searchInputCloneEl) {
  searchInputCloneEl.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    if (searchInputEl && searchInputEl.value !== searchTerm) {
      searchInputEl.value = searchTerm;
    }
    resetRoundState(true);
  });
}

if (favoritesOnlyBtn) {
  favoritesOnlyBtn.addEventListener("click", onToggleFavoritesOnly);
}

if (favoritesOnlyBtnClone) {
  favoritesOnlyBtnClone.addEventListener("click", onToggleFavoritesOnly);
}

if (tabArenaEl && tabRosterEl && arenaViewEl && rosterViewEl) {
  tabArenaEl.addEventListener("click", () => {
    tabArenaEl.classList.add("active");
    tabRosterEl.classList.remove("active");
    arenaViewEl.classList.remove("hidden");
    rosterViewEl.classList.add("hidden");
  });

  tabRosterEl.addEventListener("click", () => {
    tabRosterEl.classList.add("active");
    tabArenaEl.classList.remove("active");
    rosterViewEl.classList.remove("hidden");
    arenaViewEl.classList.add("hidden");
    renderRoster();
  });
}

if (tournamentTargetEl) {
  tournamentTargetEl.addEventListener("change", () => {
    tournamentTarget = Number(tournamentTargetEl.value) || 3;
    tournamentScores = {};
    renderTournamentBoard();
  });
}

if (resetTournamentBtn) {
  resetTournamentBtn.addEventListener("click", () => {
    tournamentScores = {};
    renderTournamentBoard();
  });
}

document.addEventListener("keydown", (event) => {
  if (!celebrationScreenEl.classList.contains("hidden")) {
    return;
  }
  if (event.key === "ArrowLeft" && roundPair[0]) {
    onVote(roundPair[0].id, "left");
  }
  if (event.key === "ArrowRight" && roundPair[1]) {
    onVote(roundPair[1].id, "right");
  }
});

window.addEventListener("resize", resizeConfettiCanvas);

async function init() {
  favorites = loadFavorites();
  updateFavoritesOnlyLabel();
  const response = await fetch("/api/characters");
  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.status}`);
  }
  const data = await response.json();
  characters = data.characters;
  renderModeFilters();
  if (getModeRoster().length < 2) {
    searchTerm = "";
    favoritesOnly = false;
    updateFavoritesOnlyLabel();
    if (searchInputEl) {
      searchInputEl.value = "";
    }
    if (searchInputCloneEl) {
      searchInputCloneEl.value = "";
    }
  }
  resetRoundState(true);
  renderTournamentBoard();
  await Promise.all([loadLeaderboard(), loadHistory()]);
  renderRoster();
}

init().catch((error) => {
  console.error(error);
  arenaEl.innerHTML = `<p>Failed to load game data. ${error.message || "Refresh to try again."}</p>`;
});

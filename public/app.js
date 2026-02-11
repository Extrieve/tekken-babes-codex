const arenaEl = document.getElementById("arena");
const championNameEl = document.getElementById("championName");
const streakCountEl = document.getElementById("streakCount");
const leaderboardEl = document.getElementById("leaderboard");
const celebrationScreenEl = document.getElementById("celebrationScreen");
const celebrationNameEl = document.getElementById("celebrationName");
const celebrationQuoteEl = document.getElementById("celebrationQuote");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const characterCardTemplate = document.getElementById("characterCardTemplate");

const streakTarget = 5;
let characters = [];
let championId = null;
let streak = 0;
let roundPair = [];

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
  art.style.background = `linear-gradient(130deg, ${character.accentA}, ${character.accentB})`;

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
}

function closeCelebration() {
  celebrationScreenEl.classList.add("hidden");
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

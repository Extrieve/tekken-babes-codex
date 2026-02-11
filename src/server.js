const path = require("node:path");
const express = require("express");
const characters = require("./characters");
const { getLeaderboard, incrementCharacterWin } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

function getCharacterById(characterId) {
  return characters.find((character) => character.id === characterId);
}

app.get("/api/characters", (_req, res) => {
  res.json({ characters });
});

app.get("/api/leaderboard", (_req, res) => {
  const byId = new Map(characters.map((character) => [character.id, character]));
  const leaderboard = getLeaderboard()
    .map((entry) => {
      const character = byId.get(entry.character_id);
      if (!character) {
        return null;
      }
      return {
        id: character.id,
        name: character.name,
        wins: entry.wins
      };
    })
    .filter(Boolean);

  res.json({ leaderboard });
});

app.post("/api/wins", (req, res) => {
  const characterId = req.body?.characterId;
  const character = getCharacterById(characterId);
  if (!character) {
    return res.status(400).json({ error: "Invalid characterId." });
  }

  const updated = incrementCharacterWin(characterId);
  if (!updated) {
    return res.status(500).json({ error: "Failed to record win." });
  }

  return res.status(201).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Tekken Babes server running on http://localhost:${PORT}`);
});

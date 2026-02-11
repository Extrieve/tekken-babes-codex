const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const characters = require("./characters");

const configuredDataDir = process.env.DATA_DIR;
const dataDir = configuredDataDir
  ? path.resolve(configuredDataDir)
  : path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "tekken-babes.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS character_wins (
    character_id TEXT PRIMARY KEY,
    wins INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const insertCharacter = db.prepare(`
  INSERT INTO character_wins (character_id, wins)
  VALUES (?, 0)
  ON CONFLICT(character_id) DO NOTHING;
`);

for (const character of characters) {
  insertCharacter.run(character.id);
}

const getLeaderboardStmt = db.prepare(`
  SELECT character_id, wins
  FROM character_wins
  ORDER BY wins DESC, character_id ASC;
`);

const incrementWinStmt = db.prepare(`
  UPDATE character_wins
  SET wins = wins + 1, updated_at = CURRENT_TIMESTAMP
  WHERE character_id = ?;
`);

function getLeaderboard() {
  return getLeaderboardStmt.all();
}

function incrementCharacterWin(characterId) {
  const result = incrementWinStmt.run(characterId);
  return result.changes === 1;
}

module.exports = {
  getLeaderboard,
  incrementCharacterWin
};

# Tekken Babes

Fun voting game: two Tekken characters appear side by side, players choose the hottest, and the selected character stays on screen as champion. If a character hits a 5-vote streak, a celebration screen appears and the global leaderboard records a crown.

## Features

- Side-by-side character voting UI
- Champion persistence between rounds
- 5-streak win condition with character-themed celebration
- Cross-era roster spanning Tekken 1 through Tekken 8
- Roster mode filters (`All`, `Classic 1-3`, `Modern 4-6`, `New Era 7-8`)
- Character search + favorites filter (persisted in local storage)
- Tournament mode (first to target crowns)
- Downloadable champion share cards (`.png`)
- Session stats (votes + best streak)
- Recent crowns feed
- Sassy character quotes on victory
- Keyboard voting (`Left Arrow` / `Right Arrow`)
- Global leaderboard persisted in SQLite
- Character posters served from local API (`/api/character-image/:id.svg`) for consistent image loading

## Tech Stack

- Node.js + Express
- SQLite (`better-sqlite3`)
- Vanilla HTML/CSS/JS frontend

## Run Locally

```bash
npm install
npm start
```

App runs at `http://localhost:3000`.

## Environment

- `PORT` (optional): server port (default `3000`)
- `DATA_DIR` (optional): directory for SQLite file (default `./data`)

## Deploy on Render

This repo includes `render.yaml` for one-click blueprint deploy.

1. Push this repo to GitHub (public).
2. In Render, choose `New +` -> `Blueprint`.
3. Select this repository.
4. Render will create a web service + persistent disk.
5. Open your deployed URL and start voting.

## API

- `GET /api/characters`
- `GET /api/character-image/:id.svg`
- `GET /api/leaderboard`
- `GET /api/history?limit=10`
- `POST /api/wins` with JSON `{ "characterId": "jin" }`

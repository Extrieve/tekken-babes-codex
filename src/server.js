const path = require("node:path");
const express = require("express");
const characters = require("./characters");
const { getLeaderboard, recordCharacterCrown, getRecentCrowns } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const fallbackImageUrl = (characterId) => `/api/character-image/${characterId}.svg`;
const characterImageUrlById = new Map();
const characterWikiImageSourceById = new Map();
const proxiedImageCacheById = new Map();
let imagesHydrationPromise = null;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

function getCharacterById(characterId) {
  return characters.find((character) => character.id === characterId);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createCharacterPosterSvg(character) {
  const title = escapeXml(character.name);
  const subtitle = escapeXml(`Tekken ${character.debutGame} debut`);
  const initial = escapeXml(character.name.slice(0, 1).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900">
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
    <text x="50%" y="210" text-anchor="middle" fill="#ffffffcc" font-size="160" font-family="Arial">${initial}</text>
    <text x="50%" y="680" text-anchor="middle" fill="#fff" font-size="56" font-family="Arial" font-weight="700">${title}</text>
    <text x="50%" y="746" text-anchor="middle" fill="#f5f5f5" font-size="34" font-family="Arial">${subtitle}</text>
  </svg>`;
}

async function fetchWikipediaThumbnail(wikiTitle) {
  if (!wikiTitle) {
    return null;
  }
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "tekken-babes-codex/1.0" }
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const thumbnail = data?.thumbnail?.source || null;
    if (!thumbnail) {
      return null;
    }
    if (thumbnail.includes("Tekken_Characters.jpg")) {
      return null;
    }
    return thumbnail;
  } catch (_error) {
    return null;
  }
}

async function fetchFandomThumbnail(title) {
  if (!title) {
    return null;
  }
  const url = `https://tekken.fandom.com/api.php?action=query&titles=${encodeURIComponent(
    title
  )}&prop=pageimages&format=json&pithumbsize=700`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "tekken-babes-codex/1.0" }
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const pages = data?.query?.pages;
    if (!pages) {
      return null;
    }
    const firstPage = Object.values(pages)[0];
    return firstPage?.thumbnail?.source || null;
  } catch (_error) {
    return null;
  }
}

async function hydrateCharacterImages() {
  for (const character of characters) {
    characterImageUrlById.set(character.id, fallbackImageUrl(character.id));
  }

  const batchSize = 8;
  for (let i = 0; i < characters.length; i += batchSize) {
    const batch = characters.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (character) => {
        let thumbnail = await fetchFandomThumbnail(character.name);
        if (!thumbnail) {
          thumbnail = await fetchWikipediaThumbnail(character.wikiTitle);
        }
        if (thumbnail) {
          characterWikiImageSourceById.set(character.id, thumbnail);
          characterImageUrlById.set(character.id, `/api/wiki-image/${character.id}`);
        }
      })
    );
  }
}

app.get("/api/characters", async (_req, res) => {
  if (imagesHydrationPromise) {
    await Promise.race([imagesHydrationPromise, new Promise((resolve) => setTimeout(resolve, 2500))]);
  }
  const payload = characters.map((character) => ({
    ...character,
    imageUrl: characterImageUrlById.get(character.id) || fallbackImageUrl(character.id),
    fallbackImageUrl: fallbackImageUrl(character.id)
  }));
  res.json({ characters: payload });
});

app.get("/api/character-image/:id.svg", (req, res) => {
  const character = getCharacterById(req.params.id);
  if (!character) {
    return res.status(404).send("Not found");
  }
  const svg = createCharacterPosterSvg(character);
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  return res.send(svg);
});

app.get("/api/wiki-image/:id", async (req, res) => {
  const characterId = req.params.id;
  const character = getCharacterById(characterId);
  if (!character) {
    return res.status(404).send("Not found");
  }

  const cached = proxiedImageCacheById.get(characterId);
  if (cached) {
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(cached.buffer);
  }

  const sourceUrl = characterWikiImageSourceById.get(characterId);
  if (!sourceUrl) {
    res.redirect(fallbackImageUrl(characterId));
    return undefined;
  }

  try {
    const upstream = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "tekken-babes-codex/1.0",
        Referer: "https://tekken.fandom.com/"
      }
    });
    if (!upstream.ok) {
      res.redirect(fallbackImageUrl(characterId));
      return undefined;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    proxiedImageCacheById.set(characterId, { buffer, contentType });
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (_error) {
    res.redirect(fallbackImageUrl(characterId));
    return undefined;
  }
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

app.get("/api/history", (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const byId = new Map(characters.map((character) => [character.id, character]));
  const history = getRecentCrowns(limit)
    .map((entry) => {
      const character = byId.get(entry.character_id);
      if (!character) {
        return null;
      }
      return {
        id: character.id,
        name: character.name,
        createdAt: entry.created_at
      };
    })
    .filter(Boolean);

  res.json({ history });
});

app.post("/api/wins", (req, res) => {
  const characterId = req.body?.characterId;
  const character = getCharacterById(characterId);
  if (!character) {
    return res.status(400).json({ error: "Invalid characterId." });
  }

  const updated = recordCharacterCrown(characterId);
  if (!updated) {
    return res.status(500).json({ error: "Failed to record win." });
  }

  return res.status(201).json({ ok: true });
});

function start() {
  app.listen(PORT, () => {
    console.log(`Tekken Babes server running on http://localhost:${PORT}`);
  });
  imagesHydrationPromise = hydrateCharacterImages().catch((error) => {
    console.error("Failed to hydrate remote character images:", error);
  });
}

start();

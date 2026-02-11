const CHARACTERS = [
  { id: "kazuya", name: "Kazuya Mishima", debutGame: 1, quote: "Charisma level: hostile takeover.", accentA: "#111827", accentB: "#b91c1c" },
  { id: "nina", name: "Nina Williams", debutGame: 1, quote: "Ice-cold stare. Red-hot scoreboard.", accentA: "#0f172a", accentB: "#38bdf8" },
  { id: "paul", name: "Paul Phoenix", debutGame: 1, quote: "Flattop iconic. Vibes chaotic. Wins undeniable.", accentA: "#eab308", accentB: "#f97316" },
  { id: "king", name: "King", debutGame: 1, quote: "Mask on, aura loud, crowd screaming.", accentA: "#f59e0b", accentB: "#dc2626" },
  { id: "yoshimitsu", name: "Yoshimitsu", debutGame: 1, quote: "Alien drip. Samurai menace. Certified menace-hot.", accentA: "#22d3ee", accentB: "#8b5cf6" },
  { id: "jack", name: "Jack", debutGame: 1, quote: "Robotic jawline with heavyweight confidence.", accentA: "#374151", accentB: "#f59e0b" },

  { id: "jun", name: "Jun Kazama", debutGame: 2, quote: "Calm aura, deadly beauty, five in a row.", accentA: "#22c55e", accentB: "#0ea5e9" },
  { id: "lei", name: "Lei Wulong", debutGame: 2, quote: "Style switcher. Face card never declines.", accentA: "#f97316", accentB: "#06b6d4" },
  { id: "baek", name: "Baek Doo San", debutGame: 2, quote: "Discipline, poise, and dangerous cheekbones.", accentA: "#ef4444", accentB: "#0f766e" },
  { id: "bruce", name: "Bruce Irvin", debutGame: 2, quote: "Muay Thai power, runway confidence.", accentA: "#475569", accentB: "#f97316" },
  { id: "devil", name: "Devil", debutGame: 2, quote: "Forbidden energy, flawless intimidation.", accentA: "#1e1b4b", accentB: "#dc2626" },
  { id: "roger", name: "Roger", debutGame: 2, quote: "Unexpectedly buff. Unexpectedly iconic.", accentA: "#f59e0b", accentB: "#84cc16" },

  { id: "jin", name: "Jin Kazama", debutGame: 3, quote: "The devil gene may be cursed, but this streak is blessed.", accentA: "#1f2937", accentB: "#ef4444" },
  { id: "xiaoyu", name: "Ling Xiaoyu", debutGame: 3, quote: "Cute, lethal, and currently unstoppable.", accentA: "#f97316", accentB: "#ec4899" },
  { id: "hwoarang", name: "Hwoarang", debutGame: 3, quote: "Kick first, pose second, stay champion always.", accentA: "#dc2626", accentB: "#f59e0b" },
  { id: "eddy", name: "Eddy Gordo", debutGame: 3, quote: "Capoeira flow. Main character magnetism.", accentA: "#16a34a", accentB: "#0ea5e9" },
  { id: "bryan", name: "Bryan Fury", debutGame: 3, quote: "Villain smile. Winner energy.", accentA: "#334155", accentB: "#ef4444" },
  { id: "julia", name: "Julia Chang", debutGame: 3, quote: "Smart, fierce, and camera-ready at all times.", accentA: "#10b981", accentB: "#f59e0b" },

  { id: "steve", name: "Steve Fox", debutGame: 4, quote: "Footwork slick. Face card elite.", accentA: "#1d4ed8", accentB: "#60a5fa" },
  { id: "christie", name: "Christie Monteiro", debutGame: 4, quote: "Rhythm, confidence, and total domination.", accentA: "#0ea5e9", accentB: "#ec4899" },
  { id: "marduk", name: "Craig Marduk", debutGame: 4, quote: "Maximum menace, maximum main-event aura.", accentA: "#7c2d12", accentB: "#eab308" },
  { id: "combot", name: "Combot", debutGame: 4, quote: "Copying moves and stealing votes.", accentA: "#6b7280", accentB: "#f43f5e" },

  { id: "asuka", name: "Asuka Kazama", debutGame: 5, quote: "Straight hands, loud confidence, clean sweep.", accentA: "#f59e0b", accentB: "#10b981" },
  { id: "lili", name: "Lili Rochefort", debutGame: 5, quote: "Graceful twirl. Ruthless victory. Repeat.", accentA: "#f472b6", accentB: "#a855f7" },
  { id: "feng", name: "Feng Wei", debutGame: 5, quote: "Stone-faced intensity with immaculate presence.", accentA: "#065f46", accentB: "#f59e0b" },
  { id: "raven", name: "Raven", debutGame: 5, quote: "Shadow ops aesthetic, spotlight success.", accentA: "#0f172a", accentB: "#7c3aed" },
  { id: "dragunov", name: "Sergei Dragunov", debutGame: 5, quote: "Silent, sharp, and weirdly mesmerizing.", accentA: "#334155", accentB: "#94a3b8" },

  { id: "alisa", name: "Alisa Bosconovitch", debutGame: 6, quote: "Android elegance detected. Crowd adoration confirmed.", accentA: "#06b6d4", accentB: "#6366f1" },
  { id: "lars", name: "Lars Alexandersson", debutGame: 6, quote: "Anime hero hair. Champion probability: high.", accentA: "#0ea5e9", accentB: "#eab308" },
  { id: "leo", name: "Leo Kliesen", debutGame: 6, quote: "Cool under pressure and unfairly photogenic.", accentA: "#3b82f6", accentB: "#22c55e" },
  { id: "bob", name: "Bob", debutGame: 6, quote: "Speed and weight class charisma in one package.", accentA: "#eab308", accentB: "#ef4444" },
  { id: "zafina", name: "Zafina", debutGame: 6, quote: "Mystic gaze, instant vote theft.", accentA: "#7c3aed", accentB: "#f43f5e" },

  { id: "claudio", name: "Claudio Serafino", debutGame: 7, quote: "Exorcist chic with immaculate posture.", accentA: "#4f46e5", accentB: "#38bdf8" },
  { id: "luckychloe", name: "Lucky Chloe", debutGame: 7, quote: "Pop idol sparkle, scoreboard terror.", accentA: "#ec4899", accentB: "#facc15" },
  { id: "kazumi", name: "Kazumi Mishima", debutGame: 7, quote: "Grace, steel, and zero mercy.", accentA: "#9f1239", accentB: "#f59e0b" },
  { id: "shaheen", name: "Shaheen", debutGame: 7, quote: "Clean suit, clean jawline, clean wins.", accentA: "#0f766e", accentB: "#f97316" },
  { id: "josie", name: "Josie Rizal", debutGame: 7, quote: "Sweet smile, savage ring IQ.", accentA: "#14b8a6", accentB: "#f43f5e" },
  { id: "leroy", name: "Leroy Smith", debutGame: 7, quote: "Legendary cool with champion composure.", accentA: "#52525b", accentB: "#e5e7eb" },

  { id: "reina", name: "Reina", debutGame: 8, quote: "Short smile, sharp eyes, full domination.", accentA: "#4f46e5", accentB: "#f43f5e" },
  { id: "victor", name: "Victor Chevalier", debutGame: 8, quote: "Spy thriller charisma, flawless execution.", accentA: "#111827", accentB: "#3b82f6" },
  { id: "azucena", name: "Azucena", debutGame: 8, quote: "Espresso energy and elite face card.", accentA: "#22c55e", accentB: "#f59e0b" }
];

module.exports = CHARACTERS;

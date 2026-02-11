const COLOR_PAIRS = [
  ["#ef4444", "#7f1d1d"],
  ["#f97316", "#7c2d12"],
  ["#eab308", "#854d0e"],
  ["#84cc16", "#3f6212"],
  ["#22c55e", "#14532d"],
  ["#14b8a6", "#134e4a"],
  ["#06b6d4", "#164e63"],
  ["#3b82f6", "#1e3a8a"],
  ["#6366f1", "#312e81"],
  ["#8b5cf6", "#4c1d95"],
  ["#a855f7", "#581c87"],
  ["#ec4899", "#831843"],
  ["#f43f5e", "#881337"],
  ["#f59e0b", "#78350f"],
  ["#64748b", "#0f172a"]
];

const RAW_CHARACTERS = [
  { id: "kazuya", name: "Kazuya Mishima", debutGame: 1, wikiTitle: "Kazuya_Mishima" },
  { id: "nina", name: "Nina Williams", debutGame: 1, wikiTitle: "Nina_Williams" },
  { id: "paul", name: "Paul Phoenix", debutGame: 1, wikiTitle: "Paul_Phoenix" },
  { id: "king", name: "King", debutGame: 1, wikiTitle: "King_(Tekken)" },
  { id: "yoshimitsu", name: "Yoshimitsu", debutGame: 1, wikiTitle: "Yoshimitsu" },
  { id: "jack", name: "Jack", debutGame: 1, wikiTitle: "Jack_(Tekken)" },
  { id: "law", name: "Marshall Law", debutGame: 1, wikiTitle: "Marshall_Law" },
  { id: "michelle", name: "Michelle Chang", debutGame: 1, wikiTitle: "Michelle_Chang" },
  { id: "ganryu", name: "Ganryu", debutGame: 1, wikiTitle: "Ganryu_(Tekken)" },
  { id: "heihachi", name: "Heihachi Mishima", debutGame: 1, wikiTitle: "Heihachi_Mishima" },
  { id: "anna", name: "Anna Williams", debutGame: 1, wikiTitle: "Anna_Williams" },
  { id: "lee", name: "Lee Chaolan", debutGame: 1, wikiTitle: "Lee_Chaolan" },
  { id: "kuma", name: "Kuma", debutGame: 1, wikiTitle: "Kuma_(Tekken)" },
  { id: "wang", name: "Wang Jinrei", debutGame: 1, wikiTitle: "Wang_Jinrei" },

  { id: "jun", name: "Jun Kazama", debutGame: 2, wikiTitle: "Jun_Kazama" },
  { id: "lei", name: "Lei Wulong", debutGame: 2, wikiTitle: "Lei_Wulong" },
  { id: "baek", name: "Baek Doo San", debutGame: 2, wikiTitle: "Baek_Doo_San" },
  { id: "bruce", name: "Bruce Irvin", debutGame: 2, wikiTitle: "Bruce_Irvin" },
  { id: "devil", name: "Devil", debutGame: 2, wikiTitle: "Devil_(Tekken)" },
  { id: "roger", name: "Roger", debutGame: 2, wikiTitle: "Roger_(Tekken)" },
  { id: "alex", name: "Alex", debutGame: 2, wikiTitle: "Alex_(Tekken)" },
  { id: "kunimitsu", name: "Kunimitsu", debutGame: 2, wikiTitle: "Kunimitsu" },
  { id: "armorking", name: "Armor King", debutGame: 2, wikiTitle: "Armor_King_(Tekken)" },

  { id: "jin", name: "Jin Kazama", debutGame: 3, wikiTitle: "Jin_Kazama" },
  { id: "xiaoyu", name: "Ling Xiaoyu", debutGame: 3, wikiTitle: "Ling_Xiaoyu" },
  { id: "hwoarang", name: "Hwoarang", debutGame: 3, wikiTitle: "Hwoarang" },
  { id: "eddy", name: "Eddy Gordo", debutGame: 3, wikiTitle: "Eddy_Gordo" },
  { id: "bryan", name: "Bryan Fury", debutGame: 3, wikiTitle: "Bryan_Fury" },
  { id: "julia", name: "Julia Chang", debutGame: 3, wikiTitle: "Julia_Chang" },
  { id: "forest", name: "Forest Law", debutGame: 3, wikiTitle: "Forest_Law" },
  { id: "gunjack", name: "Gun Jack", debutGame: 3, wikiTitle: "Gun_Jack" },
  { id: "ogre", name: "Ogre", debutGame: 3, wikiTitle: "Ogre_(Tekken)" },
  { id: "trueogre", name: "True Ogre", debutGame: 3, wikiTitle: "True_Ogre" },
  { id: "panda", name: "Panda", debutGame: 3, wikiTitle: "Panda_(Tekken)" },
  { id: "mokujin", name: "Mokujin", debutGame: 3, wikiTitle: "Mokujin" },
  { id: "tiger", name: "Tiger Jackson", debutGame: 3, wikiTitle: "Tiger_Jackson" },

  { id: "steve", name: "Steve Fox", debutGame: 4, wikiTitle: "Steve_Fox" },
  { id: "christie", name: "Christie Monteiro", debutGame: 4, wikiTitle: "Christie_Monteiro" },
  { id: "marduk", name: "Craig Marduk", debutGame: 4, wikiTitle: "Craig_Marduk" },
  { id: "combot", name: "Combot", debutGame: 4, wikiTitle: "Combot" },
  { id: "violet", name: "Violet", debutGame: 4, wikiTitle: "Violet_(Tekken)" },
  { id: "miharu", name: "Miharu Hirano", debutGame: 4, wikiTitle: "Miharu_Hirano" },

  { id: "asuka", name: "Asuka Kazama", debutGame: 5, wikiTitle: "Asuka_Kazama" },
  { id: "lili", name: "Lili Rochefort", debutGame: 5, wikiTitle: "Lili_(Tekken)" },
  { id: "feng", name: "Feng Wei", debutGame: 5, wikiTitle: "Feng_Wei" },
  { id: "raven", name: "Raven", debutGame: 5, wikiTitle: "Raven_(Tekken)" },
  { id: "dragunov", name: "Sergei Dragunov", debutGame: 5, wikiTitle: "Sergei_Dragunov" },
  { id: "deviljin", name: "Devil Jin", debutGame: 5, wikiTitle: "Devil_Jin" },
  { id: "jinpachi", name: "Jinpachi Mishima", debutGame: 5, wikiTitle: "Jinpachi_Mishima" },
  { id: "rogerjr", name: "Roger Jr.", debutGame: 5, wikiTitle: "Roger_Jr." },

  { id: "alisa", name: "Alisa Bosconovitch", debutGame: 6, wikiTitle: "Alisa_Bosconovitch" },
  { id: "lars", name: "Lars Alexandersson", debutGame: 6, wikiTitle: "Lars_Alexandersson" },
  { id: "leo", name: "Leo Kliesen", debutGame: 6, wikiTitle: "Leo_Kliesen" },
  { id: "bob", name: "Bob", debutGame: 6, wikiTitle: "Bob_(Tekken)" },
  { id: "zafina", name: "Zafina", debutGame: 6, wikiTitle: "Zafina" },
  { id: "miguel", name: "Miguel Caballero Rojo", debutGame: 6, wikiTitle: "Miguel_Caballero_Rojo" },
  { id: "azazel", name: "Azazel", debutGame: 6, wikiTitle: "Azazel_(Tekken)" },

  { id: "claudio", name: "Claudio Serafino", debutGame: 7, wikiTitle: "Claudio_Serafino" },
  { id: "luckychloe", name: "Lucky Chloe", debutGame: 7, wikiTitle: "Lucky_Chloe" },
  { id: "kazumi", name: "Kazumi Mishima", debutGame: 7, wikiTitle: "Kazumi_Mishima" },
  { id: "shaheen", name: "Shaheen", debutGame: 7, wikiTitle: "Shaheen_(Tekken)" },
  { id: "josie", name: "Josie Rizal", debutGame: 7, wikiTitle: "Josie_Rizal" },
  { id: "leroy", name: "Leroy Smith", debutGame: 7, wikiTitle: "Leroy_Smith_(Tekken)" },
  { id: "katarina", name: "Katarina Alves", debutGame: 7, wikiTitle: "Katarina_Alves" },
  { id: "gigas", name: "Gigas", debutGame: 7, wikiTitle: "Gigas_(Tekken)" },
  { id: "masterraven", name: "Master Raven", debutGame: 7, wikiTitle: "Master_Raven" },
  { id: "fahkumram", name: "Fahkumram", debutGame: 7, wikiTitle: "Fahkumram" },

  { id: "reina", name: "Reina", debutGame: 8, wikiTitle: "Reina_(Tekken)" },
  { id: "victor", name: "Victor Chevalier", debutGame: 8, wikiTitle: "Victor_Chevalier" },
  { id: "azucena", name: "Azucena", debutGame: 8, wikiTitle: "Azucena_(Tekken)" }
];

const CHARACTERS = RAW_CHARACTERS.map((character, index) => {
  const colors = COLOR_PAIRS[index % COLOR_PAIRS.length];
  return {
    ...character,
    quote: `${character.name} is serving knockout energy.`,
    accentA: colors[0],
    accentB: colors[1]
  };
});

module.exports = CHARACTERS;

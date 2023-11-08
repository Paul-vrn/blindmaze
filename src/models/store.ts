export type Score = {
  mazeName: string;
  name: string;
  score: number;
};
export type Worlds = {
  [worldName: string]: Set<string>;
}

export type Scores = Score[];

const getScores = (): Scores => {
  const scores = localStorage.getItem("scores");
  if (scores) {
    return JSON.parse(scores);
  }
  return [];
}

const setScores = (scores: Scores): void => {
  localStorage.setItem("scores", JSON.stringify(scores));
};


const getScoresByMazeName = (mazeName: string): Scores => {
  const scores = getScores();
  return scores.filter(score => score.mazeName === mazeName);
};

const addScore = (score: Score): void => {
  const scores = getScores();
  const index = scores.findIndex(s => s.mazeName === score.mazeName && s.name === score.name);
  if (index >= 0) {
    scores[index] = score;
  }
  setScores(scores);
}


// Créer une fonction pour sérialiser un Worlds
function serializeWorlds(map: Worlds): string {
  const objectToSerialize: { [key: string]: string[] } = {};
  Object.keys(map).forEach(key => {
    // Convertir chaque Set en Array
    objectToSerialize[key] = Array.from(map[key]);
  });
  return JSON.stringify(objectToSerialize);
}

// Créer une fonction pour désérialiser une chaîne en Worlds
function deserializeWorlds(serializedMap: string): Worlds {
  const parsedObject: { [key: string]: string[] } = JSON.parse(serializedMap);
  const worlds: Worlds = {};
  Object.keys(parsedObject).forEach(key => {
    // Convertir chaque Array en Set
    worlds[key] = new Set(parsedObject[key]);
  });
  return worlds;
}

const getWorlds = (): Worlds => {
  const worlds = localStorage.getItem("worlds");
  if (worlds) {
    return deserializeWorlds(worlds);
  }
  return {};
}


const addLevelToWorld = (worldName: string, levelName: string): void => {
  const worlds = getWorlds();
  if (!worlds[worldName]) {
    worlds[worldName] = new Set<string>();
  }
  worlds[worldName].add(levelName);
  localStorage.setItem("worlds", serializeWorlds(worlds));
}

export {addLevelToWorld, addScore, getScores, getScoresByMazeName, getWorlds, setScores};


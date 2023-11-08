export type Score = {
  mazeName: string;
  name: string;
  score: number;
};
export type Worlds = {
  [worldName: string]: Set<string>;
}

export type Scores = Score[];

const getScores = (world: string): Scores => {
  const scores = localStorage.getItem(`scores_${world}`);
  if (scores) {
    return JSON.parse(scores);
  }
  return [];
}

const setScores = (worldName: string, scores: Scores): void => {
  localStorage.setItem(`scores_${worldName}`, JSON.stringify(scores));
};


const getScoresByMazeName = (worldName: string, mazeName: string): Scores => {
  const scores = getScores(worldName);
  return scores.filter(score => score.mazeName === mazeName);
};

const addScore = (worldName: string, score: Score): void => {
  console.log(score);
  const scores = getScores(worldName);
  const index = scores.findIndex(s => s.mazeName === score.mazeName && s.name === score.name);
  if (index >= 0) {
    scores[index] = score;
  } else {
    scores.push(score);
  }
  setScores(worldName, scores);
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


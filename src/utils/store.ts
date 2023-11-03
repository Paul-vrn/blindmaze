type Score = {
  mazeName: string;
  name: string;
  score: number;
};
type Scores = Score[];

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

const calculateScore = (time: number, difficulty: number): number => {
  return Math.trunc(100000 / (time * difficulty));
}
export {addScore, calculateScore, getScores, getScoresByMazeName, setScores};


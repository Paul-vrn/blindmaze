
const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

type ObjectValues<T> = T[keyof T];

export type Difficulty = ObjectValues<typeof Difficulty>;

export type MazeConfig = {
  title: string;
  worldTitle: string;
  difficulty: Difficulty;
  rows: number;
  cols: number;
  nbPoints: number;
  enableDeadWalls: boolean;
  enableEnemies: boolean;
};

const GenerateMazeConfig = (title: string, worldTitle: string, difficulty: Difficulty, enableDeadWalls: boolean, enableEnemies: boolean): MazeConfig => {
  let rows: number;
  let cols: number;
  let nbPoints: number;
  switch (difficulty) {
    case Difficulty.EASY:
      rows = Phaser.Math.RND.between(4, 6);
      cols = Phaser.Math.RND.between(6, 8);
      nbPoints = Phaser.Math.RND.between(2, 5);
      break;
    case Difficulty.MEDIUM:
      rows = Phaser.Math.RND.between(6, 8);
      cols = Phaser.Math.RND.between(8, 15);
      nbPoints = Phaser.Math.RND.between(5, 10);
      break;
    case Difficulty.HARD:
      rows = Phaser.Math.RND.between(8, 11);
      cols = Phaser.Math.RND.between(15, 20);
      nbPoints = Phaser.Math.RND.between(10, 17);
      break;
  }
  return {
    title,
    worldTitle,
    difficulty,
    rows,
    cols,
    nbPoints,
    enableDeadWalls,
    enableEnemies,
  };
};

export {Difficulty, GenerateMazeConfig};
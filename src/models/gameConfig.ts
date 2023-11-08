const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
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
  nbEnemies: number;
  enableDeadWalls: boolean;
  enableEnemies: boolean;
};

const GenerateMazeConfig = (
  title: string,
  worldTitle: string,
  difficulty: Difficulty,
  enableDeadWalls: boolean,
  enableEnemies: boolean
): MazeConfig => {
  let rows: number;
  let cols: number;
  let nbPoints: number;
  let nbEnemies: number;
  switch (difficulty) {
    case Difficulty.EASY:
      rows = Phaser.Math.RND.between(4, 6);
      cols = Phaser.Math.RND.between(6, 8);
      nbPoints = Phaser.Math.RND.between(2, 5);
      nbEnemies = enableEnemies ? Phaser.Math.RND.between(1, 3) : 0;
      break;
    case Difficulty.MEDIUM:
      rows = Phaser.Math.RND.between(6, 8);
      cols = Phaser.Math.RND.between(8, 15);
      nbPoints = Phaser.Math.RND.between(5, 10);
      nbEnemies = enableEnemies ? Phaser.Math.RND.between(3, 5) : 0;
      break;
    case Difficulty.HARD:
      rows = Phaser.Math.RND.between(8, 11);
      cols = Phaser.Math.RND.between(15, 20);
      nbPoints = Phaser.Math.RND.between(10, 17);
      nbEnemies = enableEnemies ? Phaser.Math.RND.between(5, 8) : 0;
      break;
  }
  return {
    title,
    worldTitle,
    difficulty,
    rows,
    cols,
    nbPoints,
    nbEnemies,
    enableDeadWalls,
    enableEnemies,
  };
};

export { Difficulty, GenerateMazeConfig };

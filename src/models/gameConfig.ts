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
  percentDeadWalls: number;
  nbEnemies: number;
  enableDeadWalls: boolean;
  enableEnemies: boolean;
};

/**
 * Generate a maze config with random values for rows, cols, nbPoints, percentDeadWalls
 * and nbEnemies depending on the difficulty
 * @param title title of the maze
 * @param worldTitle title of the world
 * @param difficulty difficulty of the maze
 * @param enableDeadWalls true if dead walls are enabled
 * @param enableEnemies true if enemies are enabled
 * @returns a maze config
 */
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
  let percentDeadWalls: number;
  let nbEnemies: number;
  switch (difficulty) {
    case Difficulty.EASY:
      rows = Phaser.Math.RND.between(4, 6);
      cols = Phaser.Math.RND.between(6, 8);
      percentDeadWalls = enableDeadWalls ? 0.3 : 0;
      nbPoints = Phaser.Math.RND.between(2, 5);
      nbEnemies = enableEnemies ? Phaser.Math.RND.between(2, 4) : 0;
      break;
    case Difficulty.MEDIUM:
      rows = Phaser.Math.RND.between(6, 8);
      cols = Phaser.Math.RND.between(8, 12);
      nbPoints = Phaser.Math.RND.between(5, 10);
      percentDeadWalls = enableDeadWalls ? 0.35 : 0;
      nbEnemies = enableEnemies ? Phaser.Math.RND.between(4, 7) : 0;
      break;
    case Difficulty.HARD:
      rows = Phaser.Math.RND.between(8, 11);
      cols = Phaser.Math.RND.between(16, 16);
      nbPoints = Phaser.Math.RND.between(10, 17);
      percentDeadWalls = enableDeadWalls ? 0.4 : 0;
      nbEnemies = enableEnemies ? Phaser.Math.RND.between(7, 10) : 0;
      break;
  }
  return {
    title,
    worldTitle,
    difficulty,
    rows,
    cols,
    nbPoints,
    percentDeadWalls,
    nbEnemies,
    enableDeadWalls,
    enableEnemies,
  };
};

export { Difficulty, GenerateMazeConfig };

const calculateScore = (
  time: number,
  rows: number,
  cols: number,
  nbPoints: number,
  nbEnemies: number,
  nbTouchEnemyOrDeadWall: number
): number => {
  const baseScore = 10;
  const timeFactor = 2; // The higher this value, the more impact time has on the score
  const sizeFactor = 5; // Bonus based on the size of the maze
  const pointFactor = 10; // Points for each collected point
  const enemyFactor = 5; // Points for each enemy avoided
  const touchEnemyFactor = 10; // Points for each enemy touched
  // Calculate a size bonus (the larger the maze, the higher the score)
  const sizeBonus = (rows + cols) * sizeFactor;

  // Calculate a bonus based on the number of points
  const pointBonus = nbPoints * pointFactor;

  // Calculate a bonus based on the number of enemies
  const enemyBonus = nbEnemies * enemyFactor;

  // Calculate a bonus based on the number of enemies or deadwalls touched
  const touchEnemyBonus = nbTouchEnemyOrDeadWall * touchEnemyFactor;

  // Calculate a time penalty (less time gives a higher score)
  const timePenalty = Math.max(0, time / 1000 / timeFactor);

  const score =
    baseScore +
    sizeBonus +
    pointBonus +
    enemyBonus -
    timePenalty -
    touchEnemyBonus;

  return Math.floor(Math.max(0, score));
};
export default calculateScore;

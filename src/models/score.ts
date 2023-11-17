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
  const touchEnemyOrDeadWallFactor = 10; // Points for each enemy touched

  const sizeBonus = (rows + cols) * sizeFactor;
  const pointBonus = nbPoints * pointFactor;
  const enemyBonus = nbEnemies * enemyFactor;
  const touchEnemyBonus = nbTouchEnemyOrDeadWall * touchEnemyOrDeadWallFactor;

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

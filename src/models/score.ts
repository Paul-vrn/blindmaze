
const calculateScore = (
  time: number,
  rows: number,
  cols: number,
  nbPoints: number,
  nbEnemies: number,
  ): number => {
    const baseScore = 1000;
    const timeFactor = 10; // The higher this value, the more impact time has on the score
    const sizeFactor = 5; // Bonus based on the size of the maze
    const pointFactor = 100; // Points for each collected point
    const enemyFactor = 50; // Points for each enemy avoided
  
    // Calculate a size bonus (the larger the maze, the higher the score)
    const sizeBonus = (rows + cols) * sizeFactor;
  
    // Calculate a bonus based on the number of points
    const pointBonus = nbPoints * pointFactor;
  
    // Calculate a bonus based on the number of enemies
    const enemyBonus = nbEnemies * enemyFactor;
  
    // Calculate a time penalty (less time gives a higher score)
    const timePenalty = Math.max(0, time - baseScore / timeFactor);
  
    const score = baseScore + sizeBonus + pointBonus + enemyBonus - timePenalty;
  
    return Math.max(0, score);
}
export default calculateScore;

import { Difficulty, GenerateMazeConfig } from '../../models/gameConfig';
import { getScores } from '../../models/store';
import { createButton, createMazeButton } from '../../utils/createButton';

type WorldConfig = {
  title: string;
  easyMaze: number;
  mediumMaze: number;
  hardMaze: number;
  enableDeadWalls: boolean;
  enableEnemies: boolean;
};
// Classe World de base
export class World extends Phaser.Scene {
  worldTitle: string;
  easyMaze: number;
  mediumMaze: number;
  hardMaze: number;
  enableDeadWalls: boolean;
  enableEnemies: boolean;
  constructor(config: WorldConfig) {
    super(config.title);
    this.worldTitle = config.title;
    this.easyMaze = config.easyMaze;
    this.mediumMaze = config.mediumMaze;
    this.hardMaze = config.hardMaze;
    this.enableDeadWalls = config.enableDeadWalls;
    this.enableEnemies = config.enableEnemies;
  }

  create() {
    // Création du titre du monde
    const titleText = this.add.text(this.scale.width / 2, 50, this.worldTitle, {
      fontSize: '32px',
      color: '#fff',
    });
    titleText.setOrigin(0.5, 0.5);
    const scores = getScores(this.worldTitle);

    for (let i = 0; i < this.easyMaze; i++) {
      const mazeConfig = GenerateMazeConfig(
        'Maze_easy_' + i,
        this.worldTitle,
        Difficulty.EASY,
        this.enableDeadWalls,
        this.enableEnemies
      );
      const x = this.scale.width / 4 - 50;
      const y = 100 + i * 150;
      createMazeButton(this, x, y, mazeConfig);
      // leaderboard
      this.add.text(x - 95, y + 30, `Leaderboard:`, {
        fontSize: '16px',
        color: '#fff',
      });
      scores
        .filter((score) => score.mazeName === mazeConfig.title)
        .sort((a, b) => b.score - a.score)
        .forEach((score, index) => {
          this.add.text(
            x - 95,
            y + 50 + index * 20,
            `${score.name}: ${score.score}`,
            { fontSize: '16px', color: '#fff' }
          );
        });
    }
    for (let i = 0; i < this.mediumMaze; i++) {
      const mazeConfig = GenerateMazeConfig(
        'Maze_medium_' + i,
        this.worldTitle,
        Difficulty.MEDIUM,
        this.enableDeadWalls,
        this.enableEnemies
      );
      const x = this.scale.width / 2;
      const y = 100 + i * 150;
      createMazeButton(this, x, y, mazeConfig);
      this.add.text(x - 95, y + 30, `Leaderboard:`, {
        fontSize: '16px',
        color: '#fff',
      });
    }
    for (let i = 0; i < this.hardMaze; i++) {
      const mazeConfig = GenerateMazeConfig(
        'Maze_hard_' + i,
        this.worldTitle,
        Difficulty.HARD,
        this.enableDeadWalls,
        this.enableEnemies
      );
      const x = this.scale.width * 0.75 + 50;
      const y = 100 + i * 150;
      createMazeButton(this, x, y, mazeConfig);
      this.add.text(x - 95, y + 30, `Leaderboard:`, {
        fontSize: '16px',
        color: '#fff',
      });
    }

    // return back to main menu
    createButton(
      this,
      this.scale.width * 0.8,
      this.scale.height * 0.9,
      'Main Menu',
      'MainMenuScene',
      false
    );
  }
}

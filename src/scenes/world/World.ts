import createButton from "../../utils/createButton";
import Maze from "../maze/Maze";

type WorldConfig = {
  title: string;
  mazes: string[];
  mazeScenes: string[];
}
// Classe World de base
export class World extends Phaser.Scene {
  worldTitle: string;
  mazeScenes: string[];
  mazes: string[];
  constructor(config: WorldConfig) {
    super(config.title);
    this.worldTitle = config.title;
    this.mazeScenes = config.mazeScenes;
    this.mazes = config.mazes;
  }

  create() {
    // Création du titre du monde
    const titleText = this.add.text(this.scale.width / 2, 50, this.worldTitle, { fontSize: '32px', color: '#fff' });
    titleText.setOrigin(0.5, 0.5);

    // Création des boutons pour les mazes et le leaderboard
    this.mazes.forEach((maze, index) => {
      const y = 100 + index * 100;
      createButton(this, this.scale.width / 4, y, maze, this.mazeScenes[index]);
      // À côté de chaque bouton, affichez un leaderboard pour le maze
      this.add.text(this.scale.width / 2, y, `Leaderboard ${maze}`, { fontSize: '16px', color: '#fff' });
      // Ici, vous devrez intégrer la logique pour afficher les scores réels
    });

    const customMaze = new Maze("Test", 2, 2, 4, true);
    const startButton = this.add.text(400, 300, 'Start Custom Maze', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    startButton.setInteractive(); // Rend le texte interactif
    startButton.on('pointerdown', () => {
      this.game.scene.add('Test', customMaze, true);
      this.scene.remove();
    });
    // return back to main menu
    createButton(this, this.scale.width*0.8, this.scale.height*0.9, 'Main Menu', 'MainMenuScene');
  }
}

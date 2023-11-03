import createButton from "../../utils/createButton";

// Classe World de base
export class World extends Phaser.Scene {
  worldTitle: string;

  constructor(worldTitle: string) {
    super(worldTitle);
    this.worldTitle = worldTitle;
  }

  create() {
    // Création du titre du monde
    const titleText = this.add.text(this.scale.width / 2, 50, this.worldTitle, { fontSize: '32px', color: '#fff' });
    titleText.setOrigin(0.5, 0.5);

    // Création des boutons pour les mazes et le leaderboard
    const mazes = ['Maze 1', 'Maze 2', 'Maze 3'];
    const mazeScenes = ['Maze01', 'Maze02', 'Maze03'];
    mazes.forEach((maze, index) => {
      const y = 100 + index * 100;
      const button = createButton(this, this.scale.width / 4, y, maze, mazeScenes[index]);
      this.add.existing(button);
      // À côté de chaque bouton, affichez un leaderboard pour le maze
      this.add.text(this.scale.width / 2, y, `Leaderboard ${maze}`, { fontSize: '16px', color: '#fff' });
      // Ici, vous devrez intégrer la logique pour afficher les scores réels
    });
  }
}

import Phaser from 'phaser';
import config from '../config';
import createButton from '../utils/createButton';
export default class Menu extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
  }

  create() {
    const gameWidth = config.scale.width;
    // Afficher le texte du titre du menu
    const titleText = this.add.text(
      gameWidth / 2,
      100,
      'Menu Principal',
      {
        fontSize: '32px',
        color: '#fff',
      }
    );
    titleText.setOrigin(0.5);

    // Créer le bouton de la première scène
    const button1 = createButton(
      this,
      gameWidth / 2,
      200,
      'Maze 1',
      'Maze01'
    );

    // Créer le bouton de la deuxième scène
    const button2 = createButton(
      this,
      gameWidth / 2,
      300,
      'Maze 2',
      'Maze02'
    );

    // Créer le bouton de la troisième scène
    const button3 = createButton(
      this,
      gameWidth / 2,
      400,
      'Maze 3',
      'Maze03'
    );
  }
}

import 'phaser';
import createButton from '../../utils/createButton';
import config from '../../config';

export default class Maze03 extends Phaser.Scene {
  constructor() {
    super('Maze03');
  }

  create() {
    // Ajouter le contenu de la première scène ici
    const backButton = createButton(
      this,
      config.scale.width / 2,
      config.scale.height - 50,
      'Retour au Menu',
      'MainMenuScene'
    );
  }
}
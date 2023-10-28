import 'phaser';
import config from '../../config';
import createButton from '../../utils/createButton';

export default class Maze02 extends Phaser.Scene {
  bg!: Phaser.GameObjects.Rectangle;
  maskGraphics!: Phaser.GameObjects.Graphics;
  circleGraphics!: Phaser.GameObjects.Graphics;
  constructor() {
    super('Maze02');
  }

  create() {
    
    // Fond noir (rectangle) par-dessus le fond bleu
    let blackBackground = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
    blackBackground.setOrigin(0, 0);
    
    const backButton = createButton(
      this,
      config.scale.width / 2,
      config.scale.height - 50,
      'Retour au Menu',
      'MainMenuScene'
    );
    
    const graphics = this.make.graphics({ lineStyle: { color: 0x000000, width: 0.5 } });
    let mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
    
    blackBackground.setMask(mask);
    backButton.setMask(mask);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.updateCirclePosition(pointer.x, pointer.y, graphics);
    });
    
    }
    updateCirclePosition(x: number, y: number, graphics: Phaser.GameObjects.Graphics) {
      graphics
      .clear()
      .fillStyle(0xffffff)
      .fillCircle(x, y, 100);
    }
}
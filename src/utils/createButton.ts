import 'phaser';

/**
 * create a button to start a scene
 */
export default function createButton(scene: Phaser.Scene, x: number, y: number, text: string, targetScene: string) {
  const buttonStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '24px',
    color: '#fff',
    backgroundColor: '#333',
    padding: {
      x: 16,
      y: 8,
    },
  };

  const button = scene.add.text(x, y, text, buttonStyle);
  button.setOrigin(0.5);
  button.setInteractive({ useHandCursor: true });

  button.on('pointerdown', () => {
    scene.scene.start(targetScene);
  });

  return button;
}
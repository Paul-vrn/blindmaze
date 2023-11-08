import 'phaser';
import {MazeConfig} from '../models/gameConfig';
import Maze from '../scenes/maze/Maze';

/**
 * create a button to start a scene
 */
const createButton = (scene: Phaser.Scene, x: number, y: number, text: string, targetScene: string, disable: boolean) => {
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
  if (!disable) {
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      scene.scene.start(targetScene);
    });  
  } else {
    button.setAlpha(0.5);
  }
  return button;
}

const createMazeButton = (scene: Phaser.Scene, x: number, y: number, mazeConfig: MazeConfig) => {
  const buttonStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '24px',
    color: '#fff',
    backgroundColor: '#333',
    padding: {
      x: 16,
      y: 8,
    },
  };
  const button = scene.add.text(x, y, mazeConfig.title, buttonStyle);
  button.setOrigin(0.5);
  button.setInteractive({ useHandCursor: true });

  button.on('pointerdown', () => {
    const maze = new Maze(mazeConfig);
    scene.game.scene.add(mazeConfig.title, maze, true);
    scene.scene.stop();
  });

  return button;
}

export {createButton, createMazeButton};

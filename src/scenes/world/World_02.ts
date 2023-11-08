import 'phaser';
import { World } from './World';

export default class World02 extends World {
  constructor() {
    super({
      title: 'World02',
      easyMaze: 3,
      mediumMaze: 3,
      hardMaze: 3,
      enableDeadWalls: true,
      enableEnemies: false,
    });
  }
}

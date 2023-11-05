import 'phaser';
import {World} from './World';


export default class World01 extends World {
  constructor() {
    super({title:"World01", easyMaze: 3, mediumMaze: 3, hardMaze: 3, enableDeadWalls: false, enableEnemies: false});
  }
}
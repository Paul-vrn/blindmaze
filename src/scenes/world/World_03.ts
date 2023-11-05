import 'phaser';
import {World} from './World';


export default class World03 extends World {
  constructor() {
    super({title:"World03", easyMaze: 3, mediumMaze: 3, hardMaze: 3, enableDeadWalls: false, enableEnemies: true});
  }
}
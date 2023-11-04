import 'phaser';
import {World} from './World';


export default class World03 extends World {
  constructor() {
    const mazes = ['Maze 1', 'Maze 2', 'Maze 3'];
    const mazeScenes = ['Maze21', 'Maze22', 'Maze23'];
    super({title:"World03", mazes, mazeScenes});
  }
}
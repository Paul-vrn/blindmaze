import 'phaser';
import {World} from './World';


export default class World01 extends World {
  constructor() {
    const mazes = ['Maze 1', 'Maze 2', 'Maze 3'];
    const mazeScenes = ['Maze01', 'Maze02', 'Maze03'];
    super({title:"World01", mazes, mazeScenes});
  }
}
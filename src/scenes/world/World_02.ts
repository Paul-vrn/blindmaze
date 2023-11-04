import 'phaser';
import {World} from './World';


export default class World02 extends World {
  constructor() {
    const mazes = ['Maze 1', 'Maze 2', 'Maze 3'];
    const mazeScenes = ['Maze11', 'Maze12', 'Maze13'];
    super({title:"World02", mazes, mazeScenes});
  }
}
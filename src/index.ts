import Phaser from 'phaser';
import config from './config';
import Menu from './scenes/Menu';
import Maze01 from './scenes/maze/Maze_01';
import Maze02 from './scenes/maze/Maze_02';
import Maze03 from './scenes/maze/Maze_03';
import World01 from './scenes/world/World_01';
import World02 from './scenes/world/World_02';
import World03 from './scenes/world/World_03';

new Phaser.Game(
  Object.assign(config, {
    scene: [Menu, World01, World02, World03, Maze01, Maze02, Maze03]
  })
);

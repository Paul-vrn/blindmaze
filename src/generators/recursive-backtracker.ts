import 'phaser';
import { GridView } from '../models/grid-view';
import { Cell } from '../models/cell';
import { Grid } from '../models/grid';
import Maze from '../scenes/maze/Maze';

export class RecursiveBacktracker {
  scene: Maze;
  grid: Grid;
  gridView: GridView;
  currentRow!: number;
  currentCol!: number;
  cellStack!: Cell[];
  constructor(scene: Maze, grid: Grid, gridView: GridView) {
    this.scene = scene;
    this.grid = grid;
    this.gridView = gridView;

    this.reset();
  }

  reset() {
    this.currentRow = Phaser.Math.RND.between(0, this.grid.rows - 1);
    this.currentCol = Phaser.Math.RND.between(0, this.grid.cols - 1);
    this.cellStack = [];

    this.grid.forEachCell((cell: Cell) => delete cell.visited);
  }

  generate() {
    this.reset();

    this.grid.get(this.currentRow, this.currentCol).visited = true;

    this.step();
  }

  // private

  canStep() {
    return this.grid.someCell((cell) => !cell.visited);
  }

  step() {
    const cell = this.grid.get(this.currentRow, this.currentCol);
    const neighbors = Object.values(this.grid.getNeighbors(cell)).filter(
      (x) => x
    );
    const unvisitedNeighbors = neighbors.filter(
      (neighbor) => !neighbor.visited
    );

    if (unvisitedNeighbors.length) {
      const neighbor = Phaser.Math.RND.pick(unvisitedNeighbors);
      this.cellStack.push(cell);

      this.scene.scheduleNextWallRemoval(cell, neighbor);

      this.currentRow = neighbor.row;
      this.currentCol = neighbor.col;

      neighbor.visited = true;
    } else if (this.cellStack.length) {
      const poppedCell = this.cellStack.pop()!;

      this.currentRow = poppedCell.row;
      this.currentCol = poppedCell.col;
    }

    if (this.canStep()) {
      this.step();
    }
  }
}

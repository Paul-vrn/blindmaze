import 'phaser';

export class RecursiveBacktracker {
  constructor(scene, grid, gridView) {
    this.scene = scene;
    this.grid = grid;
    this.gridView = gridView;

    this.reset();
  }

  reset() {
    this.currentRow = Phaser.Math.RND.between(0, this.grid.rows - 1);
    this.currentCol = Phaser.Math.RND.between(0, this.grid.cols - 1);
    this.cellStack = [];

    this.grid.forEachCell(cell => delete cell.visited);

  }

  generate() {
    this.reset();

    this.grid.get(this.currentRow, this.currentCol).visited = true;

    this.step();
  }

  // private

  canStep() {
    return this.grid.someCell(cell => !cell.visited);
  }

  step() {
    const cell = this.grid.get(this.currentRow, this.currentCol);
    const neighbors = Object.values(this.grid.getNeighbors(cell)).filter(x => x);
    const unvisitedNeighbors = neighbors.filter(neighbor => !neighbor.visited);

    if (unvisitedNeighbors.length) {
      const neighbor = Phaser.Math.RND.pick(unvisitedNeighbors);
      this.cellStack.push(cell);

      this.scene.scheduleNextWallRemoval(cell, neighbor);

      this.currentRow = neighbor.row;
      this.currentCol = neighbor.col;

      neighbor.visited = true;
    } else if (this.cellStack.length) {
      const poppedCell = this.cellStack.pop();

      this.currentRow = poppedCell.row;
      this.currentCol = poppedCell.col;
    }

    if (this.canStep()) {
      this.step();
    }
  }
}
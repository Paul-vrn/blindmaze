import {Cell} from './cell';
import {Wall} from './wall';

export class Grid {
  constructor(rows, cols) {
    this.setSize(rows, cols);
  }

  setSize(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this.walls = new Set()

    // create cells
    for (let row = 0; row < rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < cols; col++) {
        this.cells[row][col] = new Cell(row, col);
      }
    }
    
    // create walls
    this.forEachCell(cell => {
      const aboveIndex = cell.row - 1;
      const belowIndex = cell.row + 1;
      const leftIndex = cell.col - 1;
      const rightIndex = cell.col + 1;

      const neighbors = {
        above: aboveIndex >= 0 ? this.cells[aboveIndex][cell.col] : null,
        below: belowIndex < rows ? this.cells[belowIndex][cell.col] : null,
        left: leftIndex >= 0 ? this.cells[cell.row][leftIndex] : null,
        right: rightIndex < cols ? this.cells[cell.row][rightIndex] : null,
      };

      if (neighbors.above) {
        const wall = neighbors.above.walls.below || new Wall(neighbors.above, cell);
        neighbors.above.walls.below = wall;
        cell.walls.above = wall;
        this.walls.add(wall);
      }

      if (neighbors.below) {
        const wall = neighbors.below.walls.above || new Wall(neighbors.below, cell);
        neighbors.below.walls.above = wall;
        cell.walls.below = wall;
        this.walls.add(wall);
      }

      if (neighbors.left) {
        const wall = neighbors.left.walls.right || new Wall(neighbors.left, cell);
        neighbors.left.walls.right = wall;
        cell.walls.left = wall;
        this.walls.add(wall);
      }

      if (neighbors.right) {
        const wall = neighbors.right.walls.left || new Wall(neighbors.right, cell);
        neighbors.right.walls.left = wall;
        cell.walls.right = wall;
        this.walls.add(wall);
      }
    });
  }

  getSize() {
    return { rows: this.rows, cols: this.cols };
  }
  
  getNeighbors(cell) {
    const aboveIndex = cell.row - 1;
    const belowIndex = cell.row + 1;
    const leftIndex = cell.col - 1;
    const rightIndex = cell.col + 1;

    return {
      above: aboveIndex >= 0 ? this.cells[aboveIndex][cell.col] : null,
      below: belowIndex < this.rows ? this.cells[belowIndex][cell.col] : null,
      left: leftIndex >= 0 ? this.cells[cell.row][leftIndex] : null,
      right: rightIndex < this.cols ? this.cells[cell.row][rightIndex] : null,
    };
  }

  get(row, col) {
    return this.cells[row][col];
  }

  someCell(fn) {
    return this.cells.some(row => row.some(fn));
  }

  forEachCell(fn) {
    return this.cells.forEach(row => row.forEach(fn));
  }

  forEachWall(fn) {
    return this.walls.forEach(fn);
  }
}
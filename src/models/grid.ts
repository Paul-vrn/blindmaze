import {Cell} from './cell';
import {Wall} from './wall';

interface ISize {
  rows: number;
  cols: number;
}

interface INeighbors {
  above: Cell | null;
  below: Cell | null;
  left: Cell | null;
  right: Cell | null;
}

export class Grid {
  private rows!: number;
  private cols!: number;
  private cells!: Cell[][];
  private walls!: Set<Wall>;

  constructor(rows: number, cols: number) {
    this.setSize(rows, cols);
  }

  setSize(rows: number, cols: number): void {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this.walls = new Set<Wall>();

    // create cells
    for (let row = 0; row < rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < cols; col++) {
        this.cells[row][col] = new Cell(row, col);
      }
    }

    // create walls
    this.forEachCell((cell: Cell) => {
      const neighbors: INeighbors = this.getNeighbors(cell);

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

  getSize(): ISize {
    return { rows: this.rows, cols: this.cols };
  }

  getNeighbors(cell: Cell): INeighbors {
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

  get(row: number, col: number): Cell {
    return this.cells[row][col];
  }

  someCell(fn: (cell: Cell) => boolean): boolean {
    return this.cells.some(row => row.some(fn));
  }

  forEachCell(fn: (cell: Cell) => void): void {
    this.cells.forEach(row => row.forEach(fn));
  }

  forEachWall(fn: (wall: Wall) => void): void {
    this.walls.forEach(fn);
  }
}
